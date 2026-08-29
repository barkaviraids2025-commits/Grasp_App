import { useState } from "react";
import NumberHunt from "./NumberHunt";
import PatternRecall from "./PatternRecall";
import FocusQuest from "./FocusQuest";
import { api } from "../api";

export default function DailyPuzzle({ onPlayed }) {
  const [game, setGame] = useState("hunt");

  return (
    <div className="card p-4 space-y-3">
      <div className="flex flex-wrap gap-1.5 text-xs font-semibold">
        <button
          type="button"
          className={chip(game === "hunt")}
          onClick={() => setGame("hunt")}
        >
          🔢 Hunt
        </button>
        <button
          type="button"
          className={chip(game === "pattern")}
          onClick={() => setGame("pattern")}
        >
          🔄 Recall
        </button>
        <button
          type="button"
          className={chip(game === "quest")}
          onClick={() => setGame("quest")}
        >
          ⭐ Quest
        </button>
      </div>

      {game === "hunt" && (
        <NumberHunt
          onComplete={async (stats) => {
            await api("/api/games/complete", {
              method: "POST",
              body: JSON.stringify({ game: "number-hunt", ...stats }),
            });
            onPlayed?.();
          }}
        />
      )}

      {game === "pattern" && (
        <PatternRecall
          onComplete={async (stats) => {
            await api("/api/games/complete", {
              method: "POST",
              body: JSON.stringify({ game: "pattern-recall", ...stats }),
            });
            onPlayed?.();
          }}
        />
      )}

      {game === "quest" && (
        <FocusQuest
          onDone={async () => {
            onPlayed?.();
          }}
        />
      )}
    </div>
  );
}

function chip(on) {
  return `px-2.5 py-1 rounded-full text-xs font-medium transition-colors ${
    on ? "bg-leaf text-white shadow-sm" : "bg-mist/60 text-ink/70 hover:bg-mist"
  }`;
}
