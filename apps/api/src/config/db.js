import mongoose from "mongoose";
import { config } from "./config.js";

export async function connectDB() {
  try {
    mongoose.set("strictQuery", true);
    await mongoose.connect(config.mongoUri);
    console.log("[db] MongoDB connected");
  } catch (err) {
    console.error("[db] MongoDB connection failed:", err.message);
    process.exit(1);
  }
}

mongoose.connection.on("disconnected", () => {
  console.warn("[db] MongoDB disconnected");
});