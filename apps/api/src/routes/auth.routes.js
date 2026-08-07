import { Router } from "express";
import { register, login, refresh, logout, getMe } from "../controllers/auth.controller.js";
import { validate } from "../middlewares/validate.js";
import { authenticate } from "../middlewares/authenticate.js";
import { registerSchema, loginSchema, refreshSchema } from "../validations/auth.validation.js";

const router = Router();


// @desc      Register a new user
// @route     POST /api/auth/register
// @access    Public
router.post("/register", validate(registerSchema), register);

// @desc      Login a user
// @route     POST /api/auth/login
// @access    Public
router.post("/login", validate(loginSchema), login);

// @desc      Refresh access token
// @route     POST /api/auth/refresh
// @access    Public
router.post("/refresh", validate(refreshSchema), refresh);

// @desc      Get current user
// @route     GET /api/auth/me
// @access    Private
router.get("/me", authenticate, getMe);

// @desc      Logout a user
// @route     POST /api/auth/logout
// @access    Private
router.post("/logout", authenticate, logout);

export default router;