import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { auth } from "@/app/api/auth/[...nextauth]/route"

export async function middleware(req: NextRequest) {
  const session = await auth()
  const path = req.nextUrl.pathname

  // Allow access to login and public routes
  if (path.startsWith("/api") || path === "/login") return NextResponse.next()

  // If no session, redirect to login
  if (!session?.user) {
    return NextResponse.redirect(new URL("/login", req.url))
  }

  const role = session.user.role

  // Restrict by role
  if (path.startsWith("/admin") && role !== "ADMIN")
    return NextResponse.redirect(new URL("/login", req.url))

  if (path.startsWith("/staff") && role !== "STAFF")
    return NextResponse.redirect(new URL("/login", req.url))

  if (path.startsWith("/student") && role !== "STUDENT")
    return NextResponse.redirect(new URL("/login", req.url))

  // Redirect logged-in users away from /login
  if (path === "/login" && session?.user) {
    if (role === "ADMIN") return NextResponse.redirect(new URL("/admin/dashboard", req.url))
    if (role === "STAFF") return NextResponse.redirect(new URL("/staff/dashboard", req.url))
    if (role === "STUDENT") return NextResponse.redirect(new URL("/student/dashboard", req.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
}
