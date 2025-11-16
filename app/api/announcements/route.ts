import { NextResponse } from "next/server";
import { db } from "@/lib/prisma";
import { authConfig } from "../auth/[...nextauth]/route";
import { getServerSession } from "next-auth/next";
import { AnnouncementPayloadSchema } from "@/app/lib/schemas/annoucement.schema.";

export async function GET() {
  const items = await db.announcement.findMany({
    include: { visibleRoles: true, creator: true },
    orderBy: { createdAt: "desc" }
  });

  return NextResponse.json(items);
}

export async function POST(req: Request) {
  const session = await getServerSession(authConfig);

  if (!session?.user || !["ADMIN", "STAFF"].includes(session.user.role)) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  let body: unknown;

  try {
    body = await req.json();
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

  const created = await db.$transaction(async (tx) => {
    const ann = await tx.announcement.create({
      data: {
        title,
        content,
        createdBy: session.user.id,
      },
    });

    if (roles.length > 0) {
      await tx.announcementVisibility.createMany({
        data: roles.map((role:any) => ({
          announcementId: ann.id,
          role,
        })),
      });
    }

    return ann;
  });

  return NextResponse.json(created, { status: 201 });
}
