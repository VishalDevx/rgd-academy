import { NextResponse } from "next/server";
import { db } from "@/lib/prisma";
import { auth } from "@/app/api/auth/[...nextauth]/route";

export async function GET() {
  const items = await db.feeStructure.findMany({ include: { class: true }, orderBy: { createdAt: "desc" } } as any);
  return NextResponse.json(items as any);
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") return new NextResponse("Unauthorized", { status: 401 });
  const b = await req.json().catch(() => null);
  if (!b || !b.classId || b.tuitionFee == null) return new NextResponse("Invalid payload", { status: 400 });

  const total = [b.tuitionFee, b.examFee, b.transportFee, b.miscFee]
    .map((n: any) => (n ? Number(n) : 0))
    .reduce((a: number, c: number) => a + c, 0);

  const created = await db.feeStructure.create({
    data: {
      classId: String(b.classId),
      name: b.name ? String(b.name) : null,
      tuitionFee: String(Number(b.tuitionFee).toFixed(2)) as any,
      examFee: b.examFee != null ? (String(Number(b.examFee).toFixed(2)) as any) : null,
      transportFee: b.transportFee != null ? (String(Number(b.transportFee).toFixed(2)) as any) : null,
      miscFee: b.miscFee != null ? (String(Number(b.miscFee).toFixed(2)) as any) : null,
      total: String(Number(total).toFixed(2)) as any,
    },
  });
  return NextResponse.json(created, { status: 201 });
}


