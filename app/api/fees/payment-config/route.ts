import { NextResponse } from "next/server"
import { db } from "@/lib/prisma"
import { getServerSession } from "next-auth/next"
import { authOption } from "@/app/lib/auth"

export async function GET() {
  const session = await getServerSession(authOption)
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const orgId = session.user.organizationId
  if (!orgId) {
    return NextResponse.json({ enabled: false })
  }

  const organization = await db.organization.findUnique({
    where: { id: orgId },
    select: { razorpayKeyId: true, razorpayKeySecret: true },
  })

  return NextResponse.json({
    enabled: !!(organization?.razorpayKeyId && organization?.razorpayKeySecret),
  })
}
