import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

import { useIncidents } from "../hooks/useIncidents";
import AppShell from "../../../components/ui/AppShell";
import Button from "../../../components/ui/Button";
import Card from "../../../components/ui/Card";
import StatusBadge from "../../../components/ui/StatusBadge";

const SEVERITY_MAP = {
  low: "gray",
  medium: "amber",
  high: "amber",
  critical: "red",
};

const TIMELINE_ICONS = {
  detected: "🔔",
  root_cause_analysis: "✨",
  ai_summary: "📄",
  investigating: "🔍",
  comment: "💬",
  update: "📝",
  resolved: "✅",
  reopened: "↩️",
  created: "🆕",
};

export default function IncidentDetail() {
  const { incidentId } = useParams();
  const navigate = useNavigate();

  const {
    current,
    isCurrentLoading,
    fetchIncident,
    analyzeRootCause,
    isAnalyzing,
    summarizeIncident,
    isSummarizing,
    addTimelineEntry,
    resolveIncident,
    reopenIncident,
  } = useIncidents();

  const [entryType, setEntryType] = useState("comment");
  const [entryMessage, setEntryMessage] = useState("");
  const [resolutionNotes, setResolutionNotes] = useState("");
  const [showResolveForm, setShowResolveForm] = useState(false);
  const [actionError, setActionError] = useState(null);

  useEffect(() => {
    fetchIncident(incidentId);
  }, [incidentId, fetchIncident]);

  if (isCurrentLoading || !current) {
    return (
      <AppShell>
        <div className="p-8 text-ink-muted">Loading...</div>
      </AppShell>
    );
  }

  async function handleAddEntry(e) {
    e.preventDefault();
    if (!entryMessage.trim()) return;
    await addTimelineEntry(incidentId, { event: entryType, message: entryMessage });
    setEntryMessage("");
  }

  async function handleResolve(e) {
    e.preventDefault();
    setActionError(null);
    try {
      await resolveIncident(incidentId, { resolutionNotes });
      setShowResolveForm(false);
      setResolutionNotes("");
    } catch (err) {
      setActionError(err.message);
    }
  }

  async function handleReopen() {
    await reopenIncident(incidentId);
  }

  async function handleAnalyze() {
    setActionError(null);
    try {
      await analyzeRootCause(incidentId);
    } catch (err) {
      setActionError(err.message);
    }
  }

  async function handleSummarize() {
    setActionError(null);
    try {
      await summarizeIncident(incidentId);
    } catch (err) {
      setActionError(err.message);
    }
  }

  return (
    <AppShell>
      <div className="mx-auto max-w-3xl p-8">
        <button
          onClick={() => navigate(-1)}
          className="mb-4 text-sm text-ink-muted hover:text-ink"
        >
          ← Back
        </button>

        <div className="mb-6 flex items-start justify-between gap-4">
          <div>
            <div className="mb-2 flex items-center gap-2">
              <StatusBadge status={SEVERITY_MAP[current.severity]} label={current.severity} />
              <span className="rounded-full border border-base-border px-2.5 py-1 text-xs capitalize text-ink-muted">
                {current.status}
              </span>
            </div>
            <h1 className="text-2xl font-semibold text-ink">{current.title}</h1>
            <p className="mt-1 text-sm text-ink-muted">{current.description}</p>
          </div>

          <div className="flex shrink-0 gap-2">
            {current.status !== "resolved" && (
              <Button variant="secondary" onClick={() => setShowResolveForm(true)}>
                Resolve
              </Button>
            )}
            {current.status === "resolved" && (
              <Button variant="secondary" onClick={handleReopen}>
                Reopen
              </Button>
            )}
          </div>
        </div>

        {actionError && (
          <div className="mb-4 rounded-card border border-status-red/30 bg-status-red/10 px-3.5 py-2.5 text-sm text-status-red">
            {actionError}
          </div>
        )}

        {showResolveForm && (
          <Card className="mb-6 flex flex-col gap-3">
            <h3 className="text-sm font-semibold text-ink">Resolve Incident</h3>
            <form onSubmit={handleResolve} className="flex flex-col gap-3">
              <textarea
                value={resolutionNotes}
                onChange={(e) => setResolutionNotes(e.target.value)}
                placeholder="What was done to resolve this?"
                required
                rows={3}
                className="rounded-card border border-base-border bg-base-raised px-3.5 py-2.5 text-sm text-ink outline-none focus:border-accent"
              />
              <div className="flex gap-2">
                <Button type="submit">Confirm Resolve</Button>
                <Button variant="ghost" type="button" onClick={() => setShowResolveForm(false)}>
                  Cancel
                </Button>
              </div>
            </form>
          </Card>
        )}

        {current.healthSnapshot && (
          <Card className="mb-4">
            <h3 className="mb-3 text-sm font-semibold text-ink">Health at Detection</h3>
            <div className="grid grid-cols-3 gap-4 font-mono text-sm">
              <div>
                <p className="text-xs uppercase text-ink-faint">Error Rate</p>
                <p className="mt-1 text-status-red">
                  {current.healthSnapshot.errorRatePercent}%
                </p>
              </div>
              <div>
                <p className="text-xs uppercase text-ink-faint">Avg Latency</p>
                <p className="mt-1 text-ink">{current.healthSnapshot.avgLatencyMs}ms</p>
              </div>
              <div>
                <p className="text-xs uppercase text-ink-faint">Request Count</p>
                <p className="mt-1 text-ink">{current.healthSnapshot.requestCount}</p>
              </div>
            </div>
          </Card>
        )}

        <Card className="mb-4 border-accent/30 bg-accent/5">
          <div className="mb-2 flex items-center justify-between">
            <h3 className="flex items-center gap-2 text-sm font-semibold text-accent-light">
              ✨ AI Root-Cause Analysis
            </h3>
            {!current.rootCauseAnalysis?.rootCause && (
              <Button onClick={handleAnalyze} disabled={isAnalyzing}>
                {isAnalyzing ? "Analyzing..." : "Run Analysis"}
              </Button>
            )}
          </div>
          {current.rootCauseAnalysis?.rootCause ? (
            <>
              <p className="text-sm text-ink">{current.rootCauseAnalysis.rootCause}</p>
              <div className="mt-3 flex items-center gap-2">
                <span className="text-xs uppercase tracking-wide text-ink-faint">Confidence:</span>
                <StatusBadge
                  status={
                    current.rootCauseAnalysis.confidence === "high"
                      ? "green"
                      : current.rootCauseAnalysis.confidence === "medium"
                        ? "amber"
                        : "gray"
                  }
                  label={current.rootCauseAnalysis.confidence}
                />
              </div>
              {current.rootCauseAnalysis.contributingFactors?.length > 0 && (
                <ul className="mt-3 list-inside list-disc text-sm text-ink-muted">
                  {current.rootCauseAnalysis.contributingFactors.map((factor, i) => (
                    <li key={i}>{factor}</li>
                  ))}
                </ul>
              )}
            </>
          ) : (
            <p className="text-sm text-ink-muted">Not yet analyzed.</p>
          )}
        </Card>

        <Card className="mb-6 border-accent/30 bg-accent/5">
          <div className="mb-2 flex items-center justify-between">
            <h3 className="flex items-center gap-2 text-sm font-semibold text-accent-light">
              📄 AI Incident Summary
            </h3>
            {!current.aiSummary?.summary && (
              <Button onClick={handleSummarize} disabled={isSummarizing}>
                {isSummarizing ? "Generating..." : "Generate Summary"}
              </Button>
            )}
          </div>
          {current.aiSummary?.summary ? (
            <>
              <p className="text-sm text-ink">{current.aiSummary.summary}</p>
              {current.aiSummary.runbookSteps?.length > 0 && (
                <ol className="mt-3 list-inside list-decimal text-sm text-ink-muted">
                  {current.aiSummary.runbookSteps.map((step, i) => (
                    <li key={i}>{step}</li>
                  ))}
                </ol>
              )}
            </>
          ) : (
            <p className="text-sm text-ink-muted">Not yet generated.</p>
          )}
        </Card>

        <h3 className="mb-3 text-sm font-semibold text-ink">Timeline</h3>
        <div className="mb-4 flex flex-col gap-3">
          {current.timeline.map((entry, i) => (
            <div key={i} className="flex gap-3 rounded-card border border-base-border bg-base-surface p-4">
              <span className="text-lg">{TIMELINE_ICONS[entry.event] || "•"}</span>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium uppercase tracking-wide text-ink-muted">
                    {entry.event.replace(/_/g, " ")}
                  </span>
                  <span className="font-mono text-xs text-ink-faint">
                    {new Date(entry.timestamp).toLocaleString()}
                  </span>
                </div>
                <p className="mt-1 text-sm text-ink">{entry.message}</p>
              </div>
            </div>
          ))}
        </div>

        <form onSubmit={handleAddEntry} className="flex flex-col gap-2 rounded-card border border-base-border bg-base-surface p-4">
          <div className="flex gap-2">
            <select
              value={entryType}
              onChange={(e) => setEntryType(e.target.value)}
              className="rounded-card border border-base-border bg-base-raised px-3 py-2 text-sm text-ink outline-none focus:border-accent"
            >
              <option value="comment">Comment</option>
              <option value="investigating">Investigating</option>
              <option value="update">Update</option>
            </select>
            <input
              value={entryMessage}
              onChange={(e) => setEntryMessage(e.target.value)}
              placeholder="Add a comment or update..."
              className="flex-1 rounded-card border border-base-border bg-base-raised px-3.5 py-2 text-sm text-ink outline-none focus:border-accent"
            />
            <Button type="submit">Post</Button>
          </div>
        </form>
      </div>
    </AppShell>
  );
}