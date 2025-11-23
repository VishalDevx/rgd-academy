import { z } from "zod";

export const ClassPayloadSchema = z.object({
  name: z.string().min(1),
  grade: z.enum(["NURSERY", "LKG", "UKG", "ONE", "TWO", "THREE", "FOUR", "FIVE", "SIX", "SEVEN", "EIGHT", "NINE", "TEN"]),
  section: z.string().optional(),
  gradeCode: z.string().optional(),
  teacherId: z.string().optional(),
});

export type ClassPayload = z.infer<typeof ClassPayloadSchema>;
