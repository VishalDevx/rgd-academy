import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(req: NextRequest) {
  // Safely extract JWT token using NextAuth's default salt
  const token = await getToken({
    req,
    secret: process.env.NEXTAUTH_SECRET as string,
  
  });

  const { pathname } = req.nextUrl;

  // 1️⃣ Redirect unauthenticated users trying to access protected routes
  if (!token && !pathname.startsWith("/login")) {
    const loginUrl = new URL("/login", req.url);
    loginUrl.searchParams.set("callbackUrl", req.url);
    return NextResponse.redirect(loginUrl);
  }

  const role = (token as any)?.role ?? "";

  // 2️⃣ Prevent logged-in users from going back to the login page
  if (pathname === "/login" && token) {
    const dashboard =
      role === "ADMIN"
        ? "/admin/dashboard"
        : role === "STAFF"
        ? "/staff/dashboard"
        : "/student/dashboard";

    return NextResponse.redirect(new URL(dashboard, req.url));
  }

  // 3️⃣ Role-based route protection
  if (pathname.startsWith("/admin") && role !== "ADMIN") {
    return NextResponse.redirect(new URL("/unauthorized", req.url));
  }

  if (pathname.startsWith("/staff") && !["STAFF", "ADMIN"].includes(role)) {
    return NextResponse.redirect(new URL("/unauthorized", req.url));
  }

  if (pathname.startsWith("/student") && role !== "STUDENT") {
    return NextResponse.redirect(new URL("/unauthorized", req.url));
  }

  // 4️⃣ Allow access
  return NextResponse.next();
}

export const config = {
  matcher: ["/login", "/admin/:path*", "/staff/:path*", "/student/:path*"],
};
