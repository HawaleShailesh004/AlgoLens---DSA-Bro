// revise/[id]/page.jsx — AlgoLens (Redesigned)

"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import {
  Loader2, ExternalLink, ArrowLeft, BrainCircuit, Zap, Clock,
  Code, AlertCircle, Copy, Check, BookOpen, ChevronRight,
} from "lucide-react";
import { getStoredToken } from "../../layout";

type LogDetail = {
  id: string; slug: string; title: string; difficulty: string;
  confidence: number; nextReviewAt: string; category: string | null;
  approach: string | null; complexity: string | null;
  codeSnippet: string | null; solution: string | null;
  timeTaken: number | null; timeLimit: number | null;
  metTimeLimit: boolean | null; language: string | null;
  reviewedAt: string;
};

function fmt(s: string) {
  return new Date(s).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
}

const diffConfig: Record<string, { cls: string; dot: string }> = {
  Easy:   { cls: "text-emerald-400 bg-emerald-400/10 border-emerald-400/20", dot: "bg-emerald-400" },
  Medium: { cls: "text-amber-400  bg-amber-400/10  border-amber-400/20",    dot: "bg-amber-400"  },
  Hard:   { cls: "text-rose-400   bg-rose-400/10   border-rose-400/20",     dot: "bg-rose-400"   },
};

function SectionCard({ icon: Icon, iconCls, label, children }: {
  icon: React.ElementType; iconCls: string; label: string; children: React.ReactNode;
}) {
  return (
    <section className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-6">
      <div className="flex items-center gap-2.5 mb-4">
        <div className="w-8 h-8 rounded-lg bg-slate-800/80 flex items-center justify-center">
          <Icon size={15} className={iconCls} />
        </div>
        <span className="text-xs font-bold text-slate-500 uppercase tracking-[0.12em]">{label}</span>
      </div>
      {children}
    </section>
  );
}

export default function RevisePage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string | undefined;

  const [log,     setLog]     = useState<LogDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState<string | null>(null);
  const [copied,  setCopied]  = useState(false);

  useEffect(() => {
    if (!id) return;
    const token = getStoredToken();
    if (!token) { router.push("/login"); return; }
    fetch(`/api/log/${id}`, { headers: { Authorization: `Bearer ${token}` } })
      .then(res => {
        if (res.status === 401) { router.push("/login"); return null; }
        if (!res.ok) throw new Error("Failed to load");
        return res.json();
      })
      .then(d => d && setLog(d))
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
      <div className="min-h-screen bg-slate-950 flex items-center justify-center gap-3 text-slate-500">
        <Loader2 className="w-6 h-6 animate-spin text-violet-500" />
        <span className="text-sm">Loading…</span>
      </div>
    );
  }

  if (error || !log) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-center px-4 gap-4">
        <AlertCircle className="w-10 h-10 text-rose-500" />
        <p className="text-sm text-slate-300">{error || "Not found"}</p>
        <Link href="/dashboard" className="flex items-center gap-1.5 text-violet-400 hover:text-violet-300 text-sm font-medium transition-colors">
          <ArrowLeft size={14} /> Back to Dashboard
        </Link>
      </div>
    );
  }

  const solutionText  = log.solution || log.codeSnippet || null;
  const leetcodeUrl   = `https://leetcode.com/problems/${log.slug}`;
  const diff          = diffConfig[log.difficulty] ?? diffConfig.Medium;
  const confColors    = ["bg-rose-500", "bg-amber-500", "bg-emerald-500"];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      {/* Ambient */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 right-1/4 w-[400px] h-[400px] bg-violet-600/4 rounded-full blur-3xl" />
      </div>

      <div className="relative max-w-5xl mx-auto px-4 sm:px-6 py-8 pb-20">

        {/* ── Top nav bar ──────────────────────────────────────────────────── */}
        <div className="flex items-center justify-between mb-8">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-violet-400 transition-colors"
          >
            <ArrowLeft size={14} /> Queue
          </Link>
          <a
            href={leetcodeUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 py-2.5 px-5 bg-violet-600 hover:bg-violet-500 text-white font-bold rounded-xl text-base transition-all shadow-lg shadow-violet-900/30 border border-violet-500/30"
          >
            <BookOpen size={15} />
            Practice on LeetCode
            <ExternalLink size={13} className="opacity-70" />
          </a>
        </div>

        {/* ── Problem header card ───────────────────────────────────────────── */}
        <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-6 mb-6 backdrop-blur-sm">
          {/* Tags */}
          <div className="flex flex-wrap items-center gap-2 mb-3">
            <span className={`inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-lg font-bold border ${diff.cls}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${diff.dot}`} />
              {log.difficulty}
            </span>
            {log.language && (
              <span className="text-xs text-slate-500 bg-slate-800 px-2.5 py-1 rounded-lg font-semibold border border-slate-700/60">
                {log.language}
              </span>
            )}
          </div>

          {/* Title */}
          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight leading-tight">
            {log.title}
          </h1>

          {/* Meta row */}
          <div className="flex flex-wrap items-center gap-x-5 gap-y-2 mt-4 text-xs text-slate-500">
            <span className="flex items-center gap-1.5">
              <span className="w-1 h-1 rounded-full bg-slate-600" />
              Reviewed {fmt(log.reviewedAt)}
            </span>
            <span className="flex items-center gap-1.5">
              <Clock size={11} />
              Next: {fmt(log.nextReviewAt)}
            </span>
            {log.timeTaken != null && (
              <span className="flex items-center gap-1.5">
                <Zap size={11} />
                {Math.floor(log.timeTaken / 60)}m {log.timeTaken % 60}s
              </span>
            )}
            {log.metTimeLimit != null && (
              <span className={log.metTimeLimit ? "text-emerald-400" : "text-rose-400"}>
                {log.metTimeLimit ? "✓ Within limit" : "✗ Time out"}
              </span>
            )}
          </div>

          {/* Confidence */}
          <div className="flex items-center gap-2.5 mt-5 pt-4 border-t border-slate-800/60">
            <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">Confidence</span>
            <div className="flex gap-1">
              {[1,2,3].map(i => (
                <div
                  key={i}
                  className={`h-2 w-6 rounded-sm ${i <= log.confidence ? confColors[log.confidence-1] : "bg-slate-800"} transition-all`}
                />
              ))}
            </div>
            <span className="text-xs text-slate-600">{log.confidence}/3</span>
          </div>
        </div>

        {/* ── Content sections ──────────────────────────────────────────────── */}
        <div className="space-y-4">

          {log.category && (
            <SectionCard icon={BrainCircuit} iconCls="text-violet-400" label="Pattern">
              <p className="text-slate-200 font-semibold text-base">{log.category}</p>
            </SectionCard>
          )}

          {log.complexity && (
            <SectionCard icon={Zap} iconCls="text-amber-400" label="Complexity">
              <p className="text-slate-300 font-mono text-base bg-slate-950/60 border border-slate-800/60 rounded-xl px-4 py-3">
                {log.complexity}
              </p>
            </SectionCard>
          )}

          {log.approach && (
            <SectionCard icon={ChevronRight} iconCls="text-sky-400" label="Approach">
              <p className="text-slate-300 leading-relaxed text-base">{log.approach}</p>
            </SectionCard>
          )}

          {solutionText && (
            <section className="bg-slate-900/40 border border-slate-800/80 rounded-2xl overflow-hidden">
              {/* Code header */}
              <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-800/80 bg-slate-900/60">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-slate-800/80 flex items-center justify-center">
                    <Code size={15} className="text-violet-400" />
                  </div>
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-[0.12em]">Solution</span>
                </div>
                <button
                  type="button"
                  onClick={copyCode}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200 text-xs font-semibold transition-colors border border-slate-700/60"
                >
                  {copied ? <><Check size={13} /> Copied</> : <><Copy size={13} /> Copy</>}
                </button>
              </div>

              {/* Code body */}
              <div className="relative">
                {/* Line numbers decoration */}
                <div className="absolute left-0 top-0 bottom-0 w-10 bg-slate-950/30 border-r border-slate-800/40 flex flex-col items-center pt-5 gap-[1.38rem] pointer-events-none">
                  {solutionText.split("\n").slice(0,30).map((_, i) => (
                    <span key={i} className="text-xs text-slate-700 leading-none select-none">{i+1}</span>
                  ))}
                </div>
                <pre className="pl-14 pr-5 py-5 text-base text-slate-300 font-mono overflow-x-auto whitespace-pre-wrap break-words leading-relaxed">
                  {solutionText}
                </pre>
              </div>
            </section>
          )}
        </div>

        {/* ── Bottom CTA ────────────────────────────────────────────────────── */}
        <div className="mt-8">
          <a
            href={leetcodeUrl}
            target="_blank"
            rel="noreferrer"
            className="group flex items-center justify-center gap-2.5 w-full py-4 bg-slate-900/60 hover:bg-violet-600 text-slate-400 hover:text-white rounded-2xl text-base font-bold transition-all border border-slate-800/80 hover:border-violet-500/50 hover:shadow-lg hover:shadow-violet-900/25"
          >
            <ExternalLink size={16} className="group-hover:scale-110 transition-transform" />
            Open on LeetCode — practice again
          </a>
        </div>
      </div>
    </div>
  );
}