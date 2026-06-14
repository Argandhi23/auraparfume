import React from "react";
import AdminNav from "@/components/AdminNav";

export default function AdminConsoleLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-apple-bg">
      {/* Sidebar Nav */}
      <AdminNav />

      {/* Main Console Content */}
      <main className="flex-grow p-6 md:p-10 overflow-y-auto">
        <div className="max-w-7xl mx-auto space-y-6">
          {children}
        </div>
      </main>
    </div>
  );
}
