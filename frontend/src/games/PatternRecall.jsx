import { useEffect, useMemo, useState } from "react";

export default function PatternRecall({ onComplete }) {
  const pattern = useMemo(() => {
    const cells = Array.from({ length: 9 }, (_, i) => i);
    return cells.filter(() => Math.random() > 0.55).slice(0, 4);
  }, []);
  const [phase, setPhase] = useState("show");
  const [picked, setPicked] = useState([]);

  useEffect(() => {
    const t = setTimeout(() => setPhase("hide"), 1800);
    return () => clearTimeout(t);
  }, []);

  function toggle(i) {
    if (phase !== "hide") return;
    setPicked((p) => (p.includes(i) ? p.filter((x) => x !== i) : [...p, i]));
  }

  function submit() {
    const correct = pattern.every((i) => picked.includes(i)) && picked.length === pattern.length;
    onComplete?.({
      accuracy: correct ? 1 : Math.max(0, 1 - Math.abs(picked.length - pattern.length) * 0.25),
      reaction_ms: 1800,
      mistakes: correct ? 0 : 1,
      payload: { pattern, picked },
    });
    setPhase("done");
  }

  return (
    <div>
      <p className="text-sm mb-2">{phase === "show" ? "Remember the lit tiles." : "Tap the same tiles."}</p>
      <div className="grid grid-cols-3 gap-2">
        {Array.from({ length: 9 }, (_, i) => {
          const lit = phase === "show" ? pattern.includes(i) : picked.includes(i);
          return (
            <button
              key={i}
              type="button"
              onClick={() => toggle(i)}
              className={`h-10 rounded-xl ${lit ? "bg-leaf" : "bg-mist"}`}
            />
          );
        })}
      </div>
      {phase === "hide" && (
        <button type="button" onClick={submit} className="mt-3 text-sm bg-ink text-paper px-3 py-1 rounded-full">
          Check pattern
        </button>
      )}
      {phase === "done" && <p className="text-xs mt-2 text-ink/70">Visual memory practice saved to your focus profile.</p>}
    </div>
  );
}
