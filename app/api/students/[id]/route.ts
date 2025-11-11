import { NextResponse } from "next/server";
import { db } from "@/lib/prisma";
import { authConfig } from "../../auth/[...nextauth]/route";
import { createClient } from "@supabase/supabase-js";
import { getServerSession } from "next-auth/next";
import { Gender } from "@prisma/client";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const student = await db.student.findUnique({
    where: { id: params.id },
    include: { user: true, class: true },
  });

  if (!student) return new NextResponse("Not found", { status: 404 });
  return NextResponse.json(student);
}

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authConfig);
  if (!session?.user || session.user.role !== "ADMIN") {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const contentType = req.headers.get("content-type") || "";

  // Handle multipart form data (for image upload + student update)
  if (contentType.includes("multipart/form-data")) {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const admissionNo = formData.get("admissionNo") as string | null;
    const rollNumber = formData.get("rollNumber") as string | null;
    const classId = formData.get("classId") as string | null;
    const dob = formData.get("dob") as string | null;
    const gender = formData.get("gender") as string | null;
    const address = formData.get("address") as string | null;
    const active = formData.get("active") === "true";

    let profileImgUrl: string | undefined;

    if (file) {
      // ✅ Validate file size (<= 30KB)
      if (file.size > 30 * 1024)
        return new NextResponse("File size exceeds 30KB", { status: 400 });

      // ✅ Validate file type
      const allowedTypes = ["image/jpeg", "image/png"];
      if (!allowedTypes.includes(file.type))
        return new NextResponse("Invalid file type", { status: 400 });

      // ✅ Generate unique filename and upload to Supabase
      const fileExt = file.name.split(".").pop();
      const fileName = `${params.id}_${Date.now()}.${fileExt}`;
      const path = `students/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("lms-assets") // your bucket name
        .upload(path, file, { upsert: true });

      if (uploadError)
        return new NextResponse(uploadError.message, { status: 500 });

      // ✅ Get public URL
      const { data: publicUrlData } = supabase.storage
        .from("lms-assets")
        .getPublicUrl(path);

      profileImgUrl = publicUrlData.publicUrl;
    }

    // ✅ Update DB record
    const updated = await db.student.update({
      where: { id: params.id },
      data: {
        admissionNo: admissionNo ?? undefined,
        rollNumber: rollNumber ?? undefined,
        classId: classId ?? undefined,
        dob: dob ? new Date(dob) : undefined,
        gender: gender ? (gender as Gender) : undefined,
        address: address ?? undefined,
        active: active ?? undefined,
        profileImg: profileImgUrl ?? undefined,
      },
    });

    return NextResponse.json(updated);
  }

  // Handle JSON-based updates (no file upload)
  const body = await req.json().catch(() => null);
  if (!body) return new NextResponse("Invalid payload", { status: 400 });

  const updated = await db.student.update({
    where: { id: params.id },
    data: {
      admissionNo: body.admissionNo ?? undefined,
      rollNumber: body.rollNumber ?? undefined,
      classId: body.classId ?? undefined,
      dob: body.dob ? new Date(body.dob) : undefined,
      gender: body.gender ? (body.gender as Gender) : undefined,
      address: body.address ?? undefined,
      active: body.active ?? undefined,
      profileImg: body.profileImg ?? undefined,
    },
  });

  return NextResponse.json(updated);
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authConfig);
  if (!session?.user || session.user.role !== "ADMIN") {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  await db.student.delete({ where: { id: params.id } });
  return new NextResponse(null, { status: 204 });
}
