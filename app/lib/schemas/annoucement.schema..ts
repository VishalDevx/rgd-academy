import { z } from "zod";
import { Role } from "@prisma/client";

export const AnnouncementSchema = z.object({
  title: z.string(),
  content: z.string(),
  visibleRoles: z.array(z.nativeEnum(Role)).min(1),
});
