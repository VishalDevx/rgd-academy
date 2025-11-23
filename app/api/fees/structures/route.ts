import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/prisma";

import { getServerSession } from "next-auth/next";
import { Prisma } from "@prisma/client";
import { authOptions } from "@/app/lib/auth";

// ---------- Types ----------
interface FeeStructureBody {
  classId: string;
  name?: string | null;
  tuitionFee: number | string;
  examFee?: number | string | null;
  transportFee?: number | string | null;
  miscFee?: number | string | null;
}

// Convert safely to number
const toNum = (v: unknown): number => {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
};

// ---------- GET ----------
export async function GET() {
  const items = await db.feeStructure.findMany({
    include: { class: true },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(items);
}

// ---------- POST ----------
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session?.user || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await req.json().catch(() => null)) as FeeStructureBody | null;

  if (!body || !body.classId || body.tuitionFee == null) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  // ----- Calculate total -----
  const tuition = toNum(body.tuitionFee);
  const exam = toNum(body.examFee);
  const transport = toNum(body.transportFee);
  const misc = toNum(body.miscFee);

  const total = tuition + exam + transport + misc;

  // ----- Create Fee Structure -----
  const created = await db.feeStructure.create({
    data: {
      classId: body.classId,
      name: body.name ?? null,
      tuitionFee: new Prisma.Decimal(tuition.toFixed(2)),
      examFee: body.examFee != null ? new Prisma.Decimal(exam.toFixed(2)) : null,
      transportFee:
        body.transportFee != null
          ? new Prisma.Decimal(transport.toFixed(2))
          : null,
      miscFee:
        body.miscFee != null ? new Prisma.Decimal(misc.toFixed(2)) : null,
      total: new Prisma.Decimal(total.toFixed(2)),
    },
  });

  // ----- Fetch all students -----
  const students = await db.student.findMany({
    where: { classId: body.classId },
  });

  // ----- Auto-create FeePayment -----
  if (students.length > 0) {
    await db.$transaction(
      students.map((s) =>
        db.feePayment.create({
          data: {
            studentId: s.id,
            feeStructureId: created.id,
            amountPaid: new Prisma.Decimal(0),
            remainAmount: created.total,
            status: "PENDING",
          },
        })
      )
    );
  }

  return NextResponse.json(created, { status: 201 });
}
