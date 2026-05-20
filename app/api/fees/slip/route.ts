import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/prisma"
import { getServerSession } from "next-auth/next"
import { authOption } from "@/app/lib/auth"

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOption)
    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    let studentId = searchParams.get("studentId") ?? ""

    if (session.user.role === "STUDENT") {
      const student = await db.student.findUnique({
        where: { userId: session.user.id },
        select: { id: true },
      })
      if (!student) return new NextResponse("Student not found", { status: 404 })
      studentId = student.id
    } else if (!studentId) {
      return new NextResponse("studentId is required", { status: 400 })
    }

    const student = await db.student.findUnique({
      where: { id: studentId },
      include: {
        user: { select: { name: true, email: true, phone: true } },
        class: true,
        transport: true,
      },
    })

    if (!student) {
      return new NextResponse("Student not found", { status: 404 })
    }

    const school = await db.schoolSettings.findFirst({
      orderBy: { createdAt: "desc" },
      select: { name: true, address: true, contactEmail: true, contactPhone: true, logoUrl: true },
    })

    const feeStructures = await db.feeStructure.findMany({
      where: { classId: student.classId ?? "" },
      include: { class: true },
      orderBy: { createdAt: "desc" },
    })

    const feePayments = await db.feePayment.findMany({
      where: { studentId },
      include: { feeStructure: true },
      orderBy: [{ feeMonth: "asc" }, { createdAt: "desc" }],
    })

    const slipData = feeStructures.map((fs) => {
      const paymentsForStructure = feePayments.filter((p) => p.feeStructureId === fs.id)

      let adjustedMonthly = Number(fs.monthlyFee)
      if (fs.transportFee && !student.usesTransport) {
        adjustedMonthly -= Number(fs.transportFee)
      }

      const totalMonths = fs.totalMonths || 12
      const adjustedTotal = adjustedMonthly * totalMonths
      const totalPaid = paymentsForStructure.reduce((sum, p) => sum + Number(p.amountPaid), 0)

      return {
        structureId: fs.id,
        structureName: fs.name || "Fee Structure",
        monthlyFee: adjustedMonthly,
        totalMonths,
        totalFee: adjustedTotal,
        totalPaid,
        remainAmount: Math.max(adjustedTotal - totalPaid, 0),
        status: paymentsForStructure.every((p) => p.status === "PAID")
          ? "PAID"
          : paymentsForStructure.some((p) => p.status === "PAID" || p.status === "PARTIAL")
            ? "PARTIAL"
            : "PENDING",
        payments: paymentsForStructure.map((p) => ({
          id: p.id,
          feeMonth: p.feeMonth,
          amountPaid: Number(p.amountPaid),
          remainAmount: Number(p.remainAmount),
          paymentDate: p.paymentDate,
          status: p.status,
          receiptNo: p.receiptNo,
        })),
      }
    })

    const grandTotal = slipData.reduce((s, d) => s + d.totalFee, 0)
    const grandPaid = slipData.reduce((s, d) => s + d.totalPaid, 0)
    const grandRemaining = slipData.reduce((s, d) => s + d.remainAmount, 0)

    return NextResponse.json({
      school,
      student: {
        id: student.id,
        name: student.user.name,
        email: student.user.email,
        phone: student.user.phone,
        admissionNo: student.admissionNo,
        rollNumber: student.rollNumber,
        className: student.class?.name ?? "",
        fatherName: student.fatherName,
        motherName: student.motherName,
        usesTransport: student.usesTransport,
      },
      feeSlip: slipData,
      summary: { grandTotal, grandPaid, grandRemaining },
    })
  } catch (error) {
    console.error("FEE_SLIP_ERROR:", error)
    return new NextResponse("Internal Server Error", { status: 500 })
  }
}
