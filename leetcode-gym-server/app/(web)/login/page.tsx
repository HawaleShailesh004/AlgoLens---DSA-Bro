// login.jsx — AlgoLens (Redesigned)

"use client";

import { Suspense, useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2, Mail, Lock, ArrowRight, UserPlus, LogIn } from "lucide-react";
import { setStoredAuth, getStoredToken } from "../layout";

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isSignup, setIsSignup] = useState(false);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState("");
  const [formData, setFormData] = useState({ email: "", password: "" });

  useEffect(() => {
    if (typeof window !== "undefined" && getStoredToken()) router.replace("/dashboard");
    const errorParam = searchParams.get("error");
    if (errorParam) {
      setError(errorParam === "no_email" ? "No email found. Please grant email access." : 
               errorParam === "oauth_not_configured" ? "OAuth not configured. Please use email/password." :
               errorParam === "token_exchange_failed" ? "Authentication failed. Please try again." :
               "Authentication error. Please try again.");
    }
  }, [router, searchParams]);

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
    <div className="min-h-screen flex items-center justify-center p-6 relative overflow-hidden" style={{ backgroundColor: "var(--bg)" }}>
      <div className="relative w-full max-w-md">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded mb-4 border" style={{ backgroundColor: "var(--green-dim)", borderColor: "var(--border-green)" }}>
            <span className="text-2xl font-black" style={{ color: "var(--green)" }}>λ</span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight" style={{ color: "var(--text)" }}>Grindset</h1>
          <p className="text-sm mt-1 font-medium tracking-wide" style={{ color: "var(--muted)" }}>YOUR PERSONAL DSA GYM</p>
        </div>

        <div className="flex border rounded-xl p-1 mb-6" style={{ backgroundColor: "var(--card)", borderColor: "var(--border)" }}>
          {(["login", "signup"] as const).map(mode => (
            <button
              key={mode}
              type="button"
              onClick={() => { setIsSignup(mode === "signup"); setError(""); }}
              className="flex-1 py-2.5 rounded-lg text-base font-semibold transition-all"
              style={
                (mode === "signup") === isSignup
                  ? { backgroundColor: "var(--green)", color: "#000000" }
                  : { color: "var(--muted)" }
              }
            >
              {mode === "login" ? "Sign In" : "Create Account"}
            </button>
          ))}
        </div>

        <div className="mb-6 space-y-2">
          <a
            href="/api/auth/oauth/google"
            className="flex items-center justify-center gap-2 w-full py-2.5 px-4 border rounded-xl font-medium transition-colors hover:opacity-90"
            style={{ backgroundColor: "var(--surface)", borderColor: "var(--border)", color: "var(--text)" }}
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Continue with Google
          </a>
          <a
            href="/api/auth/oauth/github"
            className="flex items-center justify-center gap-2 w-full py-2.5 px-4 border rounded-xl font-medium transition-colors hover:opacity-90"
            style={{ backgroundColor: "var(--surface)", borderColor: "var(--border)", color: "var(--text)" }}
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd"/>
            </svg>
            Continue with GitHub
          </a>
        </div>

        <div className="relative mb-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t" style={{ borderColor: "var(--border)" }}></div>
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="px-2" style={{ backgroundColor: "var(--bg)", color: "var(--muted)" }}>Or continue with email</span>
          </div>
        </div>

        <div className="border rounded-2xl p-6" style={{ backgroundColor: "var(--card)", borderColor: "var(--border)" }}>
          {error && (
            <div className="mb-4 px-4 py-3 rounded-xl text-xs text-center font-medium border" style={{ backgroundColor: "var(--red-dim)", borderColor: "rgba(239,68,68,0.3)", color: "var(--red)" }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider mb-1.5" style={{ color: "var(--muted)" }}>
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: "var(--muted)" }} />
                <input
                  type="email"
                  placeholder="you@example.com"
                  required
                  value={formData.email}
                  onChange={e => setFormData({ ...formData, email: e.target.value })}
                  className="w-full border rounded-xl py-3 pl-10 pr-4 text-base outline-none transition-all"
                  style={{ backgroundColor: "var(--surface)", borderColor: "var(--border)", color: "var(--text)" }}
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-bold uppercase tracking-wider" style={{ color: "var(--muted)" }}>
                  Password
                </label>
                {!isSignup && (
                  <Link href="/forgot-password" className="text-xs transition-colors hover:opacity-90" style={{ color: "var(--green)" }}>
                    Forgot?
                  </Link>
                )}
              </div>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: "var(--muted)" }} />
                <input
                  type="password"
                  placeholder={isSignup ? "At least 6 characters" : "Your password"}
                  required
                  value={formData.password}
                  onChange={e => setFormData({ ...formData, password: e.target.value })}
                  className="w-full border rounded-xl py-3 pl-10 pr-4 text-base outline-none transition-all"
                  style={{ backgroundColor: "var(--surface)", borderColor: "var(--border)", color: "var(--text)" }}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 font-bold py-3 rounded-xl text-sm flex items-center justify-center gap-2 transition-all border disabled:opacity-50"
              style={{ backgroundColor: "var(--green)", color: "#000000", borderColor: "var(--green)" }}
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

        <p className="text-center text-sm mt-6" style={{ color: "var(--muted)" }}>
          Solve more. Remember more. Get the offer.
        </p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: "var(--bg)" }}><Loader2 className="w-8 h-8 animate-spin" style={{ color: "var(--green)" }} /></div>}>
      <LoginContent />
    </Suspense>
  );
}