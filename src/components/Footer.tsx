import React from "react";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-apple-bg border-t border-apple-border/40 py-16 px-6">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12">
        {/* Brand Column */}
        <div className="space-y-4 md:col-span-2">
          <Link href="/" className="text-xl font-bold tracking-widest text-apple-text">
            AURA
          </Link>
          <p className="text-sm text-apple-gray max-w-sm leading-relaxed">
            Menciptakan wewangian premium minimalist modern. Kami mendedikasikan seni meracik parfum untuk menghadirkan aroma yang bersih, murni, dan meninggalkan jejak kemewahan yang elegan.
          </p>
        </div>

        {/* Catalog Links */}
        <div className="space-y-4">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-apple-text">Katalog</h4>
          <ul className="space-y-2 text-sm text-apple-gray">
            <li>
              <Link href="/products" className="hover:text-brand transition-colors">Semua Parfum</Link>
            </li>
          </ul>
        </div>

        {/* Support Links */}
        <div className="space-y-4">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-apple-text">Bantuan & Kontak</h4>
          <ul className="space-y-2 text-sm text-apple-gray">
            <li>
              <Link href="/track-order" className="hover:text-brand transition-colors">Cek Status Pesanan</Link>
            </li>
            <li>
              <a href="https://wa.me/6281234567890" target="_blank" rel="noopener noreferrer" className="hover:text-brand transition-colors inline-flex items-center gap-1">
                WhatsApp Customer Service <ArrowUpRight className="w-3.5 h-3.5" />
              </a>
            </li>
            <li className="pt-2 text-xs">
              <span className="font-semibold block text-apple-text">Offline Atelier:</span>
              Sudirman Central Business District (SCBD), Jakarta, Indonesia
            </li>
          </ul>
        </div>
      </div>

      <div className="max-w-7xl mx-auto mt-16 pt-8 border-t border-apple-border/20 flex flex-col md:flex-row items-center justify-between gap-4">
        <p className="text-xs text-apple-gray text-center md:text-left">
          © {new Date().getFullYear()} AURA. Didesain secara eksklusif dengan estetika minimalis modern.
        </p>
        <div className="flex space-x-6 text-xs text-apple-gray">
          <Link href="/admin/login" className="hover:text-brand transition-colors">Portal Admin</Link>
          <a href="#" className="hover:text-brand transition-colors">Kebijakan Privasi</a>
          <a href="#" className="hover:text-brand transition-colors">Syarat & Ketentuan</a>
        </div>
      </div>
    </footer>
  );
}
