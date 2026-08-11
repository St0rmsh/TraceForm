import { z } from "zod";

export const createIncidentSchema = z.object({
  title: z.string({ required_error: "Title is required" }).trim().min(1).max(200),
  description: z.string().trim().max(2000).optional(),
});


export const addTimelineEntrySchema = z.object({
  event: z.enum(["comment", "investigating", "update"]),
  message: z.string({ required_error: "Message is required" }).trim().min(1).max(1000),
});



export const resolveIncidentSchema = z.object({
  resolutionNotes: z.string({ required_error: "Resolution notes are required" }).trim().min(1).max(2000),
});