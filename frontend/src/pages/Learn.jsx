import { useEffect, useState } from "react";
import { Link, useNavigate, useParams, useSearchParams } from "react-router-dom";
import { api } from "../api";

const MODES = [
  { key: "simple", label: "📝 Simple Explanation", icon: "📝" },
  { key: "example", label: "💡 Worked Example", icon: "💡" },
  { key: "diagram", label: "📊 Visual Diagram", icon: "📊" },
  { key: "animation", label: "🎬 Step Flow", icon: "🎬" },
  { key: "voice", label: "🔊 Voice / Spoken", icon: "🔊" },
];

export default function Learn() {
  const { conceptId } = useParams();
  const [searchParams] = useSearchParams();
  const planId = searchParams.get("planId");
  const nav = useNavigate();

  const [data, setData] = useState(null);
  const [activeMode, setActiveMode] = useState("simple");
  const [language, setLanguage] = useState("english");
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  // Quiz / Check state
  const [mcqAnswers, setMcqAnswers] = useState({});
  const [ownWords, setOwnWords] = useState("");
  const [checking, setChecking] = useState(false);
  const [result, setResult] = useState(null);
  const [speaking, setSpeaking] = useState(false);

  // Focus timer (in seconds)
  const [secondsLeft, setSecondsLeft] = useState(25 * 60);

  useEffect(() => {
    loadConcept(language);
  }, [conceptId, planId]);

  useEffect(() => {
    const timer = setInterval(() => {
      setSecondsLeft((s) => (s > 0 ? s - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  async function loadConcept(lang) {
    if (!planId) {
      setErr("Plan ID missing. Please return to schedule.");
      setLoading(false);
      return;
    }
    setLoading(true);
    setErr("");
    setResult(null);
    try {
      const res = await api(`/api/plans/${planId}/concepts/${conceptId}/explain?language=${lang}`);
      setData(res);
      if (res.mode) setActiveMode(res.mode);
    } catch (e) {
      setErr(e.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleExplainAgain() {
    setLoading(true);
    try {
      const res = await api(`/api/plans/${planId}/concepts/${conceptId}/explain-again`, {
        method: "POST",
      });
      setData(res);
      if (res.mode) setActiveMode(res.mode);
      setResult(null);
    } catch (e) {
      setErr(e.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleLanguageSwitch(lang) {
    setLanguage(lang);
    loadConcept(lang);
  }

  async function handleSubmitCheck(e) {
    e.preventDefault();
    setChecking(true);
    setErr("");
    try {
      const payload = {
        mcq: mcqAnswers,
        own_words: ownWords,
      };
      const res = await api(`/api/plans/${planId}/concepts/${conceptId}/check`, {
        method: "POST",
        body: JSON.stringify(payload),
      });
      setResult(res);
      if (res.understood) {
        // Mastered
      } else {
        // Auto-switch mode on struggle
        handleExplainAgain();
      }
    } catch (e) {
      setErr(e.message);
    } finally {
      setChecking(false);
    }
  }

  function handleVoiceRead(text) {
    if (!("speechSynthesis" in window)) {
      alert("Text-to-speech is not supported in this browser.");
      return;
    }
    if (speaking) {
      window.speechSynthesis.cancel();
      setSpeaking(false);
      return;
    }
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.95;
    utterance.pitch = 1.0;
    if (language === "tamil") {
      utterance.lang = "ta-IN";
    } else {
      utterance.lang = "en-US";
    }
    utterance.onend = () => setSpeaking(false);
    utterance.onerror = () => setSpeaking(false);
    setSpeaking(true);
    window.speechSynthesis.speak(utterance);
  }

  if (loading && !data) {
    return (
      <div className="card p-12 text-center text-textSoft space-y-2">
        <p className="font-bold text-textMain">Preparing your adaptive explanation...</p>
        <div className="ai-thinking justify-center">
          <span></span>
          <span></span>
          <span></span>
        </div>
      </div>
    );
  }

  if (err && !data) {
    return (
      <div className="card p-8 text-center space-y-4">
        <p className="text-red-600 font-medium">{err}</p>
        <Link to="/courses" className="btn-secondary text-xs">
          ← Back to Courses
        </Link>
      </div>
    );
  }

  const title = data?.title || "Aptitude Concept";
  const explanationText = data?.[activeMode] || data?.simple || "Explanation loading...";
  const questions = data?.questions || [];
  const mcqQuestions = questions.filter((q) => q.kind === "mcq");
  const ownWordsQ = questions.find((q) => q.kind === "own_words");

  const minutes = Math.floor(secondsLeft / 60);
  const seconds = secondsLeft % 60;
  const timerDisplay = `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;

  return (
    <div className="space-y-8 max-w-4xl pb-16">
      {/* Top Navigation & Status Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border pb-4">
        <div className="flex items-center gap-3">
          <Link
            to={`/schedule/${planId}`}
            className="btn-secondary text-xs py-1.5 px-3"
          >
            ← Schedule
          </Link>
          <div>
            <p className="text-[11px] uppercase tracking-wider text-textSoft font-bold">Concept Coach Session</p>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-textMain">{title}</h1>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Focus timer badge */}
          <div className="flex items-center gap-1.5 text-xs bg-surfaceSoft px-3 py-1.5 rounded-full font-mono font-bold text-textMain border border-border">
            <span>⏱️</span>
            <span>{timerDisplay}</span>
          </div>

          {/* Language Toggle */}
          <div className="flex bg-surfaceSoft p-1 rounded-full text-xs font-semibold border border-border">
            <button
              type="button"
              onClick={() => handleLanguageSwitch("english")}
              className={`px-3 py-1 rounded-full transition-all ${
                language === "english" ? "bg-white text-primary shadow-sm font-bold" : "text-textSoft"
              }`}
            >
              English
            </button>
            <button
              type="button"
              onClick={() => handleLanguageSwitch("tamil")}
              className={`px-3 py-1 rounded-full transition-all ${
                language === "tamil" ? "bg-white text-primary shadow-sm font-bold" : "text-textSoft"
              }`}
            >
              தமிழ் (Tamil)
            </button>
          </div>
        </div>
      </div>

      {/* Core Explanation Panel */}
      <div className="card space-y-6">
        {/* Mode Switcher Tabs */}
        <div className="flex flex-wrap gap-2 border-b border-border pb-4">
          {MODES.map((m) => (
            <button
              key={m.key}
              type="button"
              onClick={() => setActiveMode(m.key)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeMode === m.key
                  ? "bg-primary text-white shadow-sm scale-[1.02]"
                  : "bg-surfaceSoft text-textSoft hover:bg-border"
              }`}
            >
              <span>{m.label}</span>
            </button>
          ))}
        </div>

        {/* Dynamic Explanation Content Body */}
        <div className="space-y-4 min-h-[140px]">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase font-bold text-textSoft">
              Current Angle: <strong className="text-primary capitalize">{activeMode}</strong>
            </span>

            <button
              type="button"
              onClick={() => handleVoiceRead(explanationText)}
              className={`voice-btn ${speaking ? "bg-primary text-white" : ""}`}
            >
              <span>{speaking ? "⏹️ Stop Voice" : "🔊 Listen"}</span>
            </button>
          </div>

          <div className="p-5 rounded-2xl bg-surfaceSoft border border-border text-textMain leading-relaxed whitespace-pre-wrap text-sm sm:text-base font-sans">
            {explanationText}
          </div>
        </div>

        {/* "Explain Again" Button */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-border">
          <div className="text-xs text-textSoft">
            <span>Struggling to visualize? </span>
            <strong className="text-textMain">We adapt the explanation until it clicks.</strong>
          </div>

          <button
            type="button"
            onClick={handleExplainAgain}
            className="voice-btn border-primary text-primary hover:bg-primary hover:text-white"
          >
            <span>🔊</span>
            <span>Explain Again (Different Angle / Simpler)</span>
          </button>
        </div>
      </div>

      {/* Result feedback banner */}
      {result && (
        <div
          className={`card space-y-3 transition-all ${
            result.understood ? "border-2 border-emerald-400 bg-emerald-50/50" : "border-2 border-amber-400 bg-amber-50/50"
          }`}
        >
          <div className="flex items-start gap-3">
            <span className="text-3xl">{result.understood ? "🎉" : "💡"}</span>
            <div className="space-y-1">
              <h3 className="text-xl font-extrabold text-textMain">
                {result.understood ? "Concept Mastered!" : "Let's Try Another Explanation"}
              </h3>
              <p className="text-xs sm:text-sm text-textSoft">{result.message}</p>
              {result.understood && (
                <div className="flex items-center gap-3 pt-2 text-xs font-bold text-emerald-600">
                  <span>+20 Learning XP Earned</span>
                  <span>•</span>
                  <span>Progress Saved</span>
                </div>
              )}
            </div>
          </div>

          {result.understood && (
            <div className="pt-2">
              <Link
                to={`/schedule/${planId}`}
                className="btn-primary text-xs"
              >
                Back to Schedule & Next Concept →
              </Link>
            </div>
          )}
        </div>
      )}

      {/* Understanding Check Form */}
      <form onSubmit={handleSubmitCheck} className="card space-y-6 border-2 border-primary/20">
        <div>
          <span className="text-xs uppercase tracking-wider text-primary font-extrabold">Active Verification</span>
          <h2 className="text-2xl font-extrabold text-textMain mt-1">Understanding Check</h2>
          <p className="text-xs text-textSoft mt-1">
            "If you don't understand it, we don't move on." Test your grasp to earn XP and unlock the next concept.
          </p>
        </div>

        {/* MCQs */}
        <div className="space-y-4">
          {mcqQuestions.map((q, idx) => (
            <fieldset key={q.id} className="p-4 rounded-xl bg-surfaceSoft space-y-3 border border-border">
              <legend className="font-semibold text-xs sm:text-sm text-textMain leading-relaxed px-1">
                {idx + 1}. {q.prompt}
              </legend>
              <div className="space-y-2">
                {q.options.map((opt, optIdx) => (
                  <label
                    key={optIdx}
                    className={`flex items-start gap-3 rounded-xl p-3 text-xs cursor-pointer transition-all border ${
                      mcqAnswers[q.id] === optIdx
                        ? "bg-primary/10 border-primary font-bold text-textMain shadow-sm"
                        : "bg-surface border-border hover:bg-white text-textSoft"
                    }`}
                  >
                    <input
                      type="radio"
                      name={q.id}
                      checked={mcqAnswers[q.id] === optIdx}
                      onChange={() => setMcqAnswers({ ...mcqAnswers, [q.id]: optIdx })}
                      className="mt-0.5 accent-primary"
                    />
                    <span>{opt}</span>
                  </label>
                ))}
              </div>
            </fieldset>
          ))}
        </div>

        {/* "Explain in your own words" (Feynman check) */}
        {ownWordsQ && (
          <div className="space-y-2">
            <label className="block text-xs uppercase font-bold text-textMain">
              🗣️ {ownWordsQ.prompt}
            </label>
            <p className="text-xs text-textSoft">
              Explaining in simple words activates active recall. Mention one number or rule.
            </p>
            <textarea
              rows={3}
              className="w-full rounded-xl border border-border p-3.5 text-xs sm:text-sm bg-surface focus:outline-none focus:border-primary transition-colors"
              placeholder="e.g. In my own words, this aptitude concept connects the starting inputs to the final target by..."
              value={ownWords}
              onChange={(e) => setOwnWords(e.target.value)}
            />
          </div>
        )}

        <div className="flex items-center justify-between pt-4 border-t border-border">
          <Link to={`/schedule/${planId}`} className="text-xs font-semibold text-textSoft hover:underline">
            ← Save & return to schedule
          </Link>

          <button
            type="submit"
            disabled={checking}
            className="btn-primary text-xs sm:text-sm px-6 py-3"
          >
            {checking ? (
              <span className="flex items-center gap-2">
                <span>Checking Understanding</span>
                <span className="ai-thinking">
                  <span></span>
                  <span></span>
                  <span></span>
                </span>
              </span>
            ) : (
              "Check My Understanding ✓"
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
