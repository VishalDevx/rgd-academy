import { NextRequest, NextResponse } from "next/server";
import { promoteAllActiveStudents } from "@/app/lib/promotion";

import { getServerSession } from "next-auth/next";
import { authOption } from "@/app/lib/auth";
// Allow manual trigger by ADMIN; for Vercel Cron we can allow a secret token header
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOption);
  const headerToken = req.headers.get("x-cron-token");
  const authHeader = req.headers.get("authorization");
  const bearer = authHeader?.startsWith("Bearer ") ? authHeader.slice("Bearer ".length) : authHeader;
  const envToken = process.env.CRON_SECRET_TOKEN ?? process.env.CRON_SECRET;

  if (!session?.user) {
    // Allow cron if token matches
    if (!envToken || headerToken !== envToken) {
      if (bearer !== envToken) return new NextResponse("Unauthorized", { status: 401 });
    }
  } else {
    if (session.user.role !== "ADMIN") return new NextResponse("Forbidden", { status: 403 });
  }

  const result = await promoteAllActiveStudents();
  return NextResponse.json({ ok: true, ...result });
}


