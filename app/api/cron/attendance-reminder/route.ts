import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/prisma";
import type { Attendance, Student, User } from "@prisma/client";

// POST /api/cron/attendance-reminder
export async function POST(req: NextRequest) {
  // --- Validate cron secret ---
  const headerToken = req.headers.get("x-cron-token");
  const envToken = process.env.CRON_SECRET_TOKEN;

  if (!envToken || headerToken !== envToken) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  // --- Date range for today ---
  const today = new Date();
  const start = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const end = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);

  // --- Explicitly typed result from Prisma ---
  type AttendanceWithStudent = Attendance & {
    student: Student & {
      user: User;
    };
  };

  // --- Fetch all ABSENT students for today ---
  const absences: AttendanceWithStudent[] = await db.attendance.findMany({
    where: {
      status: "ABSENT",
      date: { gte: start, lt: end },
    },
    include: {
      student: {
        include: { user: true },
      },
    },
  });

  if (absences.length === 0) {
    return NextResponse.json({ ok: true, created: 0 });
  }

  // --- Create notification payload ---
  const notifications = absences.map((a) => ({
    userId: a.student.userId,
    type: "ATTENDANCE_ALERT" as const,
    title: "Attendance Alert",
    message: `You were marked ABSENT on ${start.toDateString()}`,
  }));

  // --- Insert notifications ---
  await db.notification.createMany({
    data: notifications,
  });

  return NextResponse.json({ ok: true, created: absences.length });
}
