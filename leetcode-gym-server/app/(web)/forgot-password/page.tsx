"use client";

import { useState } from "react";
import Link from "next/link";
import { Loader2, Mail, ArrowLeft, CheckCircle } from "lucide-react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [resetLink, setResetLink] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setResetLink(null);
    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Something went wrong");
      setResetLink(data.resetLink);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  if (resetLink) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-zinc-950">
        <div className="w-full max-w-lg">
          <div className="mb-6 flex justify-center">
            <div className="w-12 h-12 rounded-full bg-green-500/20 flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-green-500" />
            </div>
          </div>
          <h1 className="text-2xl font-bold text-zinc-100 text-center">
            Check your reset link
          </h1>
          <p className="text-base text-zinc-500 text-center mt-2">
            Use the link below to set a new password. It expires in 1 hour.
          </p>
          <div className="mt-6 p-4 bg-zinc-900 border border-zinc-800 rounded-xl">
            <p className="text-xs text-zinc-500 mb-2">Reset link:</p>
            <a
              href={resetLink}
              className="text-base text-orange-400 hover:text-orange-300 break-all"
            >
              {resetLink}
            </a>
            <p className="text-xs text-zinc-500 mt-3">
              Copy the link and open it in this or another browser to set your new password.
            </p>
          </div>
          <Link
            href="/login"
            className="mt-6 flex items-center justify-center gap-2 text-base text-zinc-500 hover:text-orange-400"
          >
            <ArrowLeft size={14} />
            Back to sign in
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-zinc-950">
      <div className="w-full max-w-md">
        <Link
          href="/login"
          className="inline-flex items-center gap-2 text-base text-zinc-500 hover:text-orange-400 mb-6"
        >
          <ArrowLeft size={14} />
          Back to sign in
        </Link>
        <h1 className="text-2xl font-bold tracking-tight text-zinc-100">
          Forgot password?
        </h1>
        <p className="text-base text-zinc-500 mt-1">
          Enter your email and we&apos;ll give you a link to set a new password.
        </p>
        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          {error && (
            <div className="p-3 bg-red-900/20 border border-red-900/50 rounded-lg text-xs text-red-200">
              {error}
            </div>
          )}
          <div className="relative">
            <Mail className="absolute left-3 top-2.5 text-zinc-500 w-4 h-4" />
            <input
              type="email"
              placeholder="Email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-zinc-900 border border-zinc-800 rounded-xl py-2.5 pl-9 pr-4 text-base text-zinc-100 placeholder-zinc-500 focus:border-orange-500 outline-none"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-orange-600 hover:bg-orange-500 disabled:opacity-50 text-white font-bold py-2.5 rounded-xl text-base flex items-center justify-center gap-2"
          >
            {loading ? <Loader2 className="animate-spin" size={16} /> : "Get reset link"}
          </button>
        </form>
      </div>
    </div>
  );
}
