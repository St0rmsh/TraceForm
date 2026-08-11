import { apiFetch } from "../../../api/client";

/* =========================================================
   DASHBOARD
========================================================= */

export function fetchDashboard() {
  return apiFetch("/projects/dashboard");
}

/* =========================================================
   CRUD
========================================================= */

export function createProject(data) {
  return apiFetch("/projects", {
    method: "POST",

    body: JSON.stringify(data),
  });
}

export function fetchProjects() {
  return apiFetch("/projects");
}

export function fetchProject(projectId) {
  return apiFetch(`/projects/${projectId}`);
}

export function updateProject(projectId, data) {
  return apiFetch(`/projects/${projectId}`, {
    method: "PATCH",

    body: JSON.stringify(data),
  });
}

export function deleteProject(projectId) {
  return apiFetch(`/projects/${projectId}`, {
    method: "DELETE",
  });
}

/* =========================================================
   API KEY
========================================================= */

export function regenerateApiKey(projectId) {
  return apiFetch(`/projects/${projectId}/regenerate-key`, {
    method: "POST",
  });
}

/* =========================================================
   HEALTH
========================================================= */

export function fetchProjectHealth(projectId) {
  return apiFetch(`/projects/${projectId}/health`);
}