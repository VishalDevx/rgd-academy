import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/prisma"
import crypto from "crypto"

export async function POST(req: NextRequest) {
  try {
    const text = await req.text()
    const body = JSON.parse(text)

    const webhookSignature = req.headers.get("x-razorpay-signature")
    if (!webhookSignature) {
      return NextResponse.json({ error: "Missing signature" }, { status: 401 })
    }

    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_WEBHOOK_SECRET!)
      .update(text)
      .digest("hex")

    if (expectedSignature !== webhookSignature) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 })
    }

    const event = body.event
    const payload = body.payload

    const webhookEvent = await db.webhookEvent.create({
      data: {
        provider: "razorpay",
        eventType: event,
        payload: body,
      },
    })

    switch (event) {
      case "payment.captured": {
        const paymentEntity = payload.payment?.entity
        if (paymentEntity) {
          const saasPayment = await db.saasPayment.findFirst({
            where: { razorpayOrderId: paymentEntity.order_id },
          })
          if (saasPayment && saasPayment.status !== "PAID") {
            await db.$transaction(async (tx) => {
              await tx.saasPayment.update({
                where: { id: saasPayment.id },
                data: {
                  status: "PAID",
                  razorpayPaymentId: paymentEntity.id,
                  paidAt: new Date(),
                },
              })
              const subscription = await tx.subscription.findUnique({
                where: { id: saasPayment.subscriptionId },
              })
              if (subscription && subscription.status !== "ACTIVE") {
                await tx.subscription.update({
                  where: { id: saasPayment.subscriptionId },
                  data: {
                    status: "ACTIVE",
                    currentPeriodStart: new Date(),
                    currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
                  },
                })
                await tx.organization.update({
                  where: { id: saasPayment.organizationId },
                  data: { status: "ACTIVE" },
                })
              }
            })
          }
        }
        break
      }
      case "payment.failed": {
        const paymentEntity = payload.payment?.entity
        if (paymentEntity) {
          const saasPayment = await db.saasPayment.findFirst({
            where: { razorpayOrderId: paymentEntity.order_id },
          })
          if (saasPayment) {
            await db.saasPayment.update({
              where: { id: saasPayment.id },
              data: { status: "FAILED" },
            })
          }
        }
        break
      }
      case "order.paid": {
        const orderEntity = payload.order?.entity
        if (orderEntity) {
          const saasPayment = await db.saasPayment.findFirst({
            where: { razorpayOrderId: orderEntity.id },
          })
          if (saasPayment && saasPayment.status !== "PAID") {
            await db.saasPayment.update({
              where: { id: saasPayment.id },
              data: { status: "PAID" },
            })
          }
        }
        break
      }
    }

    await db.webhookEvent.update({
      where: { id: webhookEvent.id },
      data: { processed: true, processedAt: new Date() },
    })

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error("WEBHOOK_ERROR:", error)
    return NextResponse.json({ error: "Webhook processing failed" }, { status: 500 })
  }
}
