import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./features/Auth/state/authSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    // projects: projectsReducer,     — added when Projects feature is built
    // loadTests: loadTestsReducer,   — added when LoadTests feature is built
    // incidents: incidentsReducer,   — added when Incidents feature is built
  },
});