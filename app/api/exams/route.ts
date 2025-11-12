import { NextResponse } from "next/server";
import { db } from "@/lib/prisma";
import { authConfig } from "@/app/api/auth/[...nextauth]/route";
import getServerSession from "next-auth/next"
export async function GET() {
  const exams = await db.exam.findMany({ include: { class: true, createdBy: true }, orderBy: { startDate: "desc" } } as any);
  return NextResponse.json(exams as any);
}

export async function POST(req: Request) {
  const session = await getServerSession(authConfig)
  if (!session?.user || !["ADMIN", "STAFF"].includes(session.user.role)) return new NextResponse("Unauthorized", { status: 401 });
  const b = await req.json().catch(() => null);
  if (!b || !b.name || !b.classId || !b.startDate || !b.endDate) return new NextResponse("Invalid payload", { status: 400 });

  const created = await db.exam.create({
    data: {
      name: String(b.name),
      classId: String(b.classId),
      startDate: new Date(b.startDate),
      endDate: new Date(b.endDate),
      createdById: session.user.id,
    },
  });
  return NextResponse.json(created, { status: 201 });
}


