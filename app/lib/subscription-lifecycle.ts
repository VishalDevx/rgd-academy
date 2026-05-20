import { db } from "@/lib/prisma"

export function isInGracePeriod(subscription: { graceEndsAt?: Date | null; status: string }): boolean {
  if (subscription.status !== "PAST_DUE" || !subscription.graceEndsAt) return false
  return new Date() < subscription.graceEndsAt
}

export function getGracePeriodEndDate(days: number = 7): Date {
  const date = new Date()
  date.setDate(date.getDate() + days)
  return date
}

export async function checkAndUpdateExpiredSubscriptions(): Promise<{
  updated: number
  skipped: number
}> {
  const now = new Date()

  const expiredSubscriptions = await db.subscription.findMany({
    where: {
      currentPeriodEnd: { lt: now },
      status: { in: ["TRIALING", "ACTIVE", "PAST_DUE"] },
    },
    include: { organization: true },
  })

  let updated = 0
  let skipped = 0

  for (const sub of expiredSubscriptions) {
    const inGrace = sub.status === "PAST_DUE" && sub.graceEndsAt && now < sub.graceEndsAt
    if (inGrace) {
      skipped++
      continue
    }

    await db.$transaction([
      db.subscription.update({
        where: { id: sub.id },
        data: { status: "EXPIRED" },
      }),
      db.organization.update({
        where: { id: sub.organizationId },
        data: { status: "EXPIRED" },
      }),
    ])

    updated++
  }

  return { updated, skipped }
}
