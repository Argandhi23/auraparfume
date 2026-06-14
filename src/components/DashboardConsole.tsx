"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowRight, ShoppingBag, DollarSign, Clock, Package, Eye } from "lucide-react";
import { getDashboardStats } from "@/lib/actions/order";
import { supabaseClient } from "@/lib/supabase-client";

interface RecentOrderItem {
  id: string;
  customerName: string;
  customerPhone: string;
  totalAmount: number;
  status: string;
  receiptImg: string | null;
}

interface ChartItem {
  label: string;
  amount: number;
}

interface DashboardConsoleProps {
  initialTodayOrders: number;
  initialTotalRevenue: number;
  initialPendingVerifications: number;
  initialTotalProducts: number;
  initialRecentOrders: RecentOrderItem[];
  initialChartData: ChartItem[];
}

function formatIDR(price: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price);
}

export default function DashboardConsole({
  initialTodayOrders,
  initialTotalRevenue,
  initialPendingVerifications,
  initialTotalProducts,
  initialRecentOrders,
  initialChartData,
}: DashboardConsoleProps) {
  const [todayOrders, setTodayOrders] = useState(initialTodayOrders);
  const [totalRevenue, setTotalRevenue] = useState(initialTotalRevenue);
  const [pendingVerifications, setPendingVerifications] = useState(initialPendingVerifications);
  const [totalProducts, setTotalProducts] = useState(initialTotalProducts);
  const [recentOrders, setRecentOrders] = useState<RecentOrderItem[]>(initialRecentOrders);
  const [chartData, setChartData] = useState<ChartItem[]>(initialChartData);

  // Sync state with server props on initial/server load changes
  useEffect(() => {
    setTodayOrders(initialTodayOrders);
    setTotalRevenue(initialTotalRevenue);
    setPendingVerifications(initialPendingVerifications);
    setTotalProducts(initialTotalProducts);
    setRecentOrders(initialRecentOrders);
    setChartData(initialChartData);
  }, [
    initialTodayOrders,
    initialTotalRevenue,
    initialPendingVerifications,
    initialTotalProducts,
    initialRecentOrders,
    initialChartData,
  ]);

  // Realtime subscription
  useEffect(() => {
    const channel = supabaseClient
      .channel("admin-orders")
      .on(
        "broadcast",
        { event: "order-event" },
        async (response) => {
          const payload = response.payload;
          if (!payload) return;

          const res = await getDashboardStats();
          if (res.success && res.stats) {
            setTodayOrders(res.stats.todayOrders);
            setTotalRevenue(res.stats.totalRevenue);
            setPendingVerifications(res.stats.pendingVerifications);
            setTotalProducts(res.stats.totalProducts);
            setRecentOrders(res.stats.recentOrders);
            setChartData(res.stats.chartData);
          }
        }
      )
      .subscribe();

    return () => {
      supabaseClient.removeChannel(channel);
    };
  }, []);

  // SVG Chart Dimensions & Computations
  const maxVal = Math.max(...chartData.map((d) => d.amount), 1000000); // minimum 1jt scale
  const points = chartData
    .map((d, idx) => {
      const x = 50 + idx * 80;
      const y = 130 - (d.amount / maxVal) * 100;
      return `${x},${y}`;
    })
    .join(" ");

  return (
    <div className="space-y-8">
      {/* Welcome header with Live indicator */}
      <div className="flex justify-between items-start gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-apple-text">Dashboard Overview</h2>
          <p className="text-sm text-apple-gray">Ringkasan operasional toko AURA hari ini.</p>
        </div>
        <div className="flex items-center gap-2 bg-neutral-50 border border-neutral-200 px-3 py-1.5 rounded-full text-xs text-neutral-800 font-semibold shadow-2xs shrink-0 select-none">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-black opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-black"></span>
          </span>
          <span>Live</span>
        </div>
      </div>

      {/* Grid Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Stat 1 */}
        <div className="bg-white p-6 rounded-2xl border border-apple-border/30 shadow-xs flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-xs font-semibold uppercase tracking-wider text-apple-gray">Pesanan Hari Ini</p>
            <p className="text-2xl font-extrabold text-apple-text">{todayOrders}</p>
          </div>
          <div className="w-10 h-10 rounded-full bg-black/10 text-black flex items-center justify-center">
            <ShoppingBag className="w-5 h-5" />
          </div>
        </div>

        {/* Stat 2 */}
        <div className="bg-white p-6 rounded-2xl border border-apple-border/30 shadow-xs flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-xs font-semibold uppercase tracking-wider text-apple-gray">Total Pendapatan</p>
            <p className="text-2xl font-extrabold text-apple-text">{formatIDR(totalRevenue)}</p>
          </div>
          <div className="w-10 h-10 rounded-full bg-neutral-100 text-black border border-neutral-200 flex items-center justify-center">
            <DollarSign className="w-5 h-5" />
          </div>
        </div>

        {/* Stat 3 */}
        <div className="bg-white p-6 rounded-2xl border border-apple-border/30 shadow-xs flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-xs font-semibold uppercase tracking-wider text-apple-gray">Butuh Verifikasi</p>
            <p className="text-2xl font-extrabold text-apple-text">{pendingVerifications}</p>
          </div>
          <div className="w-10 h-10 rounded-full bg-neutral-100 text-black border border-neutral-200 flex items-center justify-center">
            <Clock className="w-5 h-5 animate-pulse" />
          </div>
        </div>

        {/* Stat 4 */}
        <div className="bg-white p-6 rounded-2xl border border-apple-border/30 shadow-xs flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-xs font-semibold uppercase tracking-wider text-apple-gray">Jumlah Produk</p>
            <p className="text-2xl font-extrabold text-apple-text">{totalProducts}</p>
          </div>
          <div className="w-10 h-10 rounded-full bg-neutral-100 text-black border border-neutral-200 flex items-center justify-center">
            <Package className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Analytics chart and recent orders */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Sales Chart SVG */}
        <div className="bg-white p-6 rounded-3xl border border-apple-border/30 shadow-xs flex flex-col justify-between">
          <div>
            <h3 className="text-lg font-bold text-apple-text">Penjualan 7 Hari Terakhir</h3>
            <p className="text-xs text-apple-gray">Berdasarkan pesanan terverifikasi/lunas.</p>
          </div>
          
          <div className="w-full flex items-center justify-center py-4">
            <svg viewBox="0 0 550 160" className="w-full h-auto">
              {/* Grid lines */}
              <line x1="50" y1="30" x2="530" y2="30" stroke="#F5F5F7" strokeWidth="1" />
              <line x1="50" y1="80" x2="530" y2="80" stroke="#F5F5F7" strokeWidth="1" />
              <line x1="50" y1="130" x2="530" y2="130" stroke="#D2D2D7" strokeWidth="1.5" />
              
              {/* Connecting line */}
              <polyline
                fill="none"
                stroke="#000000"
                strokeWidth="3.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                points={points}
              />

              {/* Data circles */}
              {chartData.map((d, idx) => {
                const x = 50 + idx * 80;
                const y = 130 - (d.amount / maxVal) * 100;
                return (
                  <g key={idx}>
                    <circle
                      cx={x}
                      cy={y}
                      r="5"
                      fill="#FFFFFF"
                      stroke="#000000"
                      strokeWidth="2.5"
                      className="cursor-pointer hover:r-6 transition-all duration-300"
                    />
                    <text x={x} y="152" textAnchor="middle" className="text-[10px] fill-apple-gray font-semibold">
                      {d.label}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>
        </div>

        {/* Recent Orders List */}
        <div className="lg:col-span-2 bg-white p-6 rounded-3xl border border-apple-border/30 shadow-xs space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg font-bold text-apple-text">Pesanan Terbaru</h3>
              <p className="text-xs text-apple-gray">5 transaksi terakhir yang tercatat.</p>
            </div>
            <Link
              href="/admin/orders"
              className="text-xs text-black hover:underline font-bold flex items-center gap-1 group"
            >
              Semua Pesanan <ArrowRight className="w-3 h-3 transition-transform group-hover:translate-x-0.5" />
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm divide-y divide-apple-border/20">
              <thead>
                <tr className="text-xs text-apple-gray uppercase font-semibold">
                  <th className="py-3 px-2">Order ID</th>
                  <th className="py-3 px-2">Customer</th>
                  <th className="py-3 px-2">Status</th>
                  <th className="py-3 px-2">Total</th>
                  <th className="py-3 px-2 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-apple-border/10">
                {recentOrders.map((order) => {
                  const hasReceipt = !!order.receiptImg;
                  return (
                    <tr key={order.id} className="hover:bg-apple-bg/30 transition-colors">
                      <td className="py-3.5 px-2 font-semibold text-apple-text">{order.id}</td>
                      <td className="py-3.5 px-2">
                        <div className="text-xs font-semibold text-apple-text">{order.customerName}</div>
                        <div className="text-[10px] text-apple-gray">{order.customerPhone}</div>
                      </td>
                      <td className="py-3.5 px-2">
                        <span className={`inline-block text-[10px] px-2.5 py-1 rounded-full border ${
                          order.status === "PENDING"
                            ? hasReceipt 
                              ? "bg-neutral-50 text-neutral-800 border-neutral-300 border-dashed font-medium" 
                              : "bg-neutral-50 text-neutral-800 border-neutral-300 border-dotted font-medium"
                            : order.status === "VERIFIED"
                            ? "bg-black text-white border-black font-semibold"
                            : order.status === "SHIPPED"
                            ? "bg-white text-black border-neutral-300 font-medium"
                            : "bg-white text-black border-2 border-black font-extrabold"
                        }`}>
                          {order.status === "PENDING" && hasReceipt ? "Need Verify" : order.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-2 font-medium text-apple-text">
                        {formatIDR(order.totalAmount)}
                      </td>
                      <td className="py-3.5 px-2 text-right">
                        <Link
                          href={`/admin/orders?search=${order.id}`}
                          className="inline-flex items-center justify-center p-2 rounded-lg bg-apple-bg hover:bg-apple-border/30 text-apple-text hover:text-black transition-colors"
                          title="Lihat Detail"
                        >
                          <Eye className="w-4 h-4" />
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
}
