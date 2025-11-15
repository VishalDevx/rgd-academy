import { NextApiRequest, NextApiResponse } from "next";
import { db } from "@/lib/prisma";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).end();

  const { classId, date, records, staffId } = req.body;

  if (!classId || !date || !records || !staffId) {
    return res.status(400).json({ message: "Missing fields" });
  }

  // Avoid duplicate attendance for the same student/date
  await db.attendance.createMany({
    data: records.map((r: any) => ({
      classId,
      studentId: r.studentId,
      date,
      status: r.status,
      markedById: staffId,
    })),
    skipDuplicates: true,
  });

  return res.status(200).json({ message: "Attendance saved" });
}
