import { db } from "@/lib/prisma"
import { FeesDashboardClient } from "./fees-dashboard-client"

async function getDashboardData() {
  const [
    totalStructures,
    totalPayments,
    totalCollected,
    pendingCount,
    paidCount,
    partialCount,
    recentPayments,
    monthlyData,
  ] = await Promise.all([
    db.feeStructure.count(),
    db.feePayment.count(),
    db.feePayment.aggregate({ _sum: { amountPaid: true } }),
    db.feePayment.count({ where: { status: "PENDING" } }),
    db.feePayment.count({ where: { status: "PAID" } }),
    db.feePayment.count({ where: { status: "PARTIAL" } }),
    db.feePayment.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        amountPaid: true,
        status: true,
        paymentDate: true,
        receiptNo: true,
        student: { select: { user: { select: { name: true } }, class: { select: { name: true } } } },
        feeStructure: { select: { name: true } },
      },
    }),
    db.feePayment.groupBy({
      by: ["status"],
      _count: { id: true },
      _sum: { amountPaid: true },
    }),
  ])

  return {
    totalStructures,
    totalPayments,
    totalCollected: totalCollected._sum.amountPaid
      ? Number(totalCollected._sum.amountPaid)
      : 0,
    pendingCount,
    paidCount,
    partialCount,
    recentPayments: recentPayments.map((p) => ({
      id: p.id,
      amountPaid: Number(p.amountPaid),
      status: p.status,
      paymentDate: p.paymentDate ? p.paymentDate.toISOString() : null,
      receiptNo: p.receiptNo,
      student: {
        user: { name: p.student.user.name },
        class: { name: p.student.class?.name ?? "" },
      },
      feeStructure: { name: p.feeStructure.name },
    })),
    monthlyData: monthlyData.map((m) => ({
      status: m.status,
      count: m._count.id,
      amount: Number(m._sum.amountPaid) || 0,
    })),
  }
}

export default async function FeesPage() {
  const data = await getDashboardData()

  return <FeesDashboardClient data={data} />
}
