import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOption } from "@/app/lib/auth";

// ---- Types ----
interface CreateExamBody {
  name: string;
  classId: string;
  startDate: string;
  endDate: string;
}

// ---- GET ----
export async function GET() {
  const exams = await db.exam.findMany({
    include: { class: true, createdBy: true },
    orderBy: { startDate: "desc" },
  });

  return NextResponse.json(exams);
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOption);

  if (!session?.user || !["ADMIN", "STAFF"].includes(session.user.role)) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const body: CreateExamBody | null = await req.json().catch(() => null);

  if (!body?.name || !body?.classId || !body?.startDate || !body?.endDate) {
    return new NextResponse("Invalid payload", { status: 400 });
  }

  // Verify user exists
  const user = await db.user.findUnique({ where: { id: session.user.id } });
  console.log(session.user)
  if (!user) {
    return new NextResponse("User not found", { status: 400 });
  }

  // Verify class exists
  const classExists = await db.class.findUnique({ where: { id: body.classId } });
  if (!classExists) {
    return new NextResponse("Class not found", { status: 400 });
  }

  const newExam = await db.exam.create({
    data: {
      name: body.name,
      classId: body.classId,
      startDate: new Date(body.startDate),
      endDate: new Date(body.endDate),
      createdById: session.user.id,
    },
  });

  return NextResponse.json(newExam, { status: 201 });
}
