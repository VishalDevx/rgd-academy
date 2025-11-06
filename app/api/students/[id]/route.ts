import { NextResponse } from "next/server";
import { db } from "@/lib/prisma";
import { auth } from "@/app/api/auth/[...nextauth]/route";

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const student = await db.student.findUnique({ where: { id: params.id }, include: { user: true, class: true } } as any);
  if (!student) return new NextResponse("Not found", { status: 404 });
  return NextResponse.json(student as any);
}

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    return new NextResponse("Unauthorized", { status: 401 });
  }
  const body = await req.json().catch(() => null);
  if (!body) return new NextResponse("Invalid payload", { status: 400 });

  const updated = await db.student.update({
    where: { id: params.id },
    data: {
      admissionNo: body.admissionNo ?? undefined,
      rollNumber: body.rollNumber ?? undefined,
      classId: body.classId ?? undefined,
      dob: body.dob ? new Date(body.dob) : undefined,
      gender: body.gender ?? undefined,
      address: body.address ?? undefined,
      active: body.active ?? undefined,
    },
  });
  return NextResponse.json(updated);
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    return new NextResponse("Unauthorized", { status: 401 });
  }
  await db.student.delete({ where: { id: params.id } });
  return new NextResponse(null, { status: 204 });
}


