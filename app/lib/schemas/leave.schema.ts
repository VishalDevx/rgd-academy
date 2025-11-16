import { z } from "zod";

export const LeaveRequestSchema = z.object({
  staffId: z.string(),
  fromDate: z.string(),
  toDate: z.string(),
  reason: z.string().min(3),
});
