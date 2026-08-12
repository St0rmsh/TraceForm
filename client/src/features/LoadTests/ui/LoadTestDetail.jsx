import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

import { useLoadTests } from "../hooks/useLoadTests";
import AppShell from "../../../components/ui/AppShell";
import Button from "../../../components/ui/Button";
import Card from "../../../components/ui/Card";
import StatusBadge from "../../../components/ui/StatusBadge";

const RUN_STATUS_MAP = {
  pending: "gray",
  queued: "gray",
  running: "amber",
  completed: "green",
  failed: "red",
  cancelled: "gray",
};

const ACTIVE_STATUSES = ["queued", "running"];

export default function LoadTestDetail() {
  const { runId } = useParams();
  const navigate = useNavigate();
  const {
    current,
    isCurrentLoading,
    fetchLoadTest,
    startLoadTest,
    liveProgress,
    fetchLiveProgress,
  } = useLoadTests();

  const [isStarting, setIsStarting] = useState(false);

  useEffect(() => {
    fetchLoadTest(runId);
  }, [runId, fetchLoadTest]);

  // poll while the run is active — both the run's own status (to detect
  // completion) and its live progress snapshot
  useEffect(() => {
    if (!current || !ACTIVE_STATUSES.includes(current.status)) return;

    const interval = setInterval(() => {
      fetchLoadTest(runId);
      fetchLiveProgress(runId);
    }, 2000);

    return () => clearInterval(interval);
  }, [current, runId, fetchLoadTest, fetchLiveProgress]);

  if (isCurrentLoading || !current) {
    return (
      <AppShell>
        <div className="p-8 text-ink-muted">Loading...</div>
      </AppShell>
    );
  }

  async function handleStart() {
    setIsStarting(true);
    try {
      await startLoadTest(runId);
      await fetchLoadTest(runId);
    } finally {
      setIsStarting(false);
    }
  }

  return (
    <AppShell>
      <div className="mx-auto max-w-3xl p-8">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-semibold text-ink">{current.name}</h1>
              <StatusBadge status={RUN_STATUS_MAP[current.status]} label={current.status} />
            </div>
            <p className="mt-1 font-mono text-sm text-ink-muted">
              {current.config.method} {current.config.route} · target {current.config.endRps}{" "}
              RPS · {current.config.durationSeconds}s · {current.config.concurrency} pods
            </p>
          </div>

          {current.status === "completed" && (
            <Button
              variant="secondary"
              onClick={() => navigate(`/load-tests/compare?baselineRunId=${runId}`)}
            >
              Compare
            </Button>
          )}
        </div>

        {current.status === "pending" && (
          <Card>
            <p className="mb-4 text-sm text-ink-muted">
              This run hasn't been started yet. Starting it spins up{" "}
              {current.config.concurrency} Kubernetes pod(s) to generate load.
            </p>
            <Button onClick={handleStart} disabled={isStarting}>
              {isStarting ? "Starting..." : "Start Run"}
            </Button>
          </Card>
        )}

        {ACTIVE_STATUSES.includes(current.status) && (
          <Card className="border-status-amber/30">
            <div className="mb-4 flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-status-amber animate-pulse-live" />
              <h3 className="font-medium text-ink">Live Progress</h3>
            </div>
            {liveProgress ? (
              <div className="grid grid-cols-3 gap-4 font-mono">
                <StatBlock label="Active Pods" value={liveProgress.activePods} />
                <StatBlock label="Requests So Far" value={liveProgress.totalRequestsSoFar} />
                <StatBlock label="Elapsed" value={`${liveProgress.elapsedSeconds}s`} />
              </div>
            ) : (
              <p className="text-sm text-ink-muted">Waiting for pods to report in...</p>
            )}
          </Card>
        )}

        {current.status === "completed" && current.results && (
          <div className="flex flex-col gap-4">
            {current.aiAnalysis && (
              <Card className="border-accent/30 bg-accent/5">
                <div className="mb-2 flex items-center gap-2">
                  <span className="text-accent-light">✨</span>
                  <h3 className="text-sm font-semibold text-accent-light">
                    AI Bottleneck Analysis
                  </h3>
                </div>
                <p className="text-sm text-ink">{current.aiAnalysis}</p>
              </Card>
            )}

            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              <StatCard label="Total Requests" value={current.results.totalRequests} />
              <StatCard
                label="Success / Error"
                value={`${current.results.successCount} / ${current.results.errorCount}`}
              />
              <StatCard label="Avg Latency" value={`${current.results.avgLatencyMs}ms`} />
              <StatCard label="Throughput" value={`${current.results.throughputRps} rps`} />
              <StatCard label="P95 Latency" value={`${current.results.p95LatencyMs}ms`} />
              <StatCard label="P99 Latency" value={`${current.results.p99LatencyMs}ms`} />
              <StatCard label="Max Latency" value={`${current.results.maxLatencyMs}ms`} />
            </div>
          </div>
        )}

        {current.status === "failed" && (
          <Card className="border-status-red/30 bg-status-red/5">
            <p className="text-sm text-status-red">
              This run failed or timed out before completing. Check your API server and gateway
              logs for details.
            </p>
          </Card>
        )}
      </div>
    </AppShell>
  );
}

function StatCard({ label, value }) {
  return (
    <div className="rounded-card border border-base-border bg-base-surface p-4">
      <p className="text-xs uppercase tracking-wide text-ink-faint">{label}</p>
      <p className="mt-1.5 font-mono text-lg text-ink">{value}</p>
    </div>
  );
}

function StatBlock({ label, value }) {
  return (
    <div>
      <p className="text-xs uppercase tracking-wide text-ink-faint">{label}</p>
      <p className="mt-1 text-lg text-ink">{value}</p>
    </div>
  );
}