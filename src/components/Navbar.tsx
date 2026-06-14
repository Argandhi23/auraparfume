"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ShoppingBag, Search, Menu, X, ArrowRight } from "lucide-react";
import { getCart } from "@/lib/cart";

export default function Navbar() {
  const pathname = usePathname();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const [mounted, setMounted] = useState(false);

  // Monitor scroll for solid background
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Hydration safety & Cart counter sync
  useEffect(() => {
    setMounted(true);
    
    const updateCartCount = () => {
      const cart = getCart();
      const count = cart.reduce((total, item) => total + item.quantity, 0);
      setCartCount(count);
    };

    updateCartCount();

    window.addEventListener("cart-updated", updateCartCount);
    return () => window.removeEventListener("cart-updated", updateCartCount);
  }, []);

  const navLinks = [
    { name: "Home", href: "/" },
    { name: "Katalog", href: "/products" },
    { name: "Cek Pesanan", href: "/track-order" },
    { name: "Admin Portal", href: "/admin/dashboard" },
  ];

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          isScrolled
            ? "bg-white/95 backdrop-blur-md border-b border-apple-border/40 py-3 shadow-xs"
            : "bg-transparent py-5"
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
          {/* Logo */}
          <Link
            href="/"
            className="text-xl font-bold tracking-widest text-apple-text hover:opacity-80 transition-opacity"
          >
            AURA
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.name}
                  href={link.href}
                  className={`text-sm tracking-wide font-medium transition-colors hover:text-brand ${
                    isActive ? "text-brand" : "text-apple-text/80"
                  }`}
                >
                  {link.name}
                </Link>
              );
            })}
          </nav>

          {/* Icons & Actions */}
          <div className="flex items-center space-x-4">
            {/* Cart Icon */}
            <Link
              href="/cart"
              className="relative p-2 text-apple-text hover:text-brand transition-colors"
              aria-label="Keranjang"
            >
              <ShoppingBag className="w-5 h-5 stroke-[1.5]" />
              {mounted && cartCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 bg-brand text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center animate-scaleIn">
                  {cartCount}
                </span>
              )}
            </Link>

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 md:hidden text-apple-text hover:text-brand transition-colors"
              aria-label="Menu"
            >
              {mobileMenuOpen ? (
                <X className="w-5 h-5 stroke-[1.5]" />
              ) : (
                <Menu className="w-5 h-5 stroke-[1.5]" />
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Navigation Drawer */}
      <div
        className={`fixed inset-0 z-40 bg-white transition-all duration-500 ease-in-out md:hidden ${
          mobileMenuOpen
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none translate-y-[-10px]"
        }`}
        style={{ paddingTop: "80px" }}
      >
        <div className="px-8 py-6 space-y-6 flex flex-col h-full justify-between">
          <nav className="flex flex-col space-y-6">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.name}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`text-2xl font-semibold tracking-tight transition-colors flex items-center justify-between ${
                    isActive ? "text-brand" : "text-apple-text"
                  }`}
                >
                  {link.name}
                  <ArrowRight className="w-5 h-5 text-brand" />
                </Link>
              );
            })}
          </nav>

          {/* Mobile Footer */}
          <div className="border-t border-apple-border/50 pt-8 pb-12 text-center">
            <p className="text-xs text-apple-gray">
              © {new Date().getFullYear()} AURA Parfum. All Rights Reserved.
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
