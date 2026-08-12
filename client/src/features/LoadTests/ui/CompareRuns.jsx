import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";

import { useLoadTests } from "../hooks/useLoadTests";
import AppShell from "../../../components/ui/AppShell";
import Card from "../../../components/ui/Card";
import Button from "../../../components/ui/Button";

const METRICS = [
  { key: "totalRequests", label: "Total Requests" },
  { key: "successCount", label: "Success Count" },
  { key: "errorCount", label: "Error Count" },
  { key: "avgLatencyMs", label: "Avg Latency (ms)" },
  { key: "p95LatencyMs", label: "P95 Latency (ms)" },
  { key: "p99LatencyMs", label: "P99 Latency (ms)" },
  { key: "maxLatencyMs", label: "Max Latency (ms)" },
  { key: "throughputRps", label: "Throughput (rps)" },
];

export default function CompareRuns() {
  const [searchParams] = useSearchParams();
  const initialBaseline = searchParams.get("baselineRunId") || "";

  const { comparison, isComparisonLoading, compareLoadTests, resetComparison } = useLoadTests();

  const [baselineId, setBaselineId] = useState(initialBaseline);
  const [comparisonId, setComparisonId] = useState("");
  const [error, setError] = useState(null);

  useEffect(() => {
    return () => resetComparison();
  }, [resetComparison]);

  async function handleCompare(e) {
    e.preventDefault();
    setError(null);
    try {
      await compareLoadTests(baselineId, comparisonId);
    } catch (err) {
      setError(err.message || "Unable to compare runs");
    }
  }

  return (
    <AppShell>
      <div className="mx-auto max-w-3xl p-8">
        <h1 className="mb-6 text-2xl font-semibold text-ink">Compare Runs</h1>

        <form onSubmit={handleCompare} className="mb-6 flex items-end gap-3">
          <div className="flex-1">
            <label className="mb-1.5 block text-xs uppercase tracking-wide text-ink-muted">
              Baseline Run ID
            </label>
            <input
              value={baselineId}
              onChange={(e) => setBaselineId(e.target.value)}
              className="w-full rounded-card border border-base-border bg-base-surface px-3.5 py-2.5 font-mono text-sm text-ink outline-none focus:border-accent"
              placeholder="Baseline run ID"
              required
            />
          </div>
          <div className="flex-1">
            <label className="mb-1.5 block text-xs uppercase tracking-wide text-ink-muted">
              Comparison Run ID
            </label>
            <input
              value={comparisonId}
              onChange={(e) => setComparisonId(e.target.value)}
              className="w-full rounded-card border border-base-border bg-base-surface px-3.5 py-2.5 font-mono text-sm text-ink outline-none focus:border-accent"
              placeholder="Comparison run ID"
              required
            />
          </div>
          <Button type="submit" disabled={isComparisonLoading}>
            {isComparisonLoading ? "Comparing..." : "Compare"}
          </Button>
        </form>

        {error && (
          <div className="mb-6 rounded-card border border-status-red/30 bg-status-red/10 px-3.5 py-2.5 text-sm text-status-red">
            {error}
          </div>
        )}

        {comparison && (
          <Card>
            <div className="mb-4 grid grid-cols-3 gap-4 border-b border-base-border pb-4">
              <div />
              <div className="font-medium text-ink">{comparison.baseline.name}</div>
              <div className="font-medium text-ink">{comparison.comparison.name}</div>
            </div>

            {METRICS.map((metric) => {
              const delta = comparison.deltas[metric.key];
              return (
                <div
                  key={metric.key}
                  className="grid grid-cols-3 gap-4 border-b border-base-border py-3 font-mono text-sm last:border-0"
                >
                  <div className="text-ink-muted">{metric.label}</div>
                  <div className="text-ink">{comparison.baseline.results[metric.key]}</div>
                  <div className="flex items-center gap-2">
                    <span className="text-ink">{comparison.comparison.results[metric.key]}</span>
                    {delta && (
                      <span
                        className={
                          delta.delta > 0
                            ? "text-status-amber"
                            : delta.delta < 0
                              ? "text-status-green"
                              : "text-ink-faint"
                        }
                      >
                        ({delta.delta > 0 ? "+" : ""}
                        {delta.delta}
                        {delta.percentChange !== null && ` / ${delta.percentChange}%`})
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </Card>
        )}
      </div>
    </AppShell>
  );
}