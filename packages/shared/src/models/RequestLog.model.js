import mongoose from "mongoose";

const { Schema } = mongoose;

const requestLogSchema = new Schema(
  {
    project: {
      type: Schema.Types.ObjectId,
      ref: "Project",
      required: true,
      index: true,
    },
    method: {
      type: String,
      required: true,
    },
    path: {
      type: String,
      required: true,
    },
    statusCode: {
      type: Number,
      required: true,
    },
    latencyMs: {
      type: Number,
      required: true,
    },
    ip: {
      type: String,
      default: "",
    },
    timestamp: {
      type: Date,
      required: true,
      index: true,
    },
  },
  {
    timestamps: false, // we use our own `timestamp` field (when the request happened, not when it was written)
  }
);

requestLogSchema.index({ project: 1, timestamp: -1 });

const RequestLog = mongoose.model("RequestLog", requestLogSchema);

export default RequestLog;