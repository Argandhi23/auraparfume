"use client";

import React, { useState, useTransition } from "react";
import { updateAdminUsername, updateAdminPassword } from "@/lib/actions/admin";
import { Key, User, Loader2, CheckCircle2, AlertCircle } from "lucide-react";

export default function AdminSettingsPage() {
  const [isPending, startTransition] = useTransition();

  // Username form states
  const [usernameInput, setUsernameInput] = useState("");
  const [usernameConfirmPassword, setUsernameConfirmPassword] = useState("");
  const [usernameStatus, setUsernameStatus] = useState<{ success?: boolean; message?: string } | null>(null);

  // Password form states
  const [passwordCurrentPassword, setPasswordCurrentPassword] = useState("");
  const [passwordNewPassword, setPasswordNewPassword] = useState("");
  const [passwordConfirmPassword, setPasswordConfirmPassword] = useState("");
  const [passwordStatus, setPasswordStatus] = useState<{ success?: boolean; message?: string } | null>(null);

  const handleUpdateUsername = (e: React.FormEvent) => {
    e.preventDefault();
    setUsernameStatus(null);

    if (!usernameInput || !usernameConfirmPassword) {
      setUsernameStatus({ success: false, message: "Semua kolom wajib diisi." });
      return;
    }

    startTransition(async () => {
      const res = await updateAdminUsername(usernameConfirmPassword, usernameInput);
      if (res.success) {
        setUsernameStatus({ success: true, message: "Username admin berhasil diperbarui!" });
        setUsernameInput("");
        setUsernameConfirmPassword("");
      } else {
        setUsernameStatus({ success: false, message: res.error || "Gagal memperbarui username." });
      }
    });
  };

  const handleUpdatePassword = (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordStatus(null);

    if (!passwordCurrentPassword || !passwordNewPassword || !passwordConfirmPassword) {
      setPasswordStatus({ success: false, message: "Semua kolom wajib diisi." });
      return;
    }

    startTransition(async () => {
      const res = await updateAdminPassword(
        passwordCurrentPassword,
        passwordNewPassword,
        passwordConfirmPassword
      );
      if (res.success) {
        setPasswordStatus({ success: true, message: "Password admin berhasil diperbarui!" });
        setPasswordCurrentPassword("");
        setPasswordNewPassword("");
        setPasswordConfirmPassword("");
      } else {
        setPasswordStatus({ success: false, message: res.error || "Gagal memperbarui password." });
      }
    });
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="border-b border-neutral-200 pb-4 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-black">Pengaturan Akun</h1>
          <p className="text-xs text-neutral-600 mt-1">Ubah kredensial portal administratif Anda secara aman.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Section 1: Ganti Username */}
        <div className="bg-white border border-neutral-200 rounded-lg p-6 space-y-6">
          <h2 className="text-lg font-bold text-black flex items-center gap-2 border-b border-neutral-200 pb-3">
            <User className="w-5 h-5 text-black" /> Ganti Username
          </h2>

          <form onSubmit={handleUpdateUsername} className="space-y-4">
            <div className="space-y-1.5">
              <label htmlFor="new-username" className="text-sm text-black font-medium block">
                Username Baru
              </label>
              <input
                id="new-username"
                type="text"
                value={usernameInput}
                onChange={(e) => setUsernameInput(e.target.value)}
                placeholder="Masukkan username baru (min. 4 karakter)"
                className="w-full border border-neutral-300 rounded px-3 py-2 text-base text-black bg-white focus:outline-none focus:border-black"
                disabled={isPending}
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="username-confirm-password" className="text-sm text-black font-medium block">
                Password Saat Ini (Konfirmasi)
              </label>
              <input
                id="username-confirm-password"
                type="password"
                value={usernameConfirmPassword}
                onChange={(e) => setUsernameConfirmPassword(e.target.value)}
                placeholder="Verifikasi password Anda"
                className="w-full border border-neutral-300 rounded px-3 py-2 text-base text-black bg-white focus:outline-none focus:border-black"
                disabled={isPending}
              />
            </div>

            {usernameStatus && (
              <div className={`p-4 rounded-xl border text-xs font-semibold flex items-center gap-2 ${
                usernameStatus.success 
                  ? "bg-green-50 border-green-200 text-green-800" 
                  : "bg-red-50 border-red-200 text-red-800"
              }`}>
                {usernameStatus.success ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                <span>{usernameStatus.message}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={isPending}
              className="w-full bg-black text-white hover:bg-neutral-800 disabled:opacity-40 disabled:pointer-events-none font-semibold py-3 px-4 rounded-xl text-sm transition-colors cursor-pointer flex items-center justify-center gap-2"
            >
              {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : "Simpan Username"}
            </button>
          </form>
        </div>

        {/* Section 2: Ganti Password */}
        <div className="bg-white border border-neutral-200 rounded-lg p-6 space-y-6">
          <h2 className="text-lg font-bold text-black flex items-center gap-2 border-b border-neutral-200 pb-3">
            <Key className="w-5 h-5 text-black" /> Ganti Password
          </h2>

          <form onSubmit={handleUpdatePassword} className="space-y-4">
            <div className="space-y-1.5">
              <label htmlFor="current-password" className="text-sm text-black font-medium block">
                Password Saat Ini
              </label>
              <input
                id="current-password"
                type="password"
                value={passwordCurrentPassword}
                onChange={(e) => setPasswordCurrentPassword(e.target.value)}
                placeholder="Password saat ini"
                className="w-full border border-neutral-300 rounded px-3 py-2 text-base text-black bg-white focus:outline-none focus:border-black"
                disabled={isPending}
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="new-password" className="text-sm text-black font-medium block">
                Password Baru
              </label>
              <input
                id="new-password"
                type="password"
                value={passwordNewPassword}
                onChange={(e) => setPasswordNewPassword(e.target.value)}
                placeholder="Masukkan password baru (min. 8 karakter)"
                className="w-full border border-neutral-300 rounded px-3 py-2 text-base text-black bg-white focus:outline-none focus:border-black"
                disabled={isPending}
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="confirm-new-password" className="text-sm text-black font-medium block">
                Konfirmasi Password Baru
              </label>
              <input
                id="confirm-new-password"
                type="password"
                value={passwordConfirmPassword}
                onChange={(e) => setPasswordConfirmPassword(e.target.value)}
                placeholder="Ulangi password baru"
                className="w-full border border-neutral-300 rounded px-3 py-2 text-base text-black bg-white focus:outline-none focus:border-black"
                disabled={isPending}
              />
            </div>

            {passwordStatus && (
              <div className={`p-4 rounded-xl border text-xs font-semibold flex items-center gap-2 ${
                passwordStatus.success 
                  ? "bg-green-50 border-green-200 text-green-800" 
                  : "bg-red-50 border-red-200 text-red-800"
              }`}>
                {passwordStatus.success ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                <span>{passwordStatus.message}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={isPending}
              className="w-full bg-black text-white hover:bg-neutral-800 disabled:opacity-40 disabled:pointer-events-none font-semibold py-3 px-4 rounded-xl text-sm transition-colors cursor-pointer flex items-center justify-center gap-2"
            >
              {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : "Simpan Password"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

