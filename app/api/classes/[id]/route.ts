import { NextResponse } from "next/server";
import { db } from "@/lib/prisma";
import { auth } from "@/app/api/auth/[...nextauth]/route";

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const item = await db.class.findUnique({ where: { id: params.id } });
  if (!item) return new NextResponse("Not found", { status: 404 });
  return NextResponse.json(item);
}

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    return new NextResponse("Unauthorized", { status: 401 });
  }
  const body = await req.json().catch(() => null);
  if (!body) return new NextResponse("Invalid payload", { status: 400 });

  const updated = await db.class.update({
    where: { id: params.id },
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

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    return new NextResponse("Unauthorized", { status: 401 });
  }
  await db.class.delete({ where: { id: params.id } });
  return new NextResponse(null, { status: 204 });
}




