import { NextResponse } from "next/server";
import { db } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOption } from "@/app/lib/auth";

/* ================= TYPES ================= */

interface CreateResultBody {
  examId: string;
  studentId: string;
  subjectId: string;
  marks: number | string;
  maxMarks: number | string;
  grade?: string | null;
  remarks?: string | null;
}

/* ================= GET ================= */

export async function GET(req: Request) {
  const session = await getServerSession(authOption);
  if (!session?.user) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const examId = searchParams.get("examId");
  const studentId = searchParams.get("studentId");
  const classId = searchParams.get("classId");

  // 🔒 STUDENT can only see his own results
  if (session.user.role === "STUDENT" && studentId !== session.user.id) {
    return new NextResponse("Forbidden", { status: 403 });
  }

  const results = await db.result.findMany({
    where: {
      ...(examId && { examId }),
      ...(studentId && { studentId }),
      ...(classId && {
        exam: { classId },
      }),
    },
    include: {
      exam: true,
      subject: true,
      student: {
        include: { user: true },
      },
    },
    orderBy: [
      { subject: { name: "asc" } },
      { exam: { category: "asc" } },
    ],
  });

  return NextResponse.json(results);
}

/* ================= POST (UPSERT) ================= */

export async function POST(req: Request) {
  const session = await getServerSession(authOption);

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

  const result = await db.result.upsert({
    where: {
      studentId_examId_subjectId: {
        studentId: body.studentId,
        examId: body.examId,
        subjectId: body.subjectId,
      },
    },
    update: {
      marks,
      maxMarks,
      grade: body.grade ?? null,
      remarks: body.remarks ?? null,
      uploadedBy: session.user.id,
    },
    create: {
      studentId: body.studentId,
      examId: body.examId,
      subjectId: body.subjectId,
      marks,
      maxMarks,
      grade: body.grade ?? null,
      remarks: body.remarks ?? null,
      uploadedBy: session.user.id,
    },
  });

  return NextResponse.json(result, { status: 201 });
}
