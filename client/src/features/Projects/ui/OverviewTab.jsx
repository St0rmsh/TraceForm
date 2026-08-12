import { useEffect } from "react";
import { useProjects } from "../hooks/useProjects";

export default function OverviewTab({ projectId }) {
  const { currentHealth, fetchProjectHealth } = useProjects();

  useEffect(() => {
    fetchProjectHealth(projectId);
    const interval = setInterval(() => fetchProjectHealth(projectId), 10000);
    return () => clearInterval(interval);
  }, [projectId, fetchProjectHealth]);

  const overall = currentHealth?.overall;
  const routes = currentHealth?.routes || [];

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard label="Error Rate" value={overall ? `${overall.errorRatePercent}%` : "--"} />
        <StatCard label="Avg Latency" value={overall ? `${overall.avgLatencyMs}ms` : "--"} />
        <StatCard label="Request Count" value={overall ? overall.requestCount : "--"} />
      </div>

      <div className="rounded-card border border-base-border bg-base-surface">
        <div className="border-b border-base-border px-5 py-4">
          <h3 className="font-medium text-ink">Per-Route Health</h3>
        </div>

        {routes.length === 0 ? (
          <p className="p-5 text-sm text-ink-muted">No recent traffic to show.</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-base-border text-left text-xs uppercase tracking-wide text-ink-faint">
                <th className="px-5 py-3">Route</th>
                <th className="px-5 py-3">Requests</th>
                <th className="px-5 py-3">Error Rate</th>
                <th className="px-5 py-3">Avg Latency</th>
              </tr>
            </thead>
            <tbody className="font-mono">
              {routes.map((route) => (
                <tr key={route.route} className="border-b border-base-border last:border-0">
                  <td className="px-5 py-3 text-ink">{route.route}</td>
                  <td className="px-5 py-3 text-ink-muted">{route.requestCount}</td>
                  <td
                    className={`px-5 py-3 ${
                      route.errorRatePercent > 0 ? "text-status-red" : "text-ink-muted"
                    }`}
                  >
                    {route.errorRatePercent}%
                  </td>
                  <td className="px-5 py-3 text-ink-muted">{route.avgLatencyMs}ms</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

function StatCard({ label, value }) {
  return (
    <div className="rounded-card border border-base-border bg-base-surface p-5">
      <p className="text-xs uppercase tracking-wide text-ink-faint">{label}</p>
      <p className="mt-2 font-mono text-2xl text-ink">{value}</p>
    </div>
  );
}