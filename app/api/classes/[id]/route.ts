import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOption } from "@/app/lib/auth";

// GET class by ID
export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const item = await db.class.findUnique({ where: { id } });
  if (!item) return new NextResponse("Not found", { status: 404 });
  return NextResponse.json(item);
}

// PATCH class (ADMIN only)
export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getServerSession(authOption);

  if (!session?.user || session.user.role !== "ADMIN") {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const body = await request.json().catch(() => null);
  if (!body) return new NextResponse("Invalid payload", { status: 400 });

  const updated = await db.class.update({
    where: { id },
    data: {
      name: body.name ?? undefined,
      grade: body.grade ?? undefined,
      section: body.section ?? undefined,
      gradeCode: body.gradeCode ?? undefined,
      teacherId: body.teacherId ?? undefined,
    },
  });

  return NextResponse.json(updated);
}

// DELETE class (ADMIN only)
export async function DELETE(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getServerSession(authOption);

  if (!session?.user || session.user.role !== "ADMIN") {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  await db.class.delete({ where: { id } });
  return new NextResponse(null, { status: 204 });
}
