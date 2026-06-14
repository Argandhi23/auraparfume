"use client";

import React, { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { adminLogin } from "@/lib/actions/admin";
import { ShieldAlert, Loader2, ArrowLeft } from "lucide-react";

export default function AdminLoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    startTransition(async () => {
      const response = await adminLogin({ username, password });
      if (response.success) {
        router.push("/admin/dashboard");
      } else {
        setErrorMsg(response.error || "Gagal masuk portal.");
      }
    });
  };

  return (
    <div className="min-h-screen bg-apple-bg flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      {/* Return to Public Page button */}
      <div className="absolute top-6 left-6">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-apple-gray hover:text-brand transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Kembali ke Toko
        </Link>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center space-y-4">
        <h1 className="text-3xl font-extrabold tracking-widest text-apple-text">
          AURA
        </h1>
        <p className="text-xs uppercase tracking-widest text-brand font-semibold">
          Portal Admin
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-10 px-6 sm:px-10 border border-apple-border/30 rounded-3xl shadow-sm space-y-6">
          
          {errorMsg && (
            <div className="p-4 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 flex-shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Username Input */}
            <div className="space-y-1">
              <label htmlFor="username" className="text-xs font-semibold uppercase tracking-wider text-apple-gray">
                Username
              </label>
              <input
                id="username"
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Username admin"
                disabled={isPending}
                className="w-full p-3.5 border border-apple-border/50 text-base md:text-sm rounded-xl focus:outline-none focus:ring-1 focus:ring-brand focus:border-brand bg-white"
              />
            </div>

            {/* Password Input */}
            <div className="space-y-1">
              <label htmlFor="password" className="text-xs font-semibold uppercase tracking-wider text-apple-gray">
                Password
              </label>
              <input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                disabled={isPending}
                className="w-full p-3.5 border border-apple-border/50 text-base md:text-sm rounded-xl focus:outline-none focus:ring-1 focus:ring-brand focus:border-brand bg-white"
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isPending}
              className="w-full bg-apple-text hover:bg-brand text-white font-semibold py-3.5 rounded-full flex items-center justify-center gap-2 transition-all duration-300 disabled:opacity-40 disabled:pointer-events-none text-sm shadow-xs"
            >
              {isPending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> Sedang Masuk...
                </>
              ) : (
                "Masuk Portal"
              )}
            </button>
          </form>

          <div className="text-center pt-2">
            <p className="text-[10px] text-apple-gray">
              Portal ini hanya diakses oleh administrator yang memiliki kewenangan penuh.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
