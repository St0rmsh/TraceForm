import { Router } from "express";
import { create, list, getOne, analyze } from "../controllers/incident.controller.js";
import { validate } from "../middlewares/validate.js";
import { authenticate } from "../middlewares/authenticate.js";
import { createIncidentSchema } from "../validations/incident.validation.js";

const router = Router();

router.use(authenticate);

router.post("/projects/:projectId/incidents", validate(createIncidentSchema), create);
router.get("/projects/:projectId/incidents", list);
router.get("/incidents/:incidentId", getOne);
router.post("/incidents/:incidentId/analyze", analyze);

export default router;