"use server";

import { z } from "zod";
import prisma from "@/lib/db";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { supabaseAdmin } from "@/lib/supabase";
import { rateLimit } from "@/lib/rate-limit";

// Helper to broadcast event to Supabase Realtime Broadcast channel
async function broadcastOrderEvent(payload: any) {
  try {
    const channel = supabaseAdmin.channel("admin-orders");
    await new Promise<void>((resolve) => {
      channel.subscribe(async (status) => {
        if (status === "SUBSCRIBED") {
          await channel.send({
            type: "broadcast",
            event: "order-event",
            payload,
          });
          await supabaseAdmin.removeChannel(channel);
          resolve();
        } else if (status === "CHANNEL_ERROR" || status === "TIMED_OUT") {
          resolve();
        }
      });
      setTimeout(resolve, 2000); // 2s fallback timeout
    });
  } catch (err) {
    console.error("Failed to broadcast order event:", err);
  }
}

// Input Validation Schema using Zod
const CreateOrderSchema = z.object({
  customerName: z.string().min(2, { message: "Nama lengkap minimal 2 karakter" }),
  customerPhone: z.string().min(9, { message: "Nomor WhatsApp minimal 9 digit" }),
  customerAddress: z.string().min(3, { message: "Area/Kecamatan minimal 3 karakter" }),
  customerNotes: z.string().optional(),
  codLocation: z.string().optional(),
  paymentMethod: z.enum(["QRIS", "COD"]),
  items: z.array(
    z.object({
      productId: z.string(),
      productName: z.string(),
      size: z.string(),
      price: z.number(),
      quantity: z.number().min(1),
    })
  ).min(1, { message: "Keranjang belanja kosong" }),
});

export async function createOrder(data: {
  customerName: string;
  customerPhone: string;
  customerAddress: string;
  customerNotes?: string;
  codLocation?: string;
  paymentMethod: string;
  items: {
    productId: string;
    productName: string;
    size: string;
    price: number;
    quantity: number;
  }[];
}) {
  try {
    // Rate Limiting: max 10 orders per IP per hour
    const headerList = await headers();
    const ip = headerList.get("x-forwarded-for") || "127.0.0.1";
    const ipKey = `order-ip-${ip}`;
    if (!rateLimit(ipKey, 10, 60 * 60 * 1000)) {
      return { success: false, error: "Terlalu banyak membuat pesanan. Silakan coba lagi nanti." };
    }

    // 1. Validate inputs
    const validatedData = CreateOrderSchema.parse(data);

    // 2. Generate custom unique receipt number: ORD-YYYYMMDD-XXXX
    const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, "");
    const randomSuffix = Math.random().toString(36).substring(2, 6).toUpperCase();
    const orderId = `ORD-${dateStr}-${randomSuffix}`;

    // Calculate total amount
    const totalAmount = validatedData.items.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );

    // 3. Database transaction to create order, items, and decrement stock
    const result = await prisma.$transaction(async (tx) => {
      // Verify and update stock for each item
      for (const item of validatedData.items) {
        const product = await tx.product.findUnique({
          where: { id: item.productId },
        });

        if (!product) {
          throw new Error(`Produk "${item.productName}" tidak ditemukan.`);
        }

        if (product.stock < item.quantity) {
          throw new Error(`Stok produk "${item.productName}" tidak mencukupi (Tersedia: ${product.stock}).`);
        }

        // Decrement stock
        await tx.product.update({
          where: { id: item.productId },
          data: {
            stock: {
              decrement: item.quantity,
            },
          },
        });
      }

      // Create Order
      const newOrder = await tx.order.create({
        data: {
          id: orderId,
          customerName: validatedData.customerName,
          customerPhone: validatedData.customerPhone,
          customerAddress: validatedData.customerAddress,
          customerNotes: validatedData.customerNotes || null,
          codLocation: validatedData.codLocation || null,
          paymentMethod: validatedData.paymentMethod,
          totalAmount: totalAmount,
          status: "PENDING",
          items: {
            create: validatedData.items.map((item) => ({
              productId: item.productId,
              productName: item.productName,
              size: item.size,
              price: item.price,
              quantity: item.quantity,
            })),
          },
        },
      });

      return newOrder;
    });

    // Broadcast order insert event
    await broadcastOrderEvent({ type: "ORDER_INSERT", orderId: result.id });

    return {
      success: true,
      orderId: result.id,
    };
  } catch (error: any) {
    console.error("Order creation error:", error);
    return {
      success: false,
      error: error instanceof z.ZodError 
        ? error.issues[0].message 
        : error.message || "Gagal membuat pesanan, silakan coba lagi.",
    };
  }
}

export async function uploadReceipt(orderId: string, formData: FormData) {
  try {
    // Rate Limiting: max 5 uploads per orderId per 24 hours
    const rateKey = `upload-receipt-order-${orderId}`;
    if (!rateLimit(rateKey, 5, 24 * 60 * 60 * 1000)) {
      throw new Error("Batas maksimum unggah bukti transfer telah tercapai.");
    }

    const file = formData.get("file") as File;
    if (!file) {
      throw new Error("File bukti transfer tidak ditemukan.");
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Sanitize file extension
    const originalName = file.name || "receipt.png";
    const fileExt = originalName.split(".").pop() || "png";
    const filename = `${orderId}-${Date.now()}.${fileExt}`;

    // Upload to Supabase Storage
    const { error } = await supabaseAdmin.storage
      .from("uploads")
      .upload(`receipts/${filename}`, buffer, {
        contentType: file.type,
      });

    if (error) {
      throw error;
    }

    // Get public URL
    const { data: publicUrlData } = supabaseAdmin.storage
      .from("uploads")
      .getPublicUrl(`receipts/${filename}`);

    const receiptImgUrl = publicUrlData.publicUrl;

    // Update order receiptImg url
    await prisma.order.update({
      where: { id: orderId },
      data: {
        receiptImg: receiptImgUrl,
      },
    });

    // Broadcast order update event (receipt uploaded)
    await broadcastOrderEvent({ type: "ORDER_UPDATE", orderId, status: "PENDING" });

    return {
      success: true,
      imageUrl: receiptImgUrl,
    };
  } catch (error: any) {
    console.error("Receipt upload error:", error);
    return {
      success: false,
      error: error.message || "Gagal mengunggah bukti transfer.",
    };
  }
}

export async function searchOrders(queryStr: string) {
  try {
    const q = queryStr.trim();
    if (!q) {
      return { success: true, orders: [] };
    }

    const orders = await prisma.order.findMany({
      where: {
        OR: [
          { id: q },
          { customerPhone: q },
        ],
      },
      include: {
        items: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return {
      success: true,
      orders: JSON.parse(JSON.stringify(orders)), // ensure serialization of dates
    };
  } catch (error: any) {
    console.error("Order tracking error:", error);
    return {
      success: false,
      error: error.message || "Gagal melacak pesanan.",
    };
  }
}

export async function updateOrderStatus(
  orderId: string,
  status: "PENDING" | "VERIFIED" | "COMPLETED" | "CANCELLED"
) {
  try {
    const data: any = { status };

    await prisma.order.update({
      where: { id: orderId },
      data,
    });

    revalidatePath("/admin/orders");
    revalidatePath("/admin/dashboard");
    revalidatePath(`/order-success/${orderId}`);
    revalidatePath("/track-order");

    // Broadcast order update event
    await broadcastOrderEvent({ type: "ORDER_UPDATE", orderId, status });
    
    return { success: true };
  } catch (error: any) {
    console.error("Update order status error:", error);
    return {
      success: false,
      error: error.message || "Gagal memperbarui status pesanan.",
    };
  }
}

export async function getOrderWithItems(orderId: string) {
  try {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        items: true,
      },
    });

    if (!order) {
      return { success: false, error: "Pesanan tidak ditemukan." };
    }

    return {
      success: true,
      order: JSON.parse(JSON.stringify(order)),
    };
  } catch (error: any) {
    console.error("Get order error:", error);
    return {
      success: false,
      error: error.message || "Gagal mengambil detail pesanan.",
    };
  }
}

export async function getDashboardStats() {
  try {
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const [
      todayOrders,
      revenueAgg,
      pendingVerifications,
      totalProducts,
      recentOrders,
    ] = await Promise.all([
      prisma.order.count({
        where: {
          createdAt: {
            gte: todayStart,
          },
        },
      }),
      prisma.order.aggregate({
        where: {
          status: {
            in: ["VERIFIED", "COMPLETED"],
          },
        },
        _sum: {
          totalAmount: true,
        },
      }),
      prisma.order.count({
        where: {
          status: "PENDING",
          receiptImg: {
            not: null,
          },
        },
      }),
      prisma.product.count(),
      prisma.order.findMany({
        take: 5,
        orderBy: {
          createdAt: "desc",
        },
        include: {
          items: true,
        },
      }),
    ]);

    const totalRevenue = revenueAgg._sum.totalAmount || 0;

    const last7Days = Array.from({ length: 7 }, (_, idx) => {
      const d = new Date();
      d.setDate(d.getDate() - idx);
      d.setHours(0, 0, 0, 0);
      return d;
    }).reverse();

    const chartData = await Promise.all(
      last7Days.map(async (dayDate) => {
        const nextDay = new Date(dayDate);
        nextDay.setDate(nextDay.getDate() + 1);

        const dayRevenueAgg = await prisma.order.aggregate({
          where: {
            status: {
              in: ["VERIFIED", "COMPLETED"],
            },
            createdAt: {
              gte: dayDate,
              lt: nextDay,
            },
          },
          _sum: {
            totalAmount: true,
          },
        });

        return {
          label: dayDate.toLocaleDateString("id-ID", { weekday: "short" }),
          amount: dayRevenueAgg._sum.totalAmount || 0,
        };
      })
    );

    return {
      success: true,
      stats: {
        todayOrders,
        totalRevenue,
        pendingVerifications,
        totalProducts,
        recentOrders: JSON.parse(JSON.stringify(recentOrders)),
        chartData,
      },
    };
  } catch (error: any) {
    console.error("Dashboard stats error:", error);
    return {
      success: false,
      error: error.message || "Gagal mengambil statistik dashboard.",
    };
  }
}

export async function deleteReceiptImage(orderId: string, receiptUrl: string) {
  try {
    // 1. Extract file path dari URL
    // Format URL: https://.../storage/v1/object/public/uploads/receipts/...
    const prefix = "uploads/";
    const idx = receiptUrl.indexOf(prefix);
    if (idx === -1) {
      throw new Error("Format URL bukti transfer tidak valid.");
    }
    const filePath = receiptUrl.substring(idx + prefix.length);

    // 2. Hapus dari Supabase Storage
    const { error: storageError } = await supabaseAdmin.storage
      .from("uploads")
      .remove([filePath]);

    if (storageError) {
      console.warn("Gagal menghapus file dari storage (melanjutkan update DB):", storageError);
    }

    // 3. Update database: receiptImg = null
    await prisma.order.update({
      where: { id: orderId },
      data: { receiptImg: null },
    });

    // 4. Broadcast realtime update
    await broadcastOrderEvent({ type: "ORDER_UPDATE", orderId });

    // 5. revalidatePath
    revalidatePath("/admin/orders");
    revalidatePath("/admin/dashboard");
    revalidatePath("/track-order");
    revalidatePath(`/order-success/${orderId}`);

    return { success: true };
  } catch (error: any) {
    console.error("Delete receipt error:", error);
    return {
      success: false,
      error: error.message || "Gagal menghapus bukti pembayaran.",
    };
  }
}
