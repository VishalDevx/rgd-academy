import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { AnnouncementPayloadSchema } from "@/app/lib/schemas/annoucement.schema.";
import type { Role } from "@prisma/client";
import { authOptions } from "@/app/lib/auth";

// GET all announcements
export async function GET(_request: NextRequest) {
  const items = await db.announcement.findMany({
    include: { visibleRoles: true, creator: true },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(items);
}

// POST new announcement (ADMIN/STAFF only)
export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session?.user || !["ADMIN", "STAFF"].includes(session.user.role)) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return new NextResponse("Invalid JSON", { status: 400 });
  }

  const parsed = AnnouncementPayloadSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { errors: parsed.error.flatten().fieldErrors },
      { status: 400 }
    );
  }

  const { title, content, roles } = parsed.data;

  // enforce type safety
  const safeRoles: Role[] = roles as Role[];

  const created = await db.$transaction(async (tx) => {
    const ann = await tx.announcement.create({
      data: {
        title,
        content,
        createdBy: session.user.id,
      },
    });

    if (safeRoles.length > 0) {
      await tx.announcementVisibility.createMany({
        data: safeRoles.map((role: Role) => ({
          announcementId: ann.id,
          role,
        })),
      });
    }

    return ann;
  });

  return NextResponse.json(created, { status: 201 });
}
