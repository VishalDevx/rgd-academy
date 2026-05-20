import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/prisma"
import { getServerSession } from "next-auth/next"
import { authOption } from "@/app/lib/auth"
import crypto from "crypto"

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOption)
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { razorpay_order_id, razorpay_payment_id, razorpay_signature, feePaymentId } =
    await req.json()

  if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !feePaymentId) {
    return NextResponse.json({ error: "Missing payment details" }, { status: 400 })
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

  const orgId = feePayment.organizationId || session.user.organizationId
  if (!orgId) {
    return NextResponse.json({ error: "Organization not found" }, { status: 404 })
  }

  const organization = await db.organization.findUnique({
    where: { id: orgId },
    select: { razorpayKeySecret: true },
  })

  if (!organization?.razorpayKeySecret) {
    return NextResponse.json(
      { error: "Payment gateway not configured" },
      { status: 400 }
    )
  }

  const expectedSignature = crypto
    .createHmac("sha256", organization.razorpayKeySecret)
    .update(`${razorpay_order_id}|${razorpay_payment_id}`)
    .digest("hex")

  if (expectedSignature !== razorpay_signature) {
    return NextResponse.json({ error: "Invalid payment signature" }, { status: 400 })
  }

  const amountPaid = Number(feePayment.remainAmount)

  await db.feePayment.update({
    where: { id: feePayment.id },
    data: {
      razorpayPaymentId: razorpay_payment_id,
      status: "PAID",
      paymentMode: "ONLINE",
      paymentDate: new Date(),
      amountPaid: { increment: amountPaid },
      remainAmount: 0,
    },
  })

  await db.auditLog.create({
    data: {
      userId: session.user.id,
      action: "ONLINE_FEE_PAYMENT",
      entity: "FeePayment",
      entityId: feePayment.id,
      newValue: {
        razorpayPaymentId: razorpay_payment_id,
        amountPaid,
        status: "PAID",
      },
    },
  })

  return NextResponse.json({ success: true })
}
