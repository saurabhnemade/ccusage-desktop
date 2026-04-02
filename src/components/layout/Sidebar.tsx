import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  Calendar,
  CalendarRange,
  CalendarDays,
  MessageSquare,
} from "lucide-react";
import { ThemeToggle } from "./ThemeToggle";
import { cn } from "@/lib/utils";

const navItems = [
  { to: "/", icon: LayoutDashboard, label: "Overview" },
  { to: "/daily", icon: Calendar, label: "Daily" },
  { to: "/weekly", icon: CalendarRange, label: "Weekly" },
  { to: "/monthly", icon: CalendarDays, label: "Monthly" },
  { to: "/sessions", icon: MessageSquare, label: "Sessions" },
];

export function Sidebar() {
  return (
    <aside className="flex h-screen w-56 flex-col border-r border-border bg-card">
      <div className="flex items-center gap-2 px-5 py-5">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold text-sm">
          cc
        </div>
        <span className="text-lg font-semibold text-foreground">ccusage</span>
      </div>

      <nav className="flex-1 space-y-1 px-3 py-2">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === "/"}
            className={({ isActive }) =>
              cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                isActive
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )
            }
          >
            <item.icon size={18} />
            {item.label}
          </NavLink>
        ))}
      </nav>

      <div className="border-t border-border px-3 py-3">
        <ThemeToggle />
      </div>
    </aside>
  );
}
