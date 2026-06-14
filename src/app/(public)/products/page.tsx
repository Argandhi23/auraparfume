import React, { Suspense } from "react";
import Link from "next/link";
import Image from "next/image";
import prisma from "@/lib/db";
import ProductFilters from "@/components/ProductFilters";
import ScrollReveal from "@/components/ScrollReveal";
import { ShoppingBag } from "lucide-react";

export const revalidate = 60; // Cache page for 60 seconds

function formatIDR(price: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price);
}

interface PageProps {
  searchParams: Promise<{
    sort?: string;
    search?: string;
  }>;
}

export default async function ProductsPage({ searchParams }: PageProps) {
  const resolvedParams = await searchParams;
  const sort = resolvedParams.sort || "";
  const search = resolvedParams.search || "";

  // Build Prisma where clause
  const where: any = {};

  if (search) {
    where.OR = [
      { name: { contains: search } },
      { description: { contains: search } },
    ];
  }

  // Build Prisma orderBy clause
  let orderBy: any = { createdAt: "desc" }; // Latest default

  if (sort === "price-asc") {
    orderBy = { price: "asc" };
  } else if (sort === "price-desc") {
    orderBy = { price: "desc" };
  }

  // Fetch filtered products
  const products = await prisma.product.findMany({
    where,
    orderBy,
    take: 50,
    select: {
      id: true,
      name: true,
      slug: true,
      price: true,
      stock: true,
      images: {
        select: {
          id: true,
          url: true,
        },
      },
    },
  });

  return (
    <div className="bg-white min-h-screen pt-32 pb-24 px-6 md:px-12">
      <div className="max-w-7xl mx-auto space-y-12">
        {/* Header Title */}
        <div className="space-y-2">
          <span className="text-xs uppercase tracking-widest text-brand font-semibold block">
            Aura Parfum
          </span>
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-apple-text">
            Koleksi Wewangian
          </h1>
          <p className="text-sm text-apple-gray max-w-lg leading-relaxed">
            Menghadirkan esensi aroma terpilih untuk mendampingi setiap suasana dan mendefinisikan aura elegan Anda.
          </p>
        </div>

        <Suspense fallback={<div className="h-20 animate-pulse bg-apple-bg rounded-2xl" />}>
          <ProductFilters
            currentSort={sort}
            currentSearch={search}
          />
        </Suspense>

        {/* Products Grid */}
        {products.length === 0 ? (
          <div className="text-center py-20 bg-apple-bg rounded-3xl border border-apple-border/20">
            <ShoppingBag className="w-12 h-12 text-apple-gray mx-auto mb-4 stroke-[1.2]" />
            <h3 className="text-lg font-bold text-apple-text">Tidak ada produk ditemukan</h3>
            <p className="text-sm text-apple-gray mt-1">
              Coba gunakan filter lain atau cari kata kunci yang berbeda.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-x-8 gap-y-12">
            {products.map((product, index) => {
              const imageUrl = product.images[0]?.url || "https://images.unsplash.com/photo-1547887537-6158d64c35b3?auto=format&fit=crop&q=80&w=800";
              return (
                <ScrollReveal key={product.id} delay={(index % 3) * 0.08} y={30}>
                  <Link
                    href={`/products/${product.slug}`}
                    className="group block space-y-4"
                  >
                    <div className="relative aspect-square w-full overflow-hidden bg-apple-bg rounded-2xl transition-all duration-500 group-hover:shadow-md">
                      <Image
                        src={imageUrl}
                        alt={product.name}
                        fill
                        loading="lazy"
                        className="object-cover transition-transform duration-700 group-hover:scale-[1.03]"
                        sizes="(max-width: 768px) 100vw, 33vw"
                      />
                      {product.stock === 0 && (
                        <div className="absolute inset-0 bg-white/70 backdrop-blur-xs flex items-center justify-center">
                          <span className="text-xs uppercase tracking-widest bg-apple-text text-white py-2 px-4 rounded-full font-semibold">
                            Habis
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="flex justify-between items-start pt-1">
                      <div>
                        <p className="text-[11px] text-apple-gray font-medium mb-1 tracking-wider uppercase">
                          Eau de Parfum
                        </p>
                        <h3 className="text-base font-bold text-apple-text group-hover:text-brand transition-colors">
                          {product.name}
                        </h3>
                      </div>
                      <span className="text-sm font-semibold text-apple-text">
                        {formatIDR(product.price)}
                      </span>
                    </div>
                  </Link>
                </ScrollReveal>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
