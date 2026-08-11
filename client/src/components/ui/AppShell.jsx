import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../../features/Auth/hooks/useAuth";

const NAV_ITEMS = [
  { to: "/dashboard", label: "Dashboard" },
  { to: "/projects", label: "Projects" },
  { to: "/incidents", label: "Incidents" },
];

export default function AppShell({ children }) {
  const { logout } = useAuth();
  const navigate = useNavigate();

  async function handleLogout() {
    await logout();
    navigate("/login");
  }

  return (
    <div className="flex min-h-screen bg-base">
      <aside className="flex w-64 flex-col justify-between border-r border-base-border bg-base-surface px-4 py-6">
        <div>
          <div className="mb-8 flex items-center gap-2 px-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-card border border-base-border text-accent-light">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="3" width="7" height="7" rx="1" />
                <rect x="14" y="3" width="7" height="7" rx="1" />
                <rect x="3" y="14" width="7" height="7" rx="1" />
                <rect x="14" y="14" width="7" height="7" rx="1" />
              </svg>
            </div>
            <span className="text-lg font-semibold text-ink">Traceform</span>
          </div>

          <nav className="flex flex-col gap-1">
            {NAV_ITEMS.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `rounded-card px-3 py-2 text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-accent/15 text-accent-light"
                      : "text-ink-muted hover:bg-base-raised hover:text-ink"
                  }`
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>
        </div>

        <button
          onClick={handleLogout}
          className="rounded-card px-3 py-2 text-left text-sm font-medium text-ink-muted transition-colors hover:bg-base-raised hover:text-ink"
        >
          Logout
        </button>
      </aside>

      <main className="flex-1 overflow-y-auto">{children}</main>
    </div>
  );
}