import { NextResponse } from "next/server";
import { resetAllStudentPasswords } from "@/app/lib/studentPassword";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const newPassword = body?.password || "Student@123"; // default if not passed
    const result = await resetAllStudentPasswords(newPassword);

    return NextResponse.json({ success: true, updatedCount: result.message });
  } catch (err) {
    return NextResponse.json({ error: "Failed to reset passwords" }, { status: 500 });
  }
}
