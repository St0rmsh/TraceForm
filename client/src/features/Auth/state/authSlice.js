import {
  createSlice,
  createAsyncThunk,
} from "@reduxjs/toolkit";

import * as authService from "../services/auth.service";

/* =========================================================
   CURRENT USER
========================================================= */

export const fetchCurrentUser =
  createAsyncThunk(
    "auth/fetchCurrentUser",

    async (_, { rejectWithValue }) => {
      try {
        return await authService.fetchCurrentUser();
      } catch (err) {
        return rejectWithValue({
          message: err.message,
          status: err.status,
        });
      }
    }
  );

/* =========================================================
   REGISTER
========================================================= */

export const registerThunk =
  createAsyncThunk(
    "auth/register",

    async (
      details,
      { rejectWithValue }
    ) => {
      try {
        return await authService.register(
          details
        );
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
   LOGIN
========================================================= */

export const loginThunk =
  createAsyncThunk(
    "auth/login",

    async (
      credentials,
      { rejectWithValue }
    ) => {
      try {
        return await authService.login(
          credentials
        );
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
   LOGOUT
========================================================= */

export const logoutThunk =
  createAsyncThunk(
    "auth/logout",

    async (_, { rejectWithValue }) => {
      try {
        await authService.logout();
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
  user: null,

  status: "idle",

  /*
   * We don't know whether the user is logged in
   * until /me has completed.
   */
  isHydrating: true,

  error: null,
};

/* =========================================================
   SLICE
========================================================= */

const authSlice = createSlice({
  name: "auth",

  initialState,

  reducers: {
    clearAuthError(state) {
      state.error = null;
    },
  },

  extraReducers: (builder) => {
    builder

      /* =====================================================
         CURRENT USER
      ===================================================== */

      .addCase(
        fetchCurrentUser.pending,
        (state) => {
          state.isHydrating = true;
        }
      )

      .addCase(
        fetchCurrentUser.fulfilled,
        (state, action) => {
          state.user = action.payload;
          state.isHydrating = false;
          state.error = null;
        }
      )

      .addCase(
        fetchCurrentUser.rejected,
        (state) => {
          state.user = null;
          state.isHydrating = false;
        }
      )

      /* =====================================================
         REGISTER
      ===================================================== */

      .addCase(
        registerThunk.pending,
        (state) => {
          state.status = "loading";
          state.error = null;
        }
      )

      .addCase(
        registerThunk.fulfilled,
        (state, action) => {
          state.status = "succeeded";
          state.user = action.payload;
          state.error = null;
        }
      )

      .addCase(
        registerThunk.rejected,
        (state, action) => {
          state.status = "failed";
          state.error = action.payload;
        }
      )

      /* =====================================================
         LOGIN
      ===================================================== */

      .addCase(
        loginThunk.pending,
        (state) => {
          state.status = "loading";
          state.error = null;
        }
      )

      .addCase(
        loginThunk.fulfilled,
        (state, action) => {
          state.status = "succeeded";
          state.user = action.payload;
          state.error = null;
        }
      )

      .addCase(
        loginThunk.rejected,
        (state, action) => {
          state.status = "failed";
          state.error = action.payload;
        }
      )

      /* =====================================================
         LOGOUT
      ===================================================== */

      .addCase(
        logoutThunk.pending,
        (state) => {
          state.status = "loading";
        }
      )

      .addCase(
        logoutThunk.fulfilled,
        (state) => {
          state.user = null;
          state.status = "idle";
          state.error = null;
        }
      )

      .addCase(
        logoutThunk.rejected,
        (state) => {
          state.user = null;
          state.status = "idle";
        }
      );
  },
});

export const {
  clearAuthError,
} = authSlice.actions;

export default authSlice.reducer;