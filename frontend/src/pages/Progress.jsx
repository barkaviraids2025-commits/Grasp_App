import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api";

export default function Progress() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api("/api/progress")
      .then(setData)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <div className="card p-10 text-center text-textSoft">Loading learning progress...</div>;
  }

  const xp = data?.xp || 0;
  const level = data?.level || 1;
  const title = data?.title || "Consistent Learner";
  const topicsCompleted = data?.topics_completed || 0;
  const conceptsMastered = data?.concepts_mastered || 0;
  const badges = data?.badges || [];

  const currentLevelXp = (level - 1) * 200;
  const nextLevelXp = level * 200;
  const xpInCurrentLevel = xp - currentLevelXp;
  const levelProgress = Math.min(100, Math.max(0, Math.round((xpInCurrentLevel / 200) * 100)));

  return (
    <div className="space-y-8 max-w-4xl pb-16">
      <div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-textMain tracking-tight">Learning Progress & Mastery</h1>
        <p className="text-textSoft text-xs sm:text-sm mt-1">
          "Don't study more. Understand better." Points and levels are awarded for verified understanding.
        </p>
      </div>

      {/* Level & XP Overview Card */}
      <div className="card space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-indigo-600 text-white font-extrabold text-2xl flex items-center justify-center shadow-md">
              Lvl {level}
            </div>
            <div>
              <span className="text-xs uppercase tracking-wider text-primary font-bold">Current Rank</span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-textMain">{title}</h2>
              <p className="text-xs text-textSoft">{xp} Total Learning XP earned</p>
            </div>
          </div>

          <div className="text-left sm:text-right">
            <span className="text-xs text-textSoft">Next Level in</span>
            <p className="text-2xl font-extrabold text-primary">{Math.max(0, nextLevelXp - xp)} XP</p>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-xs font-semibold text-textSoft">
            <span>Level {level} ({currentLevelXp} XP)</span>
            <span>Level {level + 1} ({nextLevelXp} XP)</span>
          </div>
          <div className="progress-bar">
            <div
              className="progress-fill"
              style={{ width: `${levelProgress}%` }}
            />
          </div>
        </div>
      </div>

      {/* Stats Counter Grid */}
      <div className="grid sm:grid-cols-3 gap-4">
        <div className="card space-y-2 border-t-4 border-t-emerald-500">
          <p className="text-xs uppercase font-bold text-textSoft">Concepts Mastered</p>
          <p className="text-4xl font-extrabold text-emerald-600">{conceptsMastered}</p>
          <p className="text-xs text-textSoft">Passed understanding checks with own-words validation</p>
        </div>

        <div className="card space-y-2 border-t-4 border-t-primary">
          <p className="text-xs uppercase font-bold text-textSoft">Completed Plans</p>
          <p className="text-4xl font-extrabold text-textMain">{topicsCompleted}</p>
          <p className="text-xs text-textSoft">Full syllabi finished within target days</p>
        </div>

        <div className="card space-y-2 border-t-4 border-t-accent">
          <p className="text-xs uppercase font-bold text-textSoft">Badges Unlocked</p>
          <p className="text-4xl font-extrabold text-primary">{badges.length}</p>
          <p className="text-xs text-textSoft">Milestones of consistency & deep comprehension</p>
        </div>
      </div>

      {/* Badges Preview Strip */}
      <div className="card space-y-4">
        <div className="flex items-center justify-between border-b border-border pb-3">
          <div>
            <h3 className="text-lg font-bold text-textMain">Earned Badges</h3>
            <p className="text-xs text-textSoft">Rewards for comprehension quality rather than logged time</p>
          </div>
          <Link to="/badges" className="text-xs font-bold text-primary hover:underline">
            View Badges Wall →
          </Link>
        </div>

        {badges.length === 0 ? (
          <div className="p-6 bg-surfaceSoft rounded-2xl text-center text-xs text-textSoft">
            Complete your first concept check to unlock badges!
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4 pt-1">
            {badges.map((b) => (
              <div key={b.key} className="bg-surfaceSoft rounded-2xl p-4 border border-border flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center text-xl shadow-xs">
                  🏅
                </div>
                <div>
                  <p className="font-bold text-xs text-textMain">{b.name}</p>
                  <p className="text-[11px] text-textSoft line-clamp-1">{b.description}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Quick Action Buttons */}
      <div className="flex flex-wrap gap-4 pt-2">
        <Link to="/courses" className="btn-primary text-xs">
          Continue Current Plan →
        </Link>
        <Link to="/leaderboard" className="btn-secondary text-xs">
          View Leaderboard 🏆
        </Link>
      </div>
    </div>
  );
}
