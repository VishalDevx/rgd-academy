import { NextResponse } from "next/server";
import { db } from "@/lib/prisma";
import { authConfig } from "@/app/api/auth/[...nextauth]/route";
import { getServerSession } from "next-auth";
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

    if (!session?.user || session.user.role !== "ADMIN") {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await req.json().catch(() => null);

    if (!body) {
      return new NextResponse("Invalid payload", { status: 400 });
    }

    const classIds: string[] = Array.isArray(body.classIds)
      ? body.classIds
      : [];

    const created = await db.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          name: String(body.name),
          email: String(body.email).toLowerCase(),
          role: "STAFF",
          adharNo: String(body.adharNo ?? `STAFF-${Date.now()}`),
          passwordHash: body.passwordHash,
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

      if (classIds.length > 0) {
        await tx.class.updateMany({
          where: { id: { in: classIds } },
          data: { teacherId: staff.id },
        });
      }

      return { user, staff };
    });

    return NextResponse.json({ success: true, data: created }, { status: 201 });
  } catch (err: any) {
    log.error("POST /staff failed", err);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
