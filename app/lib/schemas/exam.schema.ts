import { z } from "zod";

export const ExamCreateSchema = z.object({
  name: z.string(),
  classId: z.string(),
  startDate: z.string(),
  endDate: z.string(),
});
