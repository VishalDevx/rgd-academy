import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/prisma"
import { Prisma } from "@prisma/client"
import { getServerSession } from "next-auth/next"
import { authOption } from "@/app/lib/auth"

export async function GET() {
  const session = await getServerSession(authOption)
  if (!session?.user || !["ADMIN", "STAFF"].includes(session.user.role)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const items = await db.feePayment.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      amountPaid: true,
      remainAmount: true,
      monthlyFee: true,
      feeMonth: true,
      status: true,
      paymentDate: true,
      paymentMode: true,
      discount: true,
      lateFine: true,
      receiptNo: true,
      createdAt: true,
      student: {
        select: {
          id: true,
          admissionNo: true,
          rollNumber: true,
          user: { select: { name: true } },
          class: { select: { name: true } },
        },
      },
      feeStructure: { select: { id: true, name: true, monthlyFee: true, totalMonths: true } },
    },
  })

  return NextResponse.json(
    items.map((i) => ({
      ...i,
      amountPaid: Number(i.amountPaid),
      remainAmount: Number(i.remainAmount),
      monthlyFee: Number(i.monthlyFee),
      discount: i.discount ? Number(i.discount) : null,
      lateFine: i.lateFine ? Number(i.lateFine) : null,
      feeStructure: i.feeStructure
        ? { ...i.feeStructure, monthlyFee: Number(i.feeStructure.monthlyFee) }
        : null,
    }))
  )
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOption)
  if (!session?.user || !["ADMIN", "STAFF"].includes(session.user.role)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const body = await req.json().catch(() => null)
  if (!body?.studentId || !body?.feeStructureId || body.amountPaid == null) {
    return NextResponse.json({ error: "studentId, feeStructureId, and amountPaid are required" }, { status: 400 })
  }

  const feeStructure = await db.feeStructure.findUnique({ where: { id: body.feeStructureId } })
  if (!feeStructure) return NextResponse.json({ error: "Fee structure not found" }, { status: 404 })

  const student = await db.student.findUnique({ where: { id: body.studentId } })
  if (!student) return NextResponse.json({ error: "Student not found" }, { status: 404 })

  let monthlyAmount = Number(feeStructure.monthlyFee)
  if (feeStructure.transportFee && !student.usesTransport) {
    monthlyAmount -= Number(feeStructure.transportFee)
  }

  const amountPaid = Number(body.amountPaid)
  const discount = body.discount ? Number(body.discount) : 0
  const lateFine = body.lateFine ? Number(body.lateFine) : 0
  const netAmount = amountPaid + discount - lateFine
  let receiptNo = body.receiptNo?.trim() || ""
  if (!receiptNo) {
    const school = await db.schoolSettings.findFirst({ orderBy: { createdAt: "desc" } })
    const prefix = school?.receiptPrefix ?? "RCP"
    const count = await db.feePayment.count()
    receiptNo = `${prefix}${String(count + 1).padStart(6, "0")}`
  }

  const paymentDate = body.paymentDate ? new Date(body.paymentDate) : new Date()
  const paymentMode = body.paymentMode || null
  const remarks = body.remarks?.trim() || null

  let result

  if (body.feeMonth) {
    const feeMonth = Number(body.feeMonth)

    const existing = await db.feePayment.findFirst({
      where: { studentId: body.studentId, feeStructureId: body.feeStructureId, feeMonth },
    })

    if (existing) {
      const totalPaid = Number(existing.amountPaid) + netAmount
      const remaining = Math.max(monthlyAmount - totalPaid, 0)
      const status: "PENDING" | "PAID" | "PARTIAL" =
        totalPaid >= monthlyAmount ? "PAID" : totalPaid > 0 ? "PARTIAL" : "PENDING"

      result = await db.feePayment.update({
        where: { id: existing.id },
        data: {
          amountPaid: new Prisma.Decimal(totalPaid.toFixed(2)),
          remainAmount: new Prisma.Decimal(remaining.toFixed(2)),
          status,
          paymentDate,
          paymentMode: paymentMode ?? existing.paymentMode,
          discount: discount > 0 ? new Prisma.Decimal(discount.toFixed(2)) : existing.discount,
          lateFine: lateFine > 0 ? new Prisma.Decimal(lateFine.toFixed(2)) : existing.lateFine,
          receiptNo,
          remarks: remarks ?? existing.remarks,
        },
      })
    } else {
      const remaining = Math.max(monthlyAmount - netAmount, 0)
      const status: "PENDING" | "PAID" | "PARTIAL" =
        netAmount >= monthlyAmount ? "PAID" : netAmount > 0 ? "PARTIAL" : "PENDING"

      result = await db.feePayment.create({
        data: {
          studentId: body.studentId,
          feeStructureId: body.feeStructureId,
          monthlyFee: new Prisma.Decimal(monthlyAmount.toFixed(2)),
          amountPaid: new Prisma.Decimal(netAmount.toFixed(2)),
          remainAmount: new Prisma.Decimal(remaining.toFixed(2)),
          status,
          feeMonth,
          paymentDate,
          paymentMode,
          discount: discount > 0 ? new Prisma.Decimal(discount.toFixed(2)) : null,
          lateFine: lateFine > 0 ? new Prisma.Decimal(lateFine.toFixed(2)) : null,
          receiptNo,
          remarks,
          organizationId: session.user.organizationId ?? "",
        },
      })
    }
  } else {
    const unpaid = await db.feePayment.findMany({
      where: {
        studentId: body.studentId,
        feeStructureId: body.feeStructureId,
        status: { not: "PAID" },
      },
      orderBy: { feeMonth: "asc" },
    })

    if (unpaid.length === 0) {
      return NextResponse.json({ error: "All months are already paid" }, { status: 400 })
    }

    let remainingToDistribute = netAmount
    let lastUpdated

    for (const record of unpaid) {
      if (remainingToDistribute <= 0) break

      const monthDue = Number(record.remainAmount)
      const payForMonth = Math.min(remainingToDistribute, monthDue)
      const newPaid = Number(record.amountPaid) + payForMonth
      const newRemain = Math.max(monthDue - payForMonth, 0)
      const monthStatus: "PENDING" | "PAID" | "PARTIAL" =
        newPaid >= monthlyAmount ? "PAID" : newPaid > 0 ? "PARTIAL" : "PENDING"

      lastUpdated = await db.feePayment.update({
        where: { id: record.id },
        data: {
          amountPaid: new Prisma.Decimal(newPaid.toFixed(2)),
          remainAmount: new Prisma.Decimal(newRemain.toFixed(2)),
          status: monthStatus,
          paymentDate,
          paymentMode: paymentMode ?? record.paymentMode,
          discount: discount > 0 ? new Prisma.Decimal(discount.toFixed(2)) : record.discount,
          lateFine: lateFine > 0 ? new Prisma.Decimal(lateFine.toFixed(2)) : record.lateFine,
          receiptNo,
          remarks: remarks ?? record.remarks,
        },
      })

      remainingToDistribute -= payForMonth
    }

    result = lastUpdated ?? unpaid[0]
  }

  await db.auditLog.create({
    data: {
      userId: session.user.id,
      action: "CREATE_FEE_PAYMENT",
      entity: "FeePayment",
      entityId: result.id,
      newValue: {
        studentId: result.studentId,
        feeStructureId: result.feeStructureId,
        amountPaid: Number(result.amountPaid),
        remainAmount: Number(result.remainAmount),
        status: result.status,
        receiptNo: result.receiptNo,
      } as Prisma.InputJsonValue,
    },
  })

  return NextResponse.json(
    {
      ...result,
      amountPaid: Number(result.amountPaid),
      remainAmount: Number(result.remainAmount),
      monthlyFee: Number(result.monthlyFee),
    },
    { status: 201 }
  )
}
