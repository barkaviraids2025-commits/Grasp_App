import { useEffect, useMemo, useState } from "react";

export default function NumberHunt({ onComplete }) {
  const target = useMemo(() => 10 + Math.floor(Math.random() * 89), []);
  const numbers = useMemo(() => {
    const set = new Set([target]);
    while (set.size < 16) set.add(10 + Math.floor(Math.random() * 89));
    return [...set].sort(() => Math.random() - 0.5);
  }, [target]);
  const [hidden, setHidden] = useState(false);
  const [start] = useState(() => Date.now());
  const [done, setDone] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setHidden(true), 1400);
    return () => clearTimeout(t);
  }, []);

  function pick(n) {
    if (done) return;
    setDone(true);
    const ok = n === target;
    onComplete?.({
      accuracy: ok ? 1 : 0,
      reaction_ms: Date.now() - start,
      mistakes: ok ? 0 : 1,
      payload: { target, picked: n },
    });
  }

  return (
    <div>
      <p className="text-sm mb-2">
        Find <span className="font-semibold">{target}</span> among the flash of numbers.
      </p>
      <div className="grid grid-cols-4 gap-2">
        {numbers.map((n) => (
          <button
            key={n}
            type="button"
            onClick={() => pick(n)}
            className="h-10 rounded-xl bg-mist text-sm font-semibold"
          >
            {hidden && !done ? "?" : n}
          </button>
        ))}
      </div>
      {done && <p className="text-xs mt-2 text-ink/70">Logged as attention practice — not a score of “how smart you are”.</p>}
    </div>
  );
}
