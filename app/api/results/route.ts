import { NextResponse } from "next/server";
import { db } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/lib/auth";

// -------- Types --------
interface ResultQuery {
  examId?: string | null;
  classId?: string | null;
  studentId?: string | null;
}

interface CreateResultBody {
  examId: string;
  studentId: string;
  subjectId: string;
  marks: number | string;
  maxMarks: number | string;
  grade?: string | null;
  remarks?: string | null;
}

// -------- GET --------
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);

  const query: ResultQuery = {
    examId: searchParams.get("examId"),
    classId: searchParams.get("classId"),
    studentId: searchParams.get("studentId"),
  };

  const where: Record<string, string> = {};
  if (query.examId) where.examId = query.examId;
  if (query.studentId) where.studentId = query.studentId;

  const results = await db.result.findMany({
    where,
    include: {
      exam: true,
      subject: true,
      student: { include: { user: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  // Optional filtering by classId through exam.classId
  const filtered =
    query.classId != null
      ? results.filter((r) => r.exam.classId === query.classId)
      : results;

  return NextResponse.json(filtered);
}

// -------- POST --------
export async function POST(req: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user || !["ADMIN", "STAFF"].includes(session.user.role)) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const body = (await req.json().catch(() => null)) as CreateResultBody | null;

  if (
    !body ||
    !body.studentId ||
    !body.examId ||
    !body.subjectId ||
    body.marks == null ||
    body.maxMarks == null
  ) {
    return new NextResponse("Invalid payload", { status: 400 });
  }

  const marks = Number(body.marks);
  const maxMarks = Number(body.maxMarks);

  if (Number.isNaN(marks) || Number.isNaN(maxMarks)) {
    return new NextResponse("Invalid numeric values", { status: 400 });
  }

  const created = await db.result.create({
    data: {
      studentId: body.studentId,
      examId: body.examId,
      subjectId: body.subjectId,
      marks,
      maxMarks,
      grade: body.grade ?? null,
      remarks: body.remarks ?? null,
      uploadedBy: session.user.role === "STAFF" ? session.user.id : null,
    },
  });

  return NextResponse.json(created, { status: 201 });
}
