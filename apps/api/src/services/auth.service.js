import jwt from "jsonwebtoken";
import User from "@traceform/shared/models/User.model.js";
import { config } from "../config/config.js";
import { redisConnection } from "../config/redis.js";


function generateAccessToken(userId) {
  return jwt.sign({ sub: userId }, config.jwt.accessSecret, {
    expiresIn: config.jwt.accessExpiresIn,
  });
}

function generateRefreshToken(userId) {
  return jwt.sign({ sub: userId }, config.jwt.refreshSecret, {
    expiresIn: config.jwt.refreshExpiresIn,
  });
}

function sanitizeUser(user) {
  return {
    id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    createdAt: user.createdAt,
  };
}

export async function registerUser({ name, email, password }) {
  const existing = await User.findOne({ email });
  if (existing) {
    const error = new Error("An account with this email already exists");
    error.statusCode = 409;
    throw error;
  }

  // password is hashed automatically by the User model's pre-save hook
  const user = await User.create({ name, email, password });

  const accessToken = generateAccessToken(user._id);
  const refreshToken = generateRefreshToken(user._id);

  user.refreshTokens.push(refreshToken);
  await user.save();

  return { user: sanitizeUser(user), accessToken, refreshToken };
}

export async function loginUser({ email, password }) {
  const user = await User.findOne({ email }).select("+password +refreshTokens");

  if (!user) {
    const error = new Error("Invalid email or password");
    error.statusCode = 401;
    throw error;
  }

  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    const error = new Error("Invalid email or password");
    error.statusCode = 401;
    throw error;
  }

  const accessToken = generateAccessToken(user._id);
  const refreshToken = generateRefreshToken(user._id);

  user.refreshTokens.push(refreshToken);
  await user.save();

  return { user: sanitizeUser(user), accessToken, refreshToken };
}

export async function refreshAccessToken(refreshToken) {
  if (!refreshToken) {
    const error = new Error("Refresh token is required");
    error.statusCode = 401;
    throw error;
  }

  let payload;
  try {
    payload = jwt.verify(refreshToken, config.jwt.refreshSecret);
  } catch {
    const error = new Error("Invalid or expired refresh token");
    error.statusCode = 401;
    throw error;
  }

  const user = await User.findById(payload.sub).select("+refreshTokens");
  if (!user || !user.refreshTokens.includes(refreshToken)) {
    const error = new Error("Refresh token not recognized");
    error.statusCode = 401;
    throw error;
  }

  const newAccessToken = generateAccessToken(user._id);
  const newRefreshToken = generateRefreshToken(user._id);

  user.refreshTokens = user.refreshTokens.filter((t) => t !== refreshToken);
  user.refreshTokens.push(newRefreshToken);
  await user.save();

  return { accessToken: newAccessToken, refreshToken: newRefreshToken };
}

export async function getUserById(userId) {
  const user = await User.findById(userId);

  if (!user) {
    const error = new Error("User not found");
    error.statusCode = 404;
    throw error;
  }

  return sanitizeUser(user);
}

export async function logoutUser(
  userId,
  refreshToken,
  accessToken
) {
  const user = await User.findById(userId).select("+refreshTokens");

  if (user && refreshToken) {
    user.refreshTokens = user.refreshTokens.filter(
      (token) => token !== refreshToken
    );

    await user.save();
  }

  if (accessToken) {
    const decoded = jwt.decode(accessToken);

    if (decoded?.exp) {
      const ttl = decoded.exp - Math.floor(Date.now() / 1000);

      if (ttl > 0) {
        await redisConnection.set(
          `blacklist:${accessToken}`,
          "true",
          "EX",
          ttl
        );
      }
    }
  }
}

export { sanitizeUser };