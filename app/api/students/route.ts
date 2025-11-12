import { NextResponse } from "next/server";
import { db } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authConfig } from "../auth/[...nextauth]/route";
import { createClient } from "@supabase/supabase-js";

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    // ✅ Auth check
    const session = await getServerSession(authConfig);
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // ✅ Parse FormData (works natively in App Router)
    const form = await req.formData();

    // ✅ Extract text fields
    const name = form.get("name") as string | null;
    const email = form.get("email") as string | null;
    const adharNo = form.get("adharNo") as string | null;
    const admissionNo = form.get("admissionNo") as string | null;
    const rollNumber = form.get("rollNumber") as string | null;
    const dob = form.get("dob") as string | null;
    const gender = form.get("gender") as string | null;
    const address = form.get("address") as string | null;
    const classId = form.get("classId") as string | null;
    const passwordHash = form.get("passwordHash") as string | null;
    const file = form.get("file") as File | null;

    // ✅ Validate required fields
    const required = { name, email, adharNo, admissionNo, rollNumber };
    for (const [key, value] of Object.entries(required)) {
      if (!value) {
        return NextResponse.json({ error: `Missing ${key}` }, { status: 400 });
      }
    }

    // ✅ Upload profile image to Supabase (if provided)
    let profileImgUrl = "";
    if (file) {
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);

      const fileExt = file.name.split(".").pop();
      const fileName = `students/${Date.now()}-${name}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("profile-images")
        .upload(fileName, buffer, {
          cacheControl: "3600",
          upsert: false,
          contentType: file.type,
        });

      if (uploadError) {
        console.error(uploadError);
        return NextResponse.json(
          { error: "Failed to upload image" },
          { status: 500 }
        );
      }

      const { data: publicData } = supabase.storage
        .from("profile-images")
        .getPublicUrl(fileName);

      profileImgUrl = publicData.publicUrl;
    }

    // ✅ Create user and student in a transaction
    const created = await db.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          name: name!,
          email: email!.toLowerCase(),
          role: "STUDENT",
          adharNo: adharNo!,
          passwordHash: passwordHash,
        },
      });

      const student = await tx.student.create({
        data: {
          userId: user.id,
          admissionNo: admissionNo!,
          rollNumber: rollNumber!,
          classId: classId || null,
          dob: dob ? new Date(dob) : null,
          gender: gender && ["MALE", "FEMALE", "OTHER"].includes(gender.toUpperCase())
            ? (gender.toUpperCase() as any)
            : null,
          address,
          profileImg: profileImgUrl,
        },
      });

      return { user, student };
    });

    return NextResponse.json(created, { status: 201 });
  } catch (err: any) {
    console.error("Error creating student:", err);
    return NextResponse.json(
      { error: err.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}
