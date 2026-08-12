import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

import { useProjects } from "../hooks/useProjects";
import AppShell from "../../../components/ui/AppShell";
import StatusBadge from "../../../components/ui/StatusBadge";

import OverviewTab from "./OverviewTab";
import LiveTrafficTab from "./LiveTrafficTab";
import LoadTestsTab from "./LoadTestsTab";
import IncidentsTab from "./IncidentsTab";
import SettingsTab from "./SettingsTab";

const TABS = [
  { key: "overview", label: "Overview" },
  { key: "live", label: "Live Traffic" },
  { key: "loadTests", label: "Load Tests" },
  { key: "incidents", label: "Incidents" },
  { key: "settings", label: "Settings" },
];

export default function ProjectDetail() {
  const { projectId } = useParams();
  const { current, isCurrentLoading, fetchProject, currentHealth } = useProjects();
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    fetchProject(projectId);
  }, [projectId, fetchProject]);

  if (isCurrentLoading || !current) {
    return (
      <AppShell>
        <div className="p-8 text-ink-muted">Loading...</div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="p-8">
        <div className="mb-2 flex items-center gap-3">
          <h1 className="text-2xl font-semibold text-ink">{current.name}</h1>
          <StatusBadge status={currentHealth?.overall?.status} />
        </div>
        <p className="mb-6 font-mono text-sm text-ink-muted">{current.targetBaseUrl}</p>

        <div className="mb-6 flex gap-1 border-b border-base-border">
          {TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`border-b-2 px-4 py-2.5 text-sm font-medium transition-colors ${
                activeTab === tab.key
                  ? "border-accent text-ink"
                  : "border-transparent text-ink-muted hover:text-ink"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {activeTab === "overview" && <OverviewTab projectId={projectId} />}
        {activeTab === "live" && <LiveTrafficTab projectId={projectId} />}
        {activeTab === "loadTests" && <LoadTestsTab projectId={projectId} />}
        {activeTab === "incidents" && <IncidentsTab projectId={projectId} />}
        {activeTab === "settings" && <SettingsTab project={current} />}
      </div>
    </AppShell>
  );
}