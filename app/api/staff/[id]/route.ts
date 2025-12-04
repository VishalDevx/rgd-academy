import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOption } from "@/app/lib/auth";

interface StaffPatchBody {
  designation?: string;
  salary?: number;
  joinDate?: string;
}

// GET staff by ID
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const item = await db.staff.findUnique({
    where: { id },
    include: { user: true },
  });

  if (!item) return new NextResponse("Not found", { status: 404 });

  return NextResponse.json(item);
}

// PATCH staff by ID
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const session = await getServerSession(authOption);
  if (!session?.user || session.user.role !== "ADMIN") {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const body = (await request.json().catch(() => null)) as StaffPatchBody | null;
  if (!body) return new NextResponse("Invalid payload", { status: 400 });

  const updated = await db.staff.update({
    where: { id },
    data: {
      designation: body.designation,
      salary: body.salary,
      joinDate: body.joinDate ? new Date(body.joinDate) : undefined,
    },
  });

  return NextResponse.json(updated);
}

// DELETE staff by ID
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const session = await getServerSession(authOption);
  if (!session?.user || session.user.role !== "ADMIN") {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  await db.staff.delete({ where: { id } });

  return new NextResponse(null, { status: 204 });
}
