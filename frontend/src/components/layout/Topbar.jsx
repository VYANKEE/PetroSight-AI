import { Link, useLocation } from "react-router-dom";
import { RiMoonClearLine, RiNotification3Line, RiSunLine, RiUser3Line } from "react-icons/ri";

import { useTheme } from "../../hooks/useTheme.jsx";

const titles = {
  "/app/dashboard": "Executive Dashboard",
  "/app/history": "Historical Demand Explorer",
  "/app/forecast": "Forecast Studio",
  "/app/how-it-works": "Model Pipeline",
  "/app/chatbot": "AI Analytics Copilot",
};

export default function Topbar() {
  const location = useLocation();
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="glass-panel sticky top-0 z-20 rounded-[2rem] px-6 py-4">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="section-label mb-2">SaaS Platform</p>
          <h2 className="card-title text-2xl font-semibold text-white">
            {titles[location.pathname] || "Petroleum Forecast Platform"}
          </h2>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/"
            className="rounded-2xl border border-white/10 px-4 py-2 text-sm text-slate-300 transition hover:border-emerald-400/30 hover:text-white"
          >
            Landing
          </Link>
          <button
            type="button"
            onClick={toggleTheme}
            className="rounded-2xl border border-white/10 p-3 text-slate-200 transition hover:border-cyan-400/30 hover:text-white"
            aria-label="Toggle theme"
          >
            {theme === "dark" ? <RiSunLine /> : <RiMoonClearLine />}
          </button>
          <button
            type="button"
            className="rounded-2xl border border-white/10 p-3 text-slate-200 transition hover:border-cyan-400/30 hover:text-white"
            aria-label="Notifications"
          >
            <RiNotification3Line />
          </button>
          <div className="flex items-center gap-3 rounded-2xl border border-white/10 px-4 py-2">
            <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white/10 text-lg text-white">
              <RiUser3Line />
            </span>
            <div className="hidden text-left md:block">
              <p className="text-sm font-semibold text-white">Strategy User</p>
              <p className="text-xs text-slate-400">Industrial analytics</p>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
