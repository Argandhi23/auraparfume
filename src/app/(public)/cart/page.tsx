"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { getCart, removeFromCart, updateCartQty, CartItem } from "@/lib/cart";
import { Trash2, ShoppingBag, ArrowRight, Minus, Plus } from "lucide-react";

function formatIDR(price: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price);
}

export default function CartPage() {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setCartItems(getCart());
  }, []);

  const handleQtyChange = (itemId: string, newQty: number) => {
    updateCartQty(itemId, newQty);
    setCartItems(getCart());
  };

  const handleRemove = (itemId: string) => {
    removeFromCart(itemId);
    setCartItems(getCart());
  };

  if (!mounted) {
    return (
      <div className="min-h-screen pt-32 pb-24 flex items-center justify-center bg-white">
        <div className="w-8 h-8 border-4 border-brand border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <div className="bg-white min-h-screen pt-32 pb-24 px-6 md:px-12">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-apple-text mb-12">
          Kantong Belanja
        </h1>

        {cartItems.length === 0 ? (
          <div className="text-center py-24 bg-apple-bg rounded-3xl border border-apple-border/20 max-w-2xl mx-auto space-y-6">
            <ShoppingBag className="w-16 h-16 text-apple-gray mx-auto stroke-[1.2]" />
            <div className="space-y-1">
              <h3 className="text-xl font-bold text-apple-text">Kantong belanja Anda kosong</h3>
              <p className="text-sm text-apple-gray">
                Jelajahi koleksi parfum premium kami untuk menambahkan wewangian ke keranjang Anda.
              </p>
            </div>
            <Link
              href="/products"
              className="inline-block bg-brand hover:bg-brand-hover text-white font-medium py-3.5 px-8 rounded-full transition-colors text-sm shadow-xs"
            >
              Mulai Belanja
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 items-start">
            {/* Cart Items List */}
            <div className="lg:col-span-2 space-y-6">
              {cartItems.map((item) => (
                <div
                  key={item.id}
                  className="flex gap-4 md:gap-6 py-6 border-b border-apple-border/20 items-center"
                >
                  {/* Image */}
                  <div className="relative aspect-square w-20 md:w-24 bg-apple-bg rounded-xl overflow-hidden flex-shrink-0">
                    <Image
                      src={item.image || "https://images.unsplash.com/photo-1547887537-6158d64c35b3?auto=format&fit=crop&q=80&w=800"}
                      alt={item.name}
                      fill
                      loading="lazy"
                      sizes="(max-width: 768px) 80px, 96px"
                      className="object-cover"
                    />
                  </div>

                  {/* Info */}
                  <div className="flex-grow space-y-1">
                    <span className="text-[10px] text-brand font-semibold uppercase tracking-wider">
                      Parfum
                    </span>
                    <h3 className="text-sm md:text-base font-bold text-apple-text">
                      <Link href={`/products/${item.slug}`} className="hover:text-brand transition-colors">
                        {item.name}
                      </Link>
                    </h3>
                    <p className="text-xs text-apple-gray font-medium">Ukuran: {item.size}</p>
                    <p className="text-xs font-semibold text-apple-text md:hidden">
                      {formatIDR(item.price)}
                    </p>
                  </div>

                  {/* Quantity controls */}
                  <div className="flex items-center border border-apple-border/50 rounded-full overflow-hidden bg-white">
                    <button
                      onClick={() => handleQtyChange(item.id, item.quantity - 1)}
                      className="p-3.5 hover:bg-apple-bg text-apple-text transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center cursor-pointer"
                      aria-label="Kurangi jumlah"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="w-8 text-center text-xs font-semibold text-apple-text">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => handleQtyChange(item.id, item.quantity + 1)}
                      className="p-3.5 hover:bg-apple-bg text-apple-text transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center cursor-pointer"
                      aria-label="Tambah jumlah"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Price info & Delete */}
                  <div className="text-right pl-4 flex flex-col items-end gap-2">
                    <p className="text-sm font-semibold text-apple-text hidden md:block">
                      {formatIDR(item.price * item.quantity)}
                    </p>
                    <button
                      onClick={() => handleRemove(item.id)}
                      className="text-apple-gray hover:text-red-600 p-2 transition-colors"
                      aria-label="Hapus item"
                    >
                      <Trash2 className="w-4 h-4 stroke-[1.5]" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Order Summary Sidebar */}
            <div className="bg-apple-bg p-8 rounded-2xl border border-apple-border/30 space-y-6">
              <h3 className="text-lg font-bold text-apple-text">Ringkasan Belanja</h3>
              
              <div className="space-y-4 text-sm">
                <div className="flex justify-between text-apple-gray">
                  <span>Subtotal</span>
                  <span className="font-semibold text-apple-text">{formatIDR(subtotal)}</span>
                </div>
                <div className="flex justify-between text-apple-gray pb-4 border-b border-apple-border/20">
                  <span>Pengiriman</span>
                  <span className="text-apple-green font-semibold">Gratis</span>
                </div>
                <div className="flex justify-between text-base font-bold text-apple-text pt-2">
                  <span>Total Tagihan</span>
                  <span>{formatIDR(subtotal)}</span>
                </div>
              </div>

              <div className="bg-white p-4 rounded-xl border border-apple-border/20 text-xs text-apple-gray leading-relaxed">
                Lanjutkan ke checkout untuk memilih metode pembayaran (QRIS atau COD di area Surabaya & sekitarnya)
              </div>

              <Link
                href="/checkout"
                className="w-full bg-brand hover:bg-brand-hover text-white font-semibold py-4 rounded-full flex items-center justify-center gap-2 transition-all duration-300 transform hover:scale-[1.01] text-sm shadow-xs"
              >
                Lanjutkan ke Checkout
                <ArrowRight className="w-4 h-4" />
              </Link>

              <div className="text-center">
                <Link href="/products" className="text-xs text-brand hover:underline font-medium">
                  Kembali Belanja
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
