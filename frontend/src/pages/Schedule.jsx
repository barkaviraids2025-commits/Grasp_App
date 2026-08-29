import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { api } from "../api";

export default function Schedule() {
  const { id } = useParams();
  const [plan, setPlan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    setLoading(true);
    api(`/api/plans/${id}`)
      .then(setPlan)
      .catch((e) => setErr(e.message))
      .finally(() => setLoading(false));
  }, [id]);

  async function handleDownloadPdf() {
    try {
      setDownloading(true);
      const blob = await api(`/api/plans/${id}/notes.pdf`);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `Concepta-${plan?.title || "Notes"}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
    } catch (e) {
      alert("Could not generate PDF: " + e.message);
    } finally {
      setDownloading(false);
    }
  }

  if (loading) {
    return <div className="card p-10 text-center text-textSoft">Loading study schedule...</div>;
  }

  if (err || !plan) {
    return (
      <div className="card p-8 text-center space-y-4">
        <p className="text-red-600 font-medium">{err || "Plan not found"}</p>
        <Link to="/courses" className="btn-secondary text-xs">
          ← Back to Courses
        </Link>
      </div>
    );
  }

  const concepts = plan.concepts || [];
  const sessions = plan.sessions || [];
  const understoodCount = concepts.filter((c) => c.understood).length;
  const progressPercent = concepts.length ? Math.round((understoodCount / concepts.length) * 100) : 0;
  const nextConcept = concepts.find((c) => !c.understood) || concepts[0];

  const daysMap = {};
  sessions.forEach((s) => {
    const d = s.day_number || 1;
    if (!daysMap[d]) daysMap[d] = [];
    daysMap[d].push(s);
  });
  const dayNumbers = Object.keys(daysMap).map(Number).sort((a, b) => a - b);

  return (
    <div className="space-y-8 max-w-4xl pb-16">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-border pb-6">
        <div>
          <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-textSoft mb-1">
            <span className="font-bold text-primary">Aptitude Plan</span>
            <span>•</span>
            <span>{plan.deadline_days} Days Target</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-textMain tracking-tight">{plan.title}</h1>
          <p className="text-textSoft text-xs sm:text-sm mt-1">
            Source: <span className="font-semibold text-textMain">{plan.source_name || "Uploaded document"}</span>
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={handleDownloadPdf}
            disabled={downloading}
            className="btn-secondary text-xs"
          >
            <span>📥</span>
            <span>{downloading ? "Preparing PDF..." : "Download Revision Notes"}</span>
          </button>
          {nextConcept && (
            <Link
              to={`/learn/${nextConcept.id}?planId=${plan.id}`}
              className="btn-primary text-xs"
            >
              {understoodCount === concepts.length ? "Review Concepts →" : "Continue Learning →"}
            </Link>
          )}
        </div>
      </div>

      {/* Progress & Overview Cards */}
      <div className="grid sm:grid-cols-3 gap-4">
        <div className="card space-y-2">
          <p className="text-xs uppercase text-textSoft font-bold">Concept Mastery</p>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-primary">{understoodCount}</span>
            <span className="text-xs text-textSoft">/ {concepts.length} understood</span>
          </div>
          <div className="progress-bar mt-2">
            <div className="progress-fill" style={{ width: `${progressPercent}%` }} />
          </div>
        </div>

        <div className="card space-y-1">
          <p className="text-xs uppercase text-textSoft font-bold">Guiding Principle</p>
          <p className="text-base font-bold text-textMain">"If you don't understand it, we don't move on."</p>
          <p className="text-xs text-textSoft">Adaptive multi-angle coaching.</p>
        </div>

        <div className="card space-y-1">
          <p className="text-xs uppercase text-textSoft font-bold">Study Structure</p>
          <p className="text-base font-bold text-textMain">Focused Sessions + Active Check</p>
          <p className="text-xs text-textSoft">Spaced retrieval & own-words validation.</p>
        </div>
      </div>

      {/* Day by Day Schedule */}
      <div className="space-y-6">
        <h2 className="text-2xl font-extrabold text-textMain">Adaptive Schedule Breakdown</h2>

        <div className="space-y-4">
          {dayNumbers.map((dayNum) => {
            const daySessions = daysMap[dayNum];
            return (
              <div key={dayNum} className="card space-y-4 border-l-4 border-l-primary">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="w-8 h-8 rounded-full bg-primary text-white font-bold text-sm flex items-center justify-center shadow-sm">
                      {dayNum}
                    </span>
                    <div>
                      <h3 className="text-lg font-bold text-textMain">Day {dayNum}</h3>
                      <p className="text-xs text-textSoft">
                        {daySessions.reduce((acc, s) => acc + s.minutes, 0)} minutes total focus window
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-3 pt-2">
                  {daySessions.map((session, sIdx) => {
                    const sessionConcepts = concepts.filter((c) =>
                      session.concept_ids?.includes(c.id)
                    );

                    return (
                      <div
                        key={sIdx}
                        className="bg-surfaceSoft rounded-2xl p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-3"
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span
                              className={`text-xs px-2.5 py-0.5 rounded-full font-bold ${
                                session.kind === "revise"
                                  ? "bg-amber-100 text-amber-800"
                                  : session.kind === "check"
                                  ? "bg-purple-100 text-purple-800"
                                  : "bg-emerald-100 text-emerald-800"
                              }`}
                            >
                              {session.kind === "revise"
                                ? "🔁 Spaced Revision"
                                : session.kind === "check"
                                ? "🧠 Understanding Check"
                                : "📖 Deep Learning"}
                            </span>
                            <span className="text-xs text-textSoft">⏱️ {session.minutes} min</span>
                          </div>
                          <p className="font-bold text-sm text-textMain">{session.title}</p>

                          {sessionConcepts.length > 0 && (
                            <div className="flex flex-wrap gap-2 pt-1">
                              {sessionConcepts.map((c) => (
                                <Link
                                  key={c.id}
                                  to={`/learn/${c.id}?planId=${plan.id}`}
                                  className={`text-xs px-3 py-1 rounded-full border transition-all flex items-center gap-1.5 ${
                                    c.understood
                                      ? "bg-emerald-50 border-emerald-300 text-emerald-700 font-semibold"
                                      : "bg-white border-border hover:border-primary text-textMain"
                                  }`}
                                >
                                  <span>{c.understood ? "✓" : "○"}</span>
                                  <span>{c.title}</span>
                                  <span className="text-[10px] text-textSoft uppercase">({c.difficulty})</span>
                                </Link>
                              ))}
                            </div>
                          )}
                        </div>

                        {sessionConcepts.length > 0 && (
                          <div className="shrink-0">
                            <Link
                              to={`/learn/${sessionConcepts[0].id}?planId=${plan.id}`}
                              className="btn-primary text-xs py-2 px-4"
                            >
                              Start Session →
                            </Link>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* All Concepts Grid */}
      <div className="space-y-4 pt-4">
        <h2 className="text-2xl font-extrabold text-textMain">All Extracted Concepts ({concepts.length})</h2>
        <div className="grid sm:grid-cols-2 gap-3">
          {concepts.map((concept, idx) => (
            <Link
              key={concept.id}
              to={`/learn/${concept.id}?planId=${plan.id}`}
              className={`card p-4 flex items-center justify-between gap-3 hover:border-primary/40 transition-all ${
                concept.understood ? "bg-emerald-50/40" : ""
              }`}
            >
              <div className="flex items-center gap-3">
                <span
                  className={`w-7 h-7 rounded-full text-xs font-bold flex items-center justify-center ${
                    concept.understood ? "bg-emerald-600 text-white" : "bg-surfaceSoft text-textSoft"
                  }`}
                >
                  {concept.understood ? "✓" : idx + 1}
                </span>
                <div>
                  <p className="font-bold text-sm text-textMain leading-snug">{concept.title}</p>
                  <p className="text-[11px] text-textSoft capitalize">
                    {concept.difficulty} • {concept.attempts} {concept.attempts === 1 ? "attempt" : "attempts"}
                  </p>
                </div>
              </div>
              <span className="text-xs text-primary font-bold shrink-0">
                {concept.understood ? "Mastered" : "Learn →"}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
