import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api";

const ALL_BADGES = [
  {
    key: "starter",
    name: "Starter",
    icon: "🌱",
    tagline: "First Steps",
    description: "Completed onboarding and activated your first personalized learning plan.",
    requirement: "Create a learning profile and launch your first study schedule.",
  },
  {
    key: "consistency",
    name: "Consistency",
    icon: "🔥",
    tagline: "Habit Builder",
    description: "Maintained steady momentum across 3 distinct learning schedules.",
    requirement: "Complete 3 full study plans on schedule.",
  },
  {
    key: "concept-master",
    name: "Concept Master",
    icon: "🧠",
    tagline: "Deep Comprehension",
    description: "Scored 90%+ in concept assessments with strong active-recall explanation.",
    requirement: "Ace a concept verification check on the first attempt.",
  },
  {
    key: "fast-learner",
    name: "Fast Learner",
    icon: "⚡",
    tagline: "Pace & Precision",
    description: "Completed a full plan within the chosen deadline while maintaining verified understanding.",
    requirement: "Finish all concepts within target days without skipping checks.",
  },
  {
    key: "deep-learner",
    name: "Deep Learner",
    icon: "🔍",
    tagline: "Grit & Mastery",
    description: "Successfully mastered difficult concepts after multiple adaptive explanation attempts.",
    requirement: "Persist through 'Explain Again' modes until achieving full mastery.",
  },
  {
    key: "knowledge-master",
    name: "Knowledge Master",
    icon: "🏆",
    tagline: "Subject Veteran",
    description: "Completed 10 comprehensive quantitative analysis plans with strong retention.",
    requirement: "Master 10 full learning plans.",
  },
];

export default function Badges() {
  const [earnedBadges, setEarnedBadges] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api("/api/progress")
      .then((data) => {
        setEarnedBadges(data.badges || []);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const earnedKeys = new Set(earnedBadges.map((b) => b.key.replace("-pending", "")));

  return (
    <div className="space-y-8 max-w-4xl pb-16">
      <div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-textMain tracking-tight">Badges & Achievements</h1>
        <p className="text-textSoft text-xs sm:text-sm mt-1">
          Gamification built around actual understanding, not empty hours spent.
        </p>
      </div>

      {/* Badges Grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {ALL_BADGES.map((b) => {
          const isEarned = earnedKeys.has(b.key) || earnedKeys.has(b.key.replace("-", "_"));

          return (
            <div
              key={b.key}
              className={`card flex flex-col justify-between transition-all ${
                isEarned
                  ? "border-2 border-primary/40 bg-gradient-to-b from-white to-primary/5 shadow-md scale-[1.01]"
                  : "opacity-60 bg-white/40 border-dashed"
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-3xl">{b.icon}</span>
                  <span
                    className={`text-[11px] px-2.5 py-0.5 rounded-full font-bold ${
                      isEarned ? "bg-emerald-100 text-emerald-800" : "bg-surfaceSoft text-textSoft"
                    }`}
                  >
                    {isEarned ? "Unlocked ✓" : "Locked 🔒"}
                  </span>
                </div>

                <p className="text-[10px] uppercase tracking-wider text-textSoft font-bold">{b.tagline}</p>
                <h3 className="text-xl font-bold text-textMain mt-0.5">{b.name}</h3>
                <p className="text-xs text-textSoft mt-2 leading-relaxed">{b.description}</p>
              </div>

              <div className="mt-5 pt-3 border-t border-border text-xs">
                {isEarned ? (
                  <p className="text-emerald-700 font-bold flex items-center gap-1">
                    <span>🎉</span>
                    <span>+100 XP Earned</span>
                  </p>
                ) : (
                  <p className="text-textSoft italic text-[11px]">
                    Criteria: {b.requirement}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* XP Reward Structure Table */}
      <div className="card space-y-4">
        <h3 className="text-lg font-bold text-textMain">How Learning XP is Awarded</h3>
        <p className="text-xs text-textSoft">
          Our scoring model rewards comprehension quality, persistence, and consistency:
        </p>

        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-3 pt-2">
          <div className="bg-surfaceSoft rounded-2xl p-4 space-y-1 border border-border">
            <span className="text-xs font-bold text-primary">+10 XP</span>
            <p className="font-bold text-xs text-textMain">Focus Game / Daily Puzzle</p>
            <p className="text-[11px] text-textSoft">Attention practice in sidebar</p>
          </div>

          <div className="bg-surfaceSoft rounded-2xl p-4 space-y-1 border border-border">
            <span className="text-xs font-bold text-primary">+20 XP</span>
            <p className="font-bold text-xs text-textMain">Concept Understood</p>
            <p className="text-[11px] text-textSoft">Passed check & own-words test</p>
          </div>

          <div className="bg-surfaceSoft rounded-2xl p-4 space-y-1 border border-border">
            <span className="text-xs font-bold text-primary">+50 XP</span>
            <p className="font-bold text-xs text-textMain">Study Plan Completed</p>
            <p className="text-[11px] text-textSoft">Finished all scheduled concepts</p>
          </div>

          <div className="bg-surfaceSoft rounded-2xl p-4 space-y-1 border border-border">
            <span className="text-xs font-bold text-primary">+100 XP</span>
            <p className="font-bold text-xs text-textMain">Milestone Badge Earned</p>
            <p className="text-[11px] text-textSoft">Major comprehension milestone</p>
          </div>

          <div className="bg-surfaceSoft rounded-2xl p-4 space-y-1 border border-border">
            <span className="text-xs font-bold text-primary">+10 XP</span>
            <p className="font-bold text-xs text-textMain">Spaced Revision Check</p>
            <p className="text-[11px] text-textSoft">Re-tested after 48 hours</p>
          </div>

          <div className="bg-surfaceSoft rounded-2xl p-4 space-y-1 border border-border">
            <span className="text-xs font-bold text-primary">+1 Level</span>
            <p className="font-bold text-xs text-textMain">Every 200 XP</p>
            <p className="text-[11px] text-textSoft">Advances your rank title</p>
          </div>
        </div>
      </div>
    </div>
  );
}
