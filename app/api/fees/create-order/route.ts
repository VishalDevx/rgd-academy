import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/prisma"
import { getServerSession } from "next-auth/next"
import { authOption } from "@/app/lib/auth"
import Razorpay from "razorpay"

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOption)
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { feePaymentId } = await req.json()
  if (!feePaymentId) {
    return NextResponse.json({ error: "feePaymentId is required" }, { status: 400 })
  }

  const feePayment = await db.feePayment.findUnique({
    where: { id: feePaymentId },
    include: { student: true },
  })

  if (!feePayment) {
    return NextResponse.json({ error: "Fee payment not found" }, { status: 404 })
  }

  if (session.user.role === "STUDENT" && feePayment.student.userId !== session.user.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  if (session.user.role === "STUDENT" && feePayment.status === "PAID") {
    return NextResponse.json({ error: "This fee is already paid" }, { status: 400 })
  }

  const orgId = feePayment.organizationId || session.user.organizationId
  if (!orgId) {
    return NextResponse.json({ error: "Organization not found" }, { status: 404 })
  }

  const organization = await db.organization.findUnique({
    where: { id: orgId },
    select: { razorpayKeyId: true, razorpayKeySecret: true, name: true },
  })

  if (!organization?.razorpayKeyId || !organization?.razorpayKeySecret) {
    return NextResponse.json(
      { error: "Online payment is not configured. Contact school admin." },
      { status: 400 }
    )
  }

  const razorpay = new Razorpay({
    key_id: organization.razorpayKeyId,
    key_secret: organization.razorpayKeySecret,
  })

  const amountInPaise = Math.round(Number(feePayment.remainAmount) * 100)

  const order = await razorpay.orders.create({
    amount: amountInPaise,
    currency: "INR",
    receipt: `fee_${feePayment.id}_${Date.now()}`,
    notes: {
      feePaymentId: feePayment.id,
      organizationId: orgId,
      studentId: feePayment.studentId,
    },
  })

  await db.feePayment.update({
    where: { id: feePayment.id },
    data: { razorpayOrder: order.id },
  })

  return NextResponse.json({
    order_id: order.id,
    amount: order.amount,
    currency: order.currency,
    key_id: organization.razorpayKeyId,
    feePaymentId: feePayment.id,
  })
}
