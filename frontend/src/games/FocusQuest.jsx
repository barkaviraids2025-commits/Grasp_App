import { useMemo, useState } from "react";
import { api } from "../api";

const OBJECTS = ["circle", "square", "triangle", "star", "hex", "plus", "wave", "dot", "ring", "leaf"];

export default function FocusQuest({ onDone }) {
  const [round, setRound] = useState(1);
  const [stats, setStats] = useState({ accuracy: [], mistakes: 0, start: Date.now() });
  const [result, setResult] = useState(null);

  async function finish(nextStats) {
    const acc = nextStats.accuracy.reduce((a, b) => a + b, 0) / nextStats.accuracy.length;
    const body = {
      game: "focus-quest",
      accuracy: acc,
      reaction_ms: Date.now() - nextStats.start,
      mistakes: nextStats.mistakes,
      payload: { rounds: 3 },
    };
    const data = await api("/api/focus", { method: "POST", body: JSON.stringify(body) });
    setResult(data.focus_profile);
    onDone?.(data.focus_profile);
  }

  return (
    <div className="card p-5 space-y-4">
      <h3 className="font-display text-2xl">Focus Quest</h3>
      <p className="text-sm text-ink/70">Three short rounds. We describe a focus profile — never “your focus is poor”.</p>
      {round === 1 && (
        <RoundFind
          onNext={(ok) => {
            const s = { ...stats, accuracy: [...stats.accuracy, ok ? 1 : 0.3], mistakes: stats.mistakes + (ok ? 0 : 1) };
            setStats(s);
            setRound(2);
          }}
        />
      )}
      {round === 2 && (
        <RoundMemory
          onNext={(ok) => {
            const s = { ...stats, accuracy: [...stats.accuracy, ok ? 1 : 0.4], mistakes: stats.mistakes + (ok ? 0 : 1) };
            setStats(s);
            setRound(3);
          }}
        />
      )}
      {round === 3 && (
        <RoundDistract
          onNext={async (ok) => {
            const s = { ...stats, accuracy: [...stats.accuracy, ok ? 1 : 0.35], mistakes: stats.mistakes + (ok ? 0 : 1) };
            setStats(s);
            await finish(s);
            setRound(4);
          }}
        />
      )}
      {result && (
        <div className="bg-mist rounded-2xl p-4 text-sm space-y-1">
          <p className="font-semibold">Focus profile</p>
          <p>Sustained attention: {result.sustained_attention}</p>
          <p>Distraction resistance: {result.distraction_resistance}</p>
          <p>Working memory: {result.working_memory}</p>
          <p>Best session length: {result.best_session_length}</p>
          <p className="text-ink/60">{result.note}</p>
        </div>
      )}
    </div>
  );
}

function RoundFind({ onNext }) {
  const target = "star";
  const grid = useMemo(() => {
    const g = Array.from({ length: 12 }, () => OBJECTS[Math.floor(Math.random() * OBJECTS.length)]);
    g[5] = "star";
    return g;
  }, []);
  return (
    <div>
      <p className="text-sm mb-2">Round 1 — Focus: tap the star among lookalikes.</p>
      <div className="grid grid-cols-4 gap-2">
        {grid.map((item, i) => (
          <button key={i} type="button" onClick={() => onNext(item === target)} className="h-12 rounded-xl bg-mist text-xs">
            {item}
          </button>
        ))}
      </div>
    </div>
  );
}

function RoundMemory({ onNext }) {
  const five = useMemo(() => OBJECTS.slice(0, 5), []);
  const ten = useMemo(() => [...OBJECTS], []);
  const [show, setShow] = useState(true);
  const [picked, setPicked] = useState([]);
  useMemo(() => {
    const t = setTimeout(() => setShow(false), 2200);
    return () => clearTimeout(t);
  }, []);

  return (
    <div>
      <p className="text-sm mb-2">Round 2 — Memory: remember 5 objects, then pick them from 10.</p>
      {show ? (
        <div className="flex flex-wrap gap-2">
          {five.map((o) => (
            <span key={o} className="px-3 py-2 bg-leaf text-white rounded-xl text-sm">
              {o}
            </span>
          ))}
        </div>
      ) : (
        <>
          <div className="flex flex-wrap gap-2">
            {ten.map((o) => (
              <button
                key={o}
                type="button"
                onClick={() => setPicked((p) => (p.includes(o) ? p.filter((x) => x !== o) : [...p, o]))}
                className={`px-3 py-2 rounded-xl text-sm ${picked.includes(o) ? "bg-clay text-white" : "bg-mist"}`}
              >
                {o}
              </button>
            ))}
          </div>
          <button
            type="button"
            className="mt-3 bg-ink text-paper px-4 py-2 rounded-full text-sm"
            onClick={() => onNext(five.every((o) => picked.includes(o)) && picked.length === 5)}
          >
            Lock in
          </button>
        </>
      )}
    </div>
  );
}

function RoundDistract({ onNext }) {
  const [n, setN] = useState(0);
  const [notes, setNotes] = useState([]);
  return (
    <div className="relative overflow-hidden">
      <p className="text-sm mb-2">Round 3 — Distraction: tap + until you reach 8 while noise pops up.</p>
      <button
        type="button"
        className="bg-leaf text-white px-6 py-3 rounded-2xl"
        onClick={() => {
          const next = n + 1;
          setN(next);
          if (Math.random() > 0.4) setNotes((x) => [...x, "New message — ignore me"]);
          if (next >= 8) onNext(true);
        }}
      >
        Count {n} / 8
      </button>
      {notes.map((m, i) => (
        <span key={i} className="absolute right-2 top-2 text-xs bg-clay text-white px-2 py-1 rounded-full animate-pulse">
          {m}
        </span>
      ))}
    </div>
  );
}
