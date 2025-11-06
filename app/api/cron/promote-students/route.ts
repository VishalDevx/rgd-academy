import { NextResponse } from "next/server";
import { promoteAllActiveStudents } from "@/app/lib/promotion";
import { auth } from "@/app/api/auth/[...nextauth]/route";

// Allow manual trigger by ADMIN; for Vercel Cron we can allow a secret token header
export async function POST(req: Request) {
  const session = await auth();
  const headerToken = req.headers.get("x-cron-token");
  const envToken = process.env.CRON_SECRET_TOKEN;

  if (!session?.user) {
    // Allow cron if token matches
    if (!envToken || headerToken !== envToken) return new NextResponse("Unauthorized", { status: 401 });
  } else {
    if (session.user.role !== "ADMIN") return new NextResponse("Forbidden", { status: 403 });
  }

  const result = await promoteAllActiveStudents();
  return NextResponse.json({ ok: true, ...result });
}


