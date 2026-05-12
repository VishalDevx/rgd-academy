import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOption } from "@/app/lib/auth";

export async function GET() {
  const session = await getServerSession(authOption);
  if (!session?.user || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const leaves = await db.leave.findMany({
    include: {
      staff: {
        include: { user: { select: { name: true, email: true } } },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ data: leaves });
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOption);
  if (!session?.user || !["ADMIN", "STAFF"].includes(session.user.role)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  if (!body || !body.fromDate || !body.toDate || !body.reason) {
    return NextResponse.json({ error: "fromDate, toDate, reason required" }, { status: 400 });
  }

  const staff = await db.staff.findUnique({ where: { userId: session.user.id } });
  if (!staff) return NextResponse.json({ error: "Staff record not found" }, { status: 404 });

  const leave = await db.leave.create({
    data: {
      staffId: staff.id,
      fromDate: new Date(body.fromDate),
      toDate: new Date(body.toDate),
      reason: body.reason,
      status: "PENDING",
    },
  });

  return NextResponse.json({ data: leave }, { status: 201 });
}
