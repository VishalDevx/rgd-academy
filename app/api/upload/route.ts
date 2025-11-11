import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authConfig } from "../auth/[...nextauth]/route";
import { supabase } from "@/app/lib/supabaseClient";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const session = await getServerSession(authConfig);
  if (!session?.user || !["ADMIN", "STAFF"].includes(session.user.role)) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const formData = await req.formData().catch(() => null);
  if (!formData) return new NextResponse("Invalid form data", { status: 400 });

  const file = formData.get("file") as File | null;
  const type = formData.get("type") as string; // "student" or "staff"
  const id = formData.get("id") as string;

  if (!file || !type || !id)
    return new NextResponse("Missing fields", { status: 400 });

  if (!["student", "staff"].includes(type))
    return new NextResponse("Invalid type", { status: 400 });

  // File validations
  if (file.size > 500 * 1024)
    return new NextResponse("File too large. Max 500KB allowed.", { status: 400 });

  if (!["image/jpeg", "image/png", "image/webp"].includes(file.type))
    return new NextResponse("Invalid file type.", { status: 400 });

  // Upload
  const filePath = `${type}s/${id}/${Date.now()}_${file.name}`;
  const { error } = await supabase.storage
    .from("student-documents")
    .upload(filePath, file, { upsert: true });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Generate signed URL
  const { data: signed } = await supabase.storage
    .from("student-documents")
    .createSignedUrl(filePath, 60 * 60);

  return NextResponse.json({
    success: true,
    path: filePath,
    url: signed?.signedUrl,
  });
}
