import mongoose from "mongoose";

const { Schema } = mongoose;

const timelineEntrySchema = new Schema(
  {
    timestamp: { type: Date, default: Date.now },
    event: { type: String, required: true },
    message: { type: String, required: true },
  },
  { _id: false }
);

const healthSnapshotSchema = new Schema(
  {
    status: { type: String, enum: ["red", "yellow", "green", "unknown"] },
    requestCount: Number,
    errorRatePercent: Number,
    avgLatencyMs: Number,
  },
  { _id: false }
);

const incidentSchema = new Schema(
  {
    project: {
      type: Schema.Types.ObjectId,
      ref: "Project",
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: [true, "Incident title is required"],
      trim: true,
      maxlength: 200,
    },
    description: {
      type: String,
      trim: true,
      maxlength: 2000,
      default: "",
    },
    triggeredBy: {
      type: String,
      enum: ["auto", "manual"],
      required: true,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    severity: {
      type: String,
      enum: ["low", "medium", "high", "critical"],
      default: "medium",
    },
    status: {
      type: String,
      enum: ["open", "investigating", "resolved"],
      default: "open",
    },
    healthSnapshot: {
      type: healthSnapshotSchema,
      default: null,
    },
    rootCauseAnalysis: {
      rootCause: { type: String, default: null },
      confidence: { type: String, enum: ["low", "medium", "high"], default: null },
      contributingFactors: { type: [String], default: [] },
      analyzedAt: { type: Date, default: null },
    },
    timeline: {
      type: [timelineEntrySchema],
      default: [],
    },
    resolvedAt: { type: Date, default: null },
    resolutionNotes: { type: String, trim: true, maxlength: 2000, default: "" },
  },
  { timestamps: true }
);

incidentSchema.index({ project: 1, createdAt: -1 });
incidentSchema.index({ project: 1, status: 1 });

const Incident = mongoose.model("Incident", incidentSchema);

export default Incident;