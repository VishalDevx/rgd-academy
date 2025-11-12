import { NextResponse } from "next/server";
import { db } from "@/lib/prisma";
import { authConfig } from "@/app/api/auth/[...nextauth]/route";
import getServerSession from "next-auth/next"
export async function GET() {
  const items = await db.feePayment.findMany({ include: { student: { include: { user: true } }, feeStructure: true }, orderBy: { createdAt: "desc" } } as any);
  return NextResponse.json(items as any);
}

export async function POST(req: Request) {
  const session = await getServerSession(authConfig);
  if (!session?.user) return new NextResponse("Unauthorized", { status: 401 });
  const b = await req.json().catch(() => null);
  if (!b || !b.studentId || !b.feeStructureId || b.amountPaid == null) return new NextResponse("Invalid payload", { status: 400 });

  const created = await db.feePayment.create({
    data: {
      studentId: String(b.studentId),
      feeStructureId: String(b.feeStructureId),
      amountPaid: String(Number(b.amountPaid).toFixed(2)) as any,
      status: b.status ?? "PENDING",
      paymentDate: b.paymentDate ? new Date(b.paymentDate) : null,
      razorpayOrder: b.razorpayOrder ?? null,
      razorpayPaymentId: b.razorpayPaymentId ?? null,
      receiptUrl: b.receiptUrl ?? null,
    },
  });
  return NextResponse.json(created, { status: 201 });
}


