"use client";

import React, { useTransition } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { adminLogout } from "@/lib/actions/admin";
import { LayoutDashboard, ShoppingCart, LogOut, Package, Settings } from "lucide-react";

export default function AdminNav() {
  const pathname = usePathname();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const handleLogout = () => {
    startTransition(async () => {
      await adminLogout();
      router.push("/admin/login");
    });
  };

  const navItems = [
    { name: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
    { name: "Produk", href: "/admin/products", icon: Package },
    { name: "Pesanan", href: "/admin/orders", icon: ShoppingCart },
    { name: "Pengaturan", href: "/admin/settings", icon: Settings },
  ];

  return (
    <aside className="w-full md:w-64 bg-apple-text text-white flex flex-col md:min-h-screen">
      {/* Brand */}
      <div className="p-6 border-b border-white/10 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-widest">AURA</h1>
          <span className="text-[10px] text-brand uppercase tracking-wider font-semibold">
            Admin Console
          </span>
        </div>
      </div>

      {/* Nav links */}
      <nav className="flex-grow p-4 space-y-1.5 flex flex-row md:flex-col overflow-x-auto md:overflow-x-visible">
        {navItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-300 w-nowrap md:w-full ${
                isActive
                  ? "bg-brand text-white shadow-xs"
                  : "text-white/70 hover:text-white hover:bg-white/5"
              }`}
            >
              <Icon className="w-4 h-4 flex-shrink-0" />
              <span>{item.name}</span>
            </Link>
          );
        })}
      </nav>

      {/* Footer logout */}
      <div className="p-4 border-t border-white/10 mt-auto hidden md:block">
        <button
          onClick={handleLogout}
          disabled={isPending}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-all duration-300 cursor-pointer disabled:opacity-40"
        >
          <LogOut className="w-4 h-4 flex-shrink-0" />
          <span>Keluar Portal</span>
        </button>
      </div>
    </aside>
  );
}
