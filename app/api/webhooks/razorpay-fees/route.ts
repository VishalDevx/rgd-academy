import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/prisma"
import crypto from "crypto"

export async function POST(req: NextRequest) {
  const text = await req.text()
  const signature = req.headers.get("x-razorpay-signature") || ""
  const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET

  if (webhookSecret) {
    const expectedSignature = crypto
      .createHmac("sha256", webhookSecret)
      .update(text)
      .digest("hex")

    if (expectedSignature !== signature) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 400 })
    }
  }

  let event: { event?: string; payload?: Record<string, unknown> }
  try {
    event = JSON.parse(text)
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 })
  }

  if (event.event === "payment.captured") {
    const payment = event.payload?.payment as Record<string, unknown> | undefined
    const notes = payment?.notes as Record<string, unknown> | undefined
    const orderId = payment?.order_id as string | undefined

    if (notes?.feePaymentId) {
      const feePaymentId = notes.feePaymentId as string

      const feePayment = await db.feePayment.findUnique({
        where: { id: feePaymentId },
      })

      if (feePayment && feePayment.status !== "PAID") {
        const amountPaid = Number(feePayment.remainAmount)
        await db.feePayment.update({
          where: { id: feePaymentId },
          data: {
            razorpayPaymentId: (payment?.id as string) || "",
            status: "PAID",
            paymentMode: "ONLINE",
            paymentDate: new Date(),
            amountPaid: { increment: amountPaid },
            remainAmount: 0,
          },
        })
      }
    }

    if (orderId && !notes?.feePaymentId) {
      const feePayment = await db.feePayment.findFirst({
        where: { razorpayOrder: orderId },
      })
      if (feePayment && feePayment.status !== "PAID") {
        const amountPaid = Number(feePayment.remainAmount)
        await db.feePayment.update({
          where: { id: feePayment.id },
          data: {
            razorpayPaymentId: (payment?.id as string) || "",
            status: "PAID",
            paymentMode: "ONLINE",
            paymentDate: new Date(),
            amountPaid: { increment: amountPaid },
            remainAmount: 0,
          },
        })
      }
    }
  }

  return NextResponse.json({ received: true })
}
