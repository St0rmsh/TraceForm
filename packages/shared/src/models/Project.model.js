import mongoose from "mongoose";

const { Schema } = mongoose;

const trackedRouteSchema = new Schema(
  {
    path: {
      type: String,
      required: [true, "Route path is required"],
      trim: true,
    },
    method: {
      type: String,
      enum: ["GET", "POST", "PUT", "PATCH", "DELETE", "*"],
      default: "*",
    },
  },
  { _id: false }
);

const projectSchema = new Schema(
  {
    owner: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: [true, "Project name is required"],
      trim: true,
      minlength: 2,
      maxlength: 100,
    },
    description: {
      type: String,
      trim: true,
      maxlength: 500,
      default: "",
    },
    targetBaseUrl: {
      type: String,
      required: [true, "Target base URL is required"],
      trim: true,
      match: [/^https?:\/\/.+/, "Target base URL must be a valid http(s) URL"],
    },
    trackedRoutes: {
      type: [trackedRouteSchema],
      default: [],
    },
    apiKey: {
      type: String,
      required: true,
      unique: true,
      select: false, // used by the gateway to identify which project a request belongs to
    },
    status: {
      type: String,
      enum: ["active", "paused"],
      default: "active",
    },
    anomalyThresholds: {
      errorRatePercent: { type: Number, default: 5 },
      latencyMs: { type: Number, default: 1000 },
    },
  },
  { timestamps: true }
);

projectSchema.index({ owner: 1, name: 1 }, { unique: true });

const Project = mongoose.model("Project", projectSchema);

export default Project;