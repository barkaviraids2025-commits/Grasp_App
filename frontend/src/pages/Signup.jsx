import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api, setToken } from "../api";

export const DEFAULT_QUESTIONS = [
  {
    id: "q1",
    section: "🧠 1. Learning Speed",
    prompt: "When learning a completely new topic, how long do you usually need before you feel comfortable with it?",
    options: [
      ["A", "Less than 30 minutes"],
      ["B", "30–60 minutes"],
      ["C", "1–2 hours"],
      ["D", "More than 2 hours"],
      ["E", "It depends heavily on the topic"],
    ],
  },
  {
    id: "q2",
    section: "🧠 1. Learning Speed",
    prompt: "What do you usually do when you don't understand something?",
    options: [
      ["A", "Try solving it myself first"],
      ["B", "Search/watch another explanation"],
      ["C", "Ask someone"],
      ["D", "Skip it and come back later"],
      ["E", "Usually leave it unfinished"],
    ],
  },
  {
    id: "q3",
    section: "🎯 2. Focus",
    prompt: "How long can you usually study with good concentration?",
    options: [
      ["A", "Less than 15 minutes"],
      ["B", "15–30 minutes"],
      ["C", "30–60 minutes"],
      ["D", "1–2 hours"],
      ["E", "More than 2 hours"],
    ],
  },
  {
    id: "q4",
    section: "🎯 2. Focus",
    prompt: "How often do you get distracted while studying?",
    options: [
      ["A", "Almost always"],
      ["B", "Often"],
      ["C", "Sometimes"],
      ["D", "Rarely"],
      ["E", "Almost never"],
    ],
  },
  {
    id: "q5",
    section: "🧩 3. Thinking & Problem Solving",
    prompt: "When you face a difficult problem, what is your first reaction?",
    options: [
      ["A", "Break it into smaller parts"],
      ["B", "Try different approaches"],
      ["C", "Search for a solution/example"],
      ["D", "Ask someone for help"],
      ["E", "Feel stuck and move on"],
    ],
  },
  {
    id: "q6",
    section: "🧩 3. Thinking & Problem Solving",
    prompt: "When you make a mistake while solving something, what do you usually do?",
    options: [
      ["A", "Analyse exactly where I went wrong"],
      ["B", "Look at the solution and try again"],
      ["C", "Ask someone to explain it"],
      ["D", "Memorize the correct approach"],
      ["E", "Move on to the next question"],
    ],
  },
  {
    id: "q7",
    section: "📖 4. How They Learn",
    prompt: "Which method helps you understand a topic fastest?",
    options: [
      ["A", "Reading"],
      ["B", "Watching an explanation"],
      ["C", "Practising questions"],
      ["D", "Seeing real-world examples"],
      ["E", "Explaining it to someone else"],
    ],
  },
  {
    id: "q8",
    section: "📖 4. How They Learn",
    prompt: "When studying a difficult concept, what helps you most?",
    options: [
      ["A", "Step-by-step explanation"],
      ["B", "Visual diagrams"],
      ["C", "Examples"],
      ["D", "Practising immediately"],
      ["E", "Exploring it myself"],
    ],
  },
  {
    id: "q9",
    section: "🔁 5. Memory & Revision",
    prompt: "After learning something once, how well do you usually remember it after a few days?",
    options: [
      ["A", "I remember most of it"],
      ["B", "I remember the main idea"],
      ["C", "I remember some parts"],
      ["D", "I forget most of it"],
      ["E", "It depends on how interesting it was"],
    ],
  },
  {
    id: "q10",
    section: "🔁 5. Memory & Revision",
    prompt: "How often do you revise what you've studied?",
    options: [
      ["A", "Every day"],
      ["B", "Several times a week"],
      ["C", "Before exams"],
      ["D", "Only when I forget"],
      ["E", "Almost never"],
    ],
  },
  {
    id: "q11",
    section: "⏰ 6. Study Habits",
    prompt: "How many hours do you normally study outside college/school?",
    options: [
      ["A", "Less than 1 hour"],
      ["B", "1–2 hours"],
      ["C", "2–3 hours"],
      ["D", "3–5 hours"],
      ["E", "More than 5 hours"],
    ],
  },
  {
    id: "q12",
    section: "⏰ 6. Study Habits",
    prompt: "When do you study best?",
    options: [
      ["A", "Early morning"],
      ["B", "Afternoon"],
      ["C", "Evening"],
      ["D", "Late night"],
      ["E", "No particular time"],
    ],
  },
  {
    id: "q13",
    section: "🔥 7. Motivation",
    prompt: "What usually motivates you to study?",
    options: [
      ["A", "Curiosity"],
      ["B", "Good marks"],
      ["C", "Career/job goals"],
      ["D", "Competition with others"],
      ["E", "Pressure/deadlines"],
      ["F", "Parent/teacher expectations"],
    ],
  },
  {
    id: "q14",
    section: "🔥 7. Motivation",
    prompt: "What happens when you don't feel motivated?",
    options: [
      ["A", "I study anyway"],
      ["B", "I take a short break and return"],
      ["C", "I switch to an easier topic"],
      ["D", "I postpone studying"],
      ["E", "I usually stop studying"],
    ],
  },
  {
    id: "q15",
    section: "🪞 8. Self-awareness",
    prompt: "Which statement describes you best?",
    options: [
      ["A", "I understand quickly but forget quickly."],
      ["B", "I take time to understand but remember well."],
      ["C", "I need repeated practice to understand."],
      ["D", "I understand concepts quickly when they're explained clearly."],
      ["E", "My learning varies greatly depending on the subject."],
    ],
  },
];

export default function Signup() {
  const nav = useNavigate();
  const [questions, setQuestions] = useState(DEFAULT_QUESTIONS);
  const [step, setStep] = useState(0);
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    preferred_language: "english",
    answers: {},
  });

  useEffect(() => {
    api("/api/questions")
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setQuestions(data);
        }
      })
      .catch(() => {
        // Fallback to DEFAULT_QUESTIONS is already in place
      });
  }, []);

  const sections = useMemo(() => {
    const map = [];
    let current = null;
    questions.forEach((q) => {
      if (!current || current.section !== q.section) {
        current = { section: q.section, items: [] };
        map.push(current);
      }
      current.items.push(q);
    });
    return map;
  }, [questions]);

  // Step 0 = Account details, Steps 1..N = Question sections
  const totalSteps = 1 + sections.length;

  function setAnswer(id, choice) {
    setErr("");
    setForm((f) => ({ ...f, answers: { ...f.answers, [id]: choice } }));
  }

  function handleNext() {
    setErr("");

    // Validation for Step 0 (Account creation)
    if (step === 0) {
      if (!form.name.trim()) {
        setErr("Please enter your full name.");
        return;
      }
      if (!form.email.trim() || !form.email.includes("@")) {
        setErr("Please enter a valid email address.");
        return;
      }
      if (!form.password || form.password.length < 6) {
        setErr("Password must be at least 6 characters.");
        return;
      }
      setStep(1);
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    // Validation for Question Sections (Steps 1..N)
    const currentSection = sections[step - 1];
    if (currentSection) {
      const unanswered = currentSection.items.filter((q) => !form.answers[q.id]);
      if (unanswered.length > 0) {
        setErr(`Please select an answer for each question in this section.`);
        return;
      }
    }

    if (step < totalSteps - 1) {
      setStep((s) => s + 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      submit();
    }
  }

  async function submit() {
    setErr("");
    setLoading(true);
    try {
      // Ensure all 15 questions have answers
      const answeredCount = Object.keys(form.answers).length;
      if (answeredCount < 15) {
        // Auto-fill sensible default if any skipped
        const fullAnswers = { ...form.answers };
        DEFAULT_QUESTIONS.forEach((q) => {
          if (!fullAnswers[q.id]) fullAnswers[q.id] = "C";
        });
        form.answers = fullAnswers;
      }

      const data = await api("/api/auth/signup", {
        method: "POST",
        body: JSON.stringify(form),
      });
      setToken(data.token);
      nav("/dashboard");
    } catch (ex) {
      setErr(ex.message || "Failed to create profile. Please check details.");
    } finally {
      setLoading(false);
    }
  }

  const section = step === 0 ? null : sections[step - 1];
  const progressPercent = Math.round(((step + 1) / totalSteps) * 100);

  return (
    <div className="grasp-page py-10 px-4 sm:px-6">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <Link to="/" className="logo justify-center text-2xl mb-1 inline-flex">
            <span>Concepta</span>
          </Link>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-textMain tracking-tight">
            {step === 0 ? "Create Your Account" : "Adaptive Learning Assessment"}
          </h1>
          <p className="text-sm text-textSoft max-w-md mx-auto">
            {step === 0
              ? "Start with basic details, then answer 15 habit questions to shape your personalized study coach."
              : `Section ${step} of ${sections.length}: Analyzing your learning pattern, not your capability.`}
          </p>
        </div>

        {/* Animated Progress Bar */}
        <div className="progress-container">
          <div className="progress-info">
            <span>{step === 0 ? "Step 1 of 9: Account Info" : `Section ${step} of ${sections.length}: ${section?.section}`}</span>
            <span className="font-semibold text-primary">{progressPercent}%</span>
          </div>
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: `${progressPercent}%` }} />
          </div>
        </div>

        {/* Error Alert */}
        {err && (
          <div className="p-4 bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl animate-shake">
            ⚠️ {err}
          </div>
        )}

        {/* Step 0: Account Details Form */}
        {step === 0 && (
          <div className="card space-y-5">
            <div>
              <label className="block text-xs uppercase font-bold text-textSoft mb-1.5">Full Name</label>
              <input
                className="w-full rounded-xl border border-border bg-surface px-4 py-3 text-sm focus:outline-none focus:border-primary transition-colors"
                placeholder="e.g. Kutty Raman"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-xs uppercase font-bold text-textSoft mb-1.5">Email Address</label>
              <input
                className="w-full rounded-xl border border-border bg-surface px-4 py-3 text-sm focus:outline-none focus:border-primary transition-colors"
                type="email"
                placeholder="e.g. kutty@example.com"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-xs uppercase font-bold text-textSoft mb-1.5">Phone Number (Optional)</label>
              <input
                className="w-full rounded-xl border border-border bg-surface px-4 py-3 text-sm focus:outline-none focus:border-primary transition-colors"
                placeholder="e.g. +91 98765 43210"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-xs uppercase font-bold text-textSoft mb-1.5">Password</label>
              <input
                className="w-full rounded-xl border border-border bg-surface px-4 py-3 text-sm focus:outline-none focus:border-primary transition-colors"
                type="password"
                placeholder="At least 6 characters"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-xs uppercase font-bold text-textSoft mb-1.5">Preferred Explanation Language</label>
              <select
                className="w-full rounded-xl border border-border bg-surface px-4 py-3 text-sm focus:outline-none focus:border-primary transition-colors"
                value={form.preferred_language}
                onChange={(e) => setForm({ ...form, preferred_language: e.target.value })}
              >
                <option value="english">English (Plain & intuitive)</option>
                <option value="tamil">தமிழ் - Tamil (Native analogies)</option>
              </select>
              <p className="text-xs text-textSoft mt-1">You can switch languages anytime inside learning sessions.</p>
            </div>
          </div>
        )}

        {/* Steps 1..N: Question Sections */}
        {section && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl sm:text-2xl font-bold text-textMain">{section.section}</h2>
              <span className="text-xs font-semibold px-3 py-1 bg-primary/10 text-primary rounded-full">
                {section.items.length} Questions
              </span>
            </div>

            {section.items.map((q, idx) => (
              <fieldset key={q.id} className="card space-y-3">
                <legend className="font-semibold text-sm sm:text-base text-textMain leading-relaxed mb-3">
                  {idx + 1}. {q.prompt}
                </legend>
                <div className="space-y-2">
                  {q.options.map(([code, label]) => {
                    const isSelected = form.answers[q.id] === code;
                    return (
                      <label
                        key={code}
                        className={`flex items-start gap-3 rounded-xl p-3.5 cursor-pointer border transition-all text-xs sm:text-sm ${
                          isSelected
                            ? "border-primary bg-primary/10 font-semibold text-textMain shadow-sm scale-[1.01]"
                            : "border-border bg-surface hover:bg-surfaceSoft text-textMain/80"
                        }`}
                      >
                        <input
                          type="radio"
                          name={q.id}
                          checked={isSelected}
                          onChange={() => setAnswer(q.id, code)}
                          className="mt-0.5 accent-primary"
                        />
                        <span className="leading-snug">
                          <strong className="mr-1 text-primary">{code}.</strong>
                          {label}
                        </span>
                      </label>
                    );
                  })}
                </div>
              </fieldset>
            ))}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex items-center justify-between pt-2">
          <button
            type="button"
            className="btn-secondary text-sm"
            disabled={step === 0}
            style={{ opacity: step === 0 ? 0.4 : 1, pointerEvents: step === 0 ? "none" : "auto" }}
            onClick={() => {
              setErr("");
              setStep((s) => s - 1);
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
          >
            ← Back
          </button>

          {step === 0 ? (
            <button
              type="button"
              className="btn-primary"
              onClick={handleNext}
            >
              Start 15 Questions Assessment →
            </button>
          ) : step < totalSteps - 1 ? (
            <button
              type="button"
              className="btn-primary"
              onClick={handleNext}
            >
              Next Section ({sections[step]?.section || "Continue"}) →
            </button>
          ) : (
            <button
              type="button"
              disabled={loading}
              className="btn-primary"
              onClick={handleNext}
            >
              {loading ? "Generating Learning Profile…" : "Complete & Build My Profile 🎉"}
            </button>
          )}
        </div>

        {/* Signin Link */}
        <div className="text-center pt-4">
          <p className="text-xs text-textSoft">
            Already have an account?{" "}
            <Link className="font-semibold text-primary hover:underline" to="/login">
              Sign in to Concepta
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
