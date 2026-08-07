import { z } from "zod";

const trackedRouteSchema = z.object({
  path: z.string().trim().min(1, "Route path is required"),
  method: z.enum(["GET", "POST", "PUT", "PATCH", "DELETE", "*"]).default("*"),
});

export const createProjectSchema = z.object({
  name: z
    .string({ required_error: "Project name is required" })
    .trim()
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name must be at most 100 characters"),
  description: z.string().trim().max(500).optional(),
  targetBaseUrl: z
    .string({ required_error: "Target base URL is required" })
    .trim()
    .url("Target base URL must be a valid URL")
    .refine((url) => url.startsWith("http://") || url.startsWith("https://"), {
      message: "Target base URL must start with http:// or https://",
    }),
  trackedRoutes: z.array(trackedRouteSchema).optional(),
  anomalyThresholds: z
    .object({
      errorRatePercent: z.number().min(0).max(100).optional(),
      latencyMs: z.number().min(0).optional(),
    })
    .optional(),
});

export const updateProjectSchema = createProjectSchema.partial().extend({
  status: z.enum(["active", "paused"]).optional(),
});