import { z } from "zod";

export const ExpenseCreateSchema = z.object({
  title: z.string(),
  amount: z.number(),
  description: z.string().optional(),
  date: z.string().optional(),
});
