import { NextResponse } from "next/server";
import { db } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authConfig } from "../auth/[...nextauth]/route";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authConfig);
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const form = await req.formData();

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

    // 🔥 Newly added fields
    const fatherName = form.get("fatherName") as string | null;
    const motherName = form.get("motherName") as string | null;
    const occupation = form.get("occupation") as string | null;
    const religion = form.get("religion") as string | null;
    const caste = form.get("caste") as string | null;
    const udiseCode = form.get("udiseCode") as string | null;
    const contactNo = form.get("contactNo") as string | null;

    const file = form.get("file") as File | null;

    // Validate required fields
    const required = { name, email, adharNo, admissionNo, rollNumber };
    for (const [key, value] of Object.entries(required)) {
      if (!value) {
        return NextResponse.json({ error: `Missing ${key}` }, { status: 400 });
      }
    }

    // Upload image
    let profileImgUrl = "";
    if (file) {
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);

      const ext = file.name.split(".").pop();
      const fileName = `students/${Date.now()}-${name}.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from("rgd-school")
        .upload(fileName, buffer, {
          cacheControl: "3600",
          upsert: false,
          contentType: file.type,
        });

      if (uploadError) {
        console.error("Upload error", uploadError);
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

    // Transaction
    const created = await db.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          name: name!,
          email: email!.toLowerCase(),
          role: "STUDENT",
          adharNo: adharNo!,
          passwordHash,
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
          fatherName:fatherName,
          motherName:motherName,
          occupation: occupation!,
          religion: religion!,
          caste: caste!,
          udiseCode,
          contactNo,
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
