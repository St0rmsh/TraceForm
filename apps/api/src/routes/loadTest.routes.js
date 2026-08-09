import { Router } from "express";
import { create, list, getOne, remove, start, getLive, compare } from "../controllers/loadTest.controller.js";
import { validate } from "../middlewares/validate.js";
import { authenticate } from "../middlewares/authenticate.js";
import { createLoadTestSchema } from "../validations/loadTest.validation.js";

const router = Router();

router.use(authenticate);

// nested under a project: /api/projects/:projectId/load-tests

// @route POST /api/projects/:projectId/load-tests
router.post("/projects/:projectId/load-tests", validate(createLoadTestSchema), create);

// @route GET /api/projects/:projectId/load-tests
router.get("/projects/:projectId/load-tests", list);


//@desc  Compare two runs
// @route GET /api/load-tests/compare
router.get("/load-tests/compare", compare);
 

// standalone by run id: /api/load-tests/:runId


// @route GET /api/load-tests/:runId
router.get("/load-tests/:runId", getOne);

// @route DELETE /api/load-tests/:runId

router.delete("/load-tests/:runId", remove);

// @route POST /api/load-tests/:runId/start

router.post("/load-tests/:runId/start", start);


// @route GET /api/load-tests/:runId/live

router.get("/load-tests/:runId/live", getLive);




export default router;