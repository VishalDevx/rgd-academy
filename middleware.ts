import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Ignore static, API, and Next internals
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET! });
  const role = token?.role ?? null;

  // 🚫 If not authenticated and trying to access protected routes
  const isProtectedRoute =
    pathname.startsWith("/admin") ||
    pathname.startsWith("/staff") ||
    pathname.startsWith("/student");

  if (isProtectedRoute && !token) {
    const loginUrl = new URL("/login", req.url);
    loginUrl.searchParams.set("callbackUrl", req.url);
    return NextResponse.redirect(loginUrl);
  }

  // ✅ Prevent infinite redirect loops
  // Allow /login to render freely even if token exists
  if (pathname === "/login") {
    // If token exists, redirect only if the referer is not already /login
    const referer = req.headers.get("referer") || "";
    if (token && !referer.includes("/login")) {
      const dashboard =
        role === "ADMIN"
          ? "/admin/dashboard"
          : role === "STAFF"
          ? "/staff/dashboard"
          : "/student/dashboard";
      return NextResponse.redirect(new URL(dashboard, req.url));
    }
    return NextResponse.next();
  }

  // 🔒 Role-based access control
  if (pathname.startsWith("/admin") && role !== "ADMIN") {
    return NextResponse.redirect(new URL("/unauthorized", req.url));
  }

  if (pathname.startsWith("/staff") && !["STAFF", "ADMIN"].includes(role)) {
    return NextResponse.redirect(new URL("/unauthorized", req.url));
  }

  if (pathname.startsWith("/student") && role !== "STUDENT") {
    return NextResponse.redirect(new URL("/unauthorized", req.url));
  }

  return NextResponse.next();
}

// ✅ Run middleware only on protected routes (no /login)
export const config = {
  matcher: ["/admin/:path*", "/staff/:path*", "/student/:path*"],
};
