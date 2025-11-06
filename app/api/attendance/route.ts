import { NextResponse } from "next/server";
import { db } from "@/lib/prisma";
import { auth } from "@/app/api/auth/[...nextauth]/route";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const classId = searchParams.get("classId");
  const date = searchParams.get("date");
  const where: any = {};
  if (classId) where.classId = classId;
  if (date) where.date = new Date(date);
  const items = await db.attendance.findMany({ where, include: { student: { include: { user: true } }, class: true, markedBy: true }, orderBy: { date: "desc" } } as any);
  return NextResponse.json(items as any);
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user || !["ADMIN", "STAFF"].includes(session.user.role)) return new NextResponse("Unauthorized", { status: 401 });
  const b = await req.json().catch(() => null);
  if (!b || !b.classId || !Array.isArray(b.records)) return new NextResponse("Invalid payload", { status: 400 });

  const date = b.date ? new Date(b.date) : new Date();
  const created = await db.$transaction(async (tx) => {
    const results: any[] = [];
    for (const r of b.records) {
      const rec = await tx.attendance.upsert({
        where: { studentId_date: { studentId: String(r.studentId), date } },
        update: { status: r.status },
        create: {
          classId: String(b.classId),
          studentId: String(r.studentId),
          date,
          status: r.status,
          markedById: session.user.id,
        },
      } as any);
      results.push(rec);
    }
    return results;
  });
  return NextResponse.json(created, { status: 201 });
}


