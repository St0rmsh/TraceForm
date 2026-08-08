import Redis from "ioredis";
import { config } from "./config.js";

export const redisSubscriber = new Redis({
  host: config.redis.host,
  port: config.redis.port,
  username: config.redis.username,
  password: config.redis.password,
  tls: config.redis.tls,
  maxRetriesPerRequest: null,
});

redisSubscriber.on("connect", () => {
  console.log("[redis/sub] Subscriber connected");
});

redisSubscriber.on("error", (err) => {
  console.error("[redis/sub] Subscriber error:", err.message);
});