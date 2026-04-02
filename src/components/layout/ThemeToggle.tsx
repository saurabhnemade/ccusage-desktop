import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";

type Theme = "light" | "dark" | "system";

function getSystemTheme(): "light" | "dark" {
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

export function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>(() => {
    return (localStorage.getItem("theme") as Theme) || "system";
  });

  useEffect(() => {
    const resolved = theme === "system" ? getSystemTheme() : theme;
    document.documentElement.classList.toggle("dark", resolved === "dark");
    localStorage.setItem("theme", theme);
  }, [theme]);

  useEffect(() => {
    if (theme !== "system") return;
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const handler = () => {
      document.documentElement.classList.toggle("dark", mq.matches);
    };
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, [theme]);

  const cycle = () => {
    setTheme((prev) => {
      if (prev === "system") return "light";
      if (prev === "light") return "dark";
      return "system";
    });
  };

  const resolved = theme === "system" ? getSystemTheme() : theme;

  return (
    <button
      onClick={cycle}
      className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
      title={`Theme: ${theme}`}
    >
      {resolved === "dark" ? <Moon size={16} /> : <Sun size={16} />}
      <span className="capitalize">{theme}</span>
    </button>
  );
}
