import { useState } from "react";
import NumberHunt from "../games/NumberHunt";
import PatternRecall from "../games/PatternRecall";
import FocusQuest from "../games/FocusQuest";
import { api } from "../api";

export default function FocusLab() {
  const [activeTab, setActiveTab] = useState("quest");
  const [profileResult, setProfileResult] = useState(null);
  const [xpEarned, setXpEarned] = useState(0);

  async function handleGameDone(gameName, stats) {
    try {
      const res = await api("/api/games/complete", {
        method: "POST",
        body: JSON.stringify({
          game: gameName,
          accuracy: stats.accuracy || 1.0,
          reaction_ms: stats.reaction_ms || 0,
          mistakes: stats.mistakes || 0,
          score: stats.score || 100,
        }),
      });
      setProfileResult(res.profile || res.focus_profile);
      setXpEarned((x) => x + 10);
    } catch (e) {
      console.error(e);
    }
  }

  return (
    <div className="space-y-8 max-w-4xl pb-16">
      <div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-textMain tracking-tight">Focus Lab & Cognitive Puzzles</h1>
        <p className="text-textSoft text-xs sm:text-sm mt-1">
          Interactive games that train selective attention, visual working memory, and distraction resistance.
        </p>
      </div>

      {/* Game Selector Tabs */}
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setActiveTab("quest")}
          className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all ${
            activeTab === "quest"
              ? "bg-primary text-white shadow-sm scale-[1.02]"
              : "bg-surface border border-border text-textSoft hover:bg-surfaceSoft"
          }`}
        >
          ⭐ Focus Quest (3 Rounds)
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("hunt")}
          className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all ${
            activeTab === "hunt"
              ? "bg-primary text-white shadow-sm scale-[1.02]"
              : "bg-surface border border-border text-textSoft hover:bg-surfaceSoft"
          }`}
        >
          🔢 Number Hunt (Selective Attention)
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("pattern")}
          className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all ${
            activeTab === "pattern"
              ? "bg-primary text-white shadow-sm scale-[1.02]"
              : "bg-surface border border-border text-textSoft hover:bg-surfaceSoft"
          }`}
        >
          🔄 Pattern Recall (Visual Memory)
        </button>
      </div>

      {/* Active Game Container */}
      <div className="card space-y-4">
        {activeTab === "quest" && (
          <FocusQuest
            onDone={(prof) => {
              setProfileResult(prof);
              setXpEarned((x) => x + 15);
            }}
          />
        )}

        {activeTab === "hunt" && (
          <div className="space-y-4">
            <h3 className="text-xl font-bold text-textMain">Number Hunt</h3>
            <p className="text-xs text-textSoft">
              Numbers flash quickly on screen. Identify the target number among visual distractors.
            </p>
            <NumberHunt onComplete={(stats) => handleGameDone("number-hunt", stats)} />
          </div>
        )}

        {activeTab === "pattern" && (
          <div className="space-y-4">
            <h3 className="text-xl font-bold text-textMain">Pattern Recall</h3>
            <p className="text-xs text-textSoft">
              A grid pattern is revealed for a few seconds and then hidden. Reproduce it accurately from memory.
            </p>
            <PatternRecall onComplete={(stats) => handleGameDone("pattern-recall", stats)} />
          </div>
        )}
      </div>

      {/* Result Card */}
      {profileResult && (
        <div className="card border-l-4 border-l-primary space-y-4 bg-surfaceSoft/90">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-[10px] uppercase tracking-wider text-primary font-extrabold">Calibration Complete</span>
              <h3 className="text-xl font-extrabold text-textMain mt-0.5">Observed Focus Profile</h3>
            </div>
            <span className="text-xs font-bold text-emerald-700 bg-emerald-100 px-3 py-1 rounded-full border border-emerald-300">
              +10 XP Earned
            </span>
          </div>

          <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-surface rounded-2xl p-4 border border-border">
              <span className="text-[10px] text-textSoft uppercase font-bold">Sustained Attention</span>
              <p className="text-base font-bold text-primary">{profileResult.sustained_attention}</p>
            </div>
            <div className="bg-surface rounded-2xl p-4 border border-border">
              <span className="text-[10px] text-textSoft uppercase font-bold">Distraction Resistance</span>
              <p className="text-base font-bold text-textMain">{profileResult.distraction_resistance}</p>
            </div>
            <div className="bg-surface rounded-2xl p-4 border border-border">
              <span className="text-[10px] text-textSoft uppercase font-bold">Working Memory</span>
              <p className="text-base font-bold text-textMain">{profileResult.working_memory}</p>
            </div>
            <div className="bg-surface rounded-2xl p-4 border border-border">
              <span className="text-[10px] text-textSoft uppercase font-bold">Recommended Session</span>
              <p className="text-base font-bold text-emerald-600">{profileResult.best_session_length}</p>
            </div>
          </div>
          <p className="text-xs text-textSoft">{profileResult.note}</p>
        </div>
      )}

      {/* Educational Guide */}
      <div className="grid sm:grid-cols-3 gap-4 text-xs text-textSoft">
        <div className="card space-y-2">
          <span className="text-2xl">🔢</span>
          <p className="font-bold text-textMain text-sm">Selective Attention</p>
          <p>Filters out non-essential stimuli, vital for spotting key values in lengthy word problems.</p>
        </div>
        <div className="card space-y-2">
          <span className="text-2xl">🔄</span>
          <p className="font-bold text-textMain text-sm">Visual Working Memory</p>
          <p>Holds multiple intermediate problem states in mind while solving complex multi-step aptitude formulas.</p>
        </div>
        <div className="card space-y-2">
          <span className="text-2xl">⭐</span>
          <p className="font-bold text-textMain text-sm">Cognitive Stamina</p>
          <p>Maintains consistent calculation accuracy even when faced with test fatigue and distractions.</p>
        </div>
      </div>
    </div>
  );
}
