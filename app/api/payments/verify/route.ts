import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/prisma"
import crypto from "crypto"

export async function POST(req: NextRequest) {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, organizationId } = await req.json()

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !organizationId) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const body = razorpay_order_id + "|" + razorpay_payment_id
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET!)
      .update(body)
      .digest("hex")

    if (expectedSignature !== razorpay_signature) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 400 })
    }

    const payment = await db.saasPayment.findFirst({
      where: { razorpayOrderId: razorpay_order_id },
    })

    if (!payment) {
      return NextResponse.json({ error: "Payment not found" }, { status: 404 })
    }

    await db.$transaction(async (tx) => {
      await tx.saasPayment.update({
        where: { id: payment.id },
        data: {
          status: "PAID",
          razorpayPaymentId: razorpay_payment_id,
          razorpaySignature: razorpay_signature,
          paidAt: new Date(),
        },
      })

      const subscription = await tx.subscription.findUnique({
        where: { id: payment.subscriptionId },
      })

      if (!subscription) {
        throw new Error("Subscription not found")
      }

      const now = new Date()
      const periodEnd = new Date(now)
      periodEnd.setDate(periodEnd.getDate() + 30)

      await tx.subscription.update({
        where: { id: payment.subscriptionId },
        data: {
          status: "ACTIVE",
          currentPeriodStart: now,
          currentPeriodEnd: periodEnd,
        },
      })

      await tx.organization.update({
        where: { id: organizationId },
        data: { status: "ACTIVE" },
      })
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("VERIFY_PAYMENT_ERROR:", error)
    return NextResponse.json({ error: "Verification failed" }, { status: 500 })
  }
}
