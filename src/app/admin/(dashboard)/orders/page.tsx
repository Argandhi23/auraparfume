import React from "react";
import prisma from "@/lib/db";
import OrdersConsole from "@/components/OrdersConsole";

export const revalidate = 0; // Fresh database fetches

interface PageProps {
  searchParams: Promise<{
    search?: string;
  }>;
}

export default async function AdminOrdersPage({ searchParams }: PageProps) {
  const resolvedParams = await searchParams;
  const search = resolvedParams.search || "";

  const orders = await prisma.order.findMany({
    select: {
      id: true,
      customerName: true,
      customerPhone: true,
      customerAddress: true,
      customerNotes: true,
      paymentMethod: true,
      totalAmount: true,
      status: true,
      shippingResi: true,
      createdAt: true,
      receiptImg: true,
    },
    orderBy: {
      createdAt: "desc",
    },
    take: 50,
  });

  return (
    <OrdersConsole
      initialOrders={orders as any}
      searchQuery={search}
    />
  );
}
