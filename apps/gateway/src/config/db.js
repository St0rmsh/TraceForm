import dns from "dns";
import mongoose from "mongoose";
import { config } from "./config.js";

// Same fix as apps/api — some networks fail to resolve Atlas SRV records
// against the default DNS resolver.
dns.setServers(["8.8.8.8", "8.8.4.4"]);

export async function connectDB() {
  try {
    mongoose.set("strictQuery", true);
    await mongoose.connect(config.mongoUri);
    console.log("[gateway/db] MongoDB connected");
  } catch (err) {
    console.error("[gateway/db] MongoDB connection failed:", err.message);
    process.exit(1);
  }
}

mongoose.connection.on("disconnected", () => {
  console.warn("[gateway/db] MongoDB disconnected");
});