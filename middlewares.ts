import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(req: NextRequest) {
  const token = await getToken({
    req,
    secret: process.env.NEXTAUTH_SECRET as string,
    salt: ""
  });

  const { pathname } = req.nextUrl;

  // Public routes
  const publicPaths = ["/login", "/api/auth", "/_next", "/favicon.ico"];
  if (publicPaths.some((p) => pathname.startsWith(p))) {
    return NextResponse.next();
  }

  // Redirect unauthenticated users
  if (!token) {
    const loginUrl = new URL("/login", req.url);
    loginUrl.searchParams.set("callbackUrl", req.url);
    return NextResponse.redirect(loginUrl);
  }

  const role = token.role;

  // Role-based protection
  if (pathname.startsWith("/admin") && role !== "ADMIN") {
    return NextResponse.redirect(new URL("/unauthorized", req.url));
  }
  if (pathname.startsWith("/staff") && !["STAFF", "ADMIN"].includes(role)) {
    return NextResponse.redirect(new URL("/unauthorized", req.url));
  }
  if (pathname.startsWith("/student") && role !== "STUDENT") {
    return NextResponse.redirect(new URL("/unauthorized", req.url));
  }

  // Prevent logged-in users from accessing /login
  if (pathname === "/login" && token) {
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

export const config = {
  matcher: ["/((?!api|_next|favicon.ico).*)"],
};
