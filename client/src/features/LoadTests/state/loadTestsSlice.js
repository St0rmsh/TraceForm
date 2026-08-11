import {
  createSlice,
  createAsyncThunk,
} from "@reduxjs/toolkit";

import * as loadTestsService from "../services/loadTests.service";

/* =========================================================
   CRUD
========================================================= */

export const createLoadTestThunk =
  createAsyncThunk(
    "loadTests/create",

    async (
      { projectId, data },
      { rejectWithValue }
    ) => {
      try {
        return await loadTestsService.create(projectId, data);
      } catch (err) {
        return rejectWithValue({
          message: err.message,
          status: err.status,
          errors: err.errors,
        });
      }
    }
  );

export const fetchLoadTestsThunk =
  createAsyncThunk(
    "loadTests/fetchAll",

    async (projectId, { rejectWithValue }) => {
      try {
        return await loadTestsService.list(projectId);
      } catch (err) {
        return rejectWithValue({
          message: err.message,
          status: err.status,
        });
      }
    }
  );

export const fetchLoadTestThunk =
  createAsyncThunk(
    "loadTests/fetchOne",

    async (runId, { rejectWithValue }) => {
      try {
        return await loadTestsService.getById(runId);
      } catch (err) {
        return rejectWithValue({
          message: err.message,
          status: err.status,
        });
      }
    }
  );

export const deleteLoadTestThunk =
  createAsyncThunk(
    "loadTests/delete",

    async (runId, { rejectWithValue }) => {
      try {
        return await loadTestsService.remove(runId);
      } catch (err) {
        return rejectWithValue({
          message: err.message,
          status: err.status,
        });
      }
    }
  );

/* =========================================================
   EXECUTION
========================================================= */

export const startLoadTestThunk =
  createAsyncThunk(
    "loadTests/start",

    async (runId, { rejectWithValue }) => {
      try {
        return await loadTestsService.start(runId);
      } catch (err) {
        return rejectWithValue({
          message: err.message,
          status: err.status,
        });
      }
    }
  );

export const fetchLiveProgressThunk =
  createAsyncThunk(
    "loadTests/fetchLiveProgress",

    async (runId, { rejectWithValue }) => {
      try {
        const progress = await loadTestsService.getLiveProgress(runId);
        return progress;
      } catch (err) {
        return rejectWithValue({
          message: err.message,
          status: err.status,
        });
      }
    }
  );

/* =========================================================
   COMPARISON
========================================================= */

export const compareLoadTestsThunk =
  createAsyncThunk(
    "loadTests/compare",

    async (
      { baselineRunId, comparisonRunId },
      { rejectWithValue }
    ) => {
      try {
        return await loadTestsService.compare(baselineRunId, comparisonRunId);
      } catch (err) {
        return rejectWithValue({
          message: err.message,
          status: err.status,
        });
      }
    }
  );

/* =========================================================
   INITIAL STATE
========================================================= */

const initialState = {
  items: [],
  status: "idle",

  current: null,
  currentStatus: "idle",

  liveProgress: null, // null when the run isn't currently active

  comparison: null,
  comparisonStatus: "idle",

  error: null,
};

/* =========================================================
   SLICE
========================================================= */

const loadTestsSlice = createSlice({
  name: "loadTests",

  initialState,

  reducers: {
    clearLoadTestsError(state) {
      state.error = null;
    },

    clearComparison(state) {
      state.comparison = null;
    },

    clearLiveProgress(state) {
      state.liveProgress = null;
    },
  },

  extraReducers: (builder) => {
    builder

      /* =====================================================
         CREATE
      ===================================================== */

      .addCase(createLoadTestThunk.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })

      .addCase(createLoadTestThunk.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.items.unshift(action.payload);
      })

      .addCase(createLoadTestThunk.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })

      /* =====================================================
         FETCH ALL
      ===================================================== */

      .addCase(fetchLoadTestsThunk.pending, (state) => {
        state.status = "loading";
      })

      .addCase(fetchLoadTestsThunk.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.items = action.payload;
      })

      .addCase(fetchLoadTestsThunk.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })

      /* =====================================================
         FETCH ONE
      ===================================================== */

      .addCase(fetchLoadTestThunk.pending, (state) => {
        state.currentStatus = "loading";
      })

      .addCase(fetchLoadTestThunk.fulfilled, (state, action) => {
        state.currentStatus = "succeeded";
        state.current = action.payload;
      })

      .addCase(fetchLoadTestThunk.rejected, (state, action) => {
        state.currentStatus = "failed";
        state.error = action.payload;
      })

      /* =====================================================
         DELETE
      ===================================================== */

      .addCase(deleteLoadTestThunk.fulfilled, (state, action) => {
        state.items = state.items.filter((r) => r.id !== action.payload);
      })

      /* =====================================================
         START
      ===================================================== */

      .addCase(startLoadTestThunk.fulfilled, (state, action) => {
        if (state.current && state.current.id === action.payload.runId) {
          state.current.status = action.payload.status;
        }
      })

      .addCase(startLoadTestThunk.rejected, (state, action) => {
        state.error = action.payload;
      })

      /* =====================================================
         LIVE PROGRESS
      ===================================================== */

      .addCase(fetchLiveProgressThunk.fulfilled, (state, action) => {
        state.liveProgress = action.payload;
      })

      /* =====================================================
         COMPARISON
      ===================================================== */

      .addCase(compareLoadTestsThunk.pending, (state) => {
        state.comparisonStatus = "loading";
      })

      .addCase(compareLoadTestsThunk.fulfilled, (state, action) => {
        state.comparisonStatus = "succeeded";
        state.comparison = action.payload;
      })

      .addCase(compareLoadTestsThunk.rejected, (state, action) => {
        state.comparisonStatus = "failed";
        state.error = action.payload;
      });
  },
});

export const {
  clearLoadTestsError,
  clearComparison,
  clearLiveProgress,
} = loadTestsSlice.actions;

export default loadTestsSlice.reducer;