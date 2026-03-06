import { useState, useEffect } from "react";
import { Loader2, ExternalLink, AlertCircle } from "lucide-react";

const diffConfig: Record<string, { color: string; bg: string; border: string }> = {
  Easy: { color: "var(--green)", bg: "var(--green-dim)", border: "rgba(34,197,94,0.3)" },
  Medium: { color: "var(--amber)", bg: "var(--amber-dim)", border: "rgba(245,158,11,0.3)" },
  Hard: { color: "var(--red)", bg: "var(--red-dim)", border: "rgba(239,68,68,0.3)" },
};

interface LogItem {
  id: string;
  slug: string;
  title: string;
  category?: string | null;
  confidence: number;
  nextReviewAt: string;
  reviewedAt?: string | null;
  difficulty?: string | null;
}

export const Dashboard = ({
  userId,
  token,
  onLogout,
}: {
  userId: string;
  token: string | null;
  onLogout: () => void;
}) => {
  const [allProblems, setAllProblems] = useState<LogItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"dashboard" | "settings">("dashboard");

  const fetchLogs = () => {
    if (!token) return;
    setError(null);
    setLoading(true);
    const apiBase = import.meta.env.VITE_API_URL || "";
    const url = apiBase.replace(/\/api\/?$/, "") + "/api/log?limit=100";
    fetch(url, { headers: { Authorization: `Bearer ${token}` } })
      .then((res) => {
        if (res.status === 401) {
          onLogout();
          return null;
        }
        if (!res.ok) throw new Error("Failed to load logs");
        return res.json();
      })
      .then((data) => {
        if (data?.items) setAllProblems(data.items);
        else setAllProblems([]);
      })
      .catch((e) => setError(e instanceof Error ? e.message : "Failed to load"))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    if (!userId || !token) {
      if (!token) onLogout();
      setLoading(false);
      return;
    }
    fetchLogs();
  }, [userId, token]);

  const now = Date.now();
  const dueToday = allProblems.filter(
    (p) => new Date(p.nextReviewAt).getTime() <= now
  );
  const dueTodayCount = dueToday.length;
  const recentSolves = [...allProblems]
    .sort(
      (a, b) =>
        new Date(b.reviewedAt || b.nextReviewAt).getTime() -
        new Date(a.reviewedAt || a.nextReviewAt).getTime()
    )
    .slice(0, 5);

  const getLastReviewed = (log: LogItem) => {
    if (!log.reviewedAt) return "Never";
    const d = new Date(log.reviewedAt);
    const diff = Math.floor((now - d.getTime()) / (1000 * 60 * 60 * 24));
    if (diff === 0) return "Today";
    if (diff === 1) return "1 day ago";
    return `${diff} days ago`;
  };

  const appUrl = (() => {
    const base = import.meta.env.VITE_API_URL || "";
    try {
      return base ? base.replace(/\/api\/?$/, "") : "http://localhost:3000";
    } catch {
      return "http://localhost:3000";
    }
  })();

  // ─── Idle state header (spec: Logo, Nav: Dashboard / Settings, Open Website) ───
  return (
    <div
      className="h-screen flex flex-col"
      style={{
        backgroundColor: "var(--bg)",
        color: "var(--text)",
        fontFamily: "var(--mono)",
      }}
    >
      <header
        className="flex items-center justify-between border-b shrink-0"
        style={{
          height: "48px",
          padding: "12px 16px",
          backgroundColor: "var(--surface)",
          borderColor: "var(--border)",
        }}
      >
        <h1
          className="font-bold text-base"
          style={{ color: "var(--text)" }}
        >
          Grindset
        </h1>
        <nav className="flex items-center gap-1">
          {(["dashboard", "settings"] as const).map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setActiveTab(tab)}
              className="px-2 py-1 rounded text-[11px] font-bold uppercase tracking-wider transition-colors"
              style={{
                color: activeTab === tab ? "var(--text)" : "var(--muted)",
                backgroundColor: activeTab === tab ? "var(--card)" : "transparent",
              }}
            >
              {tab === "dashboard" ? "Dashboard" : "Settings"}
            </button>
          ))}
        </nav>
        <a
          href={token ? `${appUrl}/dashboard?token=${encodeURIComponent(token)}` : appUrl}
          target="_blank"
          rel="noreferrer"
          className="w-7 h-7 rounded flex items-center justify-center transition-colors"
          style={{ color: "var(--text-2)" }}
          title="Open website"
          onMouseEnter={(e) => {
            e.currentTarget.style.color = "var(--green)";
            e.currentTarget.style.backgroundColor = "var(--card)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = "var(--text-2)";
            e.currentTarget.style.backgroundColor = "transparent";
          }}
        >
          <ExternalLink size={14} aria-hidden />
        </a>
      </header>

      {activeTab === "settings" ? (
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          <p className="text-xs" style={{ color: "var(--muted)" }}>
            Open the website to customize API keys, quick prompts, and preferences.
          </p>
          <a
            href={token ? `${appUrl}/settings?token=${encodeURIComponent(token)}` : `${appUrl}/settings`}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2 rounded border text-xs font-bold transition-colors"
            style={{
              backgroundColor: "var(--green)",
              color: "#000000",
              borderColor: "var(--green)",
            }}
          >
            Open Settings →
          </a>
          <button
            type="button"
            onClick={onLogout}
            className="block text-xs font-bold transition-colors"
            style={{ color: "var(--red)" }}
          >
            Sign out
          </button>
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto min-h-0">
          <div className="p-3 space-y-4">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-12 gap-2" style={{ color: "var(--text-2)" }}>
                <Loader2 className="w-6 h-6 animate-spin" />
                <span className="text-xs">Loading…</span>
              </div>
            ) : error ? (
              <div
                className="flex flex-col items-center justify-center text-center py-8 px-4 border rounded"
                style={{
                  borderColor: "var(--border)",
                  backgroundColor: "var(--surface)",
                }}
              >
                <AlertCircle className="w-8 h-8 mb-2" style={{ color: "var(--red)" }} />
                <p className="text-sm font-medium mb-1" style={{ color: "var(--text)" }}>Couldn&apos;t load queue</p>
                <p className="text-xs mb-3 max-w-[220px]" style={{ color: "var(--text-2)" }}>{error}</p>
                <button
                  type="button"
                  onClick={fetchLogs}
                  className="px-3 py-1.5 rounded text-xs font-bold border transition-colors"
                  style={{
                    backgroundColor: "var(--card)",
                    borderColor: "var(--border)",
                    color: "var(--text)",
                  }}
                >
                  Retry
                </button>
              </div>
            ) : allProblems.length === 0 ? (
              /* Empty state (spec) */
              <div className="flex flex-col items-center justify-center text-center py-10">
                <span className="text-3xl mb-2" aria-hidden>📊</span>
                <p className="font-medium mb-1" style={{ color: "var(--text)", fontSize: "var(--text-md)" }}>
                  No logs yet
                </p>
                <p className="max-w-[240px] mb-4" style={{ color: "var(--muted)", fontSize: "var(--text-sm)" }}>
                  Solve a problem on LeetCode, then log your workout here.
                </p>
                <a
                  href="https://leetcode.com/problems"
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs font-bold transition-colors"
                  style={{ color: "var(--green)" }}
                >
                  Go to LeetCode →
                </a>
              </div>
            ) : (
              <>
                {/* Due Today (spec) */}
                <section>
                  <div className="flex items-center gap-2 mb-2">
                    {dueTodayCount > 0 ? (
                      <>
                        <span
                          className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold"
                          style={{ backgroundColor: "var(--green)", color: "#000000" }}
                        >
                          {dueTodayCount}
                        </span>
                        <span className="text-[11px] font-bold uppercase tracking-wider" style={{ color: "var(--muted)" }}>
                          Due today
                        </span>
                      </>
                    ) : (
                      <span className="text-[11px] font-bold uppercase tracking-wider" style={{ color: "var(--muted)" }}>
                        Nothing due today ✓
                      </span>
                    )}
                  </div>
                  {dueTodayCount > 0 &&
                    dueToday.slice(0, 5).map((log) => {
                      const diff = diffConfig[log.difficulty || "Medium"] ?? diffConfig.Medium;
                      return (
                        <div
                          key={log.id}
                          className="border rounded p-3 mb-2 transition-colors"
                          style={{
                            backgroundColor: "var(--card)",
                            borderColor: "var(--border)",
                          }}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="min-w-0 flex-1">
                              <p className="text-sm font-bold truncate" style={{ color: "var(--text)" }}>
                                {log.title}
                              </p>
                              <div className="flex items-center gap-2 mt-1">
                                <span
                                  className="text-[9px] font-bold uppercase px-1.5 py-0.5 rounded border shrink-0"
                                  style={{
                                    color: diff.color,
                                    backgroundColor: diff.bg,
                                    borderColor: diff.border,
                                  }}
                                >
                                  {log.difficulty || "Medium"}
                                </span>
                                <span className="text-[10px]" style={{ color: "var(--muted)" }}>
                                  {getLastReviewed(log)}
                                </span>
                              </div>
                            </div>
                            <div className="flex flex-col items-end gap-1 shrink-0">
                              <div className="flex gap-0.5">
                                {[1, 2, 3].map((level) => (
                                  <div
                                    key={level}
                                    className="w-1.5 h-2.5 rounded-sm"
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
                              <a
                                href={`https://leetcode.com/problems/${log.slug}`}
                                target="_blank"
                                rel="noreferrer"
                                className="text-[10px] font-bold px-2 py-1 rounded border transition-colors"
                                style={{
                                  backgroundColor: "var(--surface)",
                                  borderColor: "var(--border)",
                                  color: "var(--text)",
                                }}
                              >
                                Review
                              </a>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                </section>

                {/* Recent Solves (spec) */}
                <section>
                  <h2 className="text-[11px] font-bold uppercase tracking-wider mb-2" style={{ color: "var(--muted)" }}>
                    Recent Solves
                  </h2>
                  {recentSolves.map((log) => {
                    const diff = diffConfig[log.difficulty || "Medium"] ?? diffConfig.Medium;
                    return (
                      <div
                        key={log.id}
                        className="border rounded p-2.5 mb-1.5 flex items-center justify-between"
                        style={{
                          backgroundColor: "var(--card)",
                          borderColor: "var(--border)",
                        }}
                      >
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-bold truncate" style={{ color: "var(--text)" }}>
                            {log.title}
                          </p>
                          <span
                            className="text-[9px] font-bold uppercase px-1 py-0.5 rounded border"
                            style={{
                              color: diff.color,
                              backgroundColor: diff.bg,
                              borderColor: diff.border,
                            }}
                          >
                            {log.difficulty || "Medium"}
                          </span>
                        </div>
                        <a
                          href={token ? `${appUrl}/revise/${log.id}?token=${encodeURIComponent(token)}` : `${appUrl}/revise/${log.id}`}
                          target="_blank"
                          rel="noreferrer"
                          className="text-[10px] font-bold shrink-0"
                          style={{ color: "var(--green)" }}
                        >
                          View
                        </a>
                      </div>
                    );
                  })}
                </section>

                {/* Quick Actions (spec) */}
                <section className="pt-2 border-t" style={{ borderColor: "var(--border)" }}>
                  <a
                    href={token ? `${appUrl}/dashboard?token=${encodeURIComponent(token)}` : appUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="block text-xs font-bold mb-1 transition-colors"
                    style={{ color: "var(--green)" }}
                  >
                    View Full Dashboard →
                  </a>
                  <a
                    href={token ? `${appUrl}/settings?token=${encodeURIComponent(token)}` : `${appUrl}/settings`}
                    target="_blank"
                    rel="noreferrer"
                    className="block text-xs font-bold transition-colors"
                    style={{ color: "var(--muted)" }}
                  >
                    Customize →
                  </a>
                </section>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
