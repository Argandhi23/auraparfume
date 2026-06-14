import React from "react";
import prisma from "@/lib/db";
import DashboardConsole from "@/components/DashboardConsole";

export const revalidate = 0; // Fresh dashboard metrics

export default async function AdminDashboardPage() {
  // 1. Fetch Today's Orders count
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  // Generate 7-day Sales Chart dates
  const last7Days = Array.from({ length: 7 }, (_, idx) => {
    const d = new Date();
    d.setDate(d.getDate() - idx);
    d.setHours(0, 0, 0, 0);
    return d;
  }).reverse();

  // 2. Fetch everything in parallel
  const [
    todayOrders,
    revenueAgg,
    pendingVerifications,
    totalProducts,
    recentOrders,
    chartData
  ] = await Promise.all([
    prisma.order.count({
      where: {
        createdAt: {
          gte: todayStart,
        },
      },
    }),
    prisma.order.aggregate({
      where: {
        status: {
          in: ["VERIFIED", "SHIPPED", "COMPLETED"],
        },
      },
      _sum: {
        totalAmount: true,
      },
    }),
    prisma.order.count({
      where: {
        status: "PENDING",
        receiptImg: {
          not: null,
        },
      },
    }),
    prisma.product.count(),
    prisma.order.findMany({
      take: 5,
      orderBy: {
        createdAt: "desc",
      },
    }),
    Promise.all(
      last7Days.map(async (dayDate) => {
        const nextDay = new Date(dayDate);
        nextDay.setDate(nextDay.getDate() + 1);

        const dayRevenueAgg = await prisma.order.aggregate({
          where: {
            status: {
              in: ["VERIFIED", "SHIPPED", "COMPLETED"],
            },
            createdAt: {
              gte: dayDate,
              lt: nextDay,
            },
          },
          _sum: {
            totalAmount: true,
          },
        });

        return {
          label: dayDate.toLocaleDateString("id-ID", { weekday: "short" }),
          amount: dayRevenueAgg._sum.totalAmount || 0,
        };
      })
    )
  ]);

  const totalRevenue = revenueAgg._sum.totalAmount || 0;

  return (
    <DashboardConsole
      initialTodayOrders={todayOrders}
      initialTotalRevenue={totalRevenue}
      initialPendingVerifications={pendingVerifications}
      initialTotalProducts={totalProducts}
      initialRecentOrders={recentOrders.map(order => ({
        id: order.id,
        customerName: order.customerName,
        customerPhone: order.customerPhone,
        totalAmount: order.totalAmount,
        status: order.status,
        receiptImg: order.receiptImg,
      }))}
      initialChartData={chartData}
    />
  );
}
