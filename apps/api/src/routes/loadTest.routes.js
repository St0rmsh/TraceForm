import { Router } from "express";
import { create, list, getOne, remove, start } from "../controllers/loadTest.controller.js";
import { validate } from "../middlewares/validate.js";
import { authenticate } from "../middlewares/authenticate.js";
import { createLoadTestSchema } from "../validations/loadTest.validation.js";

const router = Router();

router.use(authenticate);

// nested under a project: /api/projects/:projectId/load-tests
router.post("/projects/:projectId/load-tests", validate(createLoadTestSchema), create);
router.get("/projects/:projectId/load-tests", list);

// standalone by run id: /api/load-tests/:runId
router.get("/load-tests/:runId", getOne);
router.delete("/load-tests/:runId", remove);
router.post("/load-tests/:runId/start", start);

export default router;