import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api } from "../api";

export default function Upload() {
  const nav = useNavigate();
  const [days, setDays] = useState(3);
  const [file, setFile] = useState(null);
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(e) {
    e.preventDefault();
    if (!file) return setErr("Please choose a PDF, PPT slides, or text notes file.");
    setBusy(true);
    setErr("");
    const fd = new FormData();
    fd.append("file", file);
    fd.append("deadline_days", String(days));
    try {
      const plan = await api("/api/plans/upload", { method: "POST", body: fd });
      nav(`/schedule/${plan.id}`);
    } catch (ex) {
      setErr(ex.message || "Failed to parse document. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="max-w-xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-textMain tracking-tight">Upload Source Material</h1>
        <p className="text-xs sm:text-sm text-textSoft mt-1">
          Upload PDF notes, PPT slides, or a syllabus list. We analyze concepts, calculate difficulty, and shape an adaptive schedule.
        </p>
      </div>

      <form onSubmit={submit} className="card space-y-6">
        {/* Upload Box Dropzone */}
        <label className="upload-box block">
          <input
            type="file"
            className="hidden"
            accept=".pdf,.ppt,.pptx,.txt,.md"
            onChange={(e) => setFile(e.target.files?.[0])}
          />
          <span className="upload-icon">📄</span>
          <p className="font-extrabold text-base text-textMain">
            {file ? file.name : "Tap to browse or drop your document"}
          </p>
          <p className="text-xs text-textSoft mt-1">
            Supports PDF, PowerPoint (.pptx, .ppt), or Plain Text (.txt, .md)
          </p>
        </label>

        {/* Deadline Target */}
        <div className="space-y-2">
          <label className="block text-xs uppercase font-bold text-textSoft">
            Target Completion Window (Days)
          </label>
          <div className="flex items-center gap-3">
            <input
              type="number"
              min={1}
              max={30}
              value={days}
              onChange={(e) => setDays(Number(e.target.value))}
              className="w-28 rounded-xl border border-border bg-surface px-4 py-3 text-sm font-bold text-textMain focus:outline-none focus:border-primary"
            />
            <span className="text-xs text-textSoft">
              Days to complete. Concepts will be grouped into daily focus blocks based on your attention span.
            </span>
          </div>
        </div>

        {err && <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl">⚠️ {err}</div>}

        <div className="flex items-center justify-between pt-2">
          <Link to="/courses" className="text-xs font-semibold text-textSoft hover:underline">
            ← Cancel
          </Link>

          <button
            type="submit"
            disabled={busy}
            className="btn-primary text-sm px-6 py-3"
          >
            {busy ? (
              <span className="flex items-center gap-2">
                <span>Analyzing Source</span>
                <span className="ai-thinking">
                  <span></span>
                  <span></span>
                  <span></span>
                </span>
              </span>
            ) : (
              "Generate Adaptive Schedule →"
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
