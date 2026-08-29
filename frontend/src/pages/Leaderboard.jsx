import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api";

export default function Leaderboard() {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api("/api/progress/leaderboard")
      .then((data) => {
        setEntries(data.entries || (Array.isArray(data) ? data : []));
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-8 max-w-4xl pb-16">
      <div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-textMain tracking-tight">Aptitude Mastery Leaderboard</h1>
        <p className="text-textSoft text-xs sm:text-sm mt-1">
          Rankings are calculated strictly on verified concepts understood, retention, and consistency.
        </p>
      </div>

      {/* Philosophy banner */}
      <div className="card border-l-4 border-l-primary space-y-1 bg-surfaceSoft/80">
        <p className="font-bold text-xs uppercase tracking-wider text-primary">💡 Comprehension-First Ranking</p>
        <p className="text-xs text-textSoft leading-relaxed">
          Most apps rank by raw minutes logged, encouraging unproductive cramming. Concepta calculates ranking points
          purely on <strong>concepts understood</strong>, <strong>check accuracy</strong>, and <strong>schedule completion</strong>.
          Two focused, high-clarity hours will outshine eight unfocused hours.
        </p>
      </div>

      {/* Leaderboard Table Card */}
      <div className="card overflow-hidden p-0">
        {loading ? (
          <div className="p-10 text-center text-textSoft">Loading leaderboard rankings...</div>
        ) : entries.length === 0 ? (
          <div className="p-10 text-center text-textSoft">No ranked learners yet. Be the first to earn XP!</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-surfaceSoft text-textSoft text-[11px] uppercase tracking-wider border-b border-border font-bold">
                <tr>
                  <th className="px-6 py-3.5">Rank</th>
                  <th className="px-6 py-3.5">Learner</th>
                  <th className="px-6 py-3.5">Level</th>
                  <th className="px-6 py-3.5">Concepts Mastered</th>
                  <th className="px-6 py-3.5 text-right">Learning XP</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {entries.map((entry, idx) => {
                  const isYou = entry.me || entry.you;
                  const rank = idx + 1;

                  return (
                    <tr
                      key={idx}
                      className={`leaderboard-item transition-all ${
                        isYou ? "bg-primary/10 font-bold" : "hover:bg-surfaceSoft"
                      }`}
                    >
                      <td className="px-6 py-4">
                        <span
                          className={`rank text-xs font-bold ${
                            rank === 1
                              ? "bg-amber-100 text-amber-900 border border-amber-300"
                              : rank === 2
                              ? "bg-slate-200 text-slate-800"
                              : rank === 3
                              ? "bg-orange-100 text-orange-900"
                              : "bg-surfaceSoft text-textSoft"
                          }`}
                        >
                          {rank}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-textMain">{entry.name}</span>
                          {isYou && (
                            <span className="text-[10px] bg-primary text-white px-2 py-0.5 rounded-full font-bold shadow-xs">
                              YOU
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-surfaceSoft text-textMain border border-border">
                          Lvl {entry.level || 1}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-xs font-bold text-emerald-600">
                          {entry.mastered ?? "—"}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <span className="text-base font-extrabold text-primary">
                          {entry.xp} <span className="text-[10px] text-textSoft font-normal">XP</span>
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="flex justify-between items-center text-xs text-textSoft px-1">
        <span>Updated continuously after every understanding check and focus game.</span>
        <Link to="/courses" className="text-primary font-bold hover:underline">
          Study now to climb ranks →
        </Link>
      </div>
    </div>
  );
}
