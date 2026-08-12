import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./features/Auth/state/authSlice";
import projectsReducer from "./features/Projects/state/projectsSlice";
import incidentsReducer from "./features/Incidents/state/incidentsSlice";
import loadTestsReducer from "./features/LoadTests/state/loadTestsSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    projects: projectsReducer,
    incidents: incidentsReducer,
    loadTests: loadTestsReducer,
  },
});