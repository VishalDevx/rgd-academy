import { NextResponse } from "next/server"
import { db } from "@/lib/prisma"

export async function GET() {
  const plans = await db.plan.findMany({
    where: { isActive: true },
    orderBy: { sortOrder: "asc" },
  })

  return NextResponse.json(
    plans.map((p) => ({
      ...p,
      features: p.features as string[],
    }))
  )
}
