"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Loader2, ExternalLink, AlertCircle, Search, CheckCircle2 } from "lucide-react";
import { getStoredToken } from "../layout";

interface LogItem {
  id: string;
  slug: string;
  title: string;
  category: string | null;
  confidence: number;
  nextReviewAt: string;
  reviewedAt: string | null;
  difficulty: string | null;
}

const diffStyles: Record<string, { color: string; bg: string; border: string }> = {
  Easy: { color: "var(--green)", bg: "var(--green-dim)", border: "rgba(34,197,94,0.3)" },
  Medium: { color: "var(--amber)", bg: "var(--amber-dim)", border: "rgba(245,158,11,0.3)" },
  Hard: { color: "var(--red)", bg: "var(--red-dim)", border: "rgba(239,68,68,0.3)" },
};

export default function DashboardPage() {
  const router = useRouter();
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [logs, setLogs] = useState<LogItem[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"dueToday" | "overdue" | "all">("dueToday");
  const [difficultyFilter, setDifficultyFilter] = useState<Record<string, boolean>>({
    Easy: true,
    Medium: true,
    Hard: true,
  });
  const [patternFilter, setPatternFilter] = useState<string[]>([]);
  const [userName, setUserName] = useState<string>("");
  const [streak, setStreak] = useState<{ currentStreak: number } | null>(null);
  const [readinessScore, setReadinessScore] = useState<number | null>(null);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [loadingMore, setLoadingMore] = useState(false);

  const getDueText = (dateStr: string) => {
    const diff = new Date(dateStr).getTime() - Date.now();
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
    if (days < 0) return { text: `Overdue by ${Math.abs(days)} day${Math.abs(days) !== 1 ? "s" : ""}`, colorVar: "var(--red)" };
    if (days === 0) return { text: "Due today", colorVar: "var(--green)" };
    return { text: `Due in ${days} days`, colorVar: "var(--text-2)" };
  };

  const loadMore = async () => {
    if (!nextCursor || loadingMore || !token) return;
    setLoadingMore(true);
    try {
      const res = await fetch(`/api/log?cursor=${nextCursor}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setLogs((prev) => [...prev, ...(data.items || [])]);
        setNextCursor(data.nextCursor);
      }
    } catch (err) {
      console.error("Failed to load more:", err);
    } finally {
      setLoadingMore(false);
    }
  };

  useEffect(() => {
    const storedToken = getStoredToken();
    if (!storedToken) {
      router.push("/login");
      return;
    }
    setToken(storedToken);
    try {
      const raw = localStorage.getItem("gymUser");
      if (raw) {
        const u = JSON.parse(raw) as { email?: string };
        const name = u?.email?.split("@")[0] || "";
        setUserName(name ? name.charAt(0).toUpperCase() + name.slice(1) : "");
      }
    } catch {}
  }, [router]);

  useEffect(() => {
    if (!token) return;
    const fetchLogs = async () => {
      try {
        const res = await fetch("/api/log", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) {
          if (res.status === 401) {
            router.push("/login");
            return;
          }
          throw new Error("Failed to fetch logs");
        }
        const data = await res.json();
        setLogs(data.items || []);
        setNextCursor(data.nextCursor || null);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load review queue");
      } finally {
        setLoading(false);
      }
    };
    fetchLogs();
  }, [token, router]);

  useEffect(() => {
    if (!token) return;
    fetch("/api/analytics/streak", { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => d && setStreak({ currentStreak: d.currentStreak ?? 0 }))
      .catch(() => {});
  }, [token]);

  useEffect(() => {
    if (!token) return;
    fetch("/api/analytics/readiness-score", { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => d && setReadinessScore(d.score))
      .catch(() => {});
  }, [token]);

  const now = Date.now();
  const allPatterns = [...new Set(logs.map((l) => l.category).filter(Boolean))] as string[];
  const visibleItems = logs.filter((log) => {
    const matchSearch =
      log.title.toLowerCase().includes(search.toLowerCase()) ||
      (log.category?.toLowerCase() ?? "").includes(search.toLowerCase());
    if (!matchSearch) return false;
    const due = new Date(log.nextReviewAt).getTime();
    const isOverdue = due < now;
    const isDueOrOverdue = due <= now;
    if (statusFilter === "overdue" && !isOverdue) return false;
    if (statusFilter === "dueToday" && !isDueOrOverdue) return false;
    if (!difficultyFilter[log.difficulty ?? "Medium"]) return false;
    if (patternFilter.length > 0 && !patternFilter.includes(log.category ?? "")) return false;
    return true;
  });

  const dueTodayCount = logs.filter((l) => new Date(l.nextReviewAt).getTime() <= now).length;
  const overdueCount = logs.filter((l) => new Date(l.nextReviewAt).getTime() < now).length;

  const clearFilters = () => {
    setSearch("");
    setStatusFilter("dueToday");
    setDifficultyFilter({ Easy: true, Medium: true, Hard: true });
    setPatternFilter([]);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin" style={{ color: "var(--green)" }} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Hero (spec: Welcome back, Streak, Readiness, Due Today badge) */}
      <div
        className="rounded border p-6 flex flex-wrap items-center justify-between gap-4"
        style={{
          backgroundColor: "var(--card)",
          borderColor: "var(--border)",
        }}
      >
        <div>
          <h1 className="text-2xl font-bold" style={{ color: "var(--text)" }}>
            Welcome back{userName ? `, ${userName}` : ""}
          </h1>
          <div className="flex items-center gap-4 mt-2">
            {streak != null && (
              <span className="text-sm" style={{ color: streak.currentStreak >= 7 ? "var(--green)" : "var(--muted)" }}>
                🔥 {streak.currentStreak} day streak
              </span>
            )}
            {readinessScore != null && (
              <span className="text-sm" style={{ color: "var(--text-2)" }}>
                Interview Readiness: <strong style={{ color: readinessScore >= 60 ? "var(--green)" : "var(--amber)" }}>{readinessScore}</strong> / 100
              </span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm"
            style={{ backgroundColor: "var(--green)", color: "#000000" }}
          >
            {dueTodayCount}
          </div>
          <span className="text-xs font-bold uppercase tracking-wider" style={{ color: "var(--muted)" }}>
            Due today
          </span>
        </div>
      </div>

      {error && (
        <div
          className="flex items-center gap-2 px-4 py-3 rounded border"
          style={{
            backgroundColor: "var(--red-dim)",
            borderColor: "var(--red)",
            color: "var(--red)",
          }}
        >
          <AlertCircle size={16} />
          <span>{error}</span>
        </div>
      )}

      {/* Two-column: Sidebar 240px + Queue */}
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Sidebar filters (spec: 240px, sticky) */}
        <aside
          className="lg:w-[240px] shrink-0 rounded border p-5 lg:sticky lg:top-[80px] lg:self-start"
          style={{
            backgroundColor: "var(--surface)",
            borderColor: "var(--border)",
          }}
        >
          <h2 className="text-[11px] font-bold uppercase tracking-wider mb-3" style={{ color: "var(--muted)" }}>
            Status
          </h2>
          <div className="space-y-1 mb-4">
            {[
              { key: "dueToday" as const, label: "Due Today", count: dueTodayCount },
              { key: "overdue" as const, label: "Overdue", count: overdueCount, red: true },
              { key: "all" as const, label: "All", count: logs.length },
            ].map(({ key, label, count, red }) => (
              <button
                key={key}
                type="button"
                onClick={() => setStatusFilter(key)}
                className="w-full flex items-center justify-between px-2 py-1.5 rounded text-left text-[13px] transition-colors"
                style={{
                  backgroundColor: statusFilter === key ? "var(--card)" : "transparent",
                  color: statusFilter === key ? "var(--text)" : "var(--text-2)",
                }}
              >
                {label}
                {count > 0 && (
                  <span
                    className="text-[10px] font-bold px-1.5 py-0.5 rounded"
                    style={{
                      backgroundColor: red ? "var(--red-dim)" : "var(--green-dim)",
                      color: red ? "var(--red)" : "var(--green)",
                    }}
                  >
                    {count}
                  </span>
                )}
              </button>
            ))}
          </div>

          <h2 className="text-[11px] font-bold uppercase tracking-wider mb-2" style={{ color: "var(--muted)" }}>
            Difficulty
          </h2>
          <div className="space-y-1 mb-4">
            {(["Easy", "Medium", "Hard"] as const).map((d) => (
              <label key={d} className="flex items-center gap-2 text-[13px] cursor-pointer">
                <input
                  type="checkbox"
                  checked={difficultyFilter[d]}
                  onChange={(e) =>
                    setDifficultyFilter((prev) => ({ ...prev, [d]: e.target.checked }))
                  }
                  className="rounded border"
                  style={{ accentColor: "var(--green)" }}
                />
                <span style={{ color: "var(--text)" }}>{d}</span>
              </label>
            ))}
          </div>

          <h2 className="text-[11px] font-bold uppercase tracking-wider mb-2" style={{ color: "var(--muted)" }}>
            Pattern
          </h2>
          <select
            multiple
            value={patternFilter}
            onChange={(e) =>
              setPatternFilter(
                Array.from(e.target.selectedOptions, (o) => o.value)
              )
            }
            className="w-full rounded border px-2 py-1.5 text-[13px] mb-4 max-h-24"
            style={{
              backgroundColor: "var(--card)",
              borderColor: "var(--border)",
              color: "var(--text)",
            }}
          >
            {allPatterns.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>

          <div className="relative mb-4">
            <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5" style={{ color: "var(--muted)" }} />
            <input
              placeholder="Search problems..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded border pl-8 pr-3 py-1.5 text-[13px]"
              style={{
                backgroundColor: "var(--card)",
                borderColor: "var(--border)",
                color: "var(--text)",
              }}
            />
          </div>

          <button
            type="button"
            onClick={clearFilters}
            className="text-[11px] font-bold transition-colors"
            style={{ color: "var(--muted)" }}
          >
            Clear filters
          </button>
        </aside>

        {/* Review Queue (cards) */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold" style={{ color: "var(--text)" }}>
              Review Queue
            </h2>
            <span className="text-[13px]" style={{ color: "var(--muted)" }}>
              {visibleItems.length} problems
            </span>
          </div>

          {visibleItems.length === 0 ? (
            <div
              className="rounded border p-8 text-center"
              style={{ backgroundColor: "var(--card)", borderColor: "var(--border)" }}
            >
              <CheckCircle2 className="w-12 h-12 mx-auto mb-3" style={{ color: "var(--green)" }} />
              <p className="font-medium mb-1" style={{ color: "var(--text)" }}>
                All caught up!
              </p>
              <p className="text-sm" style={{ color: "var(--muted)" }}>
                No problems due for review. Keep grinding.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {visibleItems.map((log) => {
                const due = getDueText(log.nextReviewAt);
                const diff = diffStyles[log.difficulty ?? "Medium"] ?? diffStyles.Medium;
                return (
                  <div
                    key={log.id}
                    className="rounded border p-5 transition-all"
                    style={{
                      backgroundColor: "var(--card)",
                      borderColor: "var(--border)",
                    }}
                  >
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <Link
                          href={`/revise/${log.id}`}
                          className="font-bold text-base hover:opacity-90"
                          style={{ color: "var(--text)" }}
                        >
                          {log.title}
                        </Link>
                        <div className="flex flex-wrap items-center gap-2 mt-2">
                          <span
                            className="text-[9px] font-bold uppercase px-1.5 py-0.5 rounded border"
                            style={{
                              color: diff.color,
                              backgroundColor: diff.bg,
                              borderColor: diff.border,
                            }}
                          >
                            {log.difficulty ?? "Medium"}
                          </span>
                          <span className="text-[11px]" style={{ color: due.colorVar }}>
                            {due.text}
                          </span>
                          {log.category && (
                            <span
                              className="text-[10px] px-1.5 py-0.5 rounded"
                              style={{
                                backgroundColor: "var(--surface)",
                                color: "var(--muted)",
                              }}
                            >
                              {log.category}
                            </span>
                          )}
                        </div>
                        <div className="flex gap-0.5 mt-2">
                          {[1, 2, 3].map((level) => (
                            <div
                              key={level}
                              className="w-2 h-2 rounded-sm"
                              style={{
                                backgroundColor:
                                  level <= log.confidence
                                    ? log.confidence === 1
                                      ? "var(--red)"
                                      : log.confidence === 2
                                        ? "var(--amber)"
                                        : "var(--green)"
                                    : "var(--border)",
                              }}
                            />
                          ))}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <Link
                          href={`/revise/${log.id}`}
                          className="px-4 py-2 rounded font-bold text-[13px] transition-colors"
                          style={{
                            backgroundColor: "var(--green)",
                            color: "#000000",
                          }}
                        >
                          Revise
                        </Link>
                        <a
                          href={`https://leetcode.com/problems/${log.slug}`}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-0.5 text-[13px] transition-colors"
                          style={{ color: "var(--muted)" }}
                        >
                          Open in LeetCode <ExternalLink size={12} />
                        </a>
                      </div>
                    </div>
                  </div>
                );
              })}
              {nextCursor && (
                <div className="pt-4 flex justify-center">
                  <button
                    type="button"
                    onClick={loadMore}
                    disabled={loadingMore}
                    className="px-5 py-2.5 rounded border text-[13px] font-medium disabled:opacity-50 transition-colors"
                    style={{
                      backgroundColor: "var(--card)",
                      borderColor: "var(--border)",
                      color: "var(--text)",
                    }}
                  >
                    {loadingMore ? <Loader2 className="w-4 h-4 animate-spin inline" /> : "Load more"}
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
