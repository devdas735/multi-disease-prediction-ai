import { Link, useRouterState } from "@tanstack/react-router";
import {
  Activity,
  BarChart2,
  ClipboardList,
  Heart,
  Home,
  Menu,
  Upload,
  Users,
  X,
} from "lucide-react";
import { useState } from "react";

const navItems = [
  { to: "/", label: "Home", icon: Home, ocid: "nav.home.link" },
  {
    to: "/dashboard",
    label: "Patient Dashboard",
    icon: Users,
    ocid: "nav.dashboard.link",
  },
  {
    to: "/predict",
    label: "Disease Prediction",
    icon: Activity,
    ocid: "nav.predict.link",
  },
  {
    to: "/upload",
    label: "Data Upload",
    icon: Upload,
    ocid: "nav.upload.link",
  },
  {
    to: "/analytics",
    label: "Analytics",
    icon: BarChart2,
    ocid: "nav.analytics.link",
  },
  {
    to: "/results",
    label: "Results",
    icon: ClipboardList,
    ocid: "nav.results.link",
  },
];

export default function Layout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const routerState = useRouterState();
  const currentPath = routerState.location.pathname;

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      <div
        className="px-4 py-5 border-b"
        style={{ borderColor: "oklch(var(--sidebar-border))" }}
      >
        <div className="flex items-center gap-2.5">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{ background: "oklch(var(--sidebar-primary) / 0.2)" }}
          >
            <Heart
              className="w-4 h-4"
              style={{ color: "oklch(var(--sidebar-primary))" }}
            />
          </div>
          <div>
            <p
              className="font-display font-bold text-sm leading-none"
              style={{ color: "oklch(var(--sidebar-foreground))" }}
            >
              MediPredict
            </p>
            <p
              className="text-xs mt-0.5"
              style={{ color: "oklch(var(--sidebar-foreground) / 0.5)" }}
            >
              AI Health Analytics
            </p>
          </div>
        </div>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map(({ to, label, icon: Icon, ocid }) => {
          const isActive =
            to === "/" ? currentPath === "/" : currentPath.startsWith(to);
          return (
            <Link
              key={to}
              to={to}
              data-ocid={ocid}
              className={`sidebar-item ${isActive ? "active" : ""}`}
              onClick={() => setSidebarOpen(false)}
            >
              <Icon className="w-4 h-4 shrink-0" />
              <span>{label}</span>
            </Link>
          );
        })}
      </nav>

      <div
        className="px-4 py-4 border-t"
        style={{ borderColor: "oklch(var(--sidebar-border))" }}
      >
        <p
          className="text-xs"
          style={{ color: "oklch(var(--sidebar-foreground) / 0.4)" }}
        >
          © {new Date().getFullYear()}. Built with ❤ using{" "}
          <a
            href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:opacity-80"
          >
            caffeine.ai
          </a>
        </p>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen overflow-hidden">
      <aside
        className="hidden lg:flex flex-col w-60 shrink-0"
        style={{
          background: "oklch(var(--sidebar))",
          borderRight: "1px solid oklch(var(--sidebar-border))",
        }}
      >
        <SidebarContent />
      </aside>

      {sidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          {/* biome-ignore lint/a11y/useKeyWithClickEvents: overlay dismiss */}
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setSidebarOpen(false)}
          />
          <aside
            className="absolute left-0 top-0 h-full w-64 flex flex-col"
            style={{ background: "oklch(var(--sidebar))" }}
          >
            <div className="flex justify-end px-4 pt-4">
              <button
                type="button"
                onClick={() => setSidebarOpen(false)}
                style={{ color: "oklch(var(--sidebar-foreground))" }}
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <SidebarContent />
          </aside>
        </div>
      )}

      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="lg:hidden flex items-center justify-between px-4 py-3 bg-card border-b border-border">
          <button
            type="button"
            onClick={() => setSidebarOpen(true)}
            className="p-1"
          >
            <Menu className="w-5 h-5" />
          </button>
          <span className="font-display font-bold text-sm">MediPredict AI</span>
          <div className="w-7" />
        </header>
        <main className="flex-1 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
