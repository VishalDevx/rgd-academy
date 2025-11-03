import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const path = req.nextUrl.pathname;

    // Redirect logged-in users away from login page
    if (path === "/login" && token) {
      if (token.role === "ADMIN")
        return NextResponse.redirect(new URL("/admin/dashboard", req.url));
      if (token.role === "STAFF")
        return NextResponse.redirect(new URL("/staff/dashboard", req.url));
      if (token.role === "STUDENT")
        return NextResponse.redirect(new URL("/student/dashboard", req.url));
    }

    // Role-based access control
    if (path.startsWith("/admin") && token?.role !== "ADMIN")
      return NextResponse.redirect(new URL("/login", req.url));
    if (path.startsWith("/staff") && token?.role !== "STAFF")
      return NextResponse.redirect(new URL("/login", req.url));
    if (path.startsWith("/student") && token?.role !== "STUDENT")
      return NextResponse.redirect(new URL("/login", req.url));

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
  }
);

// Run middleware only on protected routes
export const config = {
  matcher: ["/admin/:path*", "/staff/:path*", "/student/:path*"],
};
