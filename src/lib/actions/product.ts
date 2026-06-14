"use server";

import { z } from "zod";
import prisma from "@/lib/db";
import { revalidatePath, unstable_cache, revalidateTag } from "next/cache";
import { supabaseAdmin } from "@/lib/supabase";

// Product validation schema
const ProductSchema = z.object({
  name: z.string().min(2, "Nama minimal 2 karakter"),
  slug: z.string().min(2, "Slug minimal 2 karakter").regex(/^[a-z0-9-]+$/, "Slug hanya boleh huruf kecil, angka, dan dash (-)"),
  description: z.string().min(10, "Deskripsi minimal 10 karakter"),
  price: z.number().min(0, "Harga tidak boleh negatif"),
  stock: z.number().min(0, "Stok tidak boleh negatif"),
  sizes: z.array(z.object({
    size: z.string().min(1, "Ukuran wajib diisi"),
    priceAdd: z.number().min(0, "Selisih harga tidak boleh negatif"),
  })).min(1, "Harap isi minimal satu ukuran"),
  images: z.array(z.string()).min(1, "Harap sertakan minimal satu gambar"),
});

export async function createProduct(data: z.infer<typeof ProductSchema>) {
  try {
    const validatedData = ProductSchema.parse(data);

    // Verify unique slug
    const existing = await prisma.product.findUnique({
      where: { slug: validatedData.slug },
    });
    if (existing) {
      return { success: false, error: "Slug produk sudah digunakan." };
    }

    await prisma.product.create({
      data: {
        name: validatedData.name,
        slug: validatedData.slug,
        description: validatedData.description,
        price: validatedData.price,
        stock: validatedData.stock,
        imageUrl: validatedData.images[0],
        sizes: {
          create: validatedData.sizes.map((s) => ({ size: s.size, priceAdd: s.priceAdd })),
        },
        images: {
          create: validatedData.images.map((img) => ({ url: img })),
        },
      },
    });

    revalidatePath("/admin/products");
    revalidatePath("/products");
    revalidatePath(`/products/${validatedData.slug}`);
    revalidatePath("/");
    revalidateTag("products", "max");
    return { success: true };
  } catch (error: any) {
    console.error("Create product error:", error);
    return {
      success: false,
      error: error instanceof z.ZodError ? error.issues[0].message : "Gagal menambahkan produk.",
    };
  }
}

export async function updateProduct(id: string, data: z.infer<typeof ProductSchema>) {
  try {
    const validatedData = ProductSchema.parse(data);

    // Verify unique slug
    const existing = await prisma.product.findFirst({
      where: {
        slug: validatedData.slug,
        NOT: { id },
      },
    });
    if (existing) {
      return { success: false, error: "Slug produk sudah digunakan." };
    }

    // Wrap in transaction: clear relations, update, and insert new relations
    await prisma.$transaction(async (tx) => {
      // Clear sizes and images
      await tx.productSize.deleteMany({ where: { productId: id } });
      await tx.productImage.deleteMany({ where: { productId: id } });

      // Update product core fields + insert new relations
      await tx.product.update({
        where: { id },
        data: {
          name: validatedData.name,
          slug: validatedData.slug,
          description: validatedData.description,
          price: validatedData.price,
          stock: validatedData.stock,
          imageUrl: validatedData.images[0],
          sizes: {
            create: validatedData.sizes.map((s) => ({ size: s.size, priceAdd: s.priceAdd })),
          },
          images: {
            create: validatedData.images.map((img) => ({ url: img })),
          },
        },
      });
    });

    revalidatePath("/admin/products");
    revalidatePath("/products");
    revalidatePath(`/products/${validatedData.slug}`);
    revalidatePath("/");
    revalidateTag("products", "max");
    return { success: true };
  } catch (error: any) {
    console.error("Update product error:", error);
    return {
      success: false,
      error: error instanceof z.ZodError ? error.issues[0].message : "Gagal mengubah produk.",
    };
  }
}

export async function deleteProduct(id: string) {
  try {
    await prisma.product.delete({
      where: { id },
    });

    revalidatePath("/admin/products");
    revalidatePath("/products");
    revalidatePath("/");
    revalidateTag("products", "max");
    return { success: true };
  } catch (error: any) {
    console.error("Delete product error:", error);
    return {
      success: false,
      error: error.message || "Gagal menghapus produk.",
    };
  }
}

// Action to save product images in Supabase Storage uploads bucket
export async function uploadProductImage(formData: FormData) {
  try {
    const file = formData.get("file") as File;
    if (!file) {
      throw new Error("File gambar tidak ditemukan.");
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // File name
    const ext = file.name.split(".").pop() || "jpg";
    const filename = `product-${Date.now()}-${Math.floor(Math.random() * 1000)}.${ext}`;

    // Upload to Supabase Storage
    const { error } = await supabaseAdmin.storage
      .from("uploads")
      .upload(`products/${filename}`, buffer, {
        contentType: file.type,
      });

    if (error) {
      throw error;
    }

    // Get public URL
    const { data: publicUrlData } = supabaseAdmin.storage
      .from("uploads")
      .getPublicUrl(`products/${filename}`);

    const imageUrl = publicUrlData.publicUrl;

    return {
      success: true,
      imageUrl,
    };
  } catch (error: any) {
    console.error("Product image upload error:", error);
    return {
      success: false,
      error: error.message || "Gagal mengunggah gambar produk.",
    };
  }
}

export const getCachedProducts = unstable_cache(
  async () => {
    return prisma.product.findMany({
      orderBy: {
        createdAt: "desc",
      },
      include: {
        sizes: true,
        images: true,
      },
    });
  },
  ["products"],
  { tags: ["products"], revalidate: 30 }
);
