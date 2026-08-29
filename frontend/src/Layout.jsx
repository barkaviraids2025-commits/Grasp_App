import { useEffect, useState } from "react";
import { NavLink, Outlet, useNavigate, Link } from "react-router-dom";
import { api, clearToken } from "./api";
import DailyPuzzle from "./games/DailyPuzzle";

const links = [
  { label: "Dashboard", to: "/dashboard", icon: "📊" },
  { label: "Upload Source", to: "/upload", icon: "📄" },
  { label: "My Courses", to: "/courses", icon: "📚" },
  { label: "Progress", to: "/progress", icon: "📈" },
  { label: "Badges", to: "/badges", icon: "🏅" },
  { label: "Leaderboard", to: "/leaderboard", icon: "🏆" },
  { label: "Focus Lab", to: "/focus", icon: "🧠" },
  { label: "Profile", to: "/profile", icon: "👤" },
];

export default function Layout() {
  const [me, setMe] = useState(null);
  const [open, setOpen] = useState(false);
  const nav = useNavigate();

  useEffect(() => {
    api("/api/me")
      .then(setMe)
      .catch(() => nav("/login"));
  }, [nav]);

  function logout() {
    clearToken();
    nav("/");
  }

  const name = me?.user?.name || "Learner";
  const user = me?.user || {};

  return (
    <div className="grasp-page min-h-screen lg:grid lg:grid-cols-[260px_1fr_320px]">
      {/* Mobile Top Navbar */}
      <header className="lg:hidden flex items-center justify-between px-5 py-4 bg-white/80 backdrop-blur-md border-b border-border sticky top-0 z-30">
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="text-sm font-semibold text-textMain px-3 py-1.5 rounded-lg bg-surfaceSoft"
        >
          ☰ Menu
        </button>
        <Link to="/dashboard" className="logo text-xl">
          <span>Concepta</span>
        </Link>
        <button
          type="button"
          onClick={logout}
          className="text-xs font-semibold text-textSoft hover:text-primary"
        >
          Sign Out
        </button>
      </header>

      {/* Mobile Backdrop */}
      {open && (
        <div
          className="fixed inset-0 bg-textMain/30 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Left Sidebar Navigation */}
      <aside
        className={`fixed lg:static z-50 inset-y-0 left-0 w-64 bg-white/90 backdrop-blur-xl border-r border-border p-6 flex flex-col justify-between transition-transform duration-300 ${
          open ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        <div className="space-y-6">
          <Link to="/dashboard" className="logo block">
            <span>Concepta</span>
            <p className="text-[11px] font-normal text-textSoft tracking-normal mt-0.5">
              AI Personal Learning Coach
            </p>
          </Link>

          {/* User mini badge */}
          <div className="p-3.5 bg-surfaceSoft rounded-xl flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-primary text-white font-bold text-sm flex items-center justify-center shadow-sm">
              {name.charAt(0).toUpperCase()}
            </div>
            <div className="overflow-hidden">
              <p className="font-bold text-xs text-textMain truncate">{name}</p>
              <p className="text-[11px] text-textSoft">Level {user.level || 1} • {user.xp || 0} XP</p>
            </div>
          </div>

          <nav className="flex flex-col gap-1">
            {links.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={() => setOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-xs font-semibold transition-all ${
                    isActive
                      ? "bg-primary text-white shadow-sm font-bold scale-[1.02]"
                      : "text-textSoft hover:bg-surfaceSoft hover:text-textMain"
                  }`
                }
              >
                <span>{item.icon}</span>
                <span>{item.label}</span>
              </NavLink>
            ))}
          </nav>
        </div>

        <div className="pt-4 border-t border-border">
          <button
            type="button"
            onClick={logout}
            className="w-full text-left px-3 py-2 text-xs font-semibold text-textSoft hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors flex items-center gap-2"
          >
            <span>🚪</span>
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="p-5 sm:p-8 min-w-0 max-w-5xl mx-auto w-full relative z-10">
        <Outlet context={{ me, setMe, refresh: () => api("/api/me").then(setMe) }} />
      </main>

      {/* Right Sidebar: Daily Brain Puzzle & Focus Meter */}
      <aside className="hidden xl:flex flex-col gap-6 p-6 border-l border-border bg-white/60 backdrop-blur-md">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-xl">🧠</span>
            <h3 className="font-extrabold text-base text-textMain">Daily Brain Puzzle</h3>
          </div>
          <p className="text-xs text-textSoft leading-relaxed">
            Quick 2-minute cognitive warm-up to calibrate attention and focus before studying.
          </p>
        </div>

        <DailyPuzzle onPlayed={() => api("/api/me").then(setMe)} />

        {/* Observed focus stats card */}
        <div className="card p-4 space-y-2 bg-gradient-to-br from-white to-surfaceSoft">
          <p className="text-xs uppercase font-bold text-textSoft tracking-wider">Focus Window</p>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-extrabold text-primary">
              {me?.session?.session_minutes || 30} min
            </span>
            <span className="text-xs text-textSoft font-medium">
              +{me?.session?.break_minutes || 5} min pause
            </span>
          </div>
          <p className="text-[11px] text-textSoft leading-normal">
            Calibrated based on your observed puzzle reactions & onboarding answers.
          </p>
        </div>
      </aside>
    </div>
  );
}
