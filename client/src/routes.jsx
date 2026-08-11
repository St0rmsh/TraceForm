import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./features/Auth/hooks/useAuth";
import Login from "./features/Auth/ui/Login";
import Register from "./features/Auth/ui/Register";

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

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <div className="p-8 text-ink">Dashboard placeholder — Projects feature next</div>
          </ProtectedRoute>
        }
      />

      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}