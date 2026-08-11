export default function Input({ label, error, className = "", id, ...props }) {
  const inputId = id || props.name;

  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label htmlFor={inputId} className="text-xs font-medium uppercase tracking-wide text-ink-muted">
          {label}
        </label>
      )}
      <input
        id={inputId}
        className={`rounded-card border bg-base-surface px-3.5 py-2.5 text-sm text-ink placeholder:text-ink-faint outline-none transition-colors focus:border-accent ${
          error ? "border-status-red" : "border-base-border"
        } ${className}`}
        {...props}
      />
      {error && <span className="text-xs text-status-red">{error}</span>}
    </div>
  );
}