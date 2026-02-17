// login.jsx — AlgoLens (Redesigned)

"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Loader2, Mail, Lock, ArrowRight, UserPlus, LogIn } from "lucide-react";
import { setStoredAuth, getStoredToken } from "../layout";

export default function LoginPage() {
  const router = useRouter();
  const [isSignup, setIsSignup] = useState(false);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState("");
  const [formData, setFormData] = useState({ email: "", password: "" });

  useEffect(() => {
    if (typeof window !== "undefined" && getStoredToken()) router.replace("/dashboard");
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: isSignup ? "signup" : "login", ...formData }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Something went wrong");
      setStoredAuth(data.token, { id: data.id, email: data.email });
      router.push("/dashboard");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6 relative overflow-hidden">
      {/* Ambient glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-violet-600/6 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-[300px] h-[300px] bg-indigo-600/5 rounded-full blur-3xl" />
      </div>

      <div className="relative w-full max-w-md">

        {/* Logo */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-violet-500/15 border border-violet-500/30 rounded-2xl mb-4 shadow-xl shadow-violet-900/20">
            <span className="text-2xl font-black text-violet-300">λ</span>
          </div>
          <h1 className="text-3xl font-bold text-white tracking-tight">AlgoLens</h1>
          <p className="text-sm text-slate-500 mt-1 font-medium tracking-wide">YOUR PERSONAL DSA GYM</p>
        </div>

        {/* Toggle: Login / Signup */}
        <div className="flex bg-slate-900/80 border border-slate-800 rounded-xl p-1 mb-6">
          {(["login", "signup"] as const).map(mode => (
            <button
              key={mode}
              type="button"
              onClick={() => { setIsSignup(mode === "signup"); setError(""); }}
              className={`flex-1 py-2.5 rounded-lg text-base font-semibold transition-all ${
                (mode === "signup") === isSignup
                  ? "bg-violet-600 text-white shadow-sm"
                  : "text-slate-500 hover:text-slate-300"
              }`}
            >
              {mode === "login" ? "Sign In" : "Create Account"}
            </button>
          ))}
        </div>

        {/* Form card */}
        <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-6 backdrop-blur-sm">
          {error && (
            <div className="mb-4 px-4 py-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-xs text-rose-300 text-center font-medium">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email */}
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-600 w-4 h-4" />
                <input
                  type="email"
                  placeholder="you@example.com"
                  required
                  value={formData.email}
                  onChange={e => setFormData({ ...formData, email: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 pl-10 pr-4 text-base text-slate-100 placeholder-slate-600 focus:border-violet-500/60 focus:bg-slate-900 outline-none transition-all"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Password
                </label>
                {!isSignup && (
                  <Link
                    href="/forgot-password"
                    className="text-xs text-slate-600 hover:text-violet-400 transition-colors"
                  >
                    Forgot?
                  </Link>
                )}
              </div>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-600 w-4 h-4" />
                <input
                  type="password"
                  placeholder={isSignup ? "At least 6 characters" : "Your password"}
                  required
                  value={formData.password}
                  onChange={e => setFormData({ ...formData, password: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 pl-10 pr-4 text-base text-slate-100 placeholder-slate-600 focus:border-violet-500/60 focus:bg-slate-900 outline-none transition-all"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 bg-violet-600 hover:bg-violet-500 disabled:opacity-50 text-white font-bold py-3 rounded-xl text-sm flex items-center justify-center gap-2 transition-all shadow-lg shadow-violet-900/30 border border-violet-500/30"
            >
              {loading
                ? <Loader2 className="animate-spin" size={16} />
                : (
                  <>
                    {isSignup ? <UserPlus size={15} /> : <LogIn size={15} />}
                    {isSignup ? "Create Account" : "Sign In"}
                    <ArrowRight size={15} className="ml-0.5" />
                  </>
                )
              }
            </button>
          </form>
        </div>

        {/* Tagline */}
        <p className="text-center text-sm text-slate-600 mt-6">
          Solve more. Remember more. Get the offer.
        </p>
      </div>
    </div>
  );
}