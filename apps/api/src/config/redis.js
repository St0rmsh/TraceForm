import Redis from "ioredis";
import { config } from "./config.js";

export const redisConnection = new Redis({
  host: config.redis.host,
  port: config.redis.port,
  password: config.redis.password,
   maxRetriesPerRequest: null, // required by BullMQ


});

redisConnection.on("connect", async () => {
  try {
    await redisConnection.config("SET", "maxmemory-policy", "noeviction");
    console.log("[redis] Connected, maxmemory-policy=noeviction");
  } catch (err) {
    console.log(
      "[redis] Connected (maxmemory-policy managed externally - set it via your provider's dashboard if using BullMQ heavily)"
    );
  }
});

redisConnection.on("error", (err) => {
  console.error("[redis] Connection error:", err.message);
});