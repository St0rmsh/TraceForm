import { useState } from "react";
import { useNavigate } from "react-router-dom";

import { useProjects } from "../hooks/useProjects";
import AppShell from "../../../components/ui/AppShell";
import Button from "../../../components/ui/Button";
import Input from "../../../components/ui/Input";
import Card from "../../../components/ui/Card";

const DEFAULTS = {
  name: "",
  description: "",
  targetBaseUrl: "",
  anomalyThresholds: { errorRatePercent: 5, latencyMs: 1000 },
  rateLimit: { enabled: false, requestsPerMinute: 100 },
};

export default function CreateProject() {
  const { createProject, isLoading } = useProjects();
  const navigate = useNavigate();

  const [form, setForm] = useState(DEFAULTS);
  const [error, setError] = useState(null);

  function handleField(e) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  function handleThreshold(field, value) {
    setForm((prev) => ({
      ...prev,
      anomalyThresholds: { ...prev.anomalyThresholds, [field]: Number(value) },
    }));
  }

  function handleRateLimit(field, value) {
    setForm((prev) => ({
      ...prev,
      rateLimit: { ...prev.rateLimit, [field]: value },
    }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);

    try {
      const project = await createProject(form);
      navigate(`/projects/${project.id}`);
    } catch (err) {
      setError(err.message || "Unable to create project");
    }
  }

  return (
    <AppShell>
      <div className="mx-auto max-w-2xl p-8">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-ink">New Project</h1>
            <p className="mt-1 text-sm text-ink-muted">
              Configure the target endpoint and baseline thresholds.
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="secondary" onClick={() => navigate(-1)}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={isLoading}>
              {isLoading ? "Creating..." : "+ Create Project"}
            </Button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <Card className="flex flex-col gap-4">
            <h2 className="text-sm font-semibold text-ink">Target Routing</h2>
            <Input
              label="Project Name"
              name="name"
              placeholder="e.g. core-auth-service"
              value={form.name}
              onChange={handleField}
              required
            />
            <Input
              label="Target Base URL"
              name="targetBaseUrl"
              placeholder="https://api.production.com"
              value={form.targetBaseUrl}
              onChange={handleField}
              required
            />
            <Input
              label="Description (optional)"
              name="description"
              placeholder="What does this service do?"
              value={form.description}
              onChange={handleField}
            />
          </Card>

          <Card className="flex flex-col gap-4">
            <h2 className="text-sm font-semibold text-ink">Anomaly Thresholds</h2>
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Max Error Rate (%)"
                type="number"
                min="0"
                max="100"
                value={form.anomalyThresholds.errorRatePercent}
                onChange={(e) => handleThreshold("errorRatePercent", e.target.value)}
              />
              <Input
                label="Latency Threshold (ms)"
                type="number"
                min="0"
                value={form.anomalyThresholds.latencyMs}
                onChange={(e) => handleThreshold("latencyMs", e.target.value)}
              />
            </div>
          </Card>

          <Card className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-ink">Rate Limiting</h2>
              <button
                type="button"
                onClick={() => handleRateLimit("enabled", !form.rateLimit.enabled)}
                className={`h-6 w-11 rounded-full transition-colors ${
                  form.rateLimit.enabled ? "bg-accent" : "bg-base-border"
                }`}
              >
                <span
                  className={`block h-5 w-5 rounded-full bg-white transition-transform ${
                    form.rateLimit.enabled ? "translate-x-5" : "translate-x-0.5"
                  }`}
                />
              </button>
            </div>
            <Input
              label="Requests Per Minute"
              type="number"
              min="1"
              disabled={!form.rateLimit.enabled}
              value={form.rateLimit.requestsPerMinute}
              onChange={(e) => handleRateLimit("requestsPerMinute", Number(e.target.value))}
            />
          </Card>

          {error && (
            <div className="rounded-card border border-status-red/30 bg-status-red/10 px-3.5 py-2.5 text-sm text-status-red">
              {error}
            </div>
          )}
        </form>
      </div>
    </AppShell>
  );
}