import { Router } from "express";
import { create, list, getOne, analyze, summarize, addEntry, getEntries, reopen, resolve } from "../controllers/incident.controller.js";
import { validate } from "../middlewares/validate.js";
import { authenticate } from "../middlewares/authenticate.js";
import { addTimelineEntrySchema, createIncidentSchema, resolveIncidentSchema } from "../validations/incident.validation.js";

const router = Router();

router.use(authenticate);

router.post("/projects/:projectId/incidents", validate(createIncidentSchema), create);
router.get("/projects/:projectId/incidents", list);
router.get("/incidents/:incidentId", getOne);
router.post("/incidents/:incidentId/analyze", analyze);


router.post("/incidents/:incidentId/summarize", summarize);



router.post("/incidents/:incidentId/timeline", validate(addTimelineEntrySchema), addEntry);
router.get("/incidents/:incidentId/timeline", getEntries);


router.post("/incidents/:incidentId/resolve", validate(resolveIncidentSchema), resolve);
router.post("/incidents/:incidentId/reopen", reopen);

export default router;