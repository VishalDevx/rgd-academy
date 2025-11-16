import { NextResponse } from "next/server";
import { db } from "@/lib/prisma";
import { authConfig } from "../auth/[...nextauth]/route";
import getServerSession from "next-auth/next";
import { logger } from "@/app/lib/logger";

const log = logger("attendance-route");

// ------------------ GET ATTENDANCE ------------------
export async function GET(req: Request) {
  const url = new URL(req.url);
  const classId = url.searchParams.get("classId");
  const dateStr = url.searchParams.get("date");

  log.info("GET /attendance called", { classId, dateStr });

  try {
    if (!classId || !dateStr) {
      log.warn("Missing required query params", { classId, dateStr });
      return NextResponse.json(
        { error: "Missing classId or date" },
        { status: 400 }
      );
    }

    const startDate = new Date(dateStr);
    startDate.setHours(0, 0, 0, 0);

    const endDate = new Date(startDate);
    endDate.setDate(startDate.getDate() + 1);

    log.debug("Date window", { startDate, endDate });

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

    log.info("Attendance fetched", {
      count: items.length,
      classId,
      dateStr,
    });

    return NextResponse.json({ success: true, data: items });
  } catch (err: any) {
    log.error("GET /attendance error", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

// ------------------ SAVE/UPDATE ATTENDANCE ------------------
export async function POST(req: Request) {
  log.info("POST /attendance called");

  try {
    const session = await getServerSession(authConfig);

    if (!session?.user) {
      log.warn("Unauthorized access");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    log.info("User attempting to mark attendance", {
      userId: session.user.id,
      role: session.user.role,
    });

    if (!["ADMIN", "STAFF"].includes(session.user.role)) {
      log.warn("User does not have permission", session.user);
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json().catch(() => null);
    log.debug("Incoming payload", body);

    if (!body || !body.classId || !Array.isArray(body.records)) {
      log.warn("Invalid payload", body);
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
    }

    const date = new Date(body.date || new Date());
    date.setHours(0, 0, 0, 0);

    log.info("Normalized attendance date", { date });

    const created = await db.$transaction(async (tx) => {
      const results = [];

      for (const record of body.records) {
        const att = await tx.attendance.upsert({
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

        results.push(att);
      }

      return results;
    });

    log.info("Attendance updated", {
      count: created.length,
      classId: body.classId,
    });

    return NextResponse.json({ success: true, data: created }, { status: 201 });
  } catch (err: any) {
    log.error("POST /attendance error", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
