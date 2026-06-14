"use server";

import { z } from "zod";
import * as bcrypt from "bcryptjs";
import { cookies, headers } from "next/headers";
import prisma from "@/lib/db";
import { signJWT } from "@/lib/auth";
import { rateLimit } from "@/lib/rate-limit";

const LoginSchema = z.object({
  username: z.string().min(2, "Username minimal 2 karakter"),
  password: z.string().min(6, "Password minimal 6 karakter"),
});

export async function adminLogin(data: z.infer<typeof LoginSchema>) {
  try {
    // 1. Rate Limiting: max 5 attempts per IP per 15 mins
    const headerList = await headers();
    const ip = headerList.get("x-forwarded-for") || "127.0.0.1";
    const ipKey = `login-ip-${ip}`;
    if (!rateLimit(ipKey, 5, 15 * 60 * 1000)) {
      return {
        success: false,
        error: "Terlalu banyak percobaan masuk. Silakan coba lagi dalam 15 menit.",
      };
    }

    // 2. Validate input and sanitize
    const validatedData = LoginSchema.parse(data);
    const username = validatedData.username.trim().toLowerCase();

    // 3. Find admin in database
    const admin = await prisma.admin.findUnique({
      where: { username },
    });

    if (!admin) {
      return { success: false, error: "Username atau password salah." };
    }

    // 4. Compare password
    const isPasswordCorrect = await bcrypt.compare(validatedData.password, admin.password);
    if (!isPasswordCorrect) {
      return { success: false, error: "Username atau password salah." };
    }

    // 5. Generate JWT
    const token = await signJWT({
      id: admin.id,
      username: admin.username,
    });

    // 6. Save in cookie (Awaiting cookies() since it is a Promise in Next.js 15+)
    const cookieStore = await cookies();
    cookieStore.set("admin_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 2, // 2 hours
      path: "/",
    });

    return { success: true };
  } catch (error: any) {
    console.error("Admin login error:", error);
    return {
      success: false,
      error: error instanceof z.ZodError
        ? error.issues[0].message
        : "Gagal masuk, terjadi kesalahan pada server.",
    };
  }
}

export async function adminLogout() {
  const cookieStore = await cookies();
  cookieStore.delete("admin_token");
  return { success: true };
}

export async function updateAdminUsername(currentPassword: string, newUsername: string) {
  try {
    const sanitizedUsername = newUsername.trim().toLowerCase();
    if (sanitizedUsername.length < 4) {
      return { success: false, error: "Username baru minimal 4 karakter." };
    }

    const admin = await prisma.admin.findFirst();
    if (!admin) {
      return { success: false, error: "Akun admin tidak ditemukan." };
    }

    const isPasswordCorrect = await bcrypt.compare(currentPassword, admin.password);
    if (!isPasswordCorrect) {
      return { success: false, error: "Password saat ini salah." };
    }

    // Check if newUsername is already taken by another admin (if any)
    const existing = await prisma.admin.findFirst({
      where: {
        username: sanitizedUsername,
        NOT: { id: admin.id }
      }
    });
    if (existing) {
      return { success: false, error: "Username sudah digunakan." };
    }

    await prisma.admin.update({
      where: { id: admin.id },
      data: { username: sanitizedUsername }
    });

    return { success: true };
  } catch (error: any) {
    console.error("Update admin username error:", error);
    return { success: false, error: error.message || "Gagal memperbarui username." };
  }
}

export async function updateAdminPassword(currentPassword: string, newPassword: string, confirmPassword: string) {
  try {
    if (newPassword.length < 8) {
      return { success: false, error: "Password baru minimal 8 karakter." };
    }

    if (newPassword !== confirmPassword) {
      return { success: false, error: "Konfirmasi password baru tidak cocok." };
    }

    const admin = await prisma.admin.findFirst();
    if (!admin) {
      return { success: false, error: "Akun admin tidak ditemukan." };
    }

    const isPasswordCorrect = await bcrypt.compare(currentPassword, admin.password);
    if (!isPasswordCorrect) {
      return { success: false, error: "Password saat ini salah." };
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await prisma.admin.update({
      where: { id: admin.id },
      data: { password: hashedPassword }
    });

    return { success: true };
  } catch (error: any) {
    console.error("Update admin password error:", error);
    return { success: false, error: error.message || "Gagal memperbarui password." };
  }
}
