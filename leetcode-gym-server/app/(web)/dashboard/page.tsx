// dashboard.jsx — AlgoLens Dashboard (Redesigned)
// Drop-in replacement for your /dashboard page
// Uses same data types and API calls — only UI changed

"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Loader2, Trophy, Clock, Search, Filter, AlertCircle,
  Code2, Target, ExternalLink, HelpCircle, ChevronRight,
  Flame, BarChart3, TrendingUp, Zap,
} from "lucide-react";
import { getStoredToken } from "../layout";

// ─── Types ────────────────────────────────────────────────────────────────────
type LogItem = {
  id: string; slug: string; title: string; difficulty: string;
  confidence: number; nextReviewAt: string; category: string | null;
  approach: string | null; complexity: string | null; reviewedAt: string;
};

// ─── Helpers ──────────────────────────────────────────────────────────────────
const difficultyConfig: Record<string, { label: string; cls: string; dot: string }> = {
  Easy:   { label: "Easy",   cls: "text-emerald-400 bg-emerald-400/10 border-emerald-400/20", dot: "bg-emerald-400" },
  Medium: { label: "Medium", cls: "text-amber-400  bg-amber-400/10  border-amber-400/20",  dot: "bg-amber-400"  },
  Hard:   { label: "Hard",   cls: "text-rose-400   bg-rose-400/10   border-rose-400/20",   dot: "bg-rose-400"   },
};

function getDueInfo(dateStr: string, now: number) {
  const diff = new Date(dateStr).getTime() - now;
  const days = Math.ceil(diff / 86_400_000);
  if (days < 0)  return { label: "Overdue", cls: "text-rose-400",  bg: "bg-rose-400/8  border-rose-400/20"  };
  if (days === 0) return { label: "Today",  cls: "text-amber-400", bg: "bg-amber-400/8 border-amber-400/20" };
  return { label: `${days}d`, cls: "text-slate-400", bg: "bg-slate-800/40 border-slate-700/40" };
}

function ConfidenceBar({ level }: { level: number }) {
  const colors = ["bg-rose-500", "bg-amber-500", "bg-emerald-500"];
  return (
    <div className="flex items-center gap-1" title={`Confidence ${level}/3`}>
      {[1,2,3].map(i => (
        <div
          key={i}
          className={`h-2 w-4 rounded-sm transition-all ${i <= level ? colors[level-1] : "bg-slate-700"}`}
        />
      ))}
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────
export default function DashboardPage() {
  const router = useRouter();
  const [items,       setItems]       = useState<LogItem[]>([]);
  const [loading,     setLoading]     = useState(true);
  const [error,       setError]       = useState<string | null>(null);
  const [search,      setSearch]      = useState("");
  const [filterMode,  setFilterMode]  = useState<"due"|"all">("due");
  const [nextCursor,  setNextCursor]  = useState<string | null>(null);
  const [loadingMore, setLoadingMore] = useState(false);

  // ── Data fetching (unchanged logic) ────────────────────────────────────────
  const fetchLogs = async (cursor?: string | null) => {
    const token = getStoredToken();
    if (!token) { router.push("/login"); return; }
    const url = cursor ? `/api/log?limit=50&cursor=${cursor}` : "/api/log?limit=50";
    const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
    if (res.status === 401) { router.push("/login"); return; }
    if (!res.ok) { const d = await res.json().catch(() => ({})); throw new Error(d.error || "Failed to load"); }
    return res.json() as Promise<{ items: LogItem[]; nextCursor: string | null; hasMore: boolean }>;
  };

  useEffect(() => {
    const token = getStoredToken();
    if (!token) { router.push("/login"); setLoading(false); return; }
    let cancelled = false;
    fetchLogs(null)
      .then(d => { if (!cancelled && d) { setItems(d.items); setNextCursor(d.nextCursor); } })
      .catch(e => { if (!cancelled) setError(e instanceof Error ? e.message : "Failed to load"); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [router]);

  const loadMore = async () => {
    if (!nextCursor || loadingMore) return;
    setLoadingMore(true);
    try {
      const d = await fetchLogs(nextCursor);
      if (d) { setItems(p => [...p, ...d.items]); setNextCursor(d.nextCursor); }
    } finally { setLoadingMore(false); }
  };

  // ── Derived state ───────────────────────────────────────────────────────────
  const now = Date.now();
  const dueItems = items.filter(p => new Date(p.nextReviewAt).getTime() <= now);
  const visibleItems = items.filter(p => {
    const matchSearch =
      p.title.toLowerCase().includes(search.toLowerCase()) ||
      (p.category?.toLowerCase() ?? "").includes(search.toLowerCase());
    if (!matchSearch) return false;
    return filterMode === "all" || new Date(p.nextReviewAt).getTime() <= now;
  });

  const stats = {
    total:    items.length,
    due:      dueItems.length,
    easy:     items.filter(p => p.difficulty === "Easy").length,
    medium:   items.filter(p => p.difficulty === "Medium").length,
    hard:     items.filter(p => p.difficulty === "Hard").length,
    avgConf:  items.length ? (items.reduce((s,p) => s + p.confidence, 0) / items.length).toFixed(1) : "—",
  };

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      {/* ── Ambient background ─────────────────────────────────────────────── */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-[600px] h-[400px] bg-violet-600/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/3 right-0 w-[400px] h-[400px] bg-indigo-600/4 rounded-full blur-3xl" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

        {/* ── Header ─────────────────────────────────────────────────────────── */}
        <header className="mb-10">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-8 h-8 rounded-lg bg-violet-500/20 border border-violet-500/30 flex items-center justify-center">
                  <span className="text-violet-400 font-bold text-sm">λ</span>
                </div>
                <span className="text-xs font-semibold tracking-[0.15em] text-violet-400 uppercase">AlgoLens</span>
              </div>
              <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-white">
                Training Dashboard
              </h1>
              <p className="text-slate-500 mt-1.5 text-base">
                Spaced repetition for DSA mastery. Stay consistent, crush interviews.
              </p>
            </div>
            <Link
              href="/how-it-works"
              className="hidden sm:flex items-center gap-1.5 text-xs text-slate-500 hover:text-violet-400 transition-colors mt-1"
            >
              <HelpCircle size={13} /> How it works
            </Link>
          </div>
        </header>

        {/* ── Stats grid ─────────────────────────────────────────────────────── */}
        <div className="grid grid-cols-2 xl:grid-cols-4 gap-3 mb-8">

          {/* Total */}
          <div className="bg-slate-900/70 border border-slate-800/80 rounded-2xl p-5 group">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold tracking-[0.12em] text-slate-500 uppercase">Problems</span>
              <div className="w-7 h-7 rounded-lg bg-slate-800 flex items-center justify-center group-hover:bg-slate-700 transition-colors">
                <Target size={14} className="text-slate-400" />
              </div>
            </div>
            <p className="text-4xl font-bold text-white tabular-nums">{stats.total}</p>
            <p className="text-sm text-slate-600 mt-1">logged total</p>
          </div>

          {/* Due */}
          <div className={`relative rounded-2xl p-5 border overflow-hidden group ${
            stats.due > 0
              ? "bg-violet-600/10 border-violet-500/30"
              : "bg-slate-900/70 border-slate-800/80"
          }`}>
            {stats.due > 0 && (
              <div className="absolute top-0 right-0 w-24 h-24 bg-violet-500/10 rounded-full -translate-y-1/2 translate-x-1/2" />
            )}
            <div className="flex items-center justify-between mb-3 relative">
              <span className="text-xs font-bold tracking-[0.12em] text-slate-500 uppercase">Due Now</span>
              <div className={`w-7 h-7 rounded-lg flex items-center justify-center transition-colors ${
                stats.due > 0 ? "bg-violet-500/20" : "bg-slate-800"
              }`}>
                <Flame size={14} className={stats.due > 0 ? "text-violet-400" : "text-slate-500"} />
              </div>
            </div>
            <p className={`text-4xl font-bold tabular-nums relative ${stats.due > 0 ? "text-violet-300" : "text-white"}`}>
              {stats.due}
            </p>
            <p className="text-sm text-slate-600 mt-1 relative">to review</p>
          </div>

          {/* Difficulty spread */}
          <div className="bg-slate-900/70 border border-slate-800/80 rounded-2xl p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold tracking-[0.12em] text-slate-500 uppercase">Split</span>
              <div className="w-7 h-7 rounded-lg bg-slate-800 flex items-center justify-center">
                <BarChart3 size={14} className="text-slate-400" />
              </div>
            </div>
            <div className="flex items-end gap-1 h-8 mt-1">
              {[
                { v: stats.easy,   max: stats.total, c: "bg-emerald-500" },
                { v: stats.medium, max: stats.total, c: "bg-amber-500"   },
                { v: stats.hard,   max: stats.total, c: "bg-rose-500"    },
              ].map(({ v, max, c }, i) => (
                <div key={i} className="flex-1 bg-slate-800 rounded-sm overflow-hidden h-full flex items-end">
                  <div
                    className={`w-full ${c} rounded-sm transition-all`}
                    style={{ height: max ? `${Math.max(8, (v/max)*100)}%` : "8%" }}
                  />
                </div>
              ))}
            </div>
            <div className="flex gap-3 mt-2 text-xs font-semibold">
              <span className="text-emerald-400">E {stats.easy}</span>
              <span className="text-amber-400">M {stats.medium}</span>
              <span className="text-rose-400">H {stats.hard}</span>
            </div>
          </div>

          {/* Avg confidence */}
          <div className="bg-slate-900/70 border border-slate-800/80 rounded-2xl p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold tracking-[0.12em] text-slate-500 uppercase">Confidence</span>
              <div className="w-7 h-7 rounded-lg bg-slate-800 flex items-center justify-center">
                <TrendingUp size={14} className="text-slate-400" />
              </div>
            </div>
            <p className="text-3xl font-bold text-white tabular-nums">{stats.avgConf}<span className="text-slate-600 text-lg font-normal">/3</span></p>
            <p className="text-xs text-slate-600 mt-1">avg across all</p>
          </div>

        </div>

        {/* ── Extension callout strip ─────────────────────────────────────────── */}
        <div className="mb-8 flex items-center gap-4 bg-slate-900/40 border border-slate-800/60 rounded-xl px-5 py-3.5">
          <div className="w-8 h-8 rounded-lg bg-violet-500/15 border border-violet-500/25 flex items-center justify-center shrink-0">
            <Code2 size={15} className="text-violet-400" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm text-slate-300 font-medium">
              Use the Chrome extension on LeetCode to log workouts and get AI coaching.
            </p>
          </div>
          <a
            href="https://leetcode.com"
            target="_blank"
            rel="noreferrer"
            className="shrink-0 inline-flex items-center gap-1.5 text-xs font-semibold text-violet-400 hover:text-violet-300 transition-colors whitespace-nowrap"
          >
            Open LeetCode <ExternalLink size={11} />
          </a>
        </div>

        {/* ── Review queue ───────────────────────────────────────────────────── */}
        <section>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-white">Review Queue</h2>
              {stats.due > 0 && (
                <span className="inline-flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded-full bg-violet-500/15 text-violet-400 border border-violet-500/25">
                  <Zap size={9} /> {stats.due} due
                </span>
              )}
            </div>

            <div className="flex gap-2">
              {/* Search */}
              <div className="relative flex-1 sm:w-60">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 w-3.5 h-3.5" />
                <input
                  placeholder="Search problems or patterns…"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  className="w-full bg-slate-900/60 border border-slate-800 rounded-xl pl-9 pr-4 py-2.5 text-base text-slate-200 placeholder-slate-600 focus:border-violet-500/60 focus:bg-slate-900 outline-none transition-all"
                />
              </div>
              {/* Filter toggle */}
              <button
                type="button"
                onClick={() => setFilterMode(p => p === "due" ? "all" : "due")}
                className={`px-3.5 rounded-xl border flex items-center gap-2 text-xs font-bold transition-all shrink-0 ${
                  filterMode === "due"
                    ? "bg-violet-600 border-violet-500 text-white shadow-lg shadow-violet-900/30"
                    : "bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700"
                }`}
              >
                <Filter size={13} />
                {filterMode === "due" ? "Due" : "All"}
              </button>
            </div>
          </div>

          {/* ── States ─────────────────────────────────────────────────────── */}
          {loading ? (
            <div className="flex flex-col items-center justify-center py-28 gap-4 text-slate-500">
              <Loader2 className="animate-spin w-8 h-8 text-violet-500" />
              <span className="text-base">Loading your training log…</span>
            </div>
          ) : error ? (
            <div className="py-24 flex flex-col items-center justify-center text-center border border-slate-800 rounded-2xl bg-slate-900/30">
              <AlertCircle className="w-10 h-10 text-rose-500 mb-3" />
              <p className="text-sm font-medium text-slate-300">{error}</p>
              <button
                type="button"
                onClick={() => {
                  setError(null); setLoading(true);
                  fetchLogs(null)
                    .then(d => { if (d) { setItems(d.items); setNextCursor(d.nextCursor); } })
                    .catch(e => setError(e instanceof Error ? e.message : "Failed"))
                    .finally(() => setLoading(false));
                }}
                className="mt-5 px-5 py-2.5 bg-slate-800 hover:bg-slate-700 rounded-xl text-sm font-semibold text-slate-200 transition-colors"
              >
                Retry
              </button>
            </div>
          ) : visibleItems.length === 0 ? (
            <div className="py-28 flex flex-col items-center justify-center text-center border border-dashed border-slate-800 rounded-2xl bg-slate-900/20">
              <div className="w-16 h-16 rounded-2xl bg-slate-800/80 flex items-center justify-center mb-5">
                <Trophy className="w-8 h-8 text-amber-400" />
              </div>
              <h3 className="text-lg font-bold text-slate-200">
                {filterMode === "due" ? "All caught up!" : "No logs yet"}
              </h3>
              <p className="text-base text-slate-500 mt-2 max-w-[280px] leading-relaxed">
                {filterMode === "due"
                  ? "Nothing due right now. Keep practicing on LeetCode and log workouts with the extension."
                  : "Install the AlgoLens extension, solve a LeetCode problem, and log it to see it here."}
              </p>
              <a
                href="https://leetcode.com"
                target="_blank"
                rel="noreferrer"
                className="mt-6 inline-flex items-center gap-2 px-5 py-2.5 bg-violet-600 hover:bg-violet-500 text-white text-base font-bold rounded-xl transition-colors shadow-lg shadow-violet-900/30"
              >
                Go to LeetCode <ExternalLink size={14} />
              </a>
            </div>
          ) : (
            /* ── Table ───────────────────────────────────────────────────── */
            <div className="rounded-2xl border border-slate-800/80 overflow-hidden bg-slate-900/30 backdrop-blur-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-base">
                  <thead>
                    <tr className="border-b border-slate-800/80">
                      <th className="px-5 py-3.5 text-xs font-bold text-slate-500 uppercase tracking-[0.1em]">Problem</th>
                      <th className="px-5 py-3.5 text-xs font-bold text-slate-500 uppercase tracking-[0.1em] whitespace-nowrap">Difficulty</th>
                      <th className="px-5 py-3.5 text-xs font-bold text-slate-500 uppercase tracking-[0.1em] whitespace-nowrap">Pattern</th>
                      <th className="px-5 py-3.5 text-xs font-bold text-slate-500 uppercase tracking-[0.1em] whitespace-nowrap">Due</th>
                      <th className="px-5 py-3.5 text-xs font-bold text-slate-500 uppercase tracking-[0.1em] whitespace-nowrap">Confidence</th>
                      <th className="px-5 py-3.5 text-xs font-bold text-slate-500 uppercase tracking-[0.1em] text-right whitespace-nowrap">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {visibleItems.map((log, idx) => {
                      const due  = getDueInfo(log.nextReviewAt, now);
                      const diff = difficultyConfig[log.difficulty] ?? difficultyConfig.Medium;
                      return (
                        <tr
                          key={log.id}
                          className="border-b border-slate-800/50 hover:bg-slate-800/25 transition-colors group"
                          style={{ animationDelay: `${idx * 30}ms` }}
                        >
                          {/* Title */}
                          <td className="px-5 py-4 max-w-[240px]">
                            <Link
                              href={`/revise/${log.id}`}
                              className="font-semibold text-slate-200 hover:text-violet-300 transition-colors line-clamp-1"
                            >
                              {log.title}
                            </Link>
                          </td>

                          {/* Difficulty */}
                          <td className="px-5 py-4">
                            <span className={`inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-lg font-bold border ${diff.cls}`}>
                              <span className={`w-1.5 h-1.5 rounded-full ${diff.dot}`} />
                              {diff.label}
                            </span>
                          </td>

                          {/* Pattern */}
                          <td className="px-5 py-4">
                            {log.category ? (
                              <span className="text-xs text-slate-400 bg-slate-800/60 px-2.5 py-1 rounded-lg border border-slate-700/50">
                                {log.category}
                              </span>
                            ) : (
                              <span className="text-slate-600 text-xs">—</span>
                            )}
                          </td>

                          {/* Due */}
                          <td className="px-5 py-4">
                            <span className={`inline-flex items-center gap-1 text-sm font-semibold px-2.5 py-1 rounded-lg border ${due.bg} ${due.cls}`}>
                              <Clock size={10} />
                              {due.label}
                            </span>
                          </td>

                          {/* Confidence */}
                          <td className="px-5 py-4">
                            <ConfidenceBar level={log.confidence} />
                          </td>

                          {/* Actions */}
                          <td className="px-5 py-4 text-right">
                            <div className="flex items-center justify-end gap-3">
                              <Link
                                href={`/revise/${log.id}`}
                                className="inline-flex items-center gap-1 text-xs font-semibold text-violet-400 hover:text-violet-300 transition-colors"
                              >
                                Review <ChevronRight size={12} />
                              </Link>
                              <a
                                href={`https://leetcode.com/problems/${log.slug}`}
                                target="_blank"
                                rel="noreferrer"
                                className="text-xs font-medium text-slate-600 hover:text-slate-400 transition-colors inline-flex items-center gap-0.5"
                              >
                                LC <ExternalLink size={10} />
                              </a>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {nextCursor && (
                <div className="px-5 py-4 border-t border-slate-800/60 flex justify-center">
                  <button
                    type="button"
                    onClick={loadMore}
                    disabled={loadingMore}
                    className="px-6 py-2.5 bg-slate-800 hover:bg-slate-700 disabled:opacity-50 rounded-xl text-sm font-semibold text-slate-300 transition-colors flex items-center gap-2 border border-slate-700/50"
                  >
                    {loadingMore ? <Loader2 className="w-4 h-4 animate-spin" /> : "Load more"}
                  </button>
                </div>
              )}
            </div>
          )}
        </section>

        {/* ── Mobile how-it-works link ───────────────────────────────────────── */}
        <div className="mt-8 sm:hidden text-center">
          <Link href="/how-it-works" className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-violet-400 transition-colors">
            <HelpCircle size={13} /> New here? See how it works
          </Link>
        </div>
      </div>
    </div>
  );
}