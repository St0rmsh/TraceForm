import Project from "@traceform/shared/models/Project.model.js";
import { redisConnection } from "../config/redis.js";

const PROJECT_CACHE_TTL_SECONDS = 30;

function cacheKey(apiKey) {
  return `traceform:projectcache:${apiKey}`;
}

export async function resolveProject(req, res, next) {
  const apiKey = req.headers["x-api-key"];

  if (!apiKey) {
    return res.status(401).json({
      success: false,
      message: "Missing x-api-key header",
    });
  }

  try {
    const cached = await redisConnection.get(cacheKey(apiKey));

    if (cached) {
      req.project = JSON.parse(cached);

      if (req.project.status !== "active") {
        return res.status(403).json({
          success: false,
          message: "This project is paused and not accepting traffic",
        });
      }

      return next();
    }

    const project = await Project.findOne({ apiKey }).select("+apiKey");

    if (!project) {
      return res.status(401).json({
        success: false,
        message: "Invalid API key",
      });
    }

    const projectSnapshot = {
      id: project._id.toString(),
      name: project.name,
      targetBaseUrl: project.targetBaseUrl,
      status: project.status,
      anomalyThresholds: project.anomalyThresholds,
      rateLimit: project.rateLimit,
    };

    await redisConnection.set(
      cacheKey(apiKey),
      JSON.stringify(projectSnapshot),
      "EX",
      PROJECT_CACHE_TTL_SECONDS
    );

    if (projectSnapshot.status !== "active") {
      return res.status(403).json({
        success: false,
        message: "This project is paused and not accepting traffic",
      });
    }

    req.project = projectSnapshot;
    next();
  } catch (err) {
    console.error("[gateway/resolveProject] Error resolving project:", err.message);
    return res.status(500).json({
      success: false,
      message: "Internal gateway error",
    });
  }
}