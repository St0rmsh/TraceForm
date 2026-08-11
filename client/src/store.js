import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./features/Auth/state/authSlice";
import projectsReducer from "./features/Projects/state/projectsSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    projects: projectsReducer,
    // loadTests: loadTestsReducer,   — added when LoadTests feature is built
    // incidents: incidentsReducer,   — added when Incidents feature is built
  },
});