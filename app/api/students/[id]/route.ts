import { NextResponse } from "next/server";
import { db } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authConfig } from "../../auth/[...nextauth]/route";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function POST(req: Request) {
  const session = await getServerSession(authConfig);
  if (!session?.user || session.user.role !== "ADMIN") {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const contentType = req.headers.get("content-type") || "";
  if (!contentType.includes("multipart/form-data")) {
    return new NextResponse("Expected multipart/form-data", { status: 400 });
  }

  const formData = await req.formData();
  const name = formData.get("name") as string | null;
  const email = formData.get("email") as string | null;
  const adharNo = formData.get("adharNo") as string | null;
  const admissionNo = formData.get("admissionNo") as string | null;
  const rollNumber = formData.get("rollNumber") as string | null;
  const classId = formData.get("classId") as string | null;
  const file = formData.get("file") as File | null;

  if (!name || !email || !adharNo || !admissionNo || !rollNumber) {
    return new NextResponse("Missing required fields", { status: 400 });
  }

  let profileImgUrl: string | undefined;

  if (file) {
    if (file.size > 30 * 1024)
      return new NextResponse("File size exceeds 30KB", { status: 400 });

    const allowedTypes = ["image/jpeg", "image/png"];
    if (!allowedTypes.includes(file.type))
      return new NextResponse("Invalid file type", { status: 400 });

    const ext = file.name.split(".").pop();
    const path = `students/${Date.now()}_${name}.${ext}`;

    const { error: uploadError } = await supabase.storage
      .from("lms-assets")
      .upload(path, file, { upsert: true });

    if (uploadError)
      return new NextResponse(uploadError.message, { status: 500 });

    const { data } = supabase.storage.from("lms-assets").getPublicUrl(path);
    profileImgUrl = data.publicUrl;
  }

  // ✅ Create student record in Prisma
  const student = await db.student.create({
    data: {
      name,
      email,
      adharNo,
      admissionNo,
      rollNumber,
      classId: classId || null,
    profileImg :profileImgUrl?? undefined
    },
  });

  return NextResponse.json(student);
}
