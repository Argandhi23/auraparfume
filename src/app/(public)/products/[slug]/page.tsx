import React from "react";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import prisma from "@/lib/db";
import ProductGallery from "@/components/ProductGallery";
import ProductInteraction from "@/components/ProductInteraction";
import ScrollReveal from "@/components/ScrollReveal";

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
  params: Promise<{
    slug: string;
  }>;
}

export default async function ProductDetailPage({ params }: PageProps) {
  const resolvedParams = await params;
  const slug = resolvedParams.slug;

  // Fetch product details and related products in parallel
  const [product, relatedProducts] = await Promise.all([
    prisma.product.findUnique({
      where: { slug },
      include: {
        images: true,
        sizes: true,
      },
    }),
    prisma.product.findMany({
      where: {
        NOT: {
          slug,
        },
      },
      take: 4,
      orderBy: {
        createdAt: "desc",
      },
      select: {
        id: true,
        name: true,
        slug: true,
        price: true,
        images: {
          select: {
            id: true,
            url: true,
          },
        },
      },
    }),
  ]);

  if (!product) {
    notFound();
  }

  // Prepare fallback and structure for interaction component
  const productForCart = {
    id: product.id,
    name: product.name,
    slug: product.slug,
    price: product.price,
    image: product.images[0]?.url || "",
    stock: product.stock,
  };

  return (
    <div className="bg-white min-h-screen pt-32 pb-24 px-6 md:px-12">
      <div className="max-w-7xl mx-auto space-y-20">
        
        {/* Product Details Split Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-16">
          {/* Left Column: Gallery */}
          <div>
            <ProductGallery images={product.images} name={product.name} />
          </div>

          {/* Right Column: Information & CTAs */}
          <div className="space-y-6">
            <div className="space-y-2">
              <span className="inline-block text-xs uppercase tracking-widest text-brand font-semibold">
                Atelier Aura
              </span>
              <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-apple-text">
                {product.name}
              </h1>
            </div>

            <hr className="border-apple-border/30" />

            <div className="space-y-4">
              <span className="text-xs font-semibold uppercase tracking-wider text-apple-gray block">
                Deskripsi Aroma
              </span>
              <p className="text-sm md:text-base text-apple-gray leading-relaxed">
                {product.description}
              </p>
            </div>

            <hr className="border-apple-border/30" />

            {/* Sizes & Cart Button */}
            <ProductInteraction product={productForCart} sizes={product.sizes} />
          </div>
        </div>

        {/* Related Products Section */}
        {relatedProducts.length > 0 && (
          <div className="space-y-8 pt-12 border-t border-apple-border/20">
            <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-apple-text">
              Produk Terkait
            </h2>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {relatedProducts.map((p, index) => {
                const imageUrl = p.images[0]?.url || "https://images.unsplash.com/photo-1547887537-6158d64c35b3?auto=format&fit=crop&q=80&w=800";
                return (
                  <ScrollReveal key={p.id} delay={0.08 * index} y={20}>
                    <Link href={`/products/${p.slug}`} className="group block space-y-3">
                      <div className="relative aspect-square w-full overflow-hidden bg-apple-bg rounded-xl">
                        <Image
                          src={imageUrl}
                          alt={p.name}
                          fill
                          loading="lazy"
                          className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                          sizes="(max-width: 768px) 100vw, 33vw"
                        />
                      </div>
                      <div className="flex justify-between items-start pt-1">
                        <div>
                          <p className="text-[10px] text-apple-gray font-medium tracking-wider uppercase">
                            Eau de Parfum
                          </p>
                          <h3 className="text-sm font-bold text-apple-text group-hover:text-brand transition-colors">
                            {p.name}
                          </h3>
                        </div>
                        <span className="text-xs font-semibold text-apple-text">
                          {formatIDR(p.price)}
                        </span>
                      </div>
                    </Link>
                  </ScrollReveal>
                );
              })}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
