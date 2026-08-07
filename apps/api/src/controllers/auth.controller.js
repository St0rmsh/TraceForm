import asyncHandler from "express-async-handler";
import {
  registerUser,
  loginUser,
  refreshAccessToken,
  logoutUser,
  getUserById,
} from "../services/auth.service.js";
import { config } from "../config/config.js";


const ACCESS_COOKIE_NAME = "accessToken";
const REFRESH_COOKIE_NAME = "refreshToken";


const accessCookieOptions = {
  httpOnly: true,
  secure: config.nodeEnv === "production",
  sameSite: "strict",
  maxAge: 15 * 60 * 1000, // 15 minutes
};

const refreshCookieOptions = {
  httpOnly: true,
  secure: config.nodeEnv === "production",
  sameSite: "strict",
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
};


const clearCookieOptions = {
  httpOnly: true,
  secure: config.nodeEnv === "production",
  sameSite: "strict",
};

export const register = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;

  const { user, accessToken, refreshToken } = await registerUser({
    name,
    email,
    password,
  });

  res.cookie(ACCESS_COOKIE_NAME, accessToken, accessCookieOptions);
  res.cookie(REFRESH_COOKIE_NAME, refreshToken, refreshCookieOptions);

  res.status(201).json({
    success: true,
    message: "Account created successfully",
    data: { user, accessToken },
  });
});

export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const { user, accessToken, refreshToken } = await loginUser({
    email,
    password,
  });

  res.cookie(ACCESS_COOKIE_NAME, accessToken, accessCookieOptions);
  res.cookie(REFRESH_COOKIE_NAME, refreshToken, refreshCookieOptions);

  res.status(200).json({
    success: true,
    message: "Logged in successfully",
    data: { user, accessToken },
  });
});

export const refresh = asyncHandler(async (req, res) => {
  const refreshToken = req.cookies?.[REFRESH_COOKIE_NAME] || req.body?.refreshToken;

  const { accessToken, refreshToken: newRefreshToken } = await refreshAccessToken(refreshToken);

  res.cookie(ACCESS_COOKIE_NAME, accessToken, accessCookieOptions);
  res.cookie(REFRESH_COOKIE_NAME, newRefreshToken, refreshCookieOptions);

  res.status(200).json({
    success: true,
    message: "Token refreshed",
    data: { accessToken },
  });
});

export const getMe = asyncHandler(async (req, res) => {
  const user = await getUserById(req.user.id);

  res.status(200).json({
    success: true,
    data: { user },
  });
});



export const logout = asyncHandler(async (req, res) => {
  const authHeader = req.headers.authorization;
  const accessToken = authHeader?.startsWith("Bearer ")
    ? authHeader.split(" ")[1]
    : req.cookies?.[ACCESS_COOKIE_NAME];

  const refreshToken = req.cookies?.[REFRESH_COOKIE_NAME] || req.body?.refreshToken;

  if (req.user?.id) {
    await logoutUser(req.user.id, refreshToken, accessToken);
  }

  // must match path/sameSite/secure used when the cookie was originally set,
  // or the browser won't recognize it as the same cookie to clear
  res.clearCookie(ACCESS_COOKIE_NAME, { ...accessCookieOptions, maxAge: undefined });
  res.clearCookie(REFRESH_COOKIE_NAME, { ...refreshCookieOptions, maxAge: undefined });

  res.status(200).json({
    success: true,
    message: "Logged out successfully",
  });
});