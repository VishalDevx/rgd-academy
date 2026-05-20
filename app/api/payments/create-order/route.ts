import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/prisma"
import Razorpay from "razorpay"

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
})

export async function POST(req: NextRequest) {
  try {
    const { organizationId, planId } = await req.json()

    if (!organizationId || !planId) {
      return NextResponse.json({ error: "organizationId and planId are required" }, { status: 400 })
    }

    const [organization, plan] = await Promise.all([
      db.organization.findUnique({ where: { id: organizationId } }),
      db.plan.findUnique({ where: { id: planId } }),
    ])

    if (!organization) {
      return NextResponse.json({ error: "Organization not found" }, { status: 404 })
    }
    if (!plan) {
      return NextResponse.json({ error: "Plan not found" }, { status: 404 })
    }

    let subscription = await db.subscription.findUnique({
      where: { organizationId },
    })

    if (!subscription) {
      const now = new Date()
      const periodEnd = new Date(now)
      periodEnd.setDate(periodEnd.getDate() + 30)

      subscription = await db.subscription.create({
        data: {
          organizationId,
          planId,
          status: "TRIALING",
          currentPeriodStart: now,
          currentPeriodEnd: periodEnd,
        },
      })
    }

    const amount = plan.priceMonthly

    const order = await razorpay.orders.create({
      amount,
      currency: "INR",
      receipt: `sub_${subscription.id}_${Date.now()}`,
      notes: {
        organizationId,
        subscriptionId: subscription.id,
        planId,
      },
    })

    await db.saasPayment.create({
      data: {
        subscriptionId: subscription.id,
        organizationId,
        amount,
        currency: "INR",
        status: "CREATED",
        razorpayOrderId: order.id,
      },
    })

    return NextResponse.json({
      order_id: order.id,
      amount: order.amount,
      currency: order.currency,
      key: process.env.RAZORPAY_KEY_ID,
    })
  } catch (error) {
    console.error("CREATE_ORDER_ERROR:", error)
    return NextResponse.json({ error: "Failed to create order" }, { status: 500 })
  }
}
