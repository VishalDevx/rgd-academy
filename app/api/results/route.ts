import { NextResponse } from "next/server";
import { db } from "@/lib/prisma";
import { authConfig } from "@/app/api/auth/[...nextauth]/route";
import getServerSession from "next-auth/next"
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const examId = searchParams.get("examId");
  const classId = searchParams.get("classId");
  const studentId = searchParams.get("studentId");

  const where: any = {};
  if (examId) where.examId = examId;
  if (studentId) where.studentId = studentId;
  // class results via exam.classId
  const items = await db.result.findMany({
    where,
    include: { exam: true, subject: true, student: { include: { user: true } } },
    orderBy: { createdAt: "desc" },
  } as any);

  const filtered = classId ? items.filter((r: any) => r.exam.classId === classId) : items;
  return NextResponse.json(filtered as any);
}

export async function POST(req: Request) {
  const session = await getServerSession(authConfig);
  if (!session?.user || !["ADMIN", "STAFF"].includes(session.user.role)) return new NextResponse("Unauthorized", { status: 401 });
  const b = await req.json().catch(() => null);
  if (!b || !b.studentId || !b.examId || !b.subjectId || b.marks == null || b.maxMarks == null)
    return new NextResponse("Invalid payload", { status: 400 });

  const created = await db.result.create({
    data: {
      studentId: String(b.studentId),
      examId: String(b.examId),
      subjectId: String(b.subjectId),
      marks: Number(b.marks),
      maxMarks: Number(b.maxMarks),
      grade: b.grade ?? null,
      remarks: b.remarks ?? null,
      uploadedBy: session.user.role === "STAFF" ? session.user.id : null,
    },
  });
  return NextResponse.json(created, { status: 201 });
}


