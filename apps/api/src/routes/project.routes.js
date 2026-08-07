import { Router } from "express";
import {
  create,
  list,
  getOne,
  update,
  remove,
  regenerateKey,
} from "../controllers/project.controller.js";
import { validate } from "../middlewares/validate.js";
import { authenticate } from "../middlewares/authenticate.js";
import { createProjectSchema, updateProjectSchema } from "../validations/project.validation.js";

const router = Router();

router.use(authenticate); // every project route requires a logged-in user



// @desc   Create new project
// @route  POST /api/projects
// @access Private
router.post("/", validate(createProjectSchema), create);

// @desc   Get all projects
// @route  GET /api/projects
// @access Private
router.get("/", list);

// @desc   Get single project
// @route  GET /api/projects/:id
// @access Private
router.get("/:id", getOne);

// @desc   Update project
// @route  PATCH /api/projects/:id
// @access Private
router.patch("/:id", validate(updateProjectSchema), update);

// @desc   Delete project
// @route  DELETE /api/projects/:id
// @access Private
router.delete("/:id", remove);

// @desc   Regenerate API key
// @route  POST /api/projects/:id/regenerate-key
// @access Private
router.post("/:id/regenerate-key", regenerateKey);

export default router;