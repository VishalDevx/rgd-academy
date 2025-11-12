import { NextResponse } from "next/server";
import { db } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authConfig } from "../auth/[...nextauth]/route";
import fs from "fs";
import { createClient } from "@supabase/supabase-js";
import formidable from "formidable";
import { Gender } from "@prisma/client";
import { Readable } from "stream";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// Disable automatic body parsing — necessary for FormData uploads
export const config = {
  api: {
    bodyParser: false,
  },
};

// Convert Web Request → Node Readable Stream
function requestToStream(req: Request): Readable {
  const reader = req.body?.getReader();
  if (!reader) throw new Error("Request body missing");

  return new Readable({
    async read() {
      const { done, value } = await reader.read();
      if (done) this.push(null);
      else this.push(value);
    },
  });
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authConfig);
    if (!session?.user || session.user.role !== "ADMIN") {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Convert the request to Node-compatible stream
    const stream = requestToStream(req);

    // Parse multipart form
    const form = formidable({
      multiples: false,
      keepExtensions: true,
    });

    const { fields, files }: any = await new Promise((resolve, reject) => {
      form.parse(stream as any, (err, fields, files) => {
        if (err) reject(err);
        else resolve({ fields, files });
      });
    });

    // Validate required fields
    const required = ["name", "email", "adharNo", "admissionNo", "rollNumber"];
    for (const field of required) {
      if (!fields[field]) {
        return new NextResponse(`Missing ${field}`, { status: 400 });
      }
    }

    // Upload profile image to Supabase (if present)
    let profileImgUrl = "";
    if (files.file) {
      const file = Array.isArray(files.file) ? files.file[0] : files.file;
      const fileData = fs.readFileSync(file.filepath);
      const ext = file.originalFilename?.split(".").pop();
      const fileName = `students/${Date.now()}-${fields.name}.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from("profile-images")
        .upload(fileName, fileData, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: publicData } = supabase.storage
        .from("profile-images")
        .getPublicUrl(fileName);
      profileImgUrl = publicData.publicUrl;
    }

    // Save to DB
    const created = await db.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          name: String(fields.name),
          email: String(fields.email).toLowerCase(),
          role: "STUDENT",
          adharNo: String(fields.adharNo),
          passwordHash: fields.passwordHash ?? null,
        },
      });

      const student = await tx.student.create({
        data: {
          userId: user.id,
          admissionNo: String(fields.admissionNo),
          rollNumber: String(fields.rollNumber),
          classId: fields.classId ? String(fields.classId) : null,
          dob: fields.dob ? new Date(String(fields.dob)) : null,
          gender: fields.gender
            ? (String(
                Array.isArray(fields.gender)
                  ? fields.gender[0]
                  : fields.gender
              ).toUpperCase() as Gender)
            : null,
          address: Array.isArray(fields.address)
            ? fields.address[0]
            : fields.address ?? null,
          profileImg: profileImgUrl,
        },
      });

      return { user, student };
    });

    return NextResponse.json(created, { status: 201 });
  } catch (err: any) {
    console.error("Error creating student:", err);
    return NextResponse.json({ error: err.message || String(err) }, { status: 500 });
  }
}
