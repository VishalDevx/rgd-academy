import { NextResponse } from "next/server";
import { db } from "@/lib/prisma";
import { auth } from "@/app/api/auth/[...nextauth]/route";

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const item = await db.feeStructure.findUnique({ where: { id: params.id }, include: { class: true } } as any);
  if (!item) return new NextResponse("Not found", { status: 404 });
  return NextResponse.json(item as any);
}

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") return new NextResponse("Unauthorized", { status: 401 });
  const b = await req.json().catch(() => null);
  if (!b) return new NextResponse("Invalid payload", { status: 400 });

  const updated = await db.feeStructure.update({
    where: { id: params.id },
    data: {
      name: b.name ?? undefined,
      classId: b.classId ?? undefined,
      tuitionFee: b.tuitionFee != null ? (String(Number(b.tuitionFee).toFixed(2)) as any) : undefined,
      examFee: b.examFee != null ? (String(Number(b.examFee).toFixed(2)) as any) : undefined,
      transportFee: b.transportFee != null ? (String(Number(b.transportFee).toFixed(2)) as any) : undefined,
      miscFee: b.miscFee != null ? (String(Number(b.miscFee).toFixed(2)) as any) : undefined,
      total: b.total != null ? (String(Number(b.total).toFixed(2)) as any) : undefined,
    },
  });
  return NextResponse.json(updated);
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") return new NextResponse("Unauthorized", { status: 401 });
  await db.feeStructure.delete({ where: { id: params.id } });
  return new NextResponse(null, { status: 204 });
}


