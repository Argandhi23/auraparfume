import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifyJWT } from "./lib/auth";

export async function proxy(request: NextRequest) {
  const path = request.nextUrl.pathname;

  // Protect all /admin routes except /admin/login
  if (path.startsWith("/admin") && path !== "/admin/login") {
    const token = request.cookies.get("admin_token")?.value;

    if (!token) {
      return NextResponse.redirect(new URL("/admin/login", request.url));
    }

    const verified = await verifyJWT(token);
    if (!verified) {
      // If token is invalid or expired, clear cookie and redirect
      const response = NextResponse.redirect(new URL("/admin/login", request.url));
      response.cookies.delete("admin_token");
      return response;
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
