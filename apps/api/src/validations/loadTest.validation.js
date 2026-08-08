import { z } from "zod";

const configSchema = z.object({
  route: z.string({ required_error: "Target route is required" }).trim().min(1),
  method: z.enum(["GET", "POST", "PUT", "PATCH", "DELETE"]).default("GET"),
  startRps: z.number().min(1).optional(),
  endRps: z.number({ required_error: "Target RPS is required" }).min(1),
  rampDurationSeconds: z.number().min(0).optional(),
  durationSeconds: z
    .number({ required_error: "Test duration is required" })
    .min(5, "Duration must be at least 5 seconds")
    .max(600, "Duration cannot exceed 600 seconds (10 minutes)"),
  concurrency: z.number().min(1).max(200).optional(),
  body: z.any().optional(),
});

const chaosSchema = z.object({
  extraLatencyMs: z.number().min(0).optional(),
  errorRatePercent: z.number().min(0).max(100).optional(),
  dependencyDown: z.boolean().optional(),
});

export const createLoadTestSchema = z.object({
  name: z.string({ required_error: "Run name is required" }).trim().min(1).max(100),
  config: configSchema,
  chaos: chaosSchema.optional(),
});