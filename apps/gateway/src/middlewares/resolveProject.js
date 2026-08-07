import Project from "@traceform/shared/models/Project.model.js";

export async function resolveProject(req, res, next) {
  const apiKey = req.headers["x-api-key"];

  if (!apiKey) {
    return res.status(401).json({
      success: false,
      message: "Missing x-api-key header",
    });
  }

  // apiKey has `select: false` on the schema, so it must be explicitly requested
  const project = await Project.findOne({ apiKey }).select("+apiKey");

  if (!project) {
    return res.status(401).json({
      success: false,
      message: "Invalid API key",
    });
  }

  if (project.status !== "active") {
    return res.status(403).json({
      success: false,
      message: "This project is paused and not accepting traffic",
    });
  }

  // attach a lean snapshot — avoid passing the full Mongoose doc downstream
  req.project = {
    id: project._id.toString(),
    name: project.name,
    targetBaseUrl: project.targetBaseUrl,
    anomalyThresholds: project.anomalyThresholds,
  };

  next();
}