const VARIANTS = {
  primary: "bg-accent hover:bg-accent-light text-white",
  secondary: "bg-base-raised hover:bg-base-border text-ink border border-base-border",
  ghost: "hover:bg-base-surface text-ink-muted hover:text-ink",
  danger: "bg-status-red/10 hover:bg-status-red/20 text-status-red border border-status-red/30",
};

export default function Button({
  children,
  variant = "primary",
  className = "",
  disabled = false,
  type = "button",
  ...props
}) {
  return (
    <button
      type={type}
      disabled={disabled}
      className={`inline-flex items-center justify-center gap-2 rounded-card px-4 py-2.5 text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${VARIANTS[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}