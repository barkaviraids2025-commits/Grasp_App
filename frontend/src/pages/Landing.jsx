import { Link } from "react-router-dom";
import { motion } from "framer-motion";

export default function Landing() {
  return (
    <div className="grasp-page min-h-screen">
      {/* Navbar */}
      <nav className="navbar">
        <Link to="/" className="logo">
          <span>Concepta</span>
        </Link>
        <div className="flex items-center gap-3">
          <Link to="/login" className="btn-secondary text-xs">
            Sign In
          </Link>
          <Link to="/signup" className="btn-primary text-xs">
            Create Profile →
          </Link>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-6 py-16 space-y-16">
        {/* Hero Section */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-3xl mx-auto space-y-6"
        >
          <span className="inline-block uppercase tracking-wider text-xs font-bold px-3.5 py-1 rounded-full bg-primary/10 text-primary border border-primary/20">
            Quantitative Analysis & Aptitude AI Coach
          </span>

          <h1 className="text-4xl sm:text-6xl font-extrabold text-textMain tracking-tight leading-tight">
            Don't study more. <br />
            <span className="bg-gradient-to-r from-primary via-indigo-500 to-accent bg-clip-text text-transparent">
              Understand better.
            </span>
          </h1>

          <p className="text-base sm:text-lg text-textSoft leading-relaxed max-w-2xl mx-auto">
            Upload any PDF or PPT notes. Set a deadline. We build an adaptive schedule shaped around your personal
            learning profile — then explain every concept in multiple ways until it genuinely clicks.
          </p>

          <div className="pt-4 flex flex-wrap justify-center items-center gap-4">
            <Link to="/signup" className="btn-primary text-sm px-8 py-4">
              Start with a Learning Profile →
            </Link>
            <Link to="/login" className="btn-secondary text-sm px-7 py-3.5">
              Sign In to Account
            </Link>
          </div>
        </motion.section>

        {/* Feature Cards Grid */}
        <section className="grid sm:grid-cols-3 gap-6">
          <div className="card space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-2xl">
              📄
            </div>
            <h3 className="font-extrabold text-lg text-textMain">1. Upload → Plan</h3>
            <p className="text-xs text-textSoft leading-relaxed">
              Drop any PDF, slides, or syllabus notes. AI extracts concepts, difficulty, and generates a day-by-day schedule.
            </p>
          </div>

          <div className="card space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-accent/15 flex items-center justify-center text-2xl">
              🎨
            </div>
            <h3 className="font-extrabold text-lg text-textMain">2. Learn → Adapt</h3>
            <p className="text-xs text-textSoft leading-relaxed">
              Simple text, diagrams, worked examples, voice walkthroughs, and native Tamil analogies until you master it.
            </p>
          </div>

          <div className="card space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/15 flex items-center justify-center text-2xl">
              🧠
            </div>
            <h3 className="font-extrabold text-lg text-textMain">3. Prove → Master</h3>
            <p className="text-xs text-textSoft leading-relaxed">
              Feynman active-recall validation, instant PDF revision notes, and leaderboard XP based on real comprehension.
            </p>
          </div>
        </section>

        {/* Core Philosophy Banner */}
        <section className="card p-8 sm:p-10 text-center space-y-3 bg-gradient-to-br from-white to-surfaceSoft border border-primary/20">
          <span className="text-xs font-bold uppercase tracking-wider text-primary">Core Differentiator</span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-textMain">
            "If you don't understand it, we don't move on."
          </h2>
          <p className="text-xs sm:text-sm text-textSoft max-w-xl mx-auto leading-relaxed">
            Unlike standard study apps that rush through quizzes, Concepta detects when you struggle and automatically switches explanation angles.
          </p>
          <div className="pt-2">
            <Link to="/signup" className="btn-primary text-xs">
              Get Started Free →
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}
