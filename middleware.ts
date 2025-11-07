import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (
    pathname.startsWith("/api") ||
    pathname.startsWith("/_next") ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  if (!process.env.NEXTAUTH_SECRET) {
    throw new Error("NEXTAUTH_SECRET must be set in .env or .env.local");
  }

  const token = await getToken({
    req,
    secret: process.env.NEXTAUTH_SECRET,
  });

  const role: "ADMIN" | "STAFF" | "STUDENT" | null = (token as any)?.role ?? null;

  // 1️⃣ Redirect unauthenticated users
  if (!token && !pathname.startsWith("/login")) {
    const loginUrl = new URL("/login", req.url);
    loginUrl.searchParams.set("callbackUrl", req.url);
    return NextResponse.redirect(loginUrl);
  }

  // 2️⃣ Redirect logged-in users from /login
  if (pathname.startsWith("/login") && token) {
    const dashboard =
      role === "ADMIN"
        ? "/admin/dashboard"
        : role === "STAFF"
        ? "/staff/dashboard"
        : "/student/dashboard";
    return NextResponse.redirect(new URL(dashboard, req.url));
  }

  // 3️⃣ Role-based access control
  if (pathname.startsWith("/admin") && role !== "ADMIN") {
    return NextResponse.redirect(new URL("/unauthorized", req.url));
  }

if (pathname.startsWith("/staff") && role && !["STAFF", "ADMIN"].includes(role)) {
  return NextResponse.redirect(new URL("/unauthorized", req.url));
}

  if (pathname.startsWith("/student") && role !== "STUDENT") {
    return NextResponse.redirect(new URL("/unauthorized", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/login", "/admin/:path*", "/staff/:path*", "/student/:path*"],
};
