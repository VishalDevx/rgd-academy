import { NextResponse } from "next/server";
import { db } from "@/lib/prisma";
import { authConfig } from "@/app/api/auth/[...nextauth]/route";
import { getServerSession } from "next-auth";

export async function GET() {
  try {
    const classes = await db.class.findMany({
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json({ success: true, data: classes });
  } catch (err) {
    return NextResponse.json({ success: false, error: "Failed to fetch classes" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authConfig);
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

    return NextResponse.json({ success: true, data: created }, { status: 201 });
  } catch (err: unknown) {
    // log server error
    // eslint-disable-next-line no-console
    console.error("POST /api/classes failed:", err);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
