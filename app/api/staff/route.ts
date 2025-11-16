import { NextResponse } from "next/server";
import { db } from "@/lib/prisma";
import { authConfig } from "@/app/api/auth/[...nextauth]/route";
import getServerSession from "next-auth/next";
import { logger } from "@/app/lib/logger";

const log = logger("staff-route");

// ------------------ GET STAFF ------------------
export async function GET() {
  log.info("GET /staff called");

  try {
    const staff = await db.staff.findMany({
      include: { user: true },
      orderBy: { joinDate: "desc" },
    });

    log.info("Staff list fetched", { count: staff.length });

    return NextResponse.json({ success: true, data: staff });
  } catch (err: any) {
    log.error("GET /staff failed", err);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

// ------------------ CREATE STAFF ------------------
export async function POST(req: Request) {
  log.info("POST /staff called");

  try {
    const session = await getServerSession(authConfig);

    if (!session?.user) {
      log.warn("Unauthorized request - no session");
      return new NextResponse("Unauthorized", { status: 401 });
    }

    if (session.user.role !== "ADMIN") {
      log.warn("Unauthorized - insufficient permissions", {
        userId: session.user.id,
        role: session.user.role,
      });
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await req.json().catch(() => null);

    if (!body) {
      log.warn("Invalid payload received in /staff POST");
      return new NextResponse("Invalid payload", { status: 400 });
    }

    log.info("Incoming staff payload", {
      email: body.email,
      designation: body.designation,
    });

    const created = await db.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          name: String(body.name),
          email: String(body.email).toLowerCase(),
          role: "STAFF",
          adharNo: body.adharNo ? String(body.adharNo) : `STAFF-${Date.now()}`,
          passwordHash: body.passwordHash ?? null,
        },
      });

      const staff = await tx.staff.create({
        data: {
          userId: user.id,
          designation: String(body.designation),
          salary: body.salary ? Number(body.salary) : null,
          joinDate: body.joinDate ? new Date(body.joinDate) : new Date(),
        },
      });

      return { user, staff };
    });

    log.info("Staff creation successful", {
      userId: created.user.id,
      email: created.user.email,
    });

    return NextResponse.json({ success: true, data: created }, { status: 201 });
  } catch (err: any) {
    log.error("POST /staff failed", err);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
