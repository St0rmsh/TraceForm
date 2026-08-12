import { useState, useEffect } from "react";
import { useProjects } from "../hooks/useProjects";
import Button from "../../../components/ui/Button";
import Input from "../../../components/ui/Input";
import Card from "../../../components/ui/Card";

export default function SettingsTab({ project }) {
  const { updateProject, deleteProject, regenerateApiKey, lastRegeneratedKey, clearKey } =
    useProjects();

  const [form, setForm] = useState({
    name: project.name,
    description: project.description || "",
    targetBaseUrl: project.targetBaseUrl,
    anomalyThresholds: { ...project.anomalyThresholds },
    rateLimit: { ...project.rateLimit },
  });
  const [saveStatus, setSaveStatus] = useState(null);
  const [showKey, setShowKey] = useState(false);

  useEffect(() => {
    return () => clearKey(); // don't leak a regenerated key across unmounts
  }, [clearKey]);

  function handleField(e) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function handleSave() {
    setSaveStatus("saving");
    try {
      await updateProject(project.id, form);
      setSaveStatus("saved");
      setTimeout(() => setSaveStatus(null), 2000);
    } catch {
      setSaveStatus("error");
    }
  }

  async function handleRegenerateKey() {
    if (!confirm("Regenerating invalidates the old API key immediately. Continue?")) return;
    await regenerateApiKey(project.id);
    setShowKey(true);
  }

  async function handleDelete() {
    if (!confirm(`Delete "${project.name}"? This cannot be undone.`)) return;
    await deleteProject(project.id);
    window.location.href = "/dashboard";
  }

  return (
    <div className="flex flex-col gap-5">
      <Card className="flex flex-col gap-4">
        <h3 className="text-sm font-semibold text-ink">General</h3>
        <Input label="Project Name" name="name" value={form.name} onChange={handleField} />
        <Input
          label="Target Base URL"
          name="targetBaseUrl"
          value={form.targetBaseUrl}
          onChange={handleField}
        />
        <Input
          label="Description"
          name="description"
          value={form.description}
          onChange={handleField}
        />
        <Button onClick={handleSave} className="w-fit">
          {saveStatus === "saving" ? "Saving..." : saveStatus === "saved" ? "Saved ✓" : "Save Changes"}
        </Button>
      </Card>

      <Card className="flex flex-col gap-3">
        <h3 className="text-sm font-semibold text-ink">API Key</h3>
        <p className="text-sm text-ink-muted">
          Used by the gateway to identify this project via the <code>x-api-key</code> header.
        </p>
        {lastRegeneratedKey && showKey && (
          <div className="rounded-card border border-status-amber/30 bg-status-amber/10 p-3 font-mono text-sm text-status-amber">
            {lastRegeneratedKey}
            <p className="mt-1 font-sans text-xs text-ink-muted">
              Copy this now — it won't be shown again.
            </p>
          </div>
        )}
        <Button variant="secondary" onClick={handleRegenerateKey} className="w-fit">
          Regenerate API Key
        </Button>
      </Card>

      <Card className="flex flex-col gap-3 border-status-red/30">
        <h3 className="text-sm font-semibold text-status-red">Danger Zone</h3>
        <p className="text-sm text-ink-muted">Permanently delete this project and all its data.</p>
        <Button variant="danger" onClick={handleDelete} className="w-fit">
          Delete Project
        </Button>
      </Card>
    </div>
  );
}