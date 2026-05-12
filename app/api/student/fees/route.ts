import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOption } from "@/app/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOption);
    if (!session?.user || session.user.role !== "STUDENT") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get student record
    const student = await db.student.findUnique({
      where: { userId: session.user.id },
    });

    if (!student) {
      return NextResponse.json({ error: "Student not found" }, { status: 404 });
    }

    if (!student.active) {
      return NextResponse.json({ error: "Account deactivated. Contact admin." }, { status: 403 });
    }

    // Get all fee payments for this student
    const feePayments = await db.feePayment.findMany({
      where: { studentId: student.id },
      include: {
        feeStructure: {
          include: {
            class: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    // Get fee structures for student's class
    const feeStructures = await db.feeStructure.findMany({
      where: { classId: student.classId || "" },
      include: {
        class: true,
        payments: {
          where: { studentId: student.id },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    // Calculate summary
    const totalPaid = feePayments.reduce(
      (sum, payment) => sum + Number(payment.amountPaid),
      0
    );
    const totalPending = feePayments.reduce(
      (sum, payment) => sum + Number(payment.remainAmount),
      0
    );

    const paidCount = feePayments.filter((p) => p.status === "PAID").length;
    const pendingCount = feePayments.filter(
      (p) => p.status === "PENDING" || p.status === "PARTIAL"
    ).length;

    return NextResponse.json({
      feePayments,
      feeStructures,
      summary: {
        totalPaid,
        totalPending,
        paidCount,
        pendingCount,
        totalPayments: feePayments.length,
      },
    });
  } catch (error) {
    console.error("Error fetching student fees:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
