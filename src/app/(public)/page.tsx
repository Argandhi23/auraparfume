import React from "react";
import Link from "next/link";
import Image from "next/image";
import prisma from "@/lib/db";
import ScrollReveal from "@/components/ScrollReveal";
import { ArrowRight, ShieldCheck, Heart, Sparkles } from "lucide-react";
import { unstable_cache } from "next/cache";
import { paymentConfig } from "@/config/payment";

export const revalidate = 60; // Cache page for 60 seconds

function formatIDR(price: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price);
}

const getHomepageBestSellers = unstable_cache(
  async () => {
    return prisma.product.findMany({
      take: 3,
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
      orderBy: {
        createdAt: "desc"
      }
    });
  },
  ["homepage-best-sellers"],
  { tags: ["products"], revalidate: 60 }
);

export default async function HomePage() {
  // Fetch best sellers in parallel (can add other queries here using Promise.all)
  const [bestSellers] = await Promise.all([
    getHomepageBestSellers()
  ]);

  return (
    <div className="bg-white">
      {/* 1. HERO SECTION (Split layout, minimalist) */}
      <section className="relative min-h-[90vh] md:min-h-[95vh] flex items-center pt-24 px-6 md:px-12 overflow-hidden border-b border-apple-border/20">
        <div className="max-w-7xl mx-auto w-full grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          {/* Left Text Column */}
          <div className="space-y-8 max-w-xl z-10">
            <ScrollReveal delay={0.1}>
              <span className="inline-block text-xs uppercase tracking-widest text-brand font-semibold mb-2">
                Atelier Aura
              </span>
              <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-apple-text leading-[1.05]">
                Murni.<br />Minimalis.<br />Abadi.
              </h1>
            </ScrollReveal>

            <ScrollReveal delay={0.3}>
              <p className="text-base md:text-lg text-apple-gray leading-relaxed">
                Keharuman mewah yang berbicara dalam keheningan. Koleksi wewangian premium yang dirancang secara presisi untuk memancarkan keanggunan sejati Anda tanpa kebisingan visual.
              </p>
            </ScrollReveal>

            <ScrollReveal delay={0.5}>
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
                <Link
                  href="/products"
                  className="bg-brand hover:bg-brand-hover text-white text-sm font-medium py-4 px-8 rounded-full transition-all duration-300 transform hover:scale-[1.03] text-center shadow-xs"
                >
                  Jelajahi Koleksi
                </Link>
                <Link
                  href="/track-order"
                  className="text-apple-text hover:text-brand text-sm font-medium py-3 px-6 flex items-center justify-center gap-2 transition-colors group"
                >
                  Cek Pesanan Saya
                  <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                </Link>
              </div>
            </ScrollReveal>
          </div>

          {/* Right Image Column */}
          <div className="relative h-[450px] md:h-[650px] w-full flex items-center justify-center">
            {/* Minimalist background blur gradient circle */}
            <div className="absolute w-72 h-72 md:w-96 md:h-96 rounded-full bg-brand/10 blur-3xl -z-10 animate-pulse" />
            
            <ScrollReveal delay={0.4} className="w-full h-full relative">
              <Image
                src="https://xtjkuouycmjrhgsslyqj.supabase.co/storage/v1/object/public/uploads/products/aura-bottle.png"
                alt="Aura Premium Minimalist Perfume signature bottle"
                fill
                priority={true}
                className="object-contain drop-shadow-2xl hover:scale-[1.02] transition-transform duration-700"
                sizes="(max-width: 768px) 100vw, 50vw"
              />
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* Surabaya COD Service Section */}
      <section className="bg-[#F5F5F5] py-16 px-6 md:px-12 border-b border-apple-border/10">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="space-y-3 max-w-2xl">
            <span className="text-[10px] uppercase tracking-widest text-neutral-500 font-bold block">
              Layanan COD Surabaya & Sekitarnya
            </span>
            <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-neutral-900">
              COD khusus Surabaya & Sidoarjo. Luar area? Belanja aman via Shopee.
            </h2>
            <p className="text-xs md:text-sm text-neutral-500 leading-relaxed">
              Kami melayani pemesanan langsung (COD) dengan tatap muka untuk area Surabaya, Sidoarjo, dan sekitarnya. Untuk luar area tersebut, Anda dapat mengunjungi toko Shopee resmi kami untuk pengiriman reguler yang aman.
            </p>
          </div>
          <div className="w-full md:w-auto shrink-0">
            <a
              href={paymentConfig.shopeeUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 border border-black bg-transparent hover:bg-black hover:text-white text-black text-xs font-semibold py-3.5 px-8 rounded-full transition-all duration-300 w-full md:w-auto text-center"
            >
              Kunjungi Shopee <ArrowRight className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      </section>

      {/* 2. BEST SELLERS GRID */}
      <section className="py-24 px-6 md:px-12 max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-4">
          <div>
            <span className="text-xs uppercase tracking-widest text-brand font-semibold block mb-2">
              Koleksi Terbaik
            </span>
            <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-apple-text">
              Best Sellers
            </h2>
          </div>
          <Link
            href="/products"
            className="text-brand hover:text-brand-hover font-medium text-sm flex items-center gap-2 group transition-colors"
          >
            Lihat Semua Produk
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {bestSellers.map((product, index) => {
            const imageUrl = product.images[0]?.url || "https://images.unsplash.com/photo-1547887537-6158d64c35b3?auto=format&fit=crop&q=80&w=800";
            return (
              <ScrollReveal key={product.id} delay={0.1 * index} y={40}>
                <Link
                  href={`/products/${product.slug}`}
                  className="group block space-y-4"
                >
                  <div className="relative aspect-square w-full overflow-hidden bg-apple-bg rounded-2xl transition-all duration-500 group-hover:shadow-lg">
                    <Image
                      src={imageUrl}
                      alt={product.name}
                      fill
                      loading="lazy"
                      className="object-cover transition-transform duration-700 group-hover:scale-[1.05]"
                      sizes="(max-width: 768px) 100vw, 33vw"
                    />
                  </div>
                  <div className="flex justify-between items-start pt-2">
                    <div>
                      <p className="text-xs text-apple-gray font-medium mb-1">
                        Eau de Parfum
                      </p>
                      <h3 className="text-lg font-bold text-apple-text group-hover:text-brand transition-colors">
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
      </section>

      {/* 3. BRAND STORY (Luxury centered minimal block) */}
      <section className="bg-apple-bg py-28 px-6 md:px-12 border-y border-apple-border/20">
        <div className="max-w-3xl mx-auto text-center space-y-8">
          <ScrollReveal>
            <span className="text-xs uppercase tracking-widest text-brand font-semibold">
              Filosofi Kami
            </span>
          </ScrollReveal>
          <ScrollReveal delay={0.2}>
            <blockquote className="text-2xl md:text-4xl font-light tracking-tight text-apple-text leading-relaxed">
              "Kemewahan sejati terletak pada kesederhanaan. AURA adalah perwujudan dari esensi murni aroma, tanpa kebisingan visual, hanya kemewahan yang tenang."
            </blockquote>
          </ScrollReveal>
          <ScrollReveal delay={0.4}>
            <p className="text-sm text-apple-gray leading-relaxed max-w-xl mx-auto">
              Setiap tetes racikan parfum kami dikurasi menggunakan bahan-bahan alami paling eksklusif dari seluruh penjuru dunia, dirancang untuk menyatu secara organik dengan kulit Anda dan melahirkan aroma khas yang intim dan personal.
            </p>
          </ScrollReveal>
        </div>
      </section>

      {/* 4. VALUE PROPOSITIONS (Estetis icons) */}
      <section className="py-24 px-6 md:px-12 max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-12">
        <ScrollReveal delay={0.1} className="flex flex-col items-center text-center space-y-4">
          <div className="w-12 h-12 rounded-full bg-brand/10 flex items-center justify-center text-brand">
            <Sparkles className="w-5 h-5" />
          </div>
          <h3 className="text-lg font-bold text-apple-text">Formula Eksklusif</h3>
          <p className="text-sm text-apple-gray leading-relaxed max-w-xs">
            Dikembangkan oleh perfumer ahli kelas dunia dengan bahan berkualitas tinggi untuk ketahanan aroma yang luar biasa.
          </p>
        </ScrollReveal>

        <ScrollReveal delay={0.2} className="flex flex-col items-center text-center space-y-4">
          <div className="w-12 h-12 rounded-full bg-brand/10 flex items-center justify-center text-brand">
            <Heart className="w-5 h-5" />
          </div>
          <h3 className="text-lg font-bold text-apple-text">Unisex & Personal</h3>
          <p className="text-sm text-apple-gray leading-relaxed max-w-xs">
            Aroma universal yang beradaptasi dengan feromon tubuh masing-masing individu, melahirkan keharuman yang unik.
          </p>
        </ScrollReveal>

        <ScrollReveal delay={0.3} className="flex flex-col items-center text-center space-y-4">
          <div className="w-12 h-12 rounded-full bg-brand/10 flex items-center justify-center text-brand">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <h3 className="text-lg font-bold text-apple-text">Keamanan Transaksi</h3>
          <p className="text-sm text-apple-gray leading-relaxed max-w-xs">
            Pemesanan langsung tanpa akun dan pembayaran manual terverifikasi cepat, menjamin privasi data Anda.
          </p>
        </ScrollReveal>
      </section>
    </div>
  );
}
