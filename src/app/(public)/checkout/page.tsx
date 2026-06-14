"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { getCart, clearCart, CartItem } from "@/lib/cart";
import { createOrder } from "@/lib/actions/order";
import { paymentConfig } from "@/config/payment";
import { ArrowLeft, Loader2, CreditCard, ShoppingBag, MapPin, QrCode, Handshake } from "lucide-react";

function formatIDR(price: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price);
}

export default function CheckoutPage() {
  const router = useRouter();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [mounted, setMounted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // Form states
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerAddress, setCustomerAddress] = useState("");
  const [customerNotes, setCustomerNotes] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<"QRIS" | "COD">("QRIS");
  const [selectedOption, setSelectedOption] = useState<"COD" | "QRIS" | null>(null);

  useEffect(() => {
    setMounted(true);
    const cart = getCart();
    setCartItems(cart);
    
    // Redirect if cart is empty
    if (cart.length === 0) {
      router.push("/cart");
    }
  }, [router]);

  if (!mounted || cartItems.length === 0) {
    return (
      <div className="min-h-screen pt-32 pb-24 flex items-center justify-center bg-white">
        <div className="w-8 h-8 border-4 border-black border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");
    setIsSubmitting(true);

    const itemsPayload = cartItems.map((item) => ({
      productId: item.productId,
      productName: item.name,
      size: item.size,
      price: item.price,
      quantity: item.quantity,
    }));

    const response = await createOrder({
      customerName,
      customerPhone,
      customerAddress,
      customerNotes: customerNotes.trim() || undefined,
      paymentMethod,
      items: itemsPayload,
    });

    if (response.success && response.orderId) {
      clearCart(); // clear cart on success
      router.push(`/order-success/${response.orderId}`);
    } else {
      setErrorMessage(response.error || "Gagal membuat pesanan.");
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white min-h-screen pt-32 pb-24 px-6 md:px-12">
      <div className="max-w-7xl mx-auto">
        {/* Back Link */}
        <Link
          href="/cart"
          className="inline-flex items-center gap-2 text-sm text-neutral-500 hover:text-black transition-colors mb-8"
        >
          <ArrowLeft className="w-4 h-4" /> Kembali ke Kantong Belanja
        </Link>

        <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-neutral-900 mb-2">
          Checkout Pemesanan
        </h1>
        <p className="text-sm text-neutral-500 mb-12">
          Silakan pilih opsi metode pemesanan di bawah ini terlebih dahulu.
        </p>

        {/* 1. THREE OPTIONS SELECTION */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {/* Card 1: QRIS */}
          <button
            type="button"
            onClick={() => {
              setSelectedOption("QRIS");
              setPaymentMethod("QRIS");
            }}
            className={`p-6 rounded-3xl border text-left flex flex-col justify-between h-48 transition-all duration-300 cursor-pointer ${
              selectedOption === "QRIS"
                ? "border-black bg-neutral-50 ring-1 ring-black shadow-xs"
                : "border-neutral-200 bg-white hover:border-black hover:shadow-xs"
            }`}
          >
            <div className="w-10 h-10 rounded-full bg-neutral-100 flex items-center justify-center text-black">
              <QrCode className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-neutral-900">Bayar via QRIS</h3>
              <p className="text-xs text-neutral-500 mt-1 leading-relaxed">
                Scan QRIS, lalu kita janjian COD untuk serah terima parfum
              </p>
            </div>
          </button>

          {/* Card 2: COD — Bayar Saat Bertemu */}
          <button
            type="button"
            onClick={() => {
              setSelectedOption("COD");
              setPaymentMethod("COD");
            }}
            className={`p-6 rounded-3xl border text-left flex flex-col justify-between h-48 transition-all duration-300 cursor-pointer ${
              selectedOption === "COD"
                ? "border-black bg-neutral-50 ring-1 ring-black shadow-xs"
                : "border-neutral-200 bg-white hover:border-black hover:shadow-xs"
            }`}
          >
            <div className="w-10 h-10 rounded-full bg-neutral-100 flex items-center justify-center text-black">
              <Handshake className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-neutral-900">COD — Bayar Saat Bertemu</h3>
              <p className="text-xs text-neutral-500 mt-1 leading-relaxed">
                Bayar tunai saat kita bertemu langsung di area Surabaya & sekitarnya
              </p>
            </div>
          </button>

          {/* Card 3: Beli via Shopee */}
          <a
            href={paymentConfig.shopeeUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="p-6 rounded-3xl border border-neutral-200 bg-white hover:border-black hover:shadow-xs text-left flex flex-col justify-between h-48 transition-all duration-300 group cursor-pointer"
          >
            <div className="w-10 h-10 rounded-full bg-neutral-100 flex items-center justify-center text-black">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-neutral-900 flex items-center gap-1.5">
                Beli via Shopee
              </h3>
              <p className="text-xs text-neutral-500 mt-1 leading-relaxed">
                Untuk luar Surabaya atau lebih suka belanja online
              </p>
              <span className="inline-block mt-2 text-xs font-semibold underline text-neutral-800">
                Kunjungi Toko Shopee kami →
              </span>
            </div>
          </a>
        </div>

        {/* 2. CONDITIONAL FORM RENDERING */}
        {selectedOption ? (
          <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-12 items-start">
            {/* Left Columns: Forms */}
            <div className="lg:col-span-2 space-y-8 animate-scaleIn">
              
              {/* Error Message display */}
              {errorMessage && (
                <div className="p-4 bg-neutral-50 border border-neutral-300 text-black text-sm rounded-xl font-medium">
                  {errorMessage}
                </div>
              )}

              {/* Billing / Shipping Info */}
              <div className="space-y-6">
                <div className="flex justify-between items-end border-b border-neutral-200 pb-2">
                  <h2 className="text-xl font-bold text-neutral-900">
                    Informasi Kontak & Area COD
                  </h2>
                  <span className="text-xs text-neutral-500 italic">
                    Layanan COD tersedia untuk area Surabaya dan sekitarnya
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label htmlFor="name" className="text-xs font-semibold uppercase tracking-wider text-neutral-500">
                      Nama Lengkap
                    </label>
                    <input
                      id="name"
                      type="text"
                      required
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      placeholder="Nama Lengkap Penerima"
                      className="w-full p-3.5 border border-neutral-300 text-base md:text-sm rounded-xl focus:outline-none focus:ring-1 focus:ring-black focus:border-black bg-white"
                    />
                  </div>

                  <div className="space-y-1">
                    <label htmlFor="phone" className="text-xs font-semibold uppercase tracking-wider text-neutral-500">
                      No WhatsApp (Aktif)
                    </label>
                    <input
                      id="phone"
                      type="tel"
                      required
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      placeholder="Contoh: 08123456789"
                      className="w-full p-3.5 border border-neutral-300 text-base md:text-sm rounded-xl focus:outline-none focus:ring-1 focus:ring-black focus:border-black bg-white"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label htmlFor="address" className="text-xs font-semibold uppercase tracking-wider text-neutral-500">
                    Area / Kecamatan COD Surabaya
                  </label>
                  <textarea
                    id="address"
                    required
                    rows={2}
                    value={customerAddress}
                    onChange={(e) => setCustomerAddress(e.target.value)}
                    placeholder="Contoh: Rungkut, Wonokromo, Gubeng, Waru Sidoarjo, dll. (Lokasi detail akan dikoordinasikan via WA)"
                    className="w-full p-3.5 border border-neutral-300 text-base md:text-sm rounded-xl focus:outline-none focus:ring-1 focus:ring-black focus:border-black bg-white resize-none"
                  />
                </div>

                <div className="space-y-1">
                  <label htmlFor="notes" className="text-xs font-semibold uppercase tracking-wider text-neutral-500">
                    Catatan Tambahan (Opsional)
                  </label>
                  <input
                    id="notes"
                    type="text"
                    value={customerNotes}
                    onChange={(e) => setCustomerNotes(e.target.value)}
                    placeholder="Contoh: Jam pulang kantor, titip di lobby, dll."
                    className="w-full p-3.5 border border-neutral-300 text-base md:text-sm rounded-xl focus:outline-none focus:ring-1 focus:ring-black focus:border-black bg-white"
                  />
                </div>
              </div>

              {/* Payment Details Box */}
              <div className="bg-neutral-50 p-6 rounded-2xl border border-neutral-200 space-y-4">
                <span className="text-xs font-bold uppercase tracking-wider text-neutral-500 block">
                  Detail Metode Pembayaran: {paymentMethod === "QRIS" ? "QRIS" : "COD (Bayar Saat Bertemu)"}
                </span>
                
                {paymentMethod === "QRIS" && (
                  <div className="space-y-3">
                    <p className="text-sm font-semibold text-neutral-900">Scan Barcode QRIS Statis</p>
                    <p className="text-xs text-neutral-500 leading-relaxed">
                      Pindai kode QRIS kami di bawah ini untuk melakukan pembayaran. Setelah membuat pesanan, harap upload bukti pembayaran di halaman sukses agar kami dapat memproses pengiriman COD Anda.
                    </p>
                    <div className="relative w-48 h-48 border border-neutral-200 rounded-2xl overflow-hidden mt-3 bg-white flex items-center justify-center p-2">
                      <Image
                        src={paymentConfig.qris.imageUrl}
                        alt={paymentConfig.qris.name}
                        fill
                        className="object-contain p-2"
                      />
                    </div>
                  </div>
                )}

                {paymentMethod === "COD" && (
                  <div className="space-y-3">
                    <div className="space-y-1">
                      <p className="text-sm font-semibold text-neutral-900 font-sans">COD - Bayar Tunai saat Bertemu</p>
                      <p className="text-xs text-neutral-500 leading-relaxed">
                        Pesanan langsung diproses.
                      </p>
                    </div>

                    <div className="pt-2 text-xs text-neutral-600 font-medium leading-relaxed bg-neutral-100 p-3.5 rounded-xl border border-neutral-200">
                      ℹ️ Admin akan menghubungi Anda via WhatsApp untuk konfirmasi lokasi & waktu COD setelah pesanan masuk
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Right Column: Order Summary & Action */}
            <div className="bg-neutral-50 p-8 rounded-2xl border border-neutral-200 space-y-6">
              <h3 className="text-lg font-bold text-neutral-900 border-b border-neutral-200 pb-2">
                Ringkasan Pesanan
              </h3>

              {/* Item list */}
              <div className="space-y-4 max-h-60 overflow-y-auto pr-2">
                {cartItems.map((item) => (
                  <div key={item.id} className="flex gap-3 text-xs items-center justify-between">
                    <div className="flex gap-2 items-center">
                      <span className="font-semibold bg-white border border-neutral-200 w-5 h-5 rounded-md flex items-center justify-center text-[10px]">
                        {item.quantity}x
                      </span>
                      <div>
                        <p className="font-bold text-neutral-900">{item.name}</p>
                        <p className="text-[10px] text-neutral-500">{item.size}</p>
                      </div>
                    </div>
                    <span className="font-semibold text-neutral-900">{formatIDR(item.price * item.quantity)}</span>
                  </div>
                ))}
              </div>

              <hr className="border-neutral-200" />

              <div className="space-y-3 text-sm">
                <div className="flex justify-between text-neutral-500">
                  <span>Subtotal</span>
                  <span className="font-semibold text-neutral-900">{formatIDR(subtotal)}</span>
                </div>
                <div className="flex justify-between text-neutral-500 pb-3 border-b border-neutral-200">
                  <span>Pertemuan COD</span>
                  <span className="text-neutral-900 font-semibold">Gratis COD</span>
                </div>
                <div className="flex justify-between text-base font-bold text-neutral-900 pt-1">
                  <span>Total Bayar</span>
                  <span>{formatIDR(subtotal)}</span>
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-black hover:bg-neutral-800 text-white font-semibold py-4 rounded-full flex items-center justify-center gap-2 transition-all duration-300 disabled:opacity-40 disabled:pointer-events-none text-sm shadow-xs cursor-pointer"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" /> Sedang Memproses...
                  </>
                ) : paymentMethod === "QRIS" ? (
                  "Buat Pesanan & Bayar QRIS"
                ) : (
                  "Buat Pesanan COD"
                )}
              </button>
            </div>
          </form>
        ) : (
          <div className="text-center py-16 bg-neutral-50 rounded-3xl border border-dashed border-neutral-200">
            <p className="text-sm text-neutral-500">
              Silakan pilih opsi metode pemesanan (QRIS atau COD) di atas untuk mengisi formulir.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
