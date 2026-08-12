import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import { useProjects } from "../../Projects/hooks/useProjects";
import * as incidentsService from "../services/incidents.service";
import AppShell from "../../../components/ui/AppShell";
import StatusBadge from "../../../components/ui/StatusBadge";

const SEVERITY_MAP = {
  low: "gray",
  medium: "amber",
  high: "amber",
  critical: "red",
};

const STATUS_FILTERS = ["all", "open", "investigating", "resolved"];
const SEVERITY_FILTERS = ["all", "low", "medium", "high", "critical"];

export default function IncidentsList() {
  const { projects, fetchProjects } = useProjects();

  const [allIncidents, setAllIncidents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("all");
  const [severityFilter, setSeverityFilter] = useState("all");

  useEffect(() => {
    async function loadAll() {
      setIsLoading(true);

      const projectList = await fetchProjects();

      const perProjectResults = await Promise.all(
        projectList.map(async (project) => {
          try {
            const incidents = await incidentsService.list(project.id);
            return incidents.map((incident) => ({ ...incident, projectName: project.name }));
          } catch {
            return []; // one project's incidents failing shouldn't blank the whole page
          }
        })
      );

      const merged = perProjectResults
        .flat()
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

      setAllIncidents(merged);
      setIsLoading(false);
    }

    loadAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filtered = allIncidents.filter((incident) => {
    if (statusFilter !== "all" && incident.status !== statusFilter) return false;
    if (severityFilter !== "all" && incident.severity !== severityFilter) return false;
    return true;
  });

  return (
    <AppShell>
      <div className="p-8">
        <h1 className="text-2xl font-semibold text-ink">Incidents</h1>
        <p className="mt-1 text-sm text-ink-muted">
          Monitoring {projects.length} project{projects.length !== 1 ? "s" : ""}.
        </p>

        <div className="my-6 flex gap-3">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-card border border-base-border bg-base-surface px-3 py-2 text-sm text-ink outline-none focus:border-accent"
          >
            {STATUS_FILTERS.map((s) => (
              <option key={s} value={s}>
                Status: {s === "all" ? "All" : s}
              </option>
            ))}
          </select>
          <select
            value={severityFilter}
            onChange={(e) => setSeverityFilter(e.target.value)}
            className="rounded-card border border-base-border bg-base-surface px-3 py-2 text-sm text-ink outline-none focus:border-accent"
          >
            {SEVERITY_FILTERS.map((s) => (
              <option key={s} value={s}>
                Severity: {s === "all" ? "All" : s}
              </option>
            ))}
          </select>
        </div>

        {isLoading && <p className="text-sm text-ink-muted">Loading...</p>}

        {!isLoading && filtered.length === 0 && (
          <div className="rounded-card border border-dashed border-base-border p-12 text-center text-ink-muted">
            No incidents — everything's healthy.
          </div>
        )}

        {!isLoading && filtered.length > 0 && (
          <div className="overflow-hidden rounded-card border border-base-border bg-base-surface">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-base-border text-left text-xs uppercase tracking-wide text-ink-faint">
                  <th className="px-5 py-3">Severity</th>
                  <th className="px-5 py-3">Title</th>
                  <th className="px-5 py-3">Project</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3">Trigger</th>
                  <th className="px-5 py-3">Created</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((incident) => (
                  <tr
                    key={incident.id}
                    className="cursor-pointer border-b border-base-border last:border-0 hover:bg-base-raised"
                    onClick={() => (window.location.href = `/incidents/${incident.id}`)}
                  >
                    <td className="px-5 py-3">
                      <StatusBadge
                        status={SEVERITY_MAP[incident.severity]}
                        label={incident.severity}
                      />
                    </td>
                    <td className="px-5 py-3 text-ink">
                      <Link to={`/incidents/${incident.id}`} onClick={(e) => e.stopPropagation()}>
                        {incident.title}
                      </Link>
                    </td>
                    <td className="px-5 py-3 font-mono text-xs text-ink-muted">
                      {incident.projectName}
                    </td>
                    <td className="px-5 py-3 capitalize text-ink-muted">{incident.status}</td>
                    <td className="px-5 py-3 text-ink-muted">
                      {incident.triggeredBy === "auto" ? "✨ AI" : "Manual"}
                    </td>
                    <td className="px-5 py-3 font-mono text-xs text-ink-faint">
                      {new Date(incident.createdAt).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </AppShell>
  );
}