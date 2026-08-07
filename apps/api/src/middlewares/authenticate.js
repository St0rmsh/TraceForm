import jwt from "jsonwebtoken";
import { config } from "../config/config.js";
import { redisConnection } from "../config/redis.js";

export async function authenticate(req, res, next) {
  const authHeader = req.headers.authorization;
  const headerToken = authHeader?.startsWith("Bearer ") ? authHeader.split(" ")[1] : null;
  const cookieToken = req.cookies?.accessToken;

  const token = headerToken || cookieToken;

  if (!token) {
    return res.status(401).json({
      success: false,
      message: "Authentication required",
    });
  }

  try {
    const isBlacklisted = await redisConnection.get(`blacklist:${token}`);
    if (isBlacklisted) {
      return res.status(401).json({
        success: false,
        message: "Access token has been revoked",
      });
    }

    const payload = jwt.verify(token, config.jwt.accessSecret);
    req.user = { id: payload.sub };
    next();
  } catch (err) {
    const message =
      err.name === "TokenExpiredError" ? "Access token expired" : "Invalid access token";

    return res.status(401).json({
      success: false,
      message,
    });
  }
}