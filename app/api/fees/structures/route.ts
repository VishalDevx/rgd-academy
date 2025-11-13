import { NextResponse } from "next/server";
import { db } from "@/lib/prisma";
import { authConfig } from "@/app/api/auth/[...nextauth]/route";
import { getServerSession } from "next-auth/next";
import { Prisma } from "@prisma/client";

export async function GET() {
  const items = await db.feeStructure.findMany({
    include: { class: true },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(items);
}

export async function POST(req: Request) {
  const session = await getServerSession(authConfig);
  if (!session?.user || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  if (!body || !body.classId || body.tuitionFee == null) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  // Calculate total fee
  const total = [body.tuitionFee, body.examFee, body.transportFee, body.miscFee]
    .map((n: any) => (n ? Number(n) : 0))
    .reduce((a: number, c: number) => a + c, 0);

  // Create FeeStructure
  const created = await db.feeStructure.create({
    data: {
      classId: String(body.classId),
      name: body.name ? String(body.name) : null,
      tuitionFee: new Prisma.Decimal(Number(body.tuitionFee).toFixed(2)),
      examFee: body.examFee != null ? new Prisma.Decimal(Number(body.examFee).toFixed(2)) : null,
      transportFee: body.transportFee != null ? new Prisma.Decimal(Number(body.transportFee).toFixed(2)) : null,
      miscFee: body.miscFee != null ? new Prisma.Decimal(Number(body.miscFee).toFixed(2)) : null,
      total: new Prisma.Decimal(Number(total).toFixed(2)),
    },
  });

  // Auto-create FeePayment for all students in this class
  const students = await db.student.findMany({ where: { classId: body.classId } });
  await db.$transaction(
    students.map((s) =>
      db.feePayment.create({
        data: {
          studentId: s.id,
          feeStructureId: created.id,
          amountPaid: new Prisma.Decimal(0),
          status: "PENDING",
        },
      })
    )
  );

  return NextResponse.json(created, { status: 201 });
}
