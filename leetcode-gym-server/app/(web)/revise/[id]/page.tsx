"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import {
  Loader2,
  ExternalLink,
  ArrowLeft,
  BrainCircuit,
  Zap,
  Clock,
  Code,
  AlertCircle,
  Copy,
  Check,
  BookOpen,
} from "lucide-react";
import { getStoredToken } from "../../layout";

type LogDetail = {
  id: string;
  slug: string;
  title: string;
  difficulty: string;
  confidence: number;
  nextReviewAt: string;
  category: string | null;
  approach: string | null;
  complexity: string | null;
  codeSnippet: string | null;
  solution: string | null;
  keyInsight: string | null;
  mnemonic: string | null;
  timeTaken: number | null;
  timeLimit: number | null;
  metTimeLimit: boolean | null;
  language: string | null;
  reviewedAt: string;
};

function formatDate(s: string) {
  const d = new Date(s);
  return d.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default function RevisePage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string | undefined;
  const [log, setLog] = useState<LogDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!id) return;
    const token = getStoredToken();
    if (!token) {
      router.push("/login");
      return;
    }
    fetch(`/api/log/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => {
        if (res.status === 401) {
          router.push("/login");
          return null;
        }
        if (!res.ok) throw new Error("Failed to load");
        return res.json();
      })
      .then((data) => {
        setLog(data);
      })
      .catch(() => setError("Could not load this log"))
      .finally(() => setLoading(false));
  }, [id, router]);

  const copyCode = () => {
    const text = log?.solution || log?.codeSnippet || "";
    if (!text) return;
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-3" style={{ color: "var(--muted)" }}>
        <Loader2 className="w-8 h-8 animate-spin" style={{ color: "var(--green)" }} />
        <span className="text-sm">Loading...</span>
      </div>
    );
  }

  if (error || !log) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-center px-4">
        <AlertCircle className="w-10 h-10 mb-3" style={{ color: "var(--red)" }} />
        <p className="text-sm" style={{ color: "var(--text-2)" }}>{error || "Not found"}</p>
        <Link
          href="/dashboard"
          className="mt-4 flex items-center gap-2 text-sm font-medium transition-colors hover:opacity-90"
          style={{ color: "var(--green)" }}
        >
          <ArrowLeft size={14} />
          Back to Dashboard
        </Link>
      </div>
    );
  }

  const solutionText = log.solution || log.codeSnippet || null;
  const leetcodeUrl = `https://leetcode.com/problems/${log.slug}`;
  const diffStyle = log.difficulty === "Hard" ? { bg: "var(--red-dim)", color: "var(--red)", border: "rgba(239,68,68,0.3)" } : log.difficulty === "Medium" ? { bg: "var(--amber-dim)", color: "var(--amber)", border: "rgba(245,158,11,0.3)" } : { bg: "var(--green-dim)", color: "var(--green)", border: "var(--border-green)" };

  return (
    <div className="min-h-screen" style={{ backgroundColor: "var(--bg)" }}>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 pb-16">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 text-sm transition-colors w-fit hover:opacity-90"
            style={{ color: "var(--text-2)" }}
          >
            <ArrowLeft size={14} />
            Back to Queue
          </Link>
          <a
            href={leetcodeUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center justify-center gap-2 w-full sm:w-auto py-3 px-6 font-bold rounded-xl text-sm transition-all border"
            style={{
              backgroundColor: "var(--green)",
              color: "#000000",
              borderColor: "var(--green)",
            }}
          >
            <BookOpen size={18} />
            Practice on LeetCode
          </a>
        </div>

        <div className="border rounded-2xl overflow-hidden mb-6" style={{ backgroundColor: "var(--surface)", borderColor: "var(--border)" }}>
          <div className="p-5 sm:p-6 border-b" style={{ borderColor: "var(--border)" }}>
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span
                className="text-[10px] px-2 py-0.5 rounded font-semibold border"
                style={{ backgroundColor: diffStyle.bg, color: diffStyle.color, borderColor: diffStyle.border }}
              >
                {log.difficulty}
              </span>
              {log.language && (
                <span className="text-[10px] px-2 py-0.5 rounded font-medium" style={{ color: "var(--muted)", backgroundColor: "var(--card)" }}>
                  {log.language}
                </span>
              )}
            </div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight" style={{ color: "var(--text)" }}>
              {log.title}
            </h1>
            <div className="flex flex-wrap items-center gap-4 mt-3 text-xs" style={{ color: "var(--muted)" }}>
              <span>Reviewed {formatDate(log.reviewedAt)}</span>
              <span>Next: {formatDate(log.nextReviewAt)}</span>
              {log.timeTaken != null && (
                <span className="flex items-center gap-1">
                  <Clock size={12} />
                  {Math.floor(log.timeTaken / 60)}m {log.timeTaken % 60}s
                </span>
              )}
              {log.timeLimit != null && log.metTimeLimit != null && (
                <span style={{ color: log.metTimeLimit ? "var(--green)" : "var(--red)" }}>
                  {log.metTimeLimit ? "Within limit" : "Time out"}
                </span>
              )}
            </div>
          </div>
        </div>

        {(log.keyInsight || log.mnemonic) && (
          <div className="space-y-4 mb-6">
            {log.keyInsight && (
              <div className="border rounded-xl p-5" style={{ backgroundColor: "var(--green-dim)", borderColor: "var(--border-green)" }}>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-lg">💡</span>
                  <h2 className="text-xs font-bold uppercase tracking-wider" style={{ color: "var(--green)" }}>
                    Key Insight
                  </h2>
                </div>
                <p className="leading-relaxed" style={{ color: "var(--text)" }}>{log.keyInsight}</p>
              </div>
            )}
            {log.mnemonic && (
              <div className="border rounded-xl p-5" style={{ backgroundColor: "var(--green-dim)", borderColor: "var(--border-green)" }}>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-lg">🧠</span>
                  <h2 className="text-xs font-bold uppercase tracking-wider" style={{ color: "var(--green)" }}>
                    Remember
                  </h2>
                </div>
                <p className="font-medium italic leading-relaxed" style={{ color: "var(--text-2)" }}>{log.mnemonic}</p>
              </div>
            )}
          </div>
        )}

        <div className="space-y-6">
          {log.category && (
            <section className="border rounded-xl p-5" style={{ backgroundColor: "var(--card)", borderColor: "var(--border)" }}>
              <div className="flex items-center gap-2 mb-2">
                <BrainCircuit size={18} className="shrink-0" style={{ color: "var(--green)" }} />
                <h2 className="text-xs font-bold uppercase tracking-wider" style={{ color: "var(--text-2)" }}>
                  Pattern
                </h2>
              </div>
              <p className="font-medium" style={{ color: "var(--text)" }}>{log.category}</p>
            </section>
          )}

          {log.complexity && (
            <section className="border rounded-xl p-5" style={{ backgroundColor: "var(--card)", borderColor: "var(--border)" }}>
              <div className="flex items-center gap-2 mb-2">
                <Zap size={18} className="shrink-0" style={{ color: "var(--amber)" }} />
                <h2 className="text-xs font-bold uppercase tracking-wider" style={{ color: "var(--text-2)" }}>
                  Complexity
                </h2>
              </div>
              <p className="font-mono text-sm" style={{ color: "var(--text-2)" }}>{log.complexity}</p>
            </section>
          )}

          {log.approach && (
            <section className="border rounded-xl p-5" style={{ backgroundColor: "var(--card)", borderColor: "var(--border)" }}>
              <h2 className="text-xs font-bold uppercase tracking-wider mb-2" style={{ color: "var(--text-2)" }}>
                Approach
              </h2>
              <p className="leading-relaxed" style={{ color: "var(--text-2)" }}>{log.approach}</p>
            </section>
          )}

          {solutionText && (
            <section className="border rounded-xl overflow-hidden" style={{ backgroundColor: "var(--card)", borderColor: "var(--border)" }}>
              <div className="flex items-center justify-between px-5 py-3 border-b" style={{ borderColor: "var(--border)" }}>
                <div className="flex items-center gap-2">
                  <Code size={18} style={{ color: "var(--green)" }} />
                  <h2 className="text-xs font-bold uppercase tracking-wider" style={{ color: "var(--text-2)" }}>
                    Solution
                  </h2>
                </div>
                <button
                  type="button"
                  onClick={copyCode}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors border"
                  style={{ backgroundColor: "var(--card)", borderColor: "var(--border)", color: "var(--text-2)" }}
                >
                  {copied ? (
                    <><Check size={14} /> Copied</>
                  ) : (
                    <><Copy size={14} /> Copy</>
                  )}
                </button>
              </div>
              <pre className="p-5 text-sm font-mono overflow-x-auto whitespace-pre-wrap break-words leading-relaxed" style={{ color: "var(--code-text)", backgroundColor: "var(--code-bg)" }}>
                {solutionText}
              </pre>
            </section>
          )}
        </div>

        <div className="mt-8 pt-6 border-t" style={{ borderColor: "var(--border)" }}>
          <a
            href={leetcodeUrl}
            target="_blank"
            rel="noreferrer"
            className="flex items-center justify-center gap-2 w-full py-4 rounded-xl text-sm font-bold transition-all border"
            style={{
              backgroundColor: "var(--card)",
              borderColor: "var(--border)",
              color: "var(--text-2)",
            }}
          >
            <ExternalLink size={18} />
            Open on LeetCode to practice
          </a>
        </div>
      </div>
    </div>
  );
}
