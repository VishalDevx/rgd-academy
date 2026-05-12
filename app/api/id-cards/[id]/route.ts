import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOption } from "@/app/lib/auth";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOption);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const idCard = await db.iDCard.findUnique({
      where: { id },
      include: {
        student: {
          include: {
            user: { select: { name: true, email: true } },
            class: { select: { name: true } },
          },
        },
        staff: {
          include: {
            user: { select: { name: true, email: true } },
          },
        },
      },
    });

    if (!idCard) {
      return NextResponse.json({ error: "ID card not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: idCard });
  } catch (error) {
    console.error("GET /api/id-cards/[id] failed:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch ID card" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOption);
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const existing = await db.iDCard.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "ID card not found" }, { status: 404 });
    }

    await db.iDCard.delete({ where: { id } });

    return NextResponse.json({ success: true, message: "ID card deleted" });
  } catch (error) {
    console.error("DELETE /api/id-cards/[id] failed:", error);
    return NextResponse.json(
      { success: false, error: "Failed to delete ID card" },
      { status: 500 }
    );
  }
}
