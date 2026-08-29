import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api";

export default function Courses() {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api("/api/plans")
      .then((data) => {
        setPlans(data.plans || (Array.isArray(data) ? data : []));
      })
      .catch((err) => {
        console.error(err);
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6 max-w-5xl pb-16">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-border pb-4">
        <div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-textMain tracking-tight">My Courses & Study Plans</h1>
          <p className="text-textSoft text-xs sm:text-sm mt-1">
            Personalized aptitude schedules shaped around your focus window & learning style.
          </p>
        </div>
        <Link to="/upload" className="btn-primary text-xs w-fit">
          <span>+ Upload Source</span>
        </Link>
      </div>

      {loading ? (
        <div className="card p-8 text-center text-textSoft">Loading your learning plans...</div>
      ) : plans.length === 0 ? (
        <div className="card p-10 text-center space-y-4 max-w-lg mx-auto mt-6">
          <div className="w-16 h-16 rounded-full bg-surfaceSoft mx-auto flex items-center justify-center text-3xl">
            📄
          </div>
          <h3 className="text-2xl font-extrabold text-textMain">No study plans yet</h3>
          <p className="text-xs sm:text-sm text-textSoft leading-relaxed">
            Upload your syllabus, PDF notes, PPT slides, or topic list. We will break it down into concepts and create an adaptive schedule.
          </p>
          <div>
            <Link to="/upload" className="btn-primary text-xs">
              Upload your first source →
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {plans.map((p) => (
            <Link
              key={p.id}
              to={`/schedule/${p.id}`}
              className="card flex flex-col justify-between group text-decoration-none"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between text-[11px] text-textSoft">
                  <span className="font-bold uppercase tracking-wider text-primary">
                    {p.status === "completed" ? "✅ Completed" : "⚡ In Progress"}
                  </span>
                  <span>{p.deadline_days} days target</span>
                </div>
                <h3 className="text-xl font-bold text-textMain group-hover:text-primary transition-colors">
                  {p.title}
                </h3>
                <p className="text-xs text-textSoft line-clamp-1">
                  Source: {p.source_name || p.filename || "Uploaded Material"}
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-border space-y-2">
                <div className="flex justify-between text-xs text-textSoft font-medium">
                  <span>Mastery</span>
                  <span className="font-bold text-primary">{p.progress || 0}% Understood</span>
                </div>
                <div className="progress-bar">
                  <div className="progress-fill" style={{ width: `${p.progress || 0}%` }} />
                </div>
                <div className="flex items-center justify-between text-xs text-textSoft pt-2">
                  <span>{p.concepts?.length || 0} Concepts</span>
                  <span className="text-primary font-bold group-hover:translate-x-1 transition-transform inline-flex items-center gap-1">
                    Open Schedule →
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
