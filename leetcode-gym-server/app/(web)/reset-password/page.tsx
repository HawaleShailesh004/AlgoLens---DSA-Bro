"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Loader2, Lock, ArrowLeft, CheckCircle } from "lucide-react";

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!token) setError("Missing reset link. Request a new one from the login page.");
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, newPassword }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Something went wrong");
      setSuccess(true);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6" style={{ backgroundColor: "var(--bg)" }}>
        <div className="w-full max-w-md text-center">
          <div className="mb-6 flex justify-center">
            <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ backgroundColor: "var(--green-dim)" }}>
              <CheckCircle className="w-6 h-6" style={{ color: "var(--green)" }} />
            </div>
          </div>
          <h1 className="text-2xl font-bold" style={{ color: "var(--text)" }}>Password updated</h1>
          <p className="text-base mt-2" style={{ color: "var(--muted)" }}>
            You can sign in with your new password now.
          </p>
          <Link
            href="/login"
            className="mt-6 inline-block w-full font-bold py-2.5 rounded-xl text-base text-center border"
            style={{ backgroundColor: "var(--green)", color: "#000000", borderColor: "var(--green)" }}
          >
            Sign in
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6" style={{ backgroundColor: "var(--bg)" }}>
      <div className="w-full max-w-md">
        <Link
          href="/login"
          className="inline-flex items-center gap-2 text-base mb-6 transition-colors hover:opacity-90"
          style={{ color: "var(--green)" }}
        >
          <ArrowLeft size={14} />
          Back to sign in
        </Link>
        <h1 className="text-2xl font-bold tracking-tight" style={{ color: "var(--text)" }}>
          Set new password
        </h1>
        <p className="text-base mt-1" style={{ color: "var(--muted)" }}>
          Enter your new password below (at least 6 characters).
        </p>
        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          {error && (
            <div className="p-3 rounded-lg text-xs border" style={{ backgroundColor: "var(--red-dim)", borderColor: "rgba(239,68,68,0.3)", color: "var(--red)" }}>
              {error}
            </div>
          )}
          <div className="relative">
            <Lock className="absolute left-3 top-2.5 w-4 h-4" style={{ color: "var(--muted)" }} />
            <input
              type="password"
              placeholder="New password"
              required
              minLength={6}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full rounded-xl py-2.5 pl-9 pr-4 text-base border outline-none"
              style={{ backgroundColor: "var(--surface)", borderColor: "var(--border)", color: "var(--text)" }}
            />
          </div>
          <div className="relative">
            <Lock className="absolute left-3 top-2.5 w-4 h-4" style={{ color: "var(--muted)" }} />
            <input
              type="password"
              placeholder="Confirm new password"
              required
              minLength={6}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full rounded-xl py-2.5 pl-9 pr-4 text-base border outline-none"
              style={{ backgroundColor: "var(--surface)", borderColor: "var(--border)", color: "var(--text)" }}
            />
          </div>
          <button
            type="submit"
            disabled={loading || !token}
            className="w-full font-bold py-2.5 rounded-xl text-base flex items-center justify-center gap-2 border disabled:opacity-50"
            style={{ backgroundColor: "var(--green)", color: "#000000", borderColor: "var(--green)" }}
          >
            {loading ? <Loader2 className="animate-spin" size={16} /> : "Update password"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: "var(--bg)" }}>
          <Loader2 className="animate-spin w-8 h-8" style={{ color: "var(--green)" }} />
        </div>
      }
    >
      <ResetPasswordForm />
    </Suspense>
  );
}
