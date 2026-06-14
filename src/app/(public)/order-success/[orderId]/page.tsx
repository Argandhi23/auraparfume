import React from "react";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import prisma from "@/lib/db";
import { paymentConfig, adminWhatsApp } from "@/config/payment";
import ReceiptUploader from "@/components/ReceiptUploader";
import { CheckCircle2, CreditCard, ArrowRight, ShieldCheck, MapPin } from "lucide-react";

export const revalidate = 0; // Fresh database fetches

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
    orderId: string;
  }>;
}

export default async function OrderSuccessPage({ params }: PageProps) {
  const resolvedParams = await params;
  const orderId = resolvedParams.orderId;

  // Retrieve order details
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      items: true,
    },
  });

  if (!order) {
    notFound();
  }

  const isCOD = order.paymentMethod === "COD";
  const hasReceipt = !!order.receiptImg;

  return (
    <div className="bg-white min-h-screen pt-32 pb-24 px-6 md:px-12">
      <div className="max-w-3xl mx-auto space-y-10">
        
        {/* Success Header Card */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-neutral-100 text-neutral-900 border border-neutral-200">
            <CheckCircle2 className="w-10 h-10 stroke-[1.2]" />
          </div>
          <div className="space-y-1">
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-neutral-900">
              Pesanan Dibuat
            </h1>
            <p className="text-sm text-neutral-500">
              Nomor Pesanan: <span className="font-bold text-neutral-900">{order.id}</span>
            </p>
          </div>
        </div>

        <hr className="border-neutral-200" />

        {/* Status Alert Banner */}
        <div className={`p-6 rounded-2xl border text-center space-y-2 ${
          isCOD 
            ? "bg-neutral-50 border-neutral-300 text-neutral-900 font-medium"
            : hasReceipt
            ? "bg-neutral-900 border-neutral-800 text-white"
            : "bg-neutral-50 border-neutral-300 text-neutral-900"
        }`}>
          <h2 className="text-base font-bold uppercase tracking-wider text-xs">
            {isCOD 
              ? "Pesanan Terverifikasi (COD)" 
              : hasReceipt
              ? "Bukti Pembayaran Diterima" 
              : "Menunggu Pembayaran QRIS"}
          </h2>
          <p className="text-xs max-w-lg mx-auto opacity-90 leading-relaxed">
            {isCOD 
              ? "Terima kasih! Pesanan Cash on Delivery (COD) Anda telah masuk sistem. Admin kami akan segera menghubungi Anda via WhatsApp untuk melakukan konfirmasi jadwal pengiriman dan lokasi pertemuan."
              : hasReceipt
              ? "Terima kasih! Bukti transfer Anda sudah kami terima dan sedang diverifikasi oleh admin. Kami akan mengirimkan pesanan Anda setelah verifikasi selesai."
              : "Silakan pindai kode QRIS statis di bawah ini dan lakukan pembayaran. Setelah selesai, harap unggah foto/screenshot bukti transfer di form yang disediakan."}
          </p>
        </div>

        {/* Order Items Summary */}
        <div className="bg-neutral-50 p-6 rounded-2xl border border-neutral-200 space-y-4">
          <h3 className="text-xs font-bold text-neutral-900 uppercase tracking-wider">
            Rincian Pesanan Anda
          </h3>
          <div className="divide-y divide-neutral-200">
            {order.items.map((item) => (
              <div key={item.id} className="flex justify-between py-3 text-sm">
                <div>
                  <span className="font-bold text-neutral-900">{item.productName}</span>
                  <span className="text-xs text-neutral-500 block mt-0.5">Ukuran: {item.size} • Qty: {item.quantity}</span>
                </div>
                <span className="font-semibold text-neutral-900">{formatIDR(item.price * item.quantity)}</span>
              </div>
            ))}
          </div>
          <div className="flex justify-between pt-4 border-t border-neutral-200 text-base font-bold text-neutral-900">
            <span>Total Tagihan</span>
            <span>{formatIDR(order.totalAmount)}</span>
          </div>
        </div>

        {/* Conditionally Render Instructions / Uploader */}
        {isCOD ? (
          /* COD Next Steps Box */
          <div className="bg-neutral-50 p-6 rounded-2xl border border-neutral-200 text-center space-y-4 max-w-md mx-auto">
            <MapPin className="w-12 h-12 text-black mx-auto" />
            <div>
              <h3 className="text-base font-bold text-neutral-900">Langkah Selanjutnya</h3>
              <p className="text-xs text-neutral-500 mt-1 leading-relaxed">
                Harap siapkan uang tunai sebesar <span className="font-bold text-neutral-950">{formatIDR(order.totalAmount)}</span>. Admin kami akan menghubungi Anda di nomor <span className="font-bold text-neutral-950">{order.customerPhone}</span> untuk konfirmasi waktu & tempat COD.
              </p>
            </div>
            <div className="flex flex-col gap-2.5">
              <a
                href={`https://wa.me/${adminWhatsApp}?text=${encodeURIComponent(
                  `Halo Admin AURA, saya ingin konfirmasi pesanan COD saya.\n\nNomor Order: ${order.id}\nNama: ${order.customerName}\nTotal: ${formatIDR(order.totalAmount)}`
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs py-3.5 px-6 rounded-full transition-all duration-300 flex items-center justify-center gap-1.5 cursor-pointer"
              >
                💬 Chat WhatsApp Admin
              </a>
              <Link
                href="/track-order"
                className="inline-flex items-center justify-center gap-2 bg-black hover:bg-neutral-800 text-white text-xs font-semibold py-3.5 px-6 rounded-full transition-all duration-300"
              >
                Lacak Pesanan Saya <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        ) : !hasReceipt ? (
          /* QRIS Flow */
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
            {/* QRIS Instructions */}
            <div className="space-y-6 bg-white p-6 rounded-2xl border border-neutral-200">
              <h3 className="text-base font-bold text-neutral-900 flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-black" />
                Instruksi Pembayaran
              </h3>

              <div className="space-y-4 text-center">
                <p className="text-xs text-neutral-500">
                  Silakan scan QRIS di bawah ini dengan jumlah transfer sebesar:
                </p>
                <p className="text-2xl font-bold text-neutral-950">{formatIDR(order.totalAmount)}</p>
                <div className="relative w-48 h-48 mx-auto border border-neutral-200 rounded-xl overflow-hidden bg-white p-2 flex items-center justify-center">
                  <Image
                    src={paymentConfig.qris.imageUrl}
                    alt={paymentConfig.qris.name}
                    fill
                    className="object-contain p-2"
                  />
                </div>
                <p className="text-[10px] text-neutral-500 uppercase tracking-wider font-semibold">
                  {paymentConfig.qris.name}
                </p>
              </div>
            </div>

            {/* Receipt Uploader */}
            <div className="space-y-6">
              <h3 className="text-base font-bold text-neutral-900">
                Unggah Bukti Transfer
              </h3>
              <ReceiptUploader orderId={order.id} />
            </div>
          </div>
        ) : (
          /* QRIS Already Uploaded Proof */
          <div className="bg-neutral-50 p-6 rounded-2xl border border-neutral-200 text-center space-y-4 max-w-md mx-auto">
            <ShieldCheck className="w-12 h-12 text-black mx-auto" />
            <div>
              <h3 className="text-base font-bold text-neutral-900">Bukti Pembayaran Terkirim</h3>
              <p className="text-xs text-neutral-500 mt-1">
                Bukti transfer Anda sedang dalam antrean verifikasi admin. Silakan simpan nomor pesanan Anda untuk melacak status pengiriman.
              </p>
            </div>
            <Link
              href="/track-order"
              className="inline-flex items-center gap-2 bg-black hover:bg-neutral-800 text-white text-xs font-semibold py-3.5 px-6 rounded-full transition-all duration-300"
            >
              Lacak Pesanan Saya <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        )}

        {/* Delivery Address Review */}
        <div className="space-y-4 border-t border-neutral-200 pt-6">
          <h3 className="text-xs font-bold text-neutral-900 uppercase tracking-wider">
            Informasi Pengiriman
          </h3>
          <div className="text-sm space-y-2 text-neutral-500 leading-relaxed">
            <p><span className="font-semibold text-neutral-900">Penerima:</span> {order.customerName}</p>
            <p><span className="font-semibold text-neutral-900">WhatsApp:</span> {order.customerPhone}</p>
            <p><span className="font-semibold text-neutral-900">Alamat:</span> {order.customerAddress}</p>
            {order.customerNotes && (
              <p><span className="font-semibold text-neutral-900">Catatan:</span> {order.customerNotes}</p>
            )}
          </div>
        </div>

        {/* Footer links */}
        <div className="text-center pt-8">
          <Link href="/products" className="text-xs text-neutral-900 font-semibold hover:underline">
            Kembali ke Katalog Produk
          </Link>
        </div>

      </div>
    </div>
  );
}
