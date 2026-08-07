import Redis from "ioredis";
import { config } from "./config.js";

export const redisConnection = new Redis({
  host: config.redis.host,
  port: config.redis.port,
  username: config.redis.username,
  password: config.redis.password,
  tls: config.redis.tls,
  maxRetriesPerRequest: null,
});

redisConnection.on("connect", () => {
  console.log("[gateway/redis] Connected");
});

redisConnection.on("error", (err) => {
  console.error("[gateway/redis] Connection error:", err.message);
});