import { useEffect } from "react";
import { Link } from "react-router-dom";
import { useLoadTests } from "../../LoadTests/hooks/useLoadTests";
import Button from "../../../components/ui/Button";
import StatusBadge from "../../../components/ui/StatusBadge";

const RUN_STATUS_MAP = {
  pending: "gray",
  queued: "gray",
  running: "amber",
  completed: "green",
  failed: "red",
  cancelled: "gray",
};

export default function LoadTestsTab({ projectId }) {
  const { runs, isLoading, fetchLoadTests } = useLoadTests();

  useEffect(() => {
    fetchLoadTests(projectId);
  }, [projectId, fetchLoadTests]);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h3 className="font-medium text-ink">Load Test Runs</h3>
        <Link to={`/projects/${projectId}/load-tests/new`}>
          <Button>+ New Load Test</Button>
        </Link>
      </div>

      {isLoading && runs.length === 0 && <p className="text-sm text-ink-muted">Loading...</p>}

      {!isLoading && runs.length === 0 && (
        <div className="rounded-card border border-dashed border-base-border p-10 text-center text-ink-muted">
          No load tests yet.
        </div>
      )}

      <div className="flex flex-col gap-2">
        {runs.map((run) => (
          <Link
            key={run.id}
            to={`/load-tests/${run.id}`}
            className="flex items-center justify-between rounded-card border border-base-border bg-base-surface px-5 py-4 transition-colors hover:border-accent/50"
          >
            <div>
              <p className="font-medium text-ink">{run.name}</p>
              <p className="mt-0.5 font-mono text-xs text-ink-muted">
                {run.config.method} {run.config.route} · {run.config.endRps} RPS ·{" "}
                {run.config.durationSeconds}s
              </p>
            </div>
            <StatusBadge
              status={RUN_STATUS_MAP[run.status]}
              label={run.status}
            />
          </Link>
        ))}
      </div>
    </div>
  );
}