"use client";

import React, { useState, useTransition } from "react";
import Link from "next/link";
import { searchOrders } from "@/lib/actions/order";
import { adminWhatsApp } from "@/config/payment";
import { Search, Loader2, ArrowRight, ShieldCheck, Truck, AlertCircle } from "lucide-react";

function formatIDR(price: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price);
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("id-ID", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function TrackOrderPage() {
  const [query, setQuery] = useState("");
  const [orders, setOrders] = useState<any[]>([]);
  const [searched, setSearched] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [isPending, startTransition] = useTransition();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    if (!query.trim()) {
      setErrorMsg("Harap masukkan nomor pesanan atau nomor WhatsApp.");
      return;
    }

    startTransition(async () => {
      const response = await searchOrders(query);
      if (response.success && response.orders) {
        setOrders(response.orders);
        setSearched(true);
      } else {
        setErrorMsg(response.error || "Gagal melakukan pencarian.");
      }
    });
  };

  const getStatusLabel = (status: string, hasReceipt: boolean, paymentMethod: string) => {
    switch (status) {
      case "PENDING":
        if (paymentMethod === "COD") {
          return "Menunggu Konfirmasi COD";
        }
        return hasReceipt ? "Menunggu Verifikasi Pembayaran" : "Menunggu Pembayaran / Upload Bukti";
      case "VERIFIED":
        return "Pesanan Terkonfirmasi";
      case "COMPLETED":
        return "Pesanan Selesai";
      default:
        return "Status Tidak Diketahui";
    }
  };

  const getStatusStyles = (status: string, hasReceipt: boolean) => {
    switch (status) {
      case "PENDING":
        return hasReceipt
          ? "bg-neutral-50 text-neutral-800 border-neutral-300 border-dashed"
          : "bg-neutral-50 text-neutral-800 border-neutral-300 border-dotted";
      case "VERIFIED":
        return "bg-black text-white border-black font-semibold";
      case "COMPLETED":
        return "bg-white text-black border-2 border-black font-extrabold";
      default:
        return "bg-neutral-50 text-neutral-600 border-neutral-200";
    }
  };

  return (
    <div className="bg-white min-h-screen pt-32 pb-24 px-6 md:px-12">
      <div className="max-w-4xl mx-auto space-y-12">
        {/* Header */}
        <div className="space-y-2 text-center">
          <span className="text-xs uppercase tracking-widest text-neutral-900 font-semibold block">
            Layanan Customer
          </span>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-neutral-900">
            Lacak Pesanan
          </h1>
          <p className="text-sm text-neutral-500 max-w-md mx-auto leading-relaxed">
            Masukkan Nomor Pesanan Anda (contoh: ORD-...) atau Nomor WhatsApp yang digunakan saat checkout.
          </p>
        </div>

        {/* Search Bar */}
        <form onSubmit={handleSearch} className="max-w-2xl mx-auto space-y-4">
          <div className="relative flex gap-3 items-stretch">
            <div className="relative flex-grow">
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Nomor Pesanan atau No WhatsApp"
                className="w-full pl-12 pr-4 py-4 rounded-full border border-neutral-300 text-base md:text-sm focus:outline-none focus:ring-1 focus:ring-black focus:border-black bg-white"
              />
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-500 w-5 h-5 stroke-[1.5]" />
            </div>
            <button
              type="submit"
              disabled={isPending}
              className="bg-black hover:bg-neutral-800 text-white font-semibold px-8 rounded-full transition-all duration-300 text-sm flex items-center justify-center gap-2 cursor-pointer"
            >
              {isPending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> Lacak...
                </>
              ) : (
                "Cari"
              )}
            </button>
          </div>

          {errorMsg && (
            <div className="flex justify-center">
              <p className="text-xs text-black font-semibold flex items-center gap-1.5 border border-neutral-300 bg-neutral-50 py-2 px-4 rounded-full">
                <AlertCircle className="w-3.5 h-3.5" /> {errorMsg}
              </p>
            </div>
          )}
        </form>

        {/* Results */}
        {searched && (
          <div className="space-y-8">
            <h2 className="text-xl font-bold text-neutral-900 border-b border-neutral-200 pb-2">
              Hasil Pelacakan ({orders.length} Pesanan)
            </h2>

            {orders.length === 0 ? (
              <div className="text-center py-16 bg-neutral-50 rounded-2xl border border-neutral-200 max-w-xl mx-auto">
                <p className="text-sm text-neutral-900 font-bold">Pesanan tidak ditemukan</p>
                <p className="text-xs text-neutral-500 mt-1">
                  Harap periksa kembali nomor pesanan Anda atau no WhatsApp. Pastikan format sudah sesuai.
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                {orders.map((order) => (
                  <div
                    key={order.id}
                    className="border border-neutral-200 rounded-2xl bg-white overflow-hidden shadow-xs hover:shadow-md transition-shadow duration-300"
                  >
                    {/* Header Order */}
                    <div className="bg-neutral-50 px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-neutral-200">
                      <div>
                        <p className="text-xs text-neutral-500 font-semibold uppercase tracking-wider">
                          Nomor Pesanan
                        </p>
                        <p className="text-sm font-bold text-neutral-900">{order.id}</p>
                      </div>
                      <div className="sm:text-right">
                        <p className="text-xs text-neutral-500 font-semibold uppercase tracking-wider">
                          Tanggal Pemesanan
                        </p>
                        <p className="text-xs font-semibold text-neutral-900">
                          {formatDate(order.createdAt)}
                        </p>
                      </div>
                    </div>

                    {/* Body Order */}
                    <div className="p-6 space-y-6">
                      
                      {/* Status Row */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="space-y-1">
                          <span className="text-[10px] text-neutral-500 font-bold uppercase tracking-wider block">
                            Status Pemesanan
                          </span>
                          <div
                            className={`px-4 py-1.5 rounded-full border text-xs font-bold w-fit ${getStatusStyles(
                              order.status,
                              !!order.receiptImg
                            )}`}
                          >
                            {getStatusLabel(order.status, !!order.receiptImg, order.paymentMethod)}
                          </div>
                        </div>
                      </div>

                      {/* Status and Action Callout */}
                      {order.status === "PENDING" && order.paymentMethod === "QRIS" && (
                        <div className="p-4 bg-neutral-50 border border-neutral-200 text-neutral-900 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                          <div className="flex items-center gap-2">
                            <AlertCircle className="w-5 h-5 flex-shrink-0" />
                            <p className="text-xs font-medium">
                              {order.receiptImg 
                                ? "Bukti transfer telah diunggah. Menunggu verifikasi admin."
                                : "Segera upload bukti pembayaran QRIS untuk memproses pesanan."}
                            </p>
                          </div>
                          {!order.receiptImg && (
                            <Link
                              href={`/order-success/${order.id}`}
                              className="bg-black hover:bg-neutral-800 text-white font-semibold text-xs py-2.5 px-5 rounded-full flex items-center gap-1.5 transition-colors w-fit"
                            >
                              Unggah Sekarang <ArrowRight className="w-3.5 h-3.5" />
                            </Link>
                          )}
                        </div>
                      )}

                      {order.status === "PENDING" && order.paymentMethod === "COD" && (
                        <div className="p-4 bg-neutral-50 border border-neutral-200 text-neutral-900 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                          <div className="flex items-center gap-2">
                            <AlertCircle className="w-5 h-5 flex-shrink-0" />
                            <p className="text-xs font-medium">
                              Pesanan terdaftar. Selesaikan konfirmasi lokasi & waktu COD via WhatsApp admin.
                            </p>
                          </div>
                          <a
                            href={`https://wa.me/${adminWhatsApp}?text=${encodeURIComponent(
                              `Halo Admin AURA, saya ingin konfirmasi pesanan COD saya.\n\nNomor Order: ${order.id}\nNama: ${order.customerName}\nTotal: ${formatIDR(order.totalAmount)}`
                            )}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs py-2.5 px-5 rounded-full flex items-center gap-1.5 transition-colors w-fit text-center cursor-pointer"
                          >
                            💬 Chat WhatsApp Admin
                          </a>
                        </div>
                      )}

                      {order.status === "VERIFIED" && order.paymentMethod === "COD" && (
                        <div className="p-4 bg-neutral-50 border border-neutral-200 text-neutral-900 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                          <div className="flex items-center gap-2">
                            <ShieldCheck className="w-5 h-5 flex-shrink-0 text-black" />
                            <p className="text-xs font-medium">
                              Pesanan dikonfirmasi ✓ — Anda dapat berkoordinasi langsung via WhatsApp admin.
                            </p>
                          </div>
                          <a
                            href={`https://wa.me/${adminWhatsApp}?text=${encodeURIComponent(
                              `Halo Admin AURA, saya ingin konfirmasi pesanan COD saya.\n\nNomor Order: ${order.id}\nNama: ${order.customerName}\nTotal: ${formatIDR(order.totalAmount)}`
                            )}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs py-2.5 px-5 rounded-full flex items-center gap-1.5 transition-colors w-fit text-center cursor-pointer"
                          >
                            💬 Chat WhatsApp Admin
                          </a>
                        </div>
                      )}

                      {order.status === "VERIFIED" && order.paymentMethod !== "COD" && (
                        <div className="p-4 bg-neutral-50 border border-neutral-200 text-neutral-900 rounded-xl flex items-center gap-2">
                          <ShieldCheck className="w-5 h-5 flex-shrink-0 text-black" />
                          <p className="text-xs font-medium">
                            Pesanan dikonfirmasi ✓ — tunggu konfirmasi lokasi COD dari admin.
                          </p>
                        </div>
                      )}

                      {order.status === "COMPLETED" && (
                        <div className="p-4 bg-neutral-50 border border-neutral-200 text-neutral-900 rounded-xl flex items-center gap-2">
                          <ShieldCheck className="w-5 h-5 flex-shrink-0 text-black" />
                          <p className="text-xs font-medium">
                            Pesanan selesai ✓ Terima kasih!
                          </p>
                        </div>
                      )}

                      {/* Purchased Items */}
                      <div className="space-y-3">
                        <span className="text-[10px] text-neutral-500 font-bold uppercase tracking-wider block">
                          Item yang Dibeli
                        </span>
                        <div className="space-y-2 border border-neutral-200 rounded-xl divide-y divide-neutral-200 p-4 bg-neutral-50/50">
                          {order.items.map((item: any) => (
                            <div key={item.id} className="flex justify-between py-2 text-xs">
                              <div>
                                <span className="font-bold text-neutral-900">{item.productName}</span>
                                <span className="text-[10px] text-neutral-500 ml-2">({item.size})</span>
                              </div>
                              <span className="font-semibold text-neutral-900">
                                {item.quantity}x @ {formatIDR(item.price)}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Summary Pricing */}
                      <div className="flex justify-between items-center pt-2 border-t border-neutral-200 text-sm font-bold text-neutral-900">
                        <span>Total Pembayaran</span>
                        <span className="text-base text-black">{formatIDR(order.totalAmount)}</span>
                      </div>

                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
