import { NextResponse } from "next/server";
import { db } from "@/lib/prisma";
import { auth } from "@/app/api/auth/[...nextauth]/route";

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const item = await db.staff.findUnique({ where: { id: params.id }, include: { user: true } } as any);
  if (!item) return new NextResponse("Not found", { status: 404 });
  return NextResponse.json(item as any);
}

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") return new NextResponse("Unauthorized", { status: 401 });
  const body = await req.json().catch(() => null);
  if (!body) return new NextResponse("Invalid payload", { status: 400 });

  const updated = await db.staff.update({
    where: { id: params.id },
    data: {
      designation: body.designation ?? undefined,
      salary: body.salary ?? undefined,
      joinDate: body.joinDate ? new Date(body.joinDate) : undefined,
    },
  });
  return NextResponse.json(updated);
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") return new NextResponse("Unauthorized", { status: 401 });
  await db.staff.delete({ where: { id: params.id } });
  return new NextResponse(null, { status: 204 });
}


