import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { validateEnv } from "@/lib/env";
import "./globals.css";

// Check that required environment variables are set before rendering
validateEnv();

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
  preload: true,
});

export const metadata: Metadata = {
  title: "AURA — Premium Parfum",
  description: "Premium Parfum E-Commerce",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} h-full antialiased`}
      data-scroll-behavior="smooth"
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}

