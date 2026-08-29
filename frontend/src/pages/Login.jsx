import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api, setToken } from "../api";

export default function Login() {
  const nav = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(e) {
    e.preventDefault();
    setErr("");
    setLoading(true);
    try {
      const data = await api("/api/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      });
      setToken(data.token);
      nav("/dashboard");
    } catch (ex) {
      setErr(ex.message || "Invalid email or password");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="grasp-page min-h-screen flex items-center justify-center p-6">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-2">
          <Link to="/" className="logo justify-center text-2xl inline-flex mb-1">
            <span>Concepta</span>
          </Link>
          <h1 className="text-3xl font-extrabold text-textMain tracking-tight">Welcome Back</h1>
          <p className="text-xs text-textSoft">
            Sign in to continue your personalized aptitude learning plan.
          </p>
        </div>

        <form onSubmit={submit} className="card space-y-4">
          <div>
            <label className="block text-xs uppercase font-bold text-textSoft mb-1.5">Email Address</label>
            <input
              className="w-full rounded-xl border border-border bg-surface px-4 py-3 text-sm focus:outline-none focus:border-primary transition-colors"
              placeholder="e.g. kutty@example.com"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block text-xs uppercase font-bold text-textSoft mb-1.5">Password</label>
            <input
              className="w-full rounded-xl border border-border bg-surface px-4 py-3 text-sm focus:outline-none focus:border-primary transition-colors"
              type="password"
              placeholder="Your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {err && <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl">⚠️ {err}</div>}

          <button type="submit" disabled={loading} className="btn-primary w-full text-sm py-3 mt-2">
            {loading ? "Signing in…" : "Sign In to Dashboard →"}
          </button>
        </form>

        <div className="text-center">
          <p className="text-xs text-textSoft">
            New to Concepta?{" "}
            <Link className="font-semibold text-primary hover:underline" to="/signup">
              Create a free learning profile
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
