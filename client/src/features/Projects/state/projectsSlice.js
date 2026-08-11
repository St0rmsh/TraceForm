import {
  createSlice,
  createAsyncThunk,
} from "@reduxjs/toolkit";

import * as projectsService from "../services/projects.service";

/* =========================================================
   DASHBOARD
========================================================= */

export const fetchDashboardThunk =
  createAsyncThunk(
    "projects/fetchDashboard",

    async (_, { rejectWithValue }) => {
      try {
        return await projectsService.getDashboard();
      } catch (err) {
        return rejectWithValue({
          message: err.message,
          status: err.status,
        });
      }
    }
  );

/* =========================================================
   CRUD
========================================================= */

export const createProjectThunk =
  createAsyncThunk(
    "projects/create",

    async (data, { rejectWithValue }) => {
      try {
        return await projectsService.create(data);
      } catch (err) {
        return rejectWithValue({
          message: err.message,
          status: err.status,
          errors: err.errors,
        });
      }
    }
  );

export const fetchProjectsThunk =
  createAsyncThunk(
    "projects/fetchAll",

    async (_, { rejectWithValue }) => {
      try {
        return await projectsService.list();
      } catch (err) {
        return rejectWithValue({
          message: err.message,
          status: err.status,
        });
      }
    }
  );

export const fetchProjectThunk =
  createAsyncThunk(
    "projects/fetchOne",

    async (projectId, { rejectWithValue }) => {
      try {
        return await projectsService.getById(projectId);
      } catch (err) {
        return rejectWithValue({
          message: err.message,
          status: err.status,
        });
      }
    }
  );

export const updateProjectThunk =
  createAsyncThunk(
    "projects/update",

    async (
      { projectId, data },
      { rejectWithValue }
    ) => {
      try {
        return await projectsService.update(projectId, data);
      } catch (err) {
        return rejectWithValue({
          message: err.message,
          status: err.status,
          errors: err.errors,
        });
      }
    }
  );

export const deleteProjectThunk =
  createAsyncThunk(
    "projects/delete",

    async (projectId, { rejectWithValue }) => {
      try {
        return await projectsService.remove(projectId);
      } catch (err) {
        return rejectWithValue({
          message: err.message,
          status: err.status,
        });
      }
    }
  );

/* =========================================================
   API KEY
========================================================= */

export const regenerateApiKeyThunk =
  createAsyncThunk(
    "projects/regenerateKey",

    async (projectId, { rejectWithValue }) => {
      try {
        const apiKey = await projectsService.regenerateKey(projectId);
        return { projectId, apiKey };
      } catch (err) {
        return rejectWithValue({
          message: err.message,
          status: err.status,
        });
      }
    }
  );

/* =========================================================
   HEALTH
========================================================= */

export const fetchProjectHealthThunk =
  createAsyncThunk(
    "projects/fetchHealth",

    async (projectId, { rejectWithValue }) => {
      try {
        const health = await projectsService.getHealth(projectId);
        return { projectId, health };
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
  dashboard: [],
  dashboardStatus: "idle",

  items: [],
  status: "idle",

  current: null,
  currentStatus: "idle",

  currentHealth: null,

  lastRegeneratedKey: null, // shown once, then cleared by the UI after copy

  error: null,
};

/* =========================================================
   SLICE
========================================================= */

const projectsSlice = createSlice({
  name: "projects",

  initialState,

  reducers: {
    clearProjectsError(state) {
      state.error = null;
    },

    clearRegeneratedKey(state) {
      state.lastRegeneratedKey = null;
    },
  },

  extraReducers: (builder) => {
    builder

      /* =====================================================
         DASHBOARD
      ===================================================== */

      .addCase(fetchDashboardThunk.pending, (state) => {
        state.dashboardStatus = "loading";
      })

      .addCase(fetchDashboardThunk.fulfilled, (state, action) => {
        state.dashboardStatus = "succeeded";
        state.dashboard = action.payload;
      })

      .addCase(fetchDashboardThunk.rejected, (state, action) => {
        state.dashboardStatus = "failed";
        state.error = action.payload;
      })

      /* =====================================================
         CREATE
      ===================================================== */

      .addCase(createProjectThunk.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })

      .addCase(createProjectThunk.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.items.unshift(action.payload);
      })

      .addCase(createProjectThunk.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })

      /* =====================================================
         FETCH ALL
      ===================================================== */

      .addCase(fetchProjectsThunk.pending, (state) => {
        state.status = "loading";
      })

      .addCase(fetchProjectsThunk.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.items = action.payload;
      })

      .addCase(fetchProjectsThunk.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })

      /* =====================================================
         FETCH ONE
      ===================================================== */

      .addCase(fetchProjectThunk.pending, (state) => {
        state.currentStatus = "loading";
        state.current = null;
      })

      .addCase(fetchProjectThunk.fulfilled, (state, action) => {
        state.currentStatus = "succeeded";
        state.current = action.payload;
      })

      .addCase(fetchProjectThunk.rejected, (state, action) => {
        state.currentStatus = "failed";
        state.error = action.payload;
      })

      /* =====================================================
         UPDATE
      ===================================================== */

      .addCase(updateProjectThunk.fulfilled, (state, action) => {
        state.current = action.payload;

        const index = state.items.findIndex(
          (p) => p.id === action.payload.id
        );

        if (index !== -1) {
          state.items[index] = action.payload;
        }
      })

      .addCase(updateProjectThunk.rejected, (state, action) => {
        state.error = action.payload;
      })

      /* =====================================================
         DELETE
      ===================================================== */

      .addCase(deleteProjectThunk.fulfilled, (state, action) => {
        state.items = state.items.filter(
          (p) => p.id !== action.payload
        );
      })

      /* =====================================================
         REGENERATE KEY
      ===================================================== */

      .addCase(regenerateApiKeyThunk.fulfilled, (state, action) => {
        state.lastRegeneratedKey = action.payload.apiKey;
      })

      /* =====================================================
         HEALTH
      ===================================================== */

      .addCase(fetchProjectHealthThunk.fulfilled, (state, action) => {
        state.currentHealth = action.payload.health;
      });
  },
});

export const { clearProjectsError, clearRegeneratedKey } = projectsSlice.actions;

export default projectsSlice.reducer;