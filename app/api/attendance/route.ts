import { NextResponse } from "next/server";
import { db } from "@/lib/prisma";
import { authConfig } from "../auth/[...nextauth]/route";
import getServerSession from "next-auth/next";
import { cookies } from "next/headers";

// ------------------ GET ATTENDANCE ------------------
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const classId = searchParams.get("classId");
    const dateStr = searchParams.get("date");

    if (!classId || !dateStr) {
      return NextResponse.json({ error: "Missing classId or date" }, { status: 400 });
    }

    const startDate = new Date(dateStr);
    startDate.setHours(0, 0, 0, 0);
    const endDate = new Date(startDate);
    endDate.setDate(startDate.getDate() + 1);

    const items = await db.attendance.findMany({
      where: {
        classId,
        date: { gte: startDate, lt: endDate },
      },
      include: {
        student: { include: { user: true } },
        class: true,
        markedBy: true,
      },
      orderBy: { date: "asc" },
    });

    return NextResponse.json({ success: true, data: items });
  } catch (err) {
    console.error("GET /attendance error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

// ------------------ SAVE/UPDATE ATTENDANCE ------------------
export async function POST(req: Request) {
  try {
    // Pass request to getServerSession to read cookies
    
const session = await getServerSession(authConfig)

    if (!session?.user || !["ADMIN", "STAFF"].includes(session.user.role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json().catch(() => null);
    if (!body || !body.classId || !Array.isArray(body.records)) {
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
    }

    const date = new Date(body.date || new Date());
    date.setHours(0, 0, 0, 0); // normalize date for upsert

    const created = await db.$transaction(async (tx) => {
      const results = [];
      for (const record of body.records) {
        const attendance = await tx.attendance.upsert({
          where: {
            studentId_date: { studentId: String(record.studentId), date },
          },
          update: { status: record.status },
          create: {
            classId: String(body.classId),
            studentId: String(record.studentId),
            date,
            status: record.status,
            markedById: session.user.id,
          },
        });
        results.push(attendance);
      }
      return results;
    });

    return NextResponse.json({ success: true, data: created }, { status: 201 });
  } catch (err) {
    console.error("POST /attendance error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
