import { NextResponse } from "next/server";
import { db } from "@/lib/prisma";
import { authConfig } from "../auth/[...nextauth]/route";
import {getServerSession} from "next-auth/next"

export async function GET() {
  const items = await db.announcement.findMany({ include: { visibleRoles: true, creator: true }, orderBy: { createdAt: "desc" } } as any);
  return NextResponse.json(items as any);
}

export async function POST(req: Request) {
const session =await getServerSession(authConfig)
  if (!session?.user || !["ADMIN", "STAFF"].includes(session.user.role)) return new NextResponse("Unauthorized", { status: 401 });
  const b = await req.json().catch(() => null);
  if (!b || !b.title || !b.content || !Array.isArray(b.roles)) return new NextResponse("Invalid payload", { status: 400 });

  const created = await db.$transaction(async (tx) => {
    const ann = await tx.announcement.create({
      data: { title: String(b.title), content: String(b.content), createdBy: session.user.id },
    });
    if (b.roles.length) {
      await tx.announcementVisibility.createMany({
        data: b.roles.map((r: string) => ({ announcementId: ann.id, role: r as any })),
      });
    }
    return ann;
  });
  return NextResponse.json(created, { status: 201 });
}


