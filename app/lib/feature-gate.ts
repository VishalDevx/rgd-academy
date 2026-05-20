import { db } from "@/lib/prisma"

interface FeatureCheck {
  organizationId: string
  feature: string
}

export async function checkFeatureAccess({ organizationId, feature }: FeatureCheck): Promise<boolean> {
  const subscription = await db.subscription.findUnique({
    where: { organizationId },
    include: { plan: true },
  })

  if (!subscription) return false

  const features = subscription.plan.features as string[]
  return features.includes(feature)
}

export async function checkSubscriptionStatus(organizationId: string): Promise<{
  active: boolean
  status: string
  message?: string
}> {
  const subscription = await db.subscription.findUnique({
    where: { organizationId },
  })

  if (!subscription) {
    return { active: false, status: "NONE", message: "No subscription found" }
  }

  switch (subscription.status) {
    case "TRIALING":
    case "ACTIVE":
      return { active: true, status: subscription.status }
    case "PAST_DUE":
      return {
        active: false,
        status: "PAST_DUE",
        message: "Payment is past due. Please update your payment method to continue using all features.",
      }
    case "CANCELLED":
      return {
        active: false,
        status: "CANCELLED",
        message: "Your subscription has been cancelled. Please renew to regain access.",
      }
    case "EXPIRED":
      return {
        active: false,
        status: "EXPIRED",
        message: "Your subscription has expired. Please renew to continue.",
      }
    default:
      return { active: false, status: subscription.status }
  }
}

export async function canCreateStudent(organizationId: string): Promise<{ allowed: boolean; message?: string }> {
  const [usage, subscription] = await Promise.all([
    db.tenantUsage.findUnique({ where: { organizationId } }),
    db.subscription.findUnique({
      where: { organizationId },
      include: { plan: true },
    }),
  ])

  if (!subscription) {
    return { allowed: false, message: "No active subscription found" }
  }

  const count = usage?.studentCount ?? 0
  const max = subscription.plan.maxStudents

  if (count >= max) {
    return {
      allowed: false,
      message: `Student limit reached (${count}/${max}). Upgrade your plan to add more students.`,
    }
  }

  return { allowed: true }
}

export async function canCreateStaff(organizationId: string): Promise<{ allowed: boolean; message?: string }> {
  const [usage, subscription] = await Promise.all([
    db.tenantUsage.findUnique({ where: { organizationId } }),
    db.subscription.findUnique({
      where: { organizationId },
      include: { plan: true },
    }),
  ])

  if (!subscription) {
    return { allowed: false, message: "No active subscription found" }
  }

  const count = usage?.staffCount ?? 0
  const max = subscription.plan.maxStaff

  if (count >= max) {
    return {
      allowed: false,
      message: `Staff limit reached (${count}/${max}). Upgrade your plan to add more staff members.`,
    }
  }

  return { allowed: true }
}

export async function incrementUsage(organizationId: string, type: "student" | "staff" | "pdf"): Promise<void> {
  const field = type === "student" ? "studentCount" : type === "staff" ? "staffCount" : "pdfDownloads"

  await db.tenantUsage.upsert({
    where: { organizationId },
    create: { organizationId, [field]: 1 },
    update: { [field]: { increment: 1 } },
  })
}
