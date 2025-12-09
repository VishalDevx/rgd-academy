import { z } from "zod";

export const SubjectSchema = z.object({
  id: z.string().cuid().optional(),      
  name: z.string().min(1),
  code: z.string().min(1),              
  classId: z.string().min(1),
  teacherId: z.string().optional().nullable(),
  results: z.array(z.any()).optional(),
});
export type SubjectType = z.infer<typeof SubjectSchema>;
