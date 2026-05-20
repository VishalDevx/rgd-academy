import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/prisma"
import { getServerSession } from "next-auth/next"
import { authOption } from "@/app/lib/auth"

export async function GET(_req: NextRequest, { params }: { params: Promise<{ paymentId: string }> }) {
  const session = await getServerSession(authOption)
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { paymentId } = await params
  if (!paymentId) {
    return NextResponse.json({ error: "Missing paymentId" }, { status: 400 })
  }

  const payment = await db.feePayment.findUnique({
    where: { id: paymentId },
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
      remarks: true,
      createdAt: true,
      razorpayOrder: true,
      razorpayPaymentId: true,
      receiptUrl: true,
      feeStructure: { select: { id: true, name: true, totalMonths: true, total: true } },
      student: {
        select: {
          id: true,
          admissionNo: true,
          rollNumber: true,
          userId: true,
          user: { select: { name: true, email: true, phone: true } },
          class: { select: { name: true } },
        },
      },
    },
  })

  if (!payment) {
    return NextResponse.json({ error: "Payment not found" }, { status: 404 })
  }

  if (session.user.role === "STUDENT" && payment.student.userId !== session.user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  if (!["ADMIN", "STAFF", "STUDENT"].includes(session.user.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const school = await db.schoolSettings.findFirst({
    orderBy: { createdAt: "desc" },
    select: { name: true, address: true, contactEmail: true, contactPhone: true, logoUrl: true },
  })

  return NextResponse.json({
    payment: {
      ...payment,
      amountPaid: Number(payment.amountPaid),
      remainAmount: Number(payment.remainAmount),
      monthlyFee: Number(payment.monthlyFee),
      discount: payment.discount ? Number(payment.discount) : null,
      lateFine: payment.lateFine ? Number(payment.lateFine) : null,
      feeStructure: payment.feeStructure
        ? { ...payment.feeStructure, total: Number(payment.feeStructure.total) }
        : null,
    },
    school,
  })
}
