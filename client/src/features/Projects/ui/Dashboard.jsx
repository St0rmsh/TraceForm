import { useEffect } from "react";
import { Link } from "react-router-dom";

import { useProjects } from "../hooks/useProjects";
import AppShell from "../../../components/ui/AppShell";
import StatusBadge from "../../../components/ui/StatusBadge";
import Button from "../../../components/ui/Button";

export default function Dashboard() {
  const { dashboard, isDashboardLoading, fetchDashboard } = useProjects();

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  return (
    <AppShell>
      <div className="p-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-ink">Overview</h1>
            <p className="mt-1 text-sm text-ink-muted">
              Monitoring {dashboard.length} project{dashboard.length !== 1 ? "s" : ""}.
            </p>
          </div>
          <Link to="/projects/new">
            <Button>+ New Project</Button>
          </Link>
        </div>

        {isDashboardLoading && dashboard.length === 0 && (
          <p className="text-sm text-ink-muted">Loading...</p>
        )}

        {!isDashboardLoading && dashboard.length === 0 && (
          <div className="rounded-card border border-dashed border-base-border p-12 text-center">
            <p className="text-ink-muted">No projects yet.</p>
            <Link to="/projects/new" className="mt-3 inline-block">
              <Button variant="secondary">Register your first project</Button>
            </Link>
          </div>
        )}

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {dashboard.map((project) => (
            <Link
              key={project.id}
              to={`/projects/${project.id}`}
              className="rounded-card border border-base-border bg-base-surface p-5 transition-colors hover:border-accent/50"
            >
              <div className="mb-4 flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <h3 className="truncate font-medium text-ink">{project.name}</h3>
                  <p className="truncate text-xs text-ink-muted">{project.targetBaseUrl}</p>
                </div>
                <StatusBadge status={project.health?.status} />
              </div>

              <div className="grid grid-cols-3 gap-3 font-mono text-sm">
                <div>
                  <p className="text-[10px] uppercase tracking-wide text-ink-faint">Requests</p>
                  <p className="text-ink">{project.health?.requestCount ?? "--"}</p>
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-wide text-ink-faint">Error Rate</p>
                  <p
                    className={
                      project.health?.errorRatePercent > 0 ? "text-status-red" : "text-ink"
                    }
                  >
                    {project.health?.errorRatePercent ?? "--"}%
                  </p>
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-wide text-ink-faint">Latency</p>
                  <p className="text-ink">{project.health?.avgLatencyMs ?? "--"}ms</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </AppShell>
  );
}