import { NextResponse } from "next/server";
import { db } from "@/lib/prisma";

// This endpoint creates Notification records for students absent today
export async function POST(req: Request) {
  const headerToken = req.headers.get("x-cron-token");
  const envToken = process.env.CRON_SECRET_TOKEN;
  if (!envToken || headerToken !== envToken) return new NextResponse("Unauthorized", { status: 401 });

  const today = new Date();
  const start = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const end = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);

  const absences = await db.attendance.findMany({
    where: { status: "ABSENT", date: { gte: start, lt: end } },
    include: { student: { include: { user: true } } },
  } as any);

  if (!absences.length) return NextResponse.json({ ok: true, created: 0 });

  await db.notification.createMany({
    data: absences.map((a: any) => ({
      userId: a.student.userId,
      type: "ATTENDANCE_ALERT",
      title: "Attendance Alert",
      message: `You were marked ABSENT on ${start.toDateString()}`,
    })),
  } as any);

  return NextResponse.json({ ok: true, created: absences.length });
}


