import { z } from "zod";
import { AttendanceStatus } from "@prisma/client";

export const AttendanceSchema = z.object({
  classId: z.string(),
  studentId: z.string(),
  date: z.string(),
  status: z.nativeEnum(AttendanceStatus),
});
