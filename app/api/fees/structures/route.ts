import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/prisma"
import { Prisma } from "@prisma/client"
import { getServerSession } from "next-auth/next"
import { authOption } from "@/app/lib/auth"
import { createAuditLog } from "@/app/lib/audit"
import { checkSubscriptionStatus } from "@/app/lib/feature-gate"

const toNum = (v: unknown): number => {
  const n = Number(v)
  return Number.isFinite(n) ? n : 0
}

export async function GET() {
  const items = await db.feeStructure.findMany({
    include: { class: true, category: true, _count: { select: { payments: true } } },
    orderBy: { createdAt: "desc" },
  })

  return NextResponse.json(
    items.map((i) => ({
      ...i,
      total: Number(i.total),
      monthlyFee: i.monthlyFee ? Number(i.monthlyFee) : null,
      tuitionFee: i.tuitionFee ? Number(i.tuitionFee) : null,
      examFee: i.examFee ? Number(i.examFee) : null,
      transportFee: i.transportFee ? Number(i.transportFee) : null,
      miscFee: i.miscFee ? Number(i.miscFee) : null,
    }))
  )
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOption)
  if (!session?.user || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  if (session.user.organizationId) {
    const { active, message } = await checkSubscriptionStatus(session.user.organizationId)
    if (!active) {
      return NextResponse.json({ error: message || "Subscription not active" }, { status: 403 })
    }
  }

  const body = await req.json().catch(() => null)
  if (!body?.classId || !body?.monthlyFee) {
    return NextResponse.json({ error: "classId and monthlyFee are required" }, { status: 400 })
  }

  const monthlyFee = toNum(body.monthlyFee)
  const totalMonths = body.totalMonths ? toNum(body.totalMonths) : 12
  const tuitionFee = toNum(body.tuitionFee)
  const examFee = toNum(body.examFee)
  const transportFee = toNum(body.transportFee)
  const miscFee = toNum(body.miscFee)
  const total = monthlyFee * totalMonths

  const created = await db.feeStructure.create({
    data: {
      classId: body.classId,
      categoryId: body.categoryId || null,
      name: body.name?.trim() || null,
      tuitionFee: new Prisma.Decimal(tuitionFee.toFixed(2)),
      examFee: body.examFee != null ? new Prisma.Decimal(examFee.toFixed(2)) : null,
      transportFee: body.transportFee != null ? new Prisma.Decimal(transportFee.toFixed(2)) : null,
      miscFee: body.miscFee != null ? new Prisma.Decimal(miscFee.toFixed(2)) : null,
      monthlyFee: new Prisma.Decimal(monthlyFee.toFixed(2)),
      totalMonths,
      total: new Prisma.Decimal(total.toFixed(2)),
    },
  })

  const students = await db.student.findMany({
    where: { classId: body.classId, active: true },
  })

  if (students.length > 0) {
    await db.$transaction(
      students.flatMap((s) => {
        let adjustedMonthly = monthlyFee
        if (body.transportFee != null && !s.usesTransport) {
          adjustedMonthly -= transportFee
        }

        return Array.from({ length: totalMonths }, (_, i) =>
          db.feePayment.create({
            data: {
              studentId: s.id,
              feeStructureId: created.id,
              monthlyFee: new Prisma.Decimal(adjustedMonthly.toFixed(2)),
              amountPaid: new Prisma.Decimal(0),
              remainAmount: new Prisma.Decimal(adjustedMonthly.toFixed(2)),
              status: "PENDING",
              feeMonth: i + 1,
            },
          })
        )
      })
    )
  }

  await createAuditLog({
    userId: session.user.id,
    action: "CREATE",
    entity: "FEE_STRUCTURE",
    entityId: created.id,
    newValue: {
      classId: body.classId,
      monthlyFee,
      totalMonths,
      total,
      studentsAffected: students.length,
    },
  })

  return NextResponse.json(created, { status: 201 })
}
