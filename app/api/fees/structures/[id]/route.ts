import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/prisma"
import { Prisma } from "@prisma/client"
import { getServerSession } from "next-auth/next"
import { authOption } from "@/app/lib/auth"

const toNum = (v: unknown): number => {
  const n = Number(v)
  return Number.isFinite(n) ? n : 0
}

export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const item = await db.feeStructure.findUnique({
    where: { id },
    include: { class: true, category: true },
  })

  if (!item) return NextResponse.json({ error: "Not found" }, { status: 404 })

  return NextResponse.json({
    ...item,
    total: Number(item.total),
    monthlyFee: item.monthlyFee ? Number(item.monthlyFee) : null,
    tuitionFee: item.tuitionFee ? Number(item.tuitionFee) : null,
    examFee: item.examFee ? Number(item.examFee) : null,
    transportFee: item.transportFee ? Number(item.transportFee) : null,
    miscFee: item.miscFee ? Number(item.miscFee) : null,
  })
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOption)
  if (!session?.user || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { id } = await params
  const body = await req.json().catch(() => null)
  if (!body) return NextResponse.json({ error: "Invalid payload" }, { status: 400 })

  const monthlyFee = body.monthlyFee ? toNum(body.monthlyFee) : undefined
  const totalMonths = body.totalMonths ? toNum(body.totalMonths) : undefined
  const tuitionFee = body.tuitionFee != null ? toNum(body.tuitionFee) : undefined
  const examFee = body.examFee != null ? toNum(body.examFee) : undefined
  const transportFee = body.transportFee != null ? toNum(body.transportFee) : undefined
  const miscFee = body.miscFee != null ? toNum(body.miscFee) : undefined

  let total: number | undefined
  if (monthlyFee && totalMonths) {
    total = monthlyFee * totalMonths
  } else if (monthlyFee) {
    const existing = await db.feeStructure.findUnique({ where: { id }, select: { totalMonths: true } })
    total = monthlyFee * (existing?.totalMonths ?? 12)
  } else if (totalMonths) {
    const existing = await db.feeStructure.findUnique({ where: { id }, select: { monthlyFee: true } })
    total = (existing?.monthlyFee ? Number(existing.monthlyFee) : 0) * totalMonths
  }

  const updated = await db.feeStructure.update({
    where: { id },
    data: {
      ...(body.name !== undefined && { name: body.name?.trim() || null }),
      ...(body.classId !== undefined && { classId: body.classId }),
      ...(body.categoryId !== undefined && { categoryId: body.categoryId || null }),
      ...(tuitionFee !== undefined && { tuitionFee: new Prisma.Decimal(tuitionFee.toFixed(2)) }),
      ...(examFee !== undefined && { examFee: new Prisma.Decimal(examFee.toFixed(2)) }),
      ...(transportFee !== undefined && { transportFee: new Prisma.Decimal(transportFee.toFixed(2)) }),
      ...(miscFee !== undefined && { miscFee: new Prisma.Decimal(miscFee.toFixed(2)) }),
      ...(monthlyFee !== undefined && { monthlyFee: new Prisma.Decimal(monthlyFee.toFixed(2)) }),
      ...(totalMonths !== undefined && { totalMonths }),
      ...(total !== undefined && { total: new Prisma.Decimal(total.toFixed(2)) }),
    },
  })

  return NextResponse.json(updated)
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOption)
  if (!session?.user || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { id } = await params
  await db.feePayment.deleteMany({ where: { feeStructureId: id } })
  await db.feeStructure.delete({ where: { id } })
  return NextResponse.json({ success: true })
}
