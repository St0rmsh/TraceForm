import {
  createSlice,
  createAsyncThunk,
} from "@reduxjs/toolkit";

import * as incidentsService from "../services/incidents.service";

/* =========================================================
   CRUD
========================================================= */

export const createIncidentThunk =
  createAsyncThunk(
    "incidents/create",

    async (
      { projectId, data },
      { rejectWithValue }
    ) => {
      try {
        return await incidentsService.create(projectId, data);
      } catch (err) {
        return rejectWithValue({
          message: err.message,
          status: err.status,
          errors: err.errors,
        });
      }
    }
  );

export const fetchIncidentsThunk =
  createAsyncThunk(
    "incidents/fetchAll",

    async (projectId, { rejectWithValue }) => {
      try {
        return await incidentsService.list(projectId);
      } catch (err) {
        return rejectWithValue({
          message: err.message,
          status: err.status,
        });
      }
    }
  );

export const fetchIncidentThunk =
  createAsyncThunk(
    "incidents/fetchOne",

    async (incidentId, { rejectWithValue }) => {
      try {
        return await incidentsService.getById(incidentId);
      } catch (err) {
        return rejectWithValue({
          message: err.message,
          status: err.status,
        });
      }
    }
  );

/* =========================================================
   AI ANALYSIS
========================================================= */

export const analyzeRootCauseThunk =
  createAsyncThunk(
    "incidents/analyzeRootCause",

    async (incidentId, { rejectWithValue }) => {
      try {
        return await incidentsService.runRootCauseAnalysis(incidentId);
      } catch (err) {
        return rejectWithValue({
          message: err.message,
          status: err.status,
        });
      }
    }
  );

export const summarizeIncidentThunk =
  createAsyncThunk(
    "incidents/summarize",

    async (incidentId, { rejectWithValue }) => {
      try {
        return await incidentsService.generateSummary(incidentId);
      } catch (err) {
        return rejectWithValue({
          message: err.message,
          status: err.status,
        });
      }
    }
  );

/* =========================================================
   TIMELINE
========================================================= */

export const addTimelineEntryThunk =
  createAsyncThunk(
    "incidents/addTimelineEntry",

    async (
      { incidentId, data },
      { rejectWithValue }
    ) => {
      try {
        return await incidentsService.addEntry(incidentId, data);
      } catch (err) {
        return rejectWithValue({
          message: err.message,
          status: err.status,
          errors: err.errors,
        });
      }
    }
  );

/* =========================================================
   RESOLUTION
========================================================= */

export const resolveIncidentThunk =
  createAsyncThunk(
    "incidents/resolve",

    async (
      { incidentId, data },
      { rejectWithValue }
    ) => {
      try {
        return await incidentsService.resolve(incidentId, data);
      } catch (err) {
        return rejectWithValue({
          message: err.message,
          status: err.status,
          errors: err.errors,
        });
      }
    }
  );

export const reopenIncidentThunk =
  createAsyncThunk(
    "incidents/reopen",

    async (incidentId, { rejectWithValue }) => {
      try {
        return await incidentsService.reopen(incidentId);
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

  analyzeStatus: "idle",
  summarizeStatus: "idle",

  error: null,
};

/* =========================================================
   SLICE
========================================================= */

const incidentsSlice = createSlice({
  name: "incidents",

  initialState,

  reducers: {
    clearIncidentsError(state) {
      state.error = null;
    },
  },

  extraReducers: (builder) => {
    builder

      /* =====================================================
         CREATE
      ===================================================== */

      .addCase(createIncidentThunk.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })

      .addCase(createIncidentThunk.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.items.unshift(action.payload);
      })

      .addCase(createIncidentThunk.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })

      /* =====================================================
         FETCH ALL
      ===================================================== */

      .addCase(fetchIncidentsThunk.pending, (state) => {
        state.status = "loading";
      })

      .addCase(fetchIncidentsThunk.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.items = action.payload;
      })

      .addCase(fetchIncidentsThunk.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })

      /* =====================================================
         FETCH ONE
      ===================================================== */

      .addCase(fetchIncidentThunk.pending, (state) => {
        state.currentStatus = "loading";
      })

      .addCase(fetchIncidentThunk.fulfilled, (state, action) => {
        state.currentStatus = "succeeded";
        state.current = action.payload;
      })

      .addCase(fetchIncidentThunk.rejected, (state, action) => {
        state.currentStatus = "failed";
        state.error = action.payload;
      })

      /* =====================================================
         ANALYZE ROOT CAUSE
      ===================================================== */

      .addCase(analyzeRootCauseThunk.pending, (state) => {
        state.analyzeStatus = "loading";
      })

      .addCase(analyzeRootCauseThunk.fulfilled, (state, action) => {
        state.analyzeStatus = "succeeded";
        state.current = action.payload;
      })

      .addCase(analyzeRootCauseThunk.rejected, (state, action) => {
        state.analyzeStatus = "failed";
        state.error = action.payload;
      })

      /* =====================================================
         SUMMARIZE
      ===================================================== */

      .addCase(summarizeIncidentThunk.pending, (state) => {
        state.summarizeStatus = "loading";
      })

      .addCase(summarizeIncidentThunk.fulfilled, (state, action) => {
        state.summarizeStatus = "succeeded";
        state.current = action.payload;
      })

      .addCase(summarizeIncidentThunk.rejected, (state, action) => {
        state.summarizeStatus = "failed";
        state.error = action.payload;
      })

      /* =====================================================
         TIMELINE
      ===================================================== */

      .addCase(addTimelineEntryThunk.fulfilled, (state, action) => {
        state.current = action.payload;
      })

      .addCase(addTimelineEntryThunk.rejected, (state, action) => {
        state.error = action.payload;
      })

      /* =====================================================
         RESOLUTION
      ===================================================== */

      .addCase(resolveIncidentThunk.fulfilled, (state, action) => {
        state.current = action.payload;

        const index = state.items.findIndex(
          (i) => i.id === action.payload.id
        );

        if (index !== -1) {
          state.items[index] = action.payload;
        }
      })

      .addCase(reopenIncidentThunk.fulfilled, (state, action) => {
        state.current = action.payload;

        const index = state.items.findIndex(
          (i) => i.id === action.payload.id
        );

        if (index !== -1) {
          state.items[index] = action.payload;
        }
      });
  },
});

export const { clearIncidentsError } = incidentsSlice.actions;

export default incidentsSlice.reducer;