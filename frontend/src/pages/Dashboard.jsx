import { useEffect, useState } from "react";
import { Link, useOutletContext } from "react-router-dom";
import DailyPuzzle from "../games/DailyPuzzle";
import { api } from "../api";

export default function Dashboard() {
  const { me, setMe } = useOutletContext();
  const [plans, setPlans] = useState([]);
  const [loadingPlans, setLoadingPlans] = useState(true);

  useEffect(() => {
    api("/api/plans")
      .then((data) => {
        setPlans(data.plans || (Array.isArray(data) ? data : []));
      })
      .catch(console.error)
      .finally(() => setLoadingPlans(false));
  }, []);

  const user = me?.user || {};
  const stats = me?.stats || {};
  const session = me?.session || {};
  const focus = me?.focus_profile || {};

  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  const latestPlan = plans[0];
  const nextConcept = latestPlan?.concepts?.find((c) => !c.understood) || latestPlan?.concepts?.[0];

  return (
    <div className="space-y-8 max-w-5xl pb-16">
      {/* Welcome Banner */}
      <div className="welcome flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
            {greeting}, <span>{user.name || "Learner"}</span> 👋
          </h1>
          <p className="text-sm text-textSoft mt-1">
            "Don't study more. Understand better." Your adaptive aptitude coach is ready.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link to="/upload" className="btn-primary text-xs">
            <span>+ Upload Source</span>
          </Link>
          <Link to="/courses" className="btn-secondary text-xs">
            My Courses
          </Link>
        </div>
      </div>

      {/* Main Learning Plan Grid */}
      <div className="learning-plan">
        {/* Active Study Plan Card */}
        <div className="card plan-card flex flex-col justify-between space-y-5">
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs text-textSoft">
              <span className="font-bold uppercase tracking-wider text-primary">
                {latestPlan ? "Active Learning Plan" : "Get Started"}
              </span>
              <span>{latestPlan ? `${latestPlan.deadline_days} Days Target` : "Instant Schedule"}</span>
            </div>

            <h2 className="text-2xl font-extrabold text-textMain leading-tight">
              {latestPlan ? latestPlan.title : "Quantitative Analysis & Aptitude"}
            </h2>

            <p className="text-xs text-textSoft leading-relaxed">
              {latestPlan
                ? `Source: ${latestPlan.source_name || "Uploaded Notes"} • ${session.session_minutes || 30}-min focus sessions • ${session.best_time || "Evening"} rhythm`
                : "Upload your syllabus, PDF textbook chapter, or PPT notes. AI will structure concepts into a timed mastery schedule."}
            </p>
          </div>

          {/* Progress Bar Container */}
          {latestPlan && (
            <div className="progress-container">
              <div className="progress-info">
                <span>Concept Mastery</span>
                <span className="font-bold text-primary">{latestPlan.progress || 0}% Understood</span>
              </div>
              <div className="progress-bar">
                <div
                  className="progress-fill"
                  style={{ width: `${latestPlan.progress || 0}%` }}
                />
              </div>
            </div>
          )}

          <div className="pt-2 flex flex-wrap items-center gap-3">
            {latestPlan ? (
              <Link
                to={
                  nextConcept
                    ? `/learn/${nextConcept.id}?planId=${latestPlan.id}`
                    : `/schedule/${latestPlan.id}`
                }
                className="btn-primary text-xs"
              >
                <span>Continue Learning ({nextConcept?.title || "Next Topic"}) →</span>
              </Link>
            ) : (
              <Link to="/upload" className="btn-primary text-xs">
                <span>Upload PDF / PPT to Start →</span>
              </Link>
            )}

            {latestPlan && (
              <Link
                to={`/schedule/${latestPlan.id}`}
                className="btn-secondary text-xs"
              >
                View Full Schedule
              </Link>
            )}
          </div>
        </div>

        {/* Learning Profile & XP Card */}
        <div className="card flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h3 className="font-extrabold text-lg text-textMain">Learning Profile</h3>
              <span className="text-xs font-bold px-2.5 py-1 bg-primary/10 text-primary rounded-full">
                Level {user.level || 1}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3 mt-4 text-xs">
              <div className="p-3 rounded-xl bg-surfaceSoft space-y-0.5">
                <span className="text-[10px] text-textSoft uppercase font-bold block">Pace</span>
                <span className="font-bold text-textMain text-sm">{user.learning_pace || "Moderate"}</span>
              </div>

              <div className="p-3 rounded-xl bg-surfaceSoft space-y-0.5">
                <span className="text-[10px] text-textSoft uppercase font-bold block">Focus Span</span>
                <span className="font-bold text-primary text-sm">{user.focus_window_minutes || 30} min</span>
              </div>

              <div className="p-3 rounded-xl bg-surfaceSoft col-span-2 space-y-0.5">
                <span className="text-[10px] text-textSoft uppercase font-bold block">Preferred Method</span>
                <span className="font-semibold text-textMain line-clamp-1">{user.preferred_learning || "Worked Examples + Practice"}</span>
              </div>
            </div>
          </div>

          <div className="xp-card pt-3 border-t border-border">
            <div>
              <span className="level font-medium">Total Learning XP</span>
              <p className="text-[11px] text-textSoft">{stats.concepts_mastered || 0} concepts mastered</p>
            </div>
            <span className="xp">{user.xp || 0}</span>
          </div>
        </div>
      </div>

      {/* Concept Quick Access Section */}
      {latestPlan && latestPlan.concepts && latestPlan.concepts.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-extrabold text-textMain">Concepts in Current Plan</h2>
              <p className="text-xs text-textSoft">
                Tap any concept to start adaptive explanations with English/Tamil toggle & voice.
              </p>
            </div>
            <Link to={`/schedule/${latestPlan.id}`} className="text-xs font-bold text-primary hover:underline">
              All {latestPlan.concepts.length} Concepts →
            </Link>
          </div>

          <div className="concept-grid">
            {latestPlan.concepts.slice(0, 4).map((concept, idx) => (
              <Link
                key={concept.id}
                to={`/learn/${concept.id}?planId=${latestPlan.id}`}
                className="concept-card"
              >
                <div className="concept-icon">
                  {concept.understood ? "✅" : idx === 0 ? "⚡" : idx === 1 ? "📐" : "📊"}
                </div>
                <h3 className="font-bold text-textMain truncate">{concept.title}</h3>
                <p className="text-xs text-textSoft line-clamp-2">
                  {concept.summary || "Master the core rule and test active recall."}
                </p>
                <div className="mt-3 flex items-center justify-between text-[11px] font-semibold">
                  <span className={`capitalize ${concept.understood ? "text-leaf" : "text-textSoft"}`}>
                    {concept.understood ? "✓ Mastered" : `${concept.difficulty || "medium"}`}
                  </span>
                  <span className="text-primary font-bold">Study →</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Upload Source Dropzone CTA if no plan */}
      {(!latestPlan || plans.length === 0) && (
        <Link to="/upload" className="upload-box block text-decoration-none">
          <div className="upload-icon">📄</div>
          <h3 className="text-xl font-extrabold text-textMain">Upload Source Document</h3>
          <p className="text-xs text-textSoft mt-1 max-w-sm mx-auto">
            Drop PDF, PPT slides, or topic notes here. AI extracts concepts, difficulty, and generates your adaptive schedule.
          </p>
          <div className="mt-4">
            <span className="btn-primary text-xs">Choose Source File →</span>
          </div>
        </Link>
      )}

      {/* Mobile-visible brain puzzle */}
      <div className="xl:hidden space-y-3 pt-2">
        <h2 className="text-lg font-bold text-textMain">Daily Cognitive Puzzle</h2>
        <DailyPuzzle onPlayed={() => api("/api/me").then(setMe)} />
      </div>
    </div>
  );
}
