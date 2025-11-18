import { NextResponse } from "next/server";
import { db } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authConfig } from "@/app/api/auth/[...nextauth]/route";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authConfig);
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const studentId = params.id;
    const form = await req.formData();

    // Fields (optional except critical ones)
    const name = form.get("name") as string | null;
    const email = form.get("email") as string | null;
    const fatherName = form.get("fatherName") as string | null;
    const motherName = form.get("motherName") as string | null;
    const occupation = form.get("occupation") as string | null;
    const religion = form.get("religion") as string | null;
    const caste = form.get("caste") as string | null;
    const udiseCode = form.get("udiseCode") as string | null;
    const contactNo = form.get("contactNo") as string | null;
    const address = form.get("address") as string | null;
    const gender = form.get("gender") as string | null;
    const dob = form.get("dob") as string | null;

    const file = form.get("file") as File | null;

    let profileImgUrl: string | undefined;

    if (file) {
      const ext = file.name.split(".").pop();
      const fileName = `students/${Date.now()}.${ext}`;

      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);

      const { error: uploadError } = await supabase.storage
        .from("rgd-school")
        .upload(fileName, buffer, {
          contentType: file.type,
        });

      if (uploadError) {
        return NextResponse.json(
          { error: "Image upload failed" },
          { status: 500 }
        );
      }

      const { data } = supabase.storage
        .from("rgd-school")
        .getPublicUrl(fileName);

      profileImgUrl = data.publicUrl;
    }

    const updated = await db.student.update({
      where: { id: studentId },
      data: {
        admissionNo: form.get("admissionNo")?.toString(),
        rollNumber: form.get("rollNumber")?.toString(),
        classId: form.get("classId")?.toString() ?? undefined,
        dob: dob ? new Date(dob) : undefined,
        gender: gender ? (gender.toUpperCase() as any) : undefined,
        address: address ?? undefined,
        profileImg: profileImgUrl ?? undefined,

        fatherName: fatherName ?? undefined,
        motherName: motherName ?? undefined,
        occupation: occupation ?? undefined,
        religion: religion ?? undefined,
        caste: caste ?? undefined,
        udiseCode: udiseCode ?? undefined,
        contactNo: contactNo ?? undefined,
      },
    });

    // Update user table separately
    if (name || email) {
      await db.user.update({
        where: { id: updated.userId },
        data: {
          name: name ?? undefined,
          email: email?.toLowerCase() ?? undefined,
        },
      });
    }

    return NextResponse.json(updated, { status: 200 });
  } catch (err: any) {
    console.error("Error updating student:", err);
    return NextResponse.json(
      { error: err.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}
