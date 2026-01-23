import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { getServerSession } from "next-auth/next";
import { authOption } from "@/app/lib/auth";

export async function GET() {
  const session = await getServerSession(authOption);
  if (!session?.user || !["ADMIN", "STAFF"].includes(session.user.role)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const items = await db.feePayment.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      amountPaid: true,
      remainAmount: true,
      status: true,
      paymentDate: true,
      createdAt: true,
      student: {
        select: {
          id: true,
          admissionNo: true,
          rollNumber: true,
          user: { select: { name: true, email: true } },
          class: { select: { name: true } },
        },
      },
      feeStructure: { select: { id: true, name: true, total: true } },
    },
  });
  return NextResponse.json(items);
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOption);
  if (!session?.user || !["ADMIN", "STAFF"].includes(session.user.role)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  if (!body || !body.studentId || !body.feeStructureId || body.amountPaid == null) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  // Fetch fee structure to calculate status
  const fee = await db.feeStructure.findUnique({ where: { id: body.feeStructureId } });
  if (!fee) return NextResponse.json({ error: "Fee structure not found" }, { status: 404 });

  const amountPaid = Number(body.amountPaid);
  const remainAmount = Math.max(Number(fee.total) - amountPaid, 0);
  let status: "PENDING" | "PARTIAL" | "PAID" = "PENDING";
  if (amountPaid >= Number(fee.total)) status = "PAID";
  else if (amountPaid > 0) status = "PARTIAL";

  const created = await db.feePayment.create({
    data: {
      studentId: String(body.studentId),
      feeStructureId: String(body.feeStructureId),
      amountPaid: new Prisma.Decimal(amountPaid.toFixed(2)),
      status,
      remainAmount: new Prisma.Decimal(remainAmount.toFixed(2)),
      paymentDate: body.paymentDate ? new Date(body.paymentDate) : new Date(),
      razorpayOrder: body.razorpayOrder ?? null,
      razorpayPaymentId: body.razorpayPaymentId ?? null,
      receiptUrl: body.receiptUrl ?? null,
    },
  });

  await db.auditLog.create({
    data: {
      userId: session.user.id,
      action: "CREATE_FEE_PAYMENT",
      entity: "FeePayment",
      entityId: created.id,
      newValue: {
        studentId: created.studentId,
        feeStructureId: created.feeStructureId,
        amountPaid: created.amountPaid,
        remainAmount: created.remainAmount,
        status: created.status,
        paymentDate: created.paymentDate,
      } as Prisma.InputJsonValue,
    },
  });

  return NextResponse.json(created, { status: 201 });
}
