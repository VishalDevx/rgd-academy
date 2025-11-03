
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { auth } from "./api/auth/[...nextauth]/route"

export async function middleware(req: NextRequest) {
  const session = await auth()
  const path = req.nextUrl.pathname

  if (path === "/login" && session?.user) {
    const role = session.user.role
    if (role === "ADMIN") return NextResponse.redirect(new URL("/admin/dashboard", req.url))
    if (role === "STAFF") return NextResponse.redirect(new URL("/staff/dashboard", req.url))
    if (role === "STUDENT") return NextResponse.redirect(new URL("/student/dashboard", req.url))
  }

  if (path.startsWith("/admin") && session?.user.role !== "ADMIN")
    return NextResponse.redirect(new URL("/login", req.url))
  if (path.startsWith("/staff") && session?.user.role !== "STAFF")
    return NextResponse.redirect(new URL("/login", req.url))
  if (path.startsWith("/student") && session?.user.role !== "STUDENT")
    return NextResponse.redirect(new URL("/login", req.url))

  return NextResponse.next()
}

export const config = {
  matcher: ["/admin/:path*", "/staff/:path*", "/student/:path*"],
}
