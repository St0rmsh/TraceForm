import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

import { useLoadTests } from "../hooks/useLoadTests";
import AppShell from "../../../components/ui/AppShell";
import Button from "../../../components/ui/Button";
import Input from "../../../components/ui/Input";
import Card from "../../../components/ui/Card";

const DEFAULTS = {
  name: "",
  config: {
    route: "",
    method: "GET",
    endRps: 10,
    durationSeconds: 30,
    concurrency: 2,
  },
  chaos: {
    extraLatencyMs: 0,
    errorRatePercent: 0,
    dependencyDown: false,
  },
};

const METHODS = ["GET", "POST", "PUT", "PATCH", "DELETE"];

export default function NewLoadTest() {
  const { projectId } = useParams();
  const { createLoadTest, isLoading } = useLoadTests();
  const navigate = useNavigate();

  const [form, setForm] = useState(DEFAULTS);
  const [chaosEnabled, setChaosEnabled] = useState(false);
  const [error, setError] = useState(null);

  function handleConfigField(field, value) {
    setForm((prev) => ({ ...prev, config: { ...prev.config, [field]: value } }));
  }

  function handleChaosField(field, value) {
    setForm((prev) => ({ ...prev, chaos: { ...prev.chaos, [field]: value } }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);

    const payload = {
      name: form.name,
      config: form.config,
      ...(chaosEnabled ? { chaos: form.chaos } : {}),
    };

    try {
      const run = await createLoadTest(projectId, payload);
      navigate(`/load-tests/${run.id}`);
    } catch (err) {
      setError(err.message || "Unable to create load test");
    }
  }

  return (
    <AppShell>
      <div className="mx-auto max-w-2xl p-8">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-ink">New Load Test</h1>
            <p className="mt-1 text-sm text-ink-muted">
              Configure the target route, load pattern, and optional chaos conditions.
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="secondary" onClick={() => navigate(-1)}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={isLoading}>
              {isLoading ? "Creating..." : "Create"}
            </Button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <Card className="flex flex-col gap-4">
            <Input
              label="Test Name"
              placeholder="e.g. API Stress Test"
              value={form.name}
              onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
              required
            />

            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium uppercase tracking-wide text-ink-muted">
                  Method
                </label>
                <select
                  value={form.config.method}
                  onChange={(e) => handleConfigField("method", e.target.value)}
                  className="rounded-card border border-base-border bg-base-surface px-3.5 py-2.5 text-sm text-ink outline-none focus:border-accent"
                >
                  {METHODS.map((m) => (
                    <option key={m} value={m}>
                      {m}
                    </option>
                  ))}
                </select>
              </div>
              <Input
                label="Target Route"
                placeholder="/api/products"
                value={form.config.route}
                onChange={(e) => handleConfigField("route", e.target.value)}
                required
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <Input
                label="Target RPS"
                type="number"
                min="1"
                value={form.config.endRps}
                onChange={(e) => handleConfigField("endRps", Number(e.target.value))}
              />
              <Input
                label="Duration (s)"
                type="number"
                min="5"
                max="600"
                value={form.config.durationSeconds}
                onChange={(e) => handleConfigField("durationSeconds", Number(e.target.value))}
              />
              <Input
                label="Concurrency"
                type="number"
                min="1"
                max="10"
                value={form.config.concurrency}
                onChange={(e) => handleConfigField("concurrency", Number(e.target.value))}
              />
            </div>
            <p className="text-xs text-ink-faint">
              Concurrency maps to real parallel Kubernetes pods, capped at 10.
            </p>
          </Card>

          <Card className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-status-amber">⚠ Chaos Injection</h2>
              <button
                type="button"
                onClick={() => setChaosEnabled((prev) => !prev)}
                className={`h-6 w-11 rounded-full transition-colors ${
                  chaosEnabled ? "bg-status-amber" : "bg-base-border"
                }`}
              >
                <span
                  className={`block h-5 w-5 rounded-full bg-white transition-transform ${
                    chaosEnabled ? "translate-x-5" : "translate-x-0.5"
                  }`}
                />
              </button>
            </div>

            {chaosEnabled && (
              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Extra Latency (ms)"
                  type="number"
                  min="0"
                  value={form.chaos.extraLatencyMs}
                  onChange={(e) => handleChaosField("extraLatencyMs", Number(e.target.value))}
                />
                <Input
                  label="Error Rate (%)"
                  type="number"
                  min="0"
                  max="100"
                  value={form.chaos.errorRatePercent}
                  onChange={(e) => handleChaosField("errorRatePercent", Number(e.target.value))}
                />
              </div>
            )}
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