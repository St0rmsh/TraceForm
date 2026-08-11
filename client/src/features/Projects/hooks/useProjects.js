import { useSelector, useDispatch } from "react-redux";
import { useCallback } from "react";

import {
  fetchDashboardThunk,
  createProjectThunk,
  fetchProjectsThunk,
  fetchProjectThunk,
  updateProjectThunk,
  deleteProjectThunk,
  regenerateApiKeyThunk,
  fetchProjectHealthThunk,
  clearRegeneratedKey,
} from "../state/projectsSlice";

export function useProjects() {
  const dispatch = useDispatch();

  const {
    dashboard,
    dashboardStatus,
    items,
    status,
    current,
    currentStatus,
    currentHealth,
    lastRegeneratedKey,
    error,
  } = useSelector((state) => state.projects);

  const fetchDashboard = useCallback(
    () => dispatch(fetchDashboardThunk()).unwrap(),
    [dispatch]
  );

  const createProject = useCallback(
    (data) => dispatch(createProjectThunk(data)).unwrap(),
    [dispatch]
  );

  const fetchProjects = useCallback(
    () => dispatch(fetchProjectsThunk()).unwrap(),
    [dispatch]
  );

  const fetchProject = useCallback(
    (projectId) => dispatch(fetchProjectThunk(projectId)).unwrap(),
    [dispatch]
  );

  const updateProject = useCallback(
    (projectId, data) =>
      dispatch(updateProjectThunk({ projectId, data })).unwrap(),
    [dispatch]
  );

  const deleteProject = useCallback(
    (projectId) => dispatch(deleteProjectThunk(projectId)).unwrap(),
    [dispatch]
  );

  const regenerateApiKey = useCallback(
    (projectId) => dispatch(regenerateApiKeyThunk(projectId)).unwrap(),
    [dispatch]
  );

  const fetchProjectHealth = useCallback(
    (projectId) => dispatch(fetchProjectHealthThunk(projectId)).unwrap(),
    [dispatch]
  );

  const clearKey = useCallback(
    () => dispatch(clearRegeneratedKey()),
    [dispatch]
  );

  return {
    dashboard,
    isDashboardLoading: dashboardStatus === "loading",

    projects: items,
    isLoading: status === "loading",

    current,
    isCurrentLoading: currentStatus === "loading",

    currentHealth,
    lastRegeneratedKey,
    error,

    fetchDashboard,
    createProject,
    fetchProjects,
    fetchProject,
    updateProject,
    deleteProject,
    regenerateApiKey,
    fetchProjectHealth,
    clearKey,
  };
}