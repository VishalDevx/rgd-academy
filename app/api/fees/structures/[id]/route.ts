import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { getServerSession } from "next-auth/next";
import { authOption } from "@/app/lib/auth";
import { promises } from "dns";

export async function GET(_request: NextRequest, { params }: { params:Promise<{ id: string }> }) {
  const {id} = await params;
  const item = await db.feeStructure.findUnique({
    where: { id: (await params).id },
    include: { class: true },
  });
  if (!item) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(item);
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOption);
  const {id} = await params;
  if (!session?.user || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  if (!body) return NextResponse.json({ error: "Invalid payload" }, { status: 400 });

  const updated = await db.feeStructure.update({
    where: { id: (await params).id },
    data: {
      name: body.name ?? undefined,
      classId: body.classId ?? undefined,
      tuitionFee:
        body.tuitionFee != null ? new Prisma.Decimal(Number(body.tuitionFee).toFixed(2)) : undefined,
      examFee:
        body.examFee != null ? new Prisma.Decimal(Number(body.examFee).toFixed(2)) : undefined,
      transportFee:
        body.transportFee != null ? new Prisma.Decimal(Number(body.transportFee).toFixed(2)) : undefined,
      miscFee:
        body.miscFee != null ? new Prisma.Decimal(Number(body.miscFee).toFixed(2)) : undefined,
      total:
        body.total != null ? new Prisma.Decimal(Number(body.total).toFixed(2)) : undefined,
    },
  });

  return NextResponse.json(updated);
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const {id} = await params
  const session = await getServerSession(authOption);
  if (!session?.user || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await db.feeStructure.delete({ where: { id: (await params).id } });
  return NextResponse.json({ success: true }, { status: 204 });
}
