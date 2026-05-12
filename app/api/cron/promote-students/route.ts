import { NextRequest, NextResponse } from "next/server";
import { promoteAllActiveStudents } from "@/app/lib/promotion";
import { authorizeCron, executeCronJob } from "@/app/lib/cron";

export async function POST(req: NextRequest) {
  if (!(await authorizeCron(req))) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  return executeCronJob("promote-students", async () => {
    const result = await promoteAllActiveStudents();
    return {
      success: true,
      message: result.message || `Promoted ${result.promotedCount} students`,
      stats: { promotedCount: result.promotedCount, createdClasses: result.createdClasses },
      durationMs: 0,
    };
  });
}


