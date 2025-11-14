import { NextResponse } from "next/server";
import { db } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authConfig } from "../auth/[...nextauth]/route";
import { createClient } from "@supabase/supabase-js";

// ✅ Initialize Supabase client
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

    // ✅ Parse form data
    const form = await req.formData();

    // ✅ Extract fields
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

    // ✅ Upload profile image (if provided)
    let profileImgUrl = "";
    if (file) {
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);

      const fileExt = file.name.split(".").pop();
      const fileName = `students/${Date.now()}-${name}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("rgd-school") // ✅ correct bucket
        .upload(fileName, buffer, {
          cacheControl: "3600",
          upsert: false,
          contentType: file.type,
        });

      if (uploadError) {
        console.error("Supabase upload error:", uploadError);
        return NextResponse.json(
          { error: "Failed to upload image" },
          { status: 500 }
        );
      }

      const { data: publicData } = supabase.storage
        .from("rgd-school") // ✅ same bucket here
        .getPublicUrl(fileName);

      profileImgUrl = publicData.publicUrl;
    }

    // ✅ Create user + student in a transaction
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
          gender:
            gender && ["MALE", "FEMALE", "OTHER"].includes(gender.toUpperCase())
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

export async function GET() {
  try {
    const session = await getServerSession(authConfig);
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const students = await db.student.findMany({
      orderBy: { admissionDate: "desc" }, // FIXED
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            adharNo: true,
            role: true,
            createdAt: true,
          },
        },
        class: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    const data = students.map((s) => ({
      id: s.id,
      admissionNo: s.admissionNo,
      rollNumber: s.rollNumber,
      admissionDate: s.admissionDate,
      dob: s.dob,
      gender: s.gender,
      address: s.address,
      profileImg: s.profileImg,
      class: s.class, // exists now
      user: s.user,   // exists now
      active: s.active,
    }));

    return NextResponse.json(data, { status: 200 });
  } catch (err: any) {
    console.error("GET students error:", err);
    return NextResponse.json(
      { error: err.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}
