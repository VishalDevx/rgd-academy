import { NextResponse } from "next/server";
import { db } from "@/lib/prisma";
import { authConfig } from "@/app/api/auth/[...nextauth]/route";
import getServerSession from "next-auth/next"
export async function GET() {
  const classes = await db.class.findMany({
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(classes);
}

export async function POST(req: Request) {
 const session = await getServerSession(authConfig)
  if (!session?.user || session.user.role !== "ADMIN") {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const body = await req.json().catch(() => null);
  if (!body || !body.name || !body.grade) {
    return new NextResponse("Invalid payload", { status: 400 });
  }

  const created = await db.class.create({
    data: {
      name: String(body.name),
      grade: String(body.grade) as any,
      section: body.section ? String(body.section) : null,
      gradeCode: body.gradeCode ? String(body.gradeCode) : null,
      teacherId: body.teacherId ? String(body.teacherId) : null,
    },
  });

  return NextResponse.json(created, { status: 201 });
}




