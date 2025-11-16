import { z } from "zod";

export const ResultCreateSchema = z.object({
  studentId: z.string(),
  examId: z.string(),
  subjectId: z.string(),
  marks: z.number(),
  maxMarks: z.number(),
  grade: z.string().optional(),
  remarks: z.string().optional(),
});
