import crypto from "crypto";
import Project from "@traceform/shared/models/Project.model.js";

function generateApiKey() {
  // prefix helps identify key type at a glance (e.g. in logs, dashboards)
  return `tf_${crypto.randomBytes(24).toString("hex")}`;
}

function sanitizeProject(project) {
  return {
    id: project._id,
    name: project.name,
    description: project.description,
    targetBaseUrl: project.targetBaseUrl,
    trackedRoutes: project.trackedRoutes,
    status: project.status,
    anomalyThresholds: project.anomalyThresholds,
    rateLimit: project.rateLimit,
    createdAt: project.createdAt,
    updatedAt: project.updatedAt,
  };
}

async function assertOwnership(projectId, userId) {
  const project = await Project.findById(projectId);

  if (!project) {
    const error = new Error("Project not found");
    error.statusCode = 404;
    throw error;
  }

  if (project.owner.toString() !== userId) {
    const error = new Error("You do not have access to this project");
    error.statusCode = 403;
    throw error;
  }

  return project;
}

export async function createProject(userId, data) {
  const project = await Project.create({
    ...data,
    owner: userId,
    apiKey: generateApiKey(),
  });

  return sanitizeProject(project);
}

export async function listProjects(userId) {
  const projects = await Project.find({ owner: userId }).sort({ createdAt: -1 });
  return projects.map(sanitizeProject);
}

export async function getProjectById(projectId, userId) {
  const project = await assertOwnership(projectId, userId);
  return sanitizeProject(project);
}

export async function updateProject(projectId, userId, data) {
  const project = await assertOwnership(projectId, userId);

  Object.assign(project, data);
  await project.save();

  return sanitizeProject(project);
}

export async function deleteProject(projectId, userId) {
  await assertOwnership(projectId, userId);
  await Project.findByIdAndDelete(projectId);
}

export async function regenerateApiKey(projectId, userId) {
  const project = await assertOwnership(projectId, userId);

  project.apiKey = generateApiKey();
  await project.save();

  // this is the only time the raw key should ever be returned to the client
  return { apiKey: project.apiKey };
}

// internal use only (e.g. orchestrator building a K8s Job) — never expose via a controller,
// since this bypasses sanitizeProject and includes the raw apiKey
export async function getProjectRawWithApiKey(projectId) {
  const project = await Project.findById(projectId).select("+apiKey");

  if (!project) {
    const error = new Error("Project not found");
    error.statusCode = 404;
    throw error;
  }

  return project;
}

export { sanitizeProject };