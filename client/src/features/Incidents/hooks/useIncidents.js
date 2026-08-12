import { useSelector, useDispatch } from "react-redux";
import { useCallback } from "react";

import {
  createIncidentThunk,
  fetchIncidentsThunk,
  fetchIncidentThunk,
  analyzeRootCauseThunk,
  summarizeIncidentThunk,
  addTimelineEntryThunk,
  resolveIncidentThunk,
  reopenIncidentThunk,
} from "../state/incidentsSlice";

export function useIncidents() {
  const dispatch = useDispatch();

  const {
    items,
    status,
    current,
    currentStatus,
    analyzeStatus,
    summarizeStatus,
    error,
  } = useSelector((state) => state.incidents);

  const createIncident = useCallback(
    (projectId, data) =>
      dispatch(createIncidentThunk({ projectId, data })).unwrap(),
    [dispatch]
  );

  const fetchIncidents = useCallback(
    (projectId) => dispatch(fetchIncidentsThunk(projectId)).unwrap(),
    [dispatch]
  );

  const fetchIncident = useCallback(
    (incidentId) => dispatch(fetchIncidentThunk(incidentId)).unwrap(),
    [dispatch]
  );

  const analyzeRootCause = useCallback(
    (incidentId) => dispatch(analyzeRootCauseThunk(incidentId)).unwrap(),
    [dispatch]
  );

  const summarizeIncident = useCallback(
    (incidentId) => dispatch(summarizeIncidentThunk(incidentId)).unwrap(),
    [dispatch]
  );

  const addTimelineEntry = useCallback(
    (incidentId, data) =>
      dispatch(addTimelineEntryThunk({ incidentId, data })).unwrap(),
    [dispatch]
  );

  const resolveIncident = useCallback(
    (incidentId, data) =>
      dispatch(resolveIncidentThunk({ incidentId, data })).unwrap(),
    [dispatch]
  );

  const reopenIncident = useCallback(
    (incidentId) => dispatch(reopenIncidentThunk(incidentId)).unwrap(),
    [dispatch]
  );

  return {
    incidents: items,
    isLoading: status === "loading",

    current,
    isCurrentLoading: currentStatus === "loading",

    isAnalyzing: analyzeStatus === "loading",
    isSummarizing: summarizeStatus === "loading",

    error,

    createIncident,
    fetchIncidents,
    fetchIncident,
    analyzeRootCause,
    summarizeIncident,
    addTimelineEntry,
    resolveIncident,
    reopenIncident,
  };
}