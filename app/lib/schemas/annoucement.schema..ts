import { z } from "zod";

export const AnnouncementPayloadSchema = z.object({
  title: z.string().min(1, "Title is required"),
  content: z.string().min(1, "Content is required"),
  roles: z
    .array(z.enum(["ADMIN", "STAFF", "STUDENT"]))
    .default([]),
});

export type AnnouncementPayloadType = z.infer<typeof AnnouncementPayloadSchema>;
