import { NavLink } from "react-router-dom";
import {
  RiBarChartBoxLine,
  RiChatSmile3Line,
  RiCompassDiscoverLine,
  RiDatabase2Line,
  RiFlashlightLine,
} from "react-icons/ri";

const items = [
  { to: "/app/dashboard", label: "Dashboard", icon: RiBarChartBoxLine },
  { to: "/app/history", label: "History", icon: RiDatabase2Line },
  { to: "/app/forecast", label: "Forecast", icon: RiCompassDiscoverLine },
  { to: "/app/how-it-works", label: "How It Works", icon: RiFlashlightLine },
  { to: "/app/chatbot", label: "Chatbot", icon: RiChatSmile3Line },
];

export default function Sidebar() {
  return (
    <aside className="glass-panel hidden w-72 shrink-0 rounded-[2rem] p-6 lg:flex lg:flex-col">
      <div className="mb-8">
        <p className="section-label mb-4">Forecast OS</p>
        <h1 className="card-title text-2xl font-bold text-white">PetroSight AI</h1>
        <p className="mt-2 text-sm text-slate-400">
          Industrial demand forecasting for petroleum strategy teams.
        </p>
      </div>

      <nav className="space-y-3">
        {items.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition ${
                isActive
                  ? "bg-white/10 text-white shadow-neon"
                  : "text-slate-400 hover:bg-white/5 hover:text-white"
              }`
            }
          >
            <Icon className="text-lg" />
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="glass-panel mt-auto rounded-3xl p-5">
        <p className="text-sm font-semibold text-white">Model Status</p>
        <div className="mt-3 flex items-center gap-3 text-sm text-slate-400">
          <span className="pulse-dot inline-flex h-3 w-3 rounded-full bg-emerald-400" />
          Live forecast engine ready
        </div>
      </div>
    </aside>
  );
}
