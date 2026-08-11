import { useSelector, useDispatch } from "react-redux";
import { useCallback } from "react";

import {
  createLoadTestThunk,
  fetchLoadTestsThunk,
  fetchLoadTestThunk,
  deleteLoadTestThunk,
  startLoadTestThunk,
  fetchLiveProgressThunk,
  compareLoadTestsThunk,
  clearComparison,
  clearLiveProgress,
} from "../state/loadTestsSlice";

export function useLoadTests() {
  const dispatch = useDispatch();

  const {
    items,
    status,
    current,
    currentStatus,
    liveProgress,
    comparison,
    comparisonStatus,
    error,
  } = useSelector((state) => state.loadTests);

  const createLoadTest = useCallback(
    (projectId, data) =>
      dispatch(createLoadTestThunk({ projectId, data })).unwrap(),
    [dispatch]
  );

  const fetchLoadTests = useCallback(
    (projectId) => dispatch(fetchLoadTestsThunk(projectId)).unwrap(),
    [dispatch]
  );

  const fetchLoadTest = useCallback(
    (runId) => dispatch(fetchLoadTestThunk(runId)).unwrap(),
    [dispatch]
  );

  const deleteLoadTest = useCallback(
    (runId) => dispatch(deleteLoadTestThunk(runId)).unwrap(),
    [dispatch]
  );

  const startLoadTest = useCallback(
    (runId) => dispatch(startLoadTestThunk(runId)).unwrap(),
    [dispatch]
  );

  const fetchLiveProgress = useCallback(
    (runId) => dispatch(fetchLiveProgressThunk(runId)).unwrap(),
    [dispatch]
  );

  const compareLoadTests = useCallback(
    (baselineRunId, comparisonRunId) =>
      dispatch(compareLoadTestsThunk({ baselineRunId, comparisonRunId })).unwrap(),
    [dispatch]
  );

  const resetComparison = useCallback(() => dispatch(clearComparison()), [dispatch]);
  const resetLiveProgress = useCallback(() => dispatch(clearLiveProgress()), [dispatch]);

  return {
    runs: items,
    isLoading: status === "loading",

    current,
    isCurrentLoading: currentStatus === "loading",

    liveProgress,

    comparison,
    isComparisonLoading: comparisonStatus === "loading",

    error,

    createLoadTest,
    fetchLoadTests,
    fetchLoadTest,
    deleteLoadTest,
    startLoadTest,
    fetchLiveProgress,
    compareLoadTests,
    resetComparison,
    resetLiveProgress,
  };
}