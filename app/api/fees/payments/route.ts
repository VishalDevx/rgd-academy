import { NextResponse } from "next/server";
import { db } from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { authConfig } from "@/app/api/auth/[...nextauth]/route";
import { getServerSession } from "next-auth/next";

export async function GET() {
  const items = await db.feePayment.findMany({
    include: { student: { include: { user: true } }, feeStructure: true },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(items);
}

export async function POST(req: Request) {
  const session = await getServerSession(authConfig);
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
  let status: "PENDING" | "PARTIAL" | "PAID" = "PENDING";
  if (amountPaid >= Number(fee.total)) status = "PAID";
  else if (amountPaid > 0) status = "PARTIAL";

  const created = await db.feePayment.create({
    data: {
      studentId: String(body.studentId),
      feeStructureId: String(body.feeStructureId),
      amountPaid: new Prisma.Decimal(amountPaid.toFixed(2)),
      status,
      paymentDate: body.paymentDate ? new Date(body.paymentDate) : new Date(),
      razorpayOrder: body.razorpayOrder ?? null,
      razorpayPaymentId: body.razorpayPaymentId ?? null,
      receiptUrl: body.receiptUrl ?? null,
    },
  });

  return NextResponse.json(created, { status: 201 });
}
