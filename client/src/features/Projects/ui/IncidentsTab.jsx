import { useEffect } from "react";
import { Link } from "react-router-dom";
import { useIncidents } from "../../Incidents/hooks/useIncidents";
import StatusBadge from "../../../components/ui/StatusBadge";

const SEVERITY_MAP = {
  low: "gray",
  medium: "amber",
  high: "amber",
  critical: "red",
};

export default function IncidentsTab({ projectId }) {
  const { incidents, isLoading, fetchIncidents } = useIncidents();

  useEffect(() => {
    fetchIncidents(projectId);
  }, [projectId, fetchIncidents]);

  return (
    <div className="flex flex-col gap-4">
      <h3 className="font-medium text-ink">Incidents</h3>

      {isLoading && incidents.length === 0 && <p className="text-sm text-ink-muted">Loading...</p>}

      {!isLoading && incidents.length === 0 && (
        <div className="rounded-card border border-dashed border-base-border p-10 text-center text-ink-muted">
          No incidents — everything's healthy.
        </div>
      )}

      <div className="flex flex-col gap-2">
        {incidents.map((incident) => (
          <Link
            key={incident.id}
            to={`/incidents/${incident.id}`}
            className="flex items-center justify-between rounded-card border border-base-border bg-base-surface px-5 py-4 transition-colors hover:border-accent/50"
          >
            <div>
              <p className="font-medium text-ink">{incident.title}</p>
              <p className="mt-0.5 text-xs text-ink-muted">
                {incident.triggeredBy === "auto" ? "AI-detected" : "Manually opened"} ·{" "}
                {new Date(incident.createdAt).toLocaleString()}
              </p>
            </div>
            <div className="flex gap-2">
              <StatusBadge status={SEVERITY_MAP[incident.severity]} label={incident.severity} />
              <span className="rounded-full border border-base-border px-2.5 py-1 text-xs capitalize text-ink-muted">
                {incident.status}
              </span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}