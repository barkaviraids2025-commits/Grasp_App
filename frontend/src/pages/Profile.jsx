import { useEffect, useState } from "react";
import { Link, useOutletContext } from "react-router-dom";
import { api } from "../api";

export default function Profile() {
  const context = useOutletContext();
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api("/api/me")
      .then((data) => {
        setProfileData(data);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const me = profileData || context?.me;
  const user = me?.user || {};
  const prof = user?.profile || me?.profile || {};
  const focus = me?.focus_profile || {};
  const session = me?.session || {};

  if (loading && !me) {
    return <div className="card p-10 text-center text-textSoft">Loading learning profile...</div>;
  }

  return (
    <div className="space-y-8 max-w-4xl pb-16">
      {/* Header Info */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-border pb-6">
        <div>
          <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-textSoft mb-1">
            <span className="font-bold text-primary">Student Profile</span>
            <span>•</span>
            <span>Level {user.level || 1}</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-textMain tracking-tight">{user.name || "Learner"}</h1>
          <p className="text-textSoft text-xs sm:text-sm mt-1">
            {user.email} • {user.phone || "No phone registered"}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="card px-5 py-3 text-center bg-surfaceSoft">
            <span className="text-[10px] uppercase text-textSoft font-bold block">Total XP</span>
            <span className="text-2xl font-extrabold text-primary">{user.xp || 0}</span>
          </div>
        </div>
      </div>

      {/* Ethical Coach Disclaimer */}
      <div className="card border-l-4 border-l-primary space-y-1 bg-surfaceSoft/80">
        <p className="font-bold text-xs uppercase tracking-wider text-primary">🧠 Adaptive Learning Pattern</p>
        <p className="text-xs text-textSoft leading-relaxed">
          We don't say "This student has low capability." We say:{" "}
          <strong className="text-textMain">
            "This student's current learning pattern suggests this study approach may work better."
          </strong>{" "}
          Your profile is a personalized study coach guide, not an intelligence test.
        </p>
      </div>

      {/* Learning Profile Card (From Onboarding) */}
      <div className="card space-y-6">
        <div className="flex items-center justify-between border-b border-border pb-4">
          <div>
            <h2 className="text-xl font-bold text-textMain">Self-Reported Learning Pattern</h2>
            <p className="text-xs text-textSoft">Collected from the 8-category onboarding questionnaire</p>
          </div>
          <span className="text-xs bg-primary/10 text-primary font-bold px-3 py-1 rounded-full">
            Active Study Mode
          </span>
        </div>

        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
          <div className="bg-surfaceSoft rounded-2xl p-4 border border-border space-y-1">
            <span className="text-[10px] text-textSoft uppercase font-bold">Learning Speed</span>
            <p className="text-base font-bold text-textMain">{prof.pace || user.learning_pace || "Moderate"}</p>
            <p className="text-[11px] text-textSoft">Comfort time on new topics</p>
          </div>

          <div className="bg-surfaceSoft rounded-2xl p-4 border border-border space-y-1">
            <span className="text-[10px] text-textSoft uppercase font-bold">Focus Window</span>
            <p className="text-base font-bold text-primary">{prof.session_minutes || session.session_minutes || 30} mins</p>
            <p className="text-[11px] text-textSoft">Optimal unbroken attention span</p>
          </div>

          <div className="bg-surfaceSoft rounded-2xl p-4 border border-border space-y-1">
            <span className="text-[10px] text-textSoft uppercase font-bold">Preferred Style</span>
            <p className="text-base font-bold text-textMain line-clamp-1">{prof.preferred_learning || user.preferred_learning || "Worked Examples"}</p>
            <p className="text-[11px] text-textSoft">Visuals + Practice questions</p>
          </div>

          <div className="bg-surfaceSoft rounded-2xl p-4 border border-border space-y-1">
            <span className="text-[10px] text-textSoft uppercase font-bold">Problem Solving</span>
            <p className="text-base font-bold text-textMain">{prof.problem_solving || "Break into parts"}</p>
            <p className="text-[11px] text-textSoft">Initial reaction to difficult problems</p>
          </div>

          <div className="bg-surfaceSoft rounded-2xl p-4 border border-border space-y-1">
            <span className="text-[10px] text-textSoft uppercase font-bold">Revision Frequency</span>
            <p className="text-base font-bold text-textMain">{prof.revision || "Before exams"}</p>
            <p className="text-[11px] text-textSoft">Memory curve & review frequency</p>
          </div>

          <div className="bg-surfaceSoft rounded-2xl p-4 border border-border space-y-1">
            <span className="text-[10px] text-textSoft uppercase font-bold">Peak Alertness</span>
            <p className="text-base font-bold text-textMain">{prof.best_time || session.best_time || "Evening"}</p>
            <p className="text-[11px] text-textSoft">Best study timing of the day</p>
          </div>
        </div>

        {prof.summary && (
          <div className="bg-surfaceSoft rounded-2xl p-4 text-xs text-textMain leading-relaxed border border-border">
            <strong>Profile Summary:</strong> {prof.summary}
          </div>
        )}
      </div>

      {/* Focus Lab Observed Profile */}
      <div className="card space-y-6">
        <div className="flex items-center justify-between border-b border-border pb-4">
          <div>
            <h2 className="text-xl font-bold text-textMain">Observed Focus Profile</h2>
            <p className="text-xs text-textSoft">Calibrated by cognitive games (Focus Quest, Number Hunt, Pattern Recall)</p>
          </div>
          <Link to="/focus" className="btn-secondary text-xs py-1.5 px-3">
            Open Focus Lab →
          </Link>
        </div>

        <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-surfaceSoft rounded-2xl p-4 space-y-1 border border-border">
            <span className="text-[10px] text-textSoft uppercase font-bold">Sustained Attention</span>
            <p className="text-lg font-bold text-primary">{focus.sustained_attention || "Developing"}</p>
            <p className="text-[11px] text-textSoft">Continuous task focus</p>
          </div>

          <div className="bg-surfaceSoft rounded-2xl p-4 space-y-1 border border-border">
            <span className="text-[10px] text-textSoft uppercase font-bold">Distraction Resistance</span>
            <p className="text-lg font-bold text-textMain">{focus.distraction_resistance || "Developing"}</p>
            <p className="text-[11px] text-textSoft">Filtering visual noise</p>
          </div>

          <div className="bg-surfaceSoft rounded-2xl p-4 space-y-1 border border-border">
            <span className="text-[10px] text-textSoft uppercase font-bold">Working Memory</span>
            <p className="text-lg font-bold text-textMain">{focus.working_memory || "Moderate"}</p>
            <p className="text-[11px] text-textSoft">Pattern reproduction</p>
          </div>

          <div className="bg-surfaceSoft rounded-2xl p-4 space-y-1 border border-border">
            <span className="text-[10px] text-textSoft uppercase font-bold">Suggested Block</span>
            <p className="text-lg font-bold text-emerald-600">{focus.best_session_length || "25–30 min"}</p>
            <p className="text-[11px] text-textSoft">Ideal study duration</p>
          </div>
        </div>

        <p className="text-xs text-textSoft italic">
          {focus.note || "Play the games in the sidebar or Focus Lab to keep your attention profile calibrated."}
        </p>
      </div>

      {/* Language Preferences */}
      <div className="card p-5 flex items-center justify-between">
        <div>
          <h3 className="font-bold text-base text-textMain">Preferred Explanation Language</h3>
          <p className="text-xs text-textSoft">Choose between natural English and everyday Tamil analogies</p>
        </div>
        <span className="text-xs font-bold bg-primary/10 text-primary px-4 py-2 rounded-full capitalize border border-primary/20">
          {user.preferred_language || "English"}
        </span>
      </div>
    </div>
  );
}
