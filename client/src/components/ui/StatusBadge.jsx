const STATUS_STYLES = {
  green: "bg-status-green/10 text-status-green border-status-green/30",
  amber: "bg-status-amber/10 text-status-amber border-status-amber/30",
  red: "bg-status-red/10 text-status-red border-status-red/30",
  gray: "bg-status-gray/10 text-status-gray border-status-gray/30",
};

const STATUS_LABELS = {
  green: "Healthy",
  amber: "Degraded",
  red: "Critical",
  gray: "Unknown",
};

/*
 * Maps backend status values to the visual system.
 *
 * Backend uses: "red" | "yellow" | "green" | "unknown"
 * We normalize "yellow" -> "amber" and "unknown" -> "gray" here,
 * so every consumer of this component can just pass the raw
 * backend value straight through.
 */
function normalizeStatus(status) {
  if (status === "yellow") return "amber";
  if (status === "unknown" || !status) return "gray";
  return status;
}

export default function StatusBadge({ status, label, className = "" }) {
  const normalized = normalizeStatus(status);
  const style = STATUS_STYLES[normalized] || STATUS_STYLES.gray;
  const text = label || STATUS_LABELS[normalized];

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium uppercase tracking-wide ${style} ${className}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full bg-current`} />
      {text}
    </span>
  );
}