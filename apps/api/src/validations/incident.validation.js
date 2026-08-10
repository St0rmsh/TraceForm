import { z } from "zod";

export const createIncidentSchema = z.object({
  title: z.string({ required_error: "Title is required" }).trim().min(1).max(200),
  description: z.string().trim().max(2000).optional(),
});