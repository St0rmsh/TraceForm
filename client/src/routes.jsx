import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./features/Auth/hooks/useAuth";

import Login from "./features/Auth/ui/Login";
import Register from "./features/Auth/ui/Register";

import Dashboard from "./features/Projects/ui/Dashboard";
import CreateProject from "./features/Projects/ui/CreateProject";
import ProjectDetail from "./features/Projects/ui/ProjectDetail";
import NewLoadTest from "./features/LoadTests/ui/NewLoadTest";
import LoadTestDetail from "./features/LoadTests/ui/LoadTestDetail";
import CompareRuns from "./features/LoadTests/ui/CompareRuns";
import IncidentsList from "./features/Incidents/ui/IncidentsList";
import IncidentDetail from "./features/Incidents/ui/IncidentDetail";


function ProtectedRoute({ children }) {
  const { isAuthenticated, isHydrating } = useAuth();

  if (isHydrating) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-base text-ink-muted">
        Loading...
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

// temporary placeholders — replaced as each page gets built
function ComingSoon({ label }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-base text-ink-muted">
      {label} — coming next
    </div>
  );
}

export default function AppRoutes() {
  return (
    <Routes>
      {/* public */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* projects */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/projects"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/projects/new"
        element={
          <ProtectedRoute>
            <CreateProject />
          </ProtectedRoute>
        }
      />
      <Route
        path="/projects/:projectId"
        element={
          <ProtectedRoute>
            <ProjectDetail />
          </ProtectedRoute>
        }
      />

      {/* incidents */}
      <Route
        path="/incidents"
        element={
          <ProtectedRoute>
            <IncidentsList />
          </ProtectedRoute>
        }
      />
      <Route
        path="/incidents/:incidentId"
        element={
          <ProtectedRoute>
            <IncidentDetail />
          </ProtectedRoute>
        }
      />
      <Route 
        path="/projects/:projectId/load-tests/new" element={
      <ProtectedRoute>
        <NewLoadTest />
      </ProtectedRoute>
      }
    />
    <Route
        path="/load-tests/:runId"
      element={
    <ProtectedRoute>
      <LoadTestDetail />
    </ProtectedRoute>
  }
/>
<Route
  path="/load-tests/compare"
  element={
    <ProtectedRoute>
      <CompareRuns />
    </ProtectedRoute>
  }
/>

      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}