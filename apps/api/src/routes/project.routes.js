import { Router } from "express";
import {
  create,
  list,
  getOne,
  update,
  remove,
  regenerateKey,
  getHealth,
} from "../controllers/project.controller.js";
import { validate } from "../middlewares/validate.js";
import { authenticate } from "../middlewares/authenticate.js";
import { createProjectSchema, updateProjectSchema } from "../validations/project.validation.js";
import { dashboard } from "../controllers/incident.controller.js";

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


// @desc Dashboard
// @route GET /api/projects/dashboard
// @access Private
router.get("/dashboard", dashboard);

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


// @desc Get project health
// @route GET /api/projects/:id/health
// @access Private
router.get("/:id/health", getHealth);




export default router;