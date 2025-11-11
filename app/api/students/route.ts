import { NextResponse } from "next/server";
import { db } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authConfig } from "../auth/[...nextauth]/route";

export async function POST(req: Request) {
  const session = await getServerSession(authConfig);
  if (!session?.user || session.user.role !== "ADMIN") {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const body = await req.json().catch(() => null);
  if (!body || !body.name || !body.email || !body.adharNo || !body.admissionNo || !body.rollNumber) {
    return new NextResponse("Invalid payload", { status: 400 });
  }

  const created = await db.$transaction(async (tx) => {
    const user = await tx.user.create({
      data: {
        name: String(body.name),
        email: String(body.email).toLowerCase(),
        role: "STUDENT",
        adharNo: String(body.adharNo),
        passwordHash: body.passwordHash ?? null,
      },
    });

    const student = await tx.student.create({
      data: {
        userId: user.id,
        admissionNo: String(body.admissionNo),
        rollNumber: String(body.rollNumber),
        classId: body.classId ?? null,
        dob: body.dob ? new Date(body.dob) : null,
        gender: body.gender ?? null,
        address: body.address ?? null,
        profileImg: body.profileImg ?? "", // path from /api/upload
      },
    });

    return { user, student };
  });

  return NextResponse.json(created, { status: 201 });
}
