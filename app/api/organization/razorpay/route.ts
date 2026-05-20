import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/prisma"
import { getServerSession } from "next-auth/next"
import { authOption } from "@/app/lib/auth"

export async function GET() {
  const session = await getServerSession(authOption)
  if (!session?.user || (session.user.role !== "ADMIN" && session.user.role !== "SUPER_ADMIN")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const orgId = session.user.organizationId
  if (!orgId) {
    return NextResponse.json({ razorpayKeyId: null, hasKeys: false })
  }

  const org = await db.organization.findUnique({
    where: { id: orgId },
    select: { razorpayKeyId: true },
  })

  return NextResponse.json({
    razorpayKeyId: org?.razorpayKeyId || null,
    hasKeys: !!org?.razorpayKeyId,
  })
}

export async function PUT(req: NextRequest) {
  const session = await getServerSession(authOption)
  if (!session?.user || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const orgId = session.user.organizationId
  if (!orgId) {
    return NextResponse.json({ error: "Organization not found" }, { status: 404 })
  }

  const { razorpayKeyId, razorpayKeySecret } = await req.json()
  if (!razorpayKeyId || !razorpayKeySecret) {
    return NextResponse.json({ error: "Both Key ID and Key Secret are required" }, { status: 400 })
  }

  await db.organization.update({
    where: { id: orgId },
    data: { razorpayKeyId, razorpayKeySecret },
  })

  return NextResponse.json({ success: true })
}
