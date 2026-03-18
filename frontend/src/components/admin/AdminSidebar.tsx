import { Link, useLocation } from "react-router-dom";
import { LayoutDashboard, Users, Activity, HeartPulse, ArrowLeft } from "lucide-react";

const links = [
  { to: "/admin", label: "Overview", icon: LayoutDashboard },
  { to: "/admin/users", label: "Users", icon: Users },
  { to: "/admin/sessions", label: "Sessions", icon: Activity },
  { to: "/admin/health", label: "Health", icon: HeartPulse },
];

export default function AdminSidebar() {
  const location = useLocation();

  return (
    <aside className="flex flex-col border-r border-border bg-muted/50 w-60 shrink-0 min-h-screen">
      <div className="flex items-center gap-2 border-b border-border px-5 py-4">
        <div className="flex h-8 w-8 items-center justify-center rounded-button bg-primary">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" fill="hsl(var(--primary-foreground))" />
          </svg>
        </div>
        <div>
          <span className="font-display text-sm font-bold text-foreground">FocusSprint</span>
          <span className="block text-[10px] font-medium uppercase tracking-wider text-primary">Admin</span>
        </div>
      </div>

      <nav className="flex-1 space-y-1 px-3 py-4">
        {links.map((link) => {
          const isActive = location.pathname === link.to;
          return (
            <Link
              key={link.to}
              to={link.to}
              className={`flex items-center gap-3 rounded-button px-3 py-2 text-sm font-medium transition-colors ${
                isActive
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-secondary hover:text-foreground"
              }`}
            >
              <link.icon size={18} />
              {link.label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-border px-3 py-4">
        <Link
          to="/app"
          className="flex items-center gap-2 rounded-button px-3 py-2 text-sm text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors"
        >
          <ArrowLeft size={16} /> Back to App
        </Link>
      </div>
    </aside>
  );
}
