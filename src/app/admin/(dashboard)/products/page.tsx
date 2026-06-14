import React from "react";
import ProductConsole from "@/components/ProductConsole";
import prisma from "@/lib/db";

export const revalidate = 0; // Fresh database fetches

export default async function AdminProductsPage() {
  const products = await prisma.product.findMany({
    orderBy: {
      createdAt: "desc",
    },
    include: {
      sizes: true,
      images: true,
    },
  });

  return <ProductConsole initialProducts={products as any} />;
}

