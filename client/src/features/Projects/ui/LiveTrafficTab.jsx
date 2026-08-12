import { useLiveTraffic } from "../hooks/useLiveTraffic";
import Button from "../../../components/ui/Button";

const METHOD_COLORS = {
  GET: "text-status-green",
  POST: "text-accent-light",
  PUT: "text-status-amber",
  PATCH: "text-status-amber",
  DELETE: "text-status-red",
};

export default function LiveTrafficTab({ projectId }) {
  const { requests, isConnected, isPaused, togglePause, clear } = useLiveTraffic(projectId);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span
            className={`h-2 w-2 rounded-full ${
              isConnected ? "bg-status-green animate-pulse-live" : "bg-status-gray"
            }`}
          />
          <span className="text-sm text-ink-muted">
            {isConnected ? "Live" : "Connecting..."}
          </span>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={clear}>
            Clear
          </Button>
          <Button variant="secondary" onClick={togglePause}>
            {isPaused ? "Resume" : "Pause"}
          </Button>
        </div>
      </div>

      <div className="max-h-[600px] overflow-y-auto rounded-card border border-base-border bg-base-surface font-mono text-sm">
        {requests.length === 0 ? (
          <p className="p-5 text-ink-muted">Waiting for traffic...</p>
        ) : (
          requests.map((req, i) => (
            <div
              key={`${req.timestamp}-${i}`}
              className="flex items-center gap-4 border-b border-base-border px-4 py-2.5 last:border-0"
            >
              <span className={`w-14 shrink-0 ${METHOD_COLORS[req.method] || "text-ink"}`}>
                {req.method}
              </span>
              <span className="flex-1 truncate text-ink">{req.path}</span>
              <span
                className={
                  req.statusCode >= 500
                    ? "text-status-red"
                    : req.statusCode >= 400
                      ? "text-status-amber"
                      : "text-status-green"
                }
              >
                {req.statusCode}
              </span>
              <span className="w-16 text-right text-ink-muted">{req.latencyMs}ms</span>
              <span className="w-20 shrink-0 text-right text-ink-faint">
                {new Date(req.timestamp).toLocaleTimeString()}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}