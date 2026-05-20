import { db } from "@/lib/prisma"
import { LandingPageClient } from "./landing-page-client"

async function getPlans() {
  const plans = await db.plan.findMany({
    where: { isActive: true },
    orderBy: { sortOrder: "asc" },
  })
  return plans.map((p) => ({
    ...p,
    features: p.features as string[],
  }))
}

export default async function HomePage() {
  const plans = await getPlans()
  return <LandingPageClient plans={plans} />
}
