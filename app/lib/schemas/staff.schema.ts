import z from "zod"

export const  staffCreateSchema = z.object({
      name: z.string().min(2),
  email: z.string().email(),
  designation: z.string().min(2),
  salary: z.number().optional(),
  joinDate: z.string().optional(),
  adharNo: z.string().optional(),
  password: z.string().optional(),
})