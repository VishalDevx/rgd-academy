import { NextResponse } from "next/server";
import { db } from "@/lib/prisma";
import { authConfig } from "@/app/api/auth/[...nextauth]/route";
import getServerSession from "next-auth/next"
export async function GET() {
  const items = await db.expense.findMany({ include: { createdBy: true }, orderBy: { date: "desc" } } as any);
  return NextResponse.json(items as any);
}

export async function POST(req: Request) {
  const session = await getServerSession(authConfig);
  if (!session?.user || session.user.role !== "ADMIN") return new NextResponse("Unauthorized", { status: 401 });
  const b = await req.json().catch(() => null);
  if (!b || !b.title || b.amount == null) return new NextResponse("Invalid payload", { status: 400 });

  const created = await db.expense.create({
    data: {
      title: String(b.title),
      description: b.description ? String(b.description) : null,
      amount: String(Number(b.amount).toFixed(2)) as any,
      date: b.date ? new Date(b.date) : undefined,
      createdById: session.user.id,
    },
  });
  return NextResponse.json(created, { status: 201 });
}


