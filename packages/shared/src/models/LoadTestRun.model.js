import mongoose from "mongoose";

const { Schema } = mongoose;

const loadTestConfigSchema = new Schema(
  {
    route: {
      type: String,
      required: [true, "Target route is required"],
      trim: true,
    },
    method: {
      type: String,
      enum: ["GET", "POST", "PUT", "PATCH", "DELETE"],
      default: "GET",
    },
    startRps: { type: Number, default: 1, min: 1 },
    endRps: { type: Number, required: [true, "Target RPS is required"], min: 1 },
    rampDurationSeconds: { type: Number, default: 10, min: 0 },
    durationSeconds: {
      type: Number,
      required: [true, "Test duration is required"],
      min: 5,
      max: 600,
    },
    concurrency: { type: Number, default: 10, min: 1, max: 200 },
    body: { type: Schema.Types.Mixed, default: null },
  },
  { _id: false }
);

const chaosConfigSchema = new Schema(
  {
    extraLatencyMs: { type: Number, default: 0, min: 0 },
    errorRatePercent: { type: Number, default: 0, min: 0, max: 100 },
    dependencyDown: { type: Boolean, default: false },
  },
  { _id: false }
);

const resultsSummarySchema = new Schema(
  {
    totalRequests: { type: Number, default: 0 },
    successCount: { type: Number, default: 0 },
    errorCount: { type: Number, default: 0 },
    avgLatencyMs: { type: Number, default: 0 },
    p95LatencyMs: { type: Number, default: 0 },
    p99LatencyMs: { type: Number, default: 0 },
    maxLatencyMs: { type: Number, default: 0 },
    throughputRps: { type: Number, default: 0 },
  },
  { _id: false }
);

const loadTestRunSchema = new Schema(
  {
    project: {
      type: Schema.Types.ObjectId,
      ref: "Project",
      required: true,
      index: true,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    name: {
      type: String,
      required: [true, "Run name is required"],
      trim: true,
      maxlength: 100,
    },
    config: {
      type: loadTestConfigSchema,
      required: true,
    },
    chaos: {
      type: chaosConfigSchema,
      default: () => ({}),
    },
    status: {
      type: String,
      enum: ["pending", "queued", "running", "completed", "failed", "cancelled"],
      default: "pending",
    },
    results: {
      type: resultsSummarySchema,
      default: () => ({}),
    },
    aiAnalysis: {
      type: String,
      default: null,
    },
    startedAt: { type: Date, default: null },
    completedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

loadTestRunSchema.index({ project: 1, createdAt: -1 });

const LoadTestRun = mongoose.model("LoadTestRun", loadTestRunSchema);

export default LoadTestRun;