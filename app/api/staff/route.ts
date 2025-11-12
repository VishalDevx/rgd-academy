import { NextResponse } from "next/server";
import { db } from "@/lib/prisma";
import { authConfig } from "@/app/api/auth/[...nextauth]/route";
import getServerSession from "next-auth/next"
export async function GET() {
  const staff = await db.staff.findMany({ include: { user: true }, orderBy: { joinDate: "desc" } } as any);
  return NextResponse.json(staff as any);
}

export async function POST(req: Request) {
  const session = await getServerSession(authConfig);
  if (!session?.user || session.user.role !== "ADMIN") return new NextResponse("Unauthorized", { status: 401 });
  const body = await req.json().catch(() => null);
  if (!body || !body.name || !body.email || !body.designation) return new NextResponse("Invalid payload", { status: 400 });

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

  return NextResponse.json(created, { status: 201 });
}


