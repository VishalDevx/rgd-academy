import { z } from "zod";
import { FeeStatus } from "@prisma/client";

export const FeePaymentSchema = z.object({
  studentId: z.string(),
  feeStructureId: z.string(),
  amountPaid: z.number(),
  status: z.nativeEnum(FeeStatus).optional(),
  razorpayOrder: z.string().optional(),
});
