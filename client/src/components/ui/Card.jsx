export default function Card({ children, className = "", ...props }) {
  return (
    <div
      className={`rounded-card border border-base-border bg-base-surface p-5 ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}