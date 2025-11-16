import { NextResponse } from "next/server";
import { db } from "@/lib/prisma";
import { authConfig } from "@/app/api/auth/[...nextauth]/route";
import getServerSession from "next-auth/next";
import { logger } from "@/app/lib/logger";

const log = logger("staff-route");       

export async function GET() {
  try {
    log.info("Fetching staff list");

    const staff = await db.staff.findMany({
      include: { user: true },
      orderBy: { joinDate: "desc" }
    });

    log.info(`Fetched ${staff.length} staff`);
    return NextResponse.json(staff);
  } catch (err) {
    log.error("GET /staff failed:", err);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    log.info("Staff creation request received");

    const session = await getServerSession(authConfig);

    if (!session?.user || session.user.role !== "ADMIN") {
      log.warn("Unauthorized POST /staff attempt");
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await req.json().catch(() => null);
    if (!body) {
      log.warn("Invalid payload received in POST /staff");
      return new NextResponse("Invalid payload", { status: 400 });
    }

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
          joinDate: body.joinDate ? new Date(body.joinDate) : undefined,
        },
      });

      return { user, staff };
    });

    log.info("Staff created successfully:", created.user.email);

    return NextResponse.json(created, { status: 201 });
  } catch (err) {
    log.error("POST /staff failed:", err);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
