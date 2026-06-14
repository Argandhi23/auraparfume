"use client";

import React, { useState, useTransition, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { updateOrderStatus, getOrderWithItems, deleteReceiptImage } from "@/lib/actions/order";
import { adminWhatsApp } from "@/config/payment";
import { supabaseClient } from "@/lib/supabase-client";
import { Search, Loader2, X, AlertCircle, Eye, Phone, Calendar, User, MapPin, Check, FileImage } from "lucide-react";


interface OrderItem {
  id: string;
  productName: string;
  size: string;
  price: number;
  quantity: number;
}

interface Order {
  id: string;
  customerName: string;
  customerPhone: string;
  customerAddress: string;
  customerNotes: string | null;
  paymentMethod: string;
  totalAmount: number;
  status: "PENDING" | "VERIFIED" | "COMPLETED" | "CANCELLED";
  receiptImg: string | null;
  codLocation: string | null;
  createdAt: string;
  items: OrderItem[];
}

interface OrdersConsoleProps {
  initialOrders: Order[];
  searchQuery?: string;
}

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

export default function OrdersConsole({ initialOrders, searchQuery = "" }: OrdersConsoleProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [orders, setOrders] = useState<Order[]>(initialOrders);
  const [newOrderAlert, setNewOrderAlert] = useState(false);
  const [search, setSearch] = useState(searchQuery);
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [zoomReceipt, setZoomReceipt] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState("");


  // Sync state with server props
  useEffect(() => {
    setOrders(initialOrders);
  }, [initialOrders]);

  const handleSelectOrder = async (order: Order) => {
    if (!order.items || order.items.length === 0) {
      const res = await getOrderWithItems(order.id);
      if (res.success && res.order) {
        setSelectedOrder(res.order as Order);
        setOrders((prev) =>
          prev.map((o) => (o.id === order.id ? (res.order as Order) : o))
        );
      }
    } else {
      setSelectedOrder(order);
    }
  };


  const handleDeleteReceipt = async () => {
    if (!selectedOrder || !selectedOrder.receiptImg) return;
    if (!window.confirm("Apakah Anda yakin ingin menghapus bukti pembayaran ini? Tindakan ini akan menghapus file dari storage dan database.")) {
      return;
    }

    startTransition(async () => {
      const res = await deleteReceiptImage(selectedOrder.id, selectedOrder.receiptImg!);
      if (res.success) {
        setSelectedOrder((prev) => prev ? { ...prev, receiptImg: null } : null);
        setOrders((prev) =>
          prev.map((o) => (o.id === selectedOrder.id ? { ...o, receiptImg: null } : o))
        );
      } else {
        alert(res.error || "Gagal menghapus bukti pembayaran.");
      }
    });
  };

  // Sync state with server props
  useEffect(() => {
    setOrders(initialOrders);
  }, [initialOrders]);

  // Realtime subscriber for Order table (Broadcast event)
  useEffect(() => {
    const channel = supabaseClient
      .channel("admin-orders")
      .on(
        "broadcast",
        { event: "order-event" },
        async (response) => {
          const payload = response.payload;
          if (!payload) return;

          if (payload.type === "ORDER_INSERT") {
            const res = await getOrderWithItems(payload.orderId);
            if (res.success && res.order) {
              setOrders((prev) => {
                if (prev.some((o) => o.id === res.order.id)) return prev;
                return [res.order as Order, ...prev];
              });
              setNewOrderAlert(true);
            }
          } else if (payload.type === "ORDER_UPDATE") {
            const res = await getOrderWithItems(payload.orderId);
            if (res.success && res.order) {
              setOrders((prev) =>
                prev.map((o) => (o.id === payload.orderId ? (res.order as Order) : o))
              );
              setSelectedOrder((current) => {
                if (current && current.id === payload.orderId) {
                  return res.order as Order;
                }
                return current;
              });
            }
          }
        }
      )
      .subscribe();

    return () => {
      supabaseClient.removeChannel(channel);
    };
  }, []);

  // Auto-focus selected order if matched by ID search
  useEffect(() => {
    if (searchQuery && orders.length > 0) {
      const matched = orders.find(o => o.id === searchQuery);
      if (matched) {
        handleSelectOrder(matched);
      }
    }
  }, [searchQuery, orders]);

  const handleUpdateStatus = (
    orderId: string,
    nextStatus: "PENDING" | "VERIFIED" | "COMPLETED" | "CANCELLED"
  ) => {
    setErrorMsg("");

    startTransition(async () => {
      const res = await updateOrderStatus(orderId, nextStatus);
      if (res.success) {
        // Update local state directly
        setOrders((prev) =>
          prev.map((o) =>
            o.id === orderId
              ? ({
                  ...o,
                  status: nextStatus,
                } as Order)
              : o
          )
        );

        const updated = orders.find((o) => o.id === orderId);
        if (updated) {
          setSelectedOrder({
            ...updated,
            status: nextStatus,
          });
        }
        
        router.refresh();
      } else {
        setErrorMsg(res.error || "Gagal memperbarui status.");
      }
    });
  };

  const getStatusLabel = (order: Order) => {
    if (order.status === "PENDING") {
      return order.receiptImg ? "Menunggu Verifikasi" : "Menunggu Pembayaran";
    }
    if (order.status === "VERIFIED") return "Dikonfirmasi (Jadwal COD)";
    if (order.status === "CANCELLED") return "Dibatalkan";
    return "Selesai";
  };

  const getStatusBadge = (order: Order) => {
    if (order.status === "PENDING") {
      return order.receiptImg
        ? "bg-neutral-50 text-neutral-800 border-neutral-300 border-dashed"
        : "bg-neutral-50 text-neutral-800 border-neutral-300 border-dotted";
    }
    if (order.status === "VERIFIED") return "bg-black text-white border-black font-semibold";
    if (order.status === "CANCELLED") return "bg-red-50 text-red-700 border-red-200";
    return "bg-white text-black border-2 border-black font-extrabold";
  };

  const getCustomerWhatsAppLink = (order: Order) => {
    const cleanPhone = order.customerPhone.replace(/[^0-9]/g, "");
    let waPhone = cleanPhone;
    if (cleanPhone.startsWith("0")) {
      waPhone = "62" + cleanPhone.substring(1);
    }
    const message = `Halo ${order.customerName}, pesanan AURA Anda (#${order.id}) sudah kami terima. Mari kita atur lokasi dan waktu COD. Total pembayaran: ${formatIDR(order.totalAmount)}. Kapan dan di mana Anda bisa bertemu?`;
    return `https://wa.me/${waPhone}?text=${encodeURIComponent(message)}`;
  };


  // Filter orders client-side
  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      order.id.toLowerCase().includes(search.toLowerCase()) ||
      order.customerName.toLowerCase().includes(search.toLowerCase()) ||
      order.customerPhone.includes(search);

    const matchesStatus =
      statusFilter === "ALL" ||
      (statusFilter === "PENDING_NO_RECEIPT" && order.status === "PENDING" && !order.receiptImg) ||
      (statusFilter === "PENDING_VERIFY" && order.status === "PENDING" && order.receiptImg) ||
      order.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex justify-between items-start gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-apple-text">
            Kelola Pesanan
          </h2>
          <p className="text-sm text-apple-gray">Pantau transaksi masuk, verifikasi bukti transfer, dan atur waktu/lokasi COD.</p>
        </div>
        <div className="flex items-center gap-2 bg-neutral-50 border border-neutral-200 px-3 py-1.5 rounded-full text-xs text-neutral-800 font-semibold shadow-2xs shrink-0 select-none">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-black opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-black"></span>
          </span>
          <span>Live</span>
        </div>
      </div>

      {newOrderAlert && (
        <div className="bg-black text-white px-5 py-3.5 rounded-2xl flex items-center justify-between shadow-xs animate-scaleIn">
          <span className="text-xs font-semibold tracking-wide">📦 Pesanan baru telah masuk secara live!</span>
          <button
            onClick={() => setNewOrderAlert(false)}
            className="text-white/80 hover:text-white p-1 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Filters & Search Row */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:max-w-md">
          <input
            type="text"
            placeholder="Cari Order ID atau nama customer..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-11 pr-4 py-3 rounded-full border border-apple-border/50 text-base md:text-sm focus:outline-none focus:ring-1 focus:ring-black focus:border-black bg-white"
          />
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-apple-gray w-4 h-4" />
        </div>

        <div className="flex flex-wrap gap-2 w-full md:w-auto overflow-x-auto pb-1">
          {[
            { label: "Semua", value: "ALL" },
            { label: "Belum Bayar", value: "PENDING_NO_RECEIPT" },
            { label: "Butuh Verifikasi", value: "PENDING_VERIFY" },
            { label: "Dikonfirmasi", value: "VERIFIED" },
            { label: "Selesai", value: "COMPLETED" },
            { label: "Dibatalkan", value: "CANCELLED" },
          ].map((tab) => (
            <button
              key={tab.value}
              onClick={() => setStatusFilter(tab.value)}
              className={`text-xs py-2 px-4 rounded-full font-semibold border transition-all duration-300 ${
                statusFilter === tab.value
                  ? "bg-apple-text text-white border-apple-text"
                  : "bg-white text-apple-gray border-apple-border/50 hover:border-apple-text"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white p-6 rounded-3xl border border-apple-border/30 shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm divide-y divide-apple-border/20">
            <thead>
              <tr className="text-xs text-apple-gray uppercase font-semibold">
                <th className="py-3 px-2">Order ID</th>
                <th className="py-3 px-2">Customer</th>
                <th className="py-3 px-2">Tanggal</th>
                <th className="py-3 px-2">Status</th>
                <th className="py-3 px-2">Metode</th>
                <th className="py-3 px-2">Total</th>
                <th className="py-3 px-2 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-apple-border/10">
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-apple-gray text-xs">
                    Tidak ada transaksi ditemukan.
                  </td>
                </tr>
              ) : (
                filteredOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-apple-bg/30 transition-colors">
                    <td className="py-4 px-2 font-semibold text-apple-text">{order.id}</td>
                    <td className="py-4 px-2">
                      <div className="font-semibold text-apple-text">{order.customerName}</div>
                      <div className="text-[10px] text-apple-gray flex items-center gap-1">
                        <Phone className="w-2.5 h-2.5" /> {order.customerPhone}
                      </div>
                    </td>
                    <td className="py-4 px-2 text-xs text-apple-gray">
                      {formatDate(order.createdAt)}
                    </td>
                    <td className="py-4 px-2">
                      <span className={`inline-block text-[10px] font-bold px-3 py-1 rounded-full border ${getStatusBadge(order)}`}>
                        {getStatusLabel(order)}
                      </span>
                    </td>
                    <td className="py-4 px-2 font-semibold text-xs text-neutral-900"><span className="bg-neutral-100 px-2.5 py-1 rounded-md">{order.paymentMethod}</span></td>
                    <td className="py-4 px-2 font-semibold text-apple-text">{formatIDR(order.totalAmount)}</td>
                    <td className="py-4 px-2 text-right">
                      <button
                        onClick={() => handleSelectOrder(order)}
                        className="inline-flex items-center justify-center p-2 rounded-lg bg-apple-bg hover:bg-apple-border/30 text-apple-text hover:text-black transition-colors cursor-pointer"
                        title="Lihat Detail"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Order Detail Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl border border-apple-border/30 shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto flex flex-col">
            
            {/* Modal Header */}
            <div className="p-6 border-b border-apple-border/20 flex items-center justify-between sticky top-0 bg-white z-10">
              <div>
                <span className="text-[10px] text-brand font-bold uppercase tracking-wider block">Detail Transaksi</span>
                <h3 className="text-xl font-bold text-apple-text">{selectedOrder.id}</h3>
              </div>
              <button
                onClick={() => {
                  setSelectedOrder(null);
                  setErrorMsg("");
                }}
                className="text-apple-gray hover:text-apple-text cursor-pointer p-1 rounded-lg hover:bg-apple-bg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-8 flex-grow">
              
              {/* Error messages */}
              {errorMsg && (
                <div className="p-4 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {/* Status Banner (No Resi removed) */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 bg-apple-bg rounded-2xl border border-apple-border/20">
                <div className="space-y-1">
                  <span className="text-[9px] text-apple-gray font-bold uppercase tracking-wider block">Status</span>
                  <span className={`inline-block text-[10px] font-bold px-3 py-1 rounded-full border ${getStatusBadge(selectedOrder)}`}>
                    {getStatusLabel(selectedOrder)}
                  </span>
                </div>
              </div>

              {/* Grid 2 Columns: Info & Items */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Customer Details & Receipt */}
                <div className="space-y-6">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-apple-gray border-b border-apple-border/15 pb-1 flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-black" /> Informasi Pembeli
                  </h4>
                  <div className="space-y-3 text-xs text-apple-gray leading-relaxed">
                    <p><span className="font-semibold text-apple-text">Nama:</span> {selectedOrder.customerName}</p>
                    <p className="flex items-center gap-2">
                      <span className="font-semibold text-apple-text">WhatsApp:</span> 
                      <a
                        href={`https://wa.me/${selectedOrder.customerPhone.replace(/[^0-9]/g, "").startsWith("0") ? "62" + selectedOrder.customerPhone.replace(/[^0-9]/g, "").slice(1) : selectedOrder.customerPhone.replace(/[^0-9]/g, "")}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-black hover:underline font-semibold flex items-center gap-1"
                      >
                        {selectedOrder.customerPhone} <Phone className="w-3 h-3 text-neutral-800 fill-neutral-800" />
                      </a>
                    </p>
                    <p className="flex items-start gap-1">
                      <span className="font-semibold text-apple-text flex-shrink-0">Area COD:</span> 
                      <span>{selectedOrder.customerAddress}</span>
                    </p>
                    {selectedOrder.customerNotes && (
                      <p><span className="font-semibold text-apple-text">Catatan:</span> {selectedOrder.customerNotes}</p>
                    )}
                    <p><span className="font-semibold text-apple-text">Tanggal Order:</span> {formatDate(selectedOrder.createdAt)}</p>
                    <p><span className="font-semibold text-apple-text">Metode Bayar:</span> {selectedOrder.paymentMethod}</p>
                  </div>


                  {/* Payment Proof Image */}
                  <div className="space-y-3">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-apple-gray border-b border-apple-border/15 pb-1 flex items-center gap-1.5">
                      <FileImage className="w-3.5 h-3.5 text-black" /> Bukti Pembayaran (QRIS)
                    </h4>
                    {selectedOrder.receiptImg ? (
                      <div className="space-y-2">
                        <div
                          onClick={() => setZoomReceipt(selectedOrder.receiptImg)}
                          className="relative aspect-[4/3] w-full rounded-xl overflow-hidden border border-apple-border/30 bg-apple-bg cursor-zoom-in hover:brightness-95 transition-all shadow-xs"
                          title="Klik untuk memperbesar"
                        >
                          <Image src={selectedOrder.receiptImg} alt="Bukti Transfer" fill className="object-cover" />
                        </div>
                        <p className="text-[10px] text-apple-gray text-center">Klik gambar untuk memperbesar bukti transfer.</p>
                        {selectedOrder.paymentMethod === "QRIS" && (
                          <button
                            type="button"
                            onClick={handleDeleteReceipt}
                            disabled={isPending}
                            className="mt-2 text-sm text-neutral-500 hover:text-black underline underline-offset-2 transition-colors cursor-pointer w-full text-center"
                          >
                            🗑 Hapus Bukti Bayar dari Storage
                          </button>
                        )}
                      </div>
                    ) : (
                      <p className="text-xs text-apple-gray italic bg-neutral-50 border border-neutral-200 p-4 rounded-xl text-center">
                        Penerima belum mengunggah bukti pembayaran.
                      </p>
                    )}
                  </div>
                </div>

                {/* Items Purchased & Actions */}
                <div className="space-y-6 flex flex-col justify-between">
                  <div className="space-y-4">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-apple-gray border-b border-apple-border/15 pb-1">
                      Item Pembelian
                    </h4>
                    <div className="divide-y divide-apple-border/10 space-y-3">
                      {selectedOrder.items.map((item) => (
                        <div key={item.id} className="flex justify-between items-start text-xs pt-3">
                          <div>
                            <p className="font-bold text-apple-text">{item.productName}</p>
                            <p className="text-[10px] text-apple-gray mt-0.5">Ukuran: {item.size} • Qty: {item.quantity}</p>
                          </div>
                          <span className="font-semibold text-apple-text">{formatIDR(item.price * item.quantity)}</span>
                        </div>
                      ))}
                    </div>
                    <div className="flex justify-between items-center pt-4 border-t border-apple-border/20 text-sm font-bold text-apple-text">
                      <span>Total Bayar</span>
                      <span className="text-black text-base">{formatIDR(selectedOrder.totalAmount)}</span>
                    </div>
                  </div>

                  {/* Actions Console */}
                  <div className="bg-apple-bg/50 p-5 rounded-2xl border border-apple-border/20 space-y-3 mt-8">
                    <span className="text-xs font-bold uppercase tracking-wider text-apple-gray block">
                      Tindakan Admin
                    </span>

                    {/* Pending Verification -> Verify */}
                    {selectedOrder.status === "PENDING" && (
                      <button
                        onClick={() => handleUpdateStatus(selectedOrder.id, "VERIFIED")}
                        disabled={isPending}
                        className="w-full bg-black hover:bg-neutral-800 text-white font-semibold py-3.5 rounded-full flex items-center justify-center gap-2 text-xs transition-colors cursor-pointer disabled:opacity-40"
                      >
                        {isPending ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <>
                            <Check className="w-4 h-4" /> Konfirmasi Order (Proses)
                          </>
                        )}
                      </button>
                    )}

                    {/* Verified -> Complete */}
                    {selectedOrder.status === "VERIFIED" && (
                      <button
                        onClick={() => handleUpdateStatus(selectedOrder.id, "COMPLETED")}
                        disabled={isPending}
                        className="w-full bg-black hover:bg-neutral-800 text-white font-semibold py-3.5 rounded-full flex items-center justify-center gap-2 text-xs transition-colors cursor-pointer disabled:opacity-40"
                      >
                        {isPending ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <>
                            <Check className="w-4 h-4" /> Tandai Selesai (Selesai)
                          </>
                        )}
                      </button>
                    )}

                    {/* WhatsApp Chat button for COD order (PENDING or VERIFIED status) */}
                    {selectedOrder.paymentMethod === "COD" && (selectedOrder.status === "PENDING" || selectedOrder.status === "VERIFIED") && (
                      <a
                        href={getCustomerWhatsAppLink(selectedOrder)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-3.5 rounded-full flex items-center justify-center gap-2 text-xs transition-colors cursor-pointer text-center"
                      >
                        💬 Chat Customer via WhatsApp
                      </a>
                    )}

                    {/* Cancel button: available if status is PENDING or VERIFIED */}
                    {(selectedOrder.status === "PENDING" || selectedOrder.status === "VERIFIED") && (
                      <button
                        onClick={() => {
                          if (confirm("Apakah Anda yakin ingin membatalkan pesanan ini?")) {
                            handleUpdateStatus(selectedOrder.id, "CANCELLED");
                          }
                        }}
                        disabled={isPending}
                        className="w-full bg-white hover:bg-neutral-50 text-red-600 border border-neutral-300 font-semibold py-3.5 rounded-full flex items-center justify-center gap-2 text-xs transition-colors cursor-pointer disabled:opacity-40"
                      >
                        Batalkan Pesanan
                      </button>
                    )}

                    {/* Completed */}
                    {selectedOrder.status === "COMPLETED" && (
                      <div className="text-center py-2 bg-neutral-100 text-neutral-800 rounded-xl border border-neutral-300 text-xs font-semibold">
                        Pesanan Selesai & Lunas
                      </div>
                    )}

                    {/* Cancelled */}
                    {selectedOrder.status === "CANCELLED" && (
                      <div className="text-center py-2 bg-red-50 text-red-800 rounded-xl border border-red-200 text-xs font-semibold">
                        Pesanan Dibatalkan
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Full-screen Receipt Zoom Image Modal Overlay */}
      {zoomReceipt && (
        <div
          onClick={() => setZoomReceipt(null)}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-6 cursor-zoom-out"
        >
          <div className="relative max-w-4xl max-h-[90vh] aspect-auto w-full h-full">
            <Image src={zoomReceipt} alt="Bukti Transfer Zoomed" fill className="object-contain" />
          </div>
        </div>
      )}
    </div>
  );
}
