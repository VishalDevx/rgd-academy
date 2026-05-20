import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/prisma"
import bcrypt from "bcryptjs"

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { schoolName, adminName, adminEmail, password, phone, planCode, address, city, state } = body

    if (!schoolName?.trim() || !adminName?.trim() || !adminEmail?.trim() || !password) {
      return NextResponse.json({ error: "Required fields missing" }, { status: 400 })
    }

    const slug = schoolName.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") + "-" + Date.now().toString(36)

    // Find plan
    let plan = await db.plan.findUnique({ where: { code: planCode || "trial" } })
    if (!plan) plan = await db.plan.findUnique({ where: { code: "trial" } })
    if (!plan) return NextResponse.json({ error: "Invalid plan" }, { status: 400 })

    // Check existing email
    const existing = await db.user.findUnique({ where: { email: adminEmail } })
    if (existing) {
      return NextResponse.json({ error: "Email already registered" }, { status: 409 })
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 12)

    // Create organization, user, subscription in transaction
    const result = await db.$transaction(async (tx) => {
      const org = await tx.organization.create({
        data: {
          name: schoolName.trim(),
          slug,
          email: adminEmail.trim(),
          phone: phone?.trim() || null,
          address: address?.trim() || null,
          city: city?.trim() || null,
          state: state?.trim() || null,
          status: "REGISTERED",
        },
      })

      const user = await tx.user.create({
        data: {
          email: adminEmail.trim(),
          passwordHash,
          name: adminName.trim(),
          role: "ADMIN",
          phone: phone?.trim() || null,
          adharNo: `ADM-${Date.now()}`,
          organizationId: org.id,
        },
      })

      await tx.schoolSettings.create({
        data: {
          organizationId: org.id,
          name: schoolName.trim(),
          contactEmail: adminEmail.trim(),
          contactPhone: phone?.trim() || null,
          address: address?.trim() || null,
        },
      })

      const now = new Date()
      const trialDays = plan.code === "trial" ? 14 : 0
      const periodEnd = new Date(now)
      periodEnd.setDate(periodEnd.getDate() + (trialDays || 30))

      const subscription = await tx.subscription.create({
        data: {
          organizationId: org.id,
          planId: plan.id,
          status: plan.code === "trial" ? "TRIALING" : "ACTIVE",
          trialEndsAt: plan.code === "trial" ? periodEnd : null,
          currentPeriodStart: now,
          currentPeriodEnd: periodEnd,
        },
      })

      await tx.tenantUsage.create({
        data: {
          organizationId: org.id,
        },
      })

      // If paid plan, create a pending payment
      if (plan.priceMonthly > 0) {
        await tx.saasPayment.create({
          data: {
            subscriptionId: subscription.id,
            organizationId: org.id,
            amount: plan.priceMonthly,
            currency: "INR",
            status: "PENDING",
          },
        })
      }

      return { organizationId: org.id, slug: org.slug, isPaid: plan.priceMonthly > 0, planPrice: plan.priceMonthly }
    })

    return NextResponse.json(result, { status: 201 })
  } catch (error) {
    console.error("REGISTRATION_ERROR:", error)
    return NextResponse.json({ error: "Registration failed. Please try again." }, { status: 500 })
  }
}
