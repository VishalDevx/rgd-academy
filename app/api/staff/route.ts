import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/prisma";

import { getServerSession } from "next-auth/next";
import { logger } from "@/app/lib/logger";
import { authOptions } from "@/app/lib/auth";

const log = logger("staff-route");

// -------------------------------------------------------
// GET /staff
// -------------------------------------------------------
export async function GET() {
  log.info("GET /staff called");

  try {
    const staff = await db.staff.findMany({
      include: { user: true },
      orderBy: { joinDate: "desc" },
    });

    return NextResponse.json({ success: true, data: staff });
  } catch (err) {
    log.error("GET /staff failed", err);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

// -------------------------------------------------------
// POST /staff  (Admin only)
// -------------------------------------------------------
export async function POST(req: NextRequest) {
  log.info("POST /staff called");

  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.role !== "ADMIN") {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await req.json().catch(() => null);
    if (!body) return new NextResponse("Invalid payload", { status: 400 });

    // Validate basics
    if (!body.name || !body.email || !body.designation) {
      return new NextResponse("Missing required fields", { status: 400 });
    }

    const classIds: string[] = Array.isArray(body.classIds)
      ? body.classIds
      : [];

    const result = await db.$transaction(async (tx) => {
      // ---- Create user ----
      const user = await tx.user.create({
        data: {
          name: String(body.name),
          email: String(body.email).toLowerCase(),
          role: "STAFF",
          adharNo: String(body.adharNo ?? `STAFF-${Date.now()}`),
          passwordHash: String(body.passwordHash),
        },
      });

      // ---- Create staff ----
      const staff = await tx.staff.create({
        data: {
          userId: user.id,
          designation: String(body.designation),
          salary: body.salary ? Number(body.salary) : null,
          joinDate: body.joinDate ? new Date(body.joinDate) : new Date(),
        },
      });

      // ---- Assign teacher to multiple classes ----
      if (classIds.length > 0) {
        await tx.class.updateMany({
          where: { id: { in: classIds } },
          data: { teacherId: staff.id },
        });
      }

      return { user, staff };
    });

    return NextResponse.json({ success: true, data: result }, { status: 201 });
  } catch (err) {
    log.error("POST /staff failed", err);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
