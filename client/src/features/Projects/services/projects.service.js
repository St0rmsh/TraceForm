import {
  fetchDashboard,
  createProject,
  fetchProjects,
  fetchProject,
  updateProject,
  deleteProject,
  regenerateApiKey,
  fetchProjectHealth,
} from "../api/projects.api";

/* =========================================================
   DASHBOARD
========================================================= */

export async function getDashboard() {
  const res = await fetchDashboard();

  return res.data.dashboard;
}

/* =========================================================
   CRUD
========================================================= */

export async function create(data) {
  const res = await createProject(data);

  return res.data.project;
}

export async function list() {
  const res = await fetchProjects();

  return res.data.projects;
}

export async function getById(projectId) {
  const res = await fetchProject(projectId);

  return res.data.project;
}

export async function update(projectId, data) {
  const res = await updateProject(projectId, data);

  return res.data.project;
}

export async function remove(projectId) {
  await deleteProject(projectId);

  return projectId;
}

/* =========================================================
   API KEY
========================================================= */

export async function regenerateKey(projectId) {
  const res = await regenerateApiKey(projectId);

  return res.data.apiKey;
}

/* =========================================================
   HEALTH
========================================================= */

export async function getHealth(projectId) {
  const res = await fetchProjectHealth(projectId);

  return res.data;
}