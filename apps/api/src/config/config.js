import dotenv from "dotenv";

dotenv.config();

const required = [
  "MONGO_URI",
  "REDIS_HOST",
  "REDIS_PORT",
  "REDIS_PASSWORD",
  "JWT_ACCESS_SECRET",
  "JWT_REFRESH_SECRET",
];

for (const key of required) {
  if (!process.env[key]) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
}

export const config = {
  nodeEnv: process.env.NODE_ENV || "development",
  port: parseInt(process.env.PORT || "4000", 10),

  mongoUri: process.env.MONGO_URI,

  redis: {
    host: process.env.REDIS_HOST,
    port: parseInt(process.env.REDIS_PORT, 10),
    username: process.env.REDIS_USERNAME || "default",
    password: process.env.REDIS_PASSWORD,
    tls: process.env.REDIS_TLS === "true" ? {} : undefined,
  },

  jwt: {
    accessSecret: process.env.JWT_ACCESS_SECRET,
    refreshSecret: process.env.JWT_REFRESH_SECRET,
    accessExpiresIn: process.env.JWT_ACCESS_EXPIRES_IN || "15m",
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || "7d",
  },

  clientUrl: process.env.CLIENT_URL || "http://localhost:5173",
};