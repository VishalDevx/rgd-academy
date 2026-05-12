import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOption } from "@/app/lib/auth";
import { promoteAllActiveStudents } from "@/app/lib/promotion";

export async function POST() {
  try {
    const session = await getServerSession(authOption);
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const result = await promoteAllActiveStudents();

    return NextResponse.json({
      message: "Promotion completed",
      ...result,
    });
  } catch (err) {
    console.error("Promotion error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Promotion failed" },
      { status: 500 }
    );
  }
}
