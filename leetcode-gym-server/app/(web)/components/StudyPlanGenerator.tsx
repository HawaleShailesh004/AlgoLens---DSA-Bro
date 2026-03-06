"use client";

import { useState } from "react";
import { Loader2, Target, Sparkles, AlertCircle, ExternalLink } from "lucide-react";
import { getStoredToken } from "../layout";

type StudyPlanWeek = {
  week: number;
  focus: string;
  problems: Array<{
    slug: string;
    title: string;
    difficulty: "Easy" | "Medium" | "Hard";
    pattern: string;
    reason: string;
  }>;
};

type StudyPlan = {
  weeks: StudyPlanWeek[];
  summary: string;
};

type StudyPlanResponse = {
  plan: StudyPlan;
  weakPatterns: Array<{ pattern: string; avgConfidence: number; count: number }>;
  totalWeeks: number;
  problemsPerWeek: number;
};

const difficultyStyles: Record<string, { color: string; bg: string; border: string }> = {
  Easy: { color: "var(--green)", bg: "var(--green-dim)", border: "var(--border-green)" },
  Medium: { color: "var(--amber)", bg: "var(--amber-dim)", border: "rgba(245,158,11,0.3)" },
  Hard: { color: "var(--red)", bg: "var(--red-dim)", border: "rgba(239,68,68,0.3)" },
};

export function StudyPlanGenerator() {
  const [weeks, setWeeks] = useState(4);
  const [problemsPerWeek, setProblemsPerWeek] = useState(5);
  const [loading, setLoading] = useState(false);
  const [plan, setPlan] = useState<StudyPlanResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showGenerator, setShowGenerator] = useState(true);

  const generatePlan = async () => {
    setLoading(true);
    setError(null);
    const token = getStoredToken();
    if (!token) {
      setError("Please log in to generate a study plan");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/study-plan", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ weeks, problemsPerWeek }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to generate study plan");
      }

      const data: StudyPlanResponse = await res.json();
      setPlan(data);
      setShowGenerator(false);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  };

  if (!showGenerator && plan) {
    return (
      <div className="border rounded-2xl p-6 space-y-6" style={{ backgroundColor: "var(--surface)", borderColor: "var(--border)" }}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded flex items-center justify-center border" style={{ backgroundColor: "var(--green-dim)", borderColor: "var(--border-green)" }}>
              <Target size={18} style={{ color: "var(--green)" }} />
            </div>
            <div>
              <h2 className="text-lg font-bold" style={{ color: "var(--text)" }}>Your Study Plan</h2>
              <p className="text-xs" style={{ color: "var(--muted)" }}>{plan.totalWeeks} weeks • {plan.problemsPerWeek} problems/week</p>
            </div>
          </div>
          <button
            onClick={() => { setShowGenerator(true); setPlan(null); }}
            className="text-xs transition-colors hover:opacity-90"
            style={{ color: "var(--text-2)" }}
          >
            Generate New
          </button>
        </div>

        {plan.plan.summary && (
          <div className="border rounded-xl p-4" style={{ backgroundColor: "var(--card)", borderColor: "var(--border)" }}>
            <p className="text-sm leading-relaxed" style={{ color: "var(--text-2)" }}>{plan.plan.summary}</p>
          </div>
        )}

        {plan.weakPatterns.length > 0 && (
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider mb-3" style={{ color: "var(--muted)" }}>Focus Areas</h3>
            <div className="flex flex-wrap gap-2">
              {plan.weakPatterns.map((p) => (
                <div
                  key={p.pattern}
                  className="text-xs px-3 py-1.5 rounded-lg border"
                  style={{ backgroundColor: "var(--green-dim)", borderColor: "var(--border-green)", color: "var(--green)" }}
                >
                  {p.pattern} ({p.avgConfidence.toFixed(1)}/3)
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="space-y-4">
          {plan.plan.weeks.map((week) => (
            <div
              key={week.week}
              className="border rounded-xl p-5 space-y-3"
              style={{ backgroundColor: "var(--card)", borderColor: "var(--border)" }}
            >
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded flex items-center justify-center border" style={{ backgroundColor: "var(--green-dim)", borderColor: "var(--border-green)" }}>
                  <span className="text-sm font-bold" style={{ color: "var(--green)" }}>W{week.week}</span>
                </div>
                <h3 className="text-base font-semibold" style={{ color: "var(--text)" }}>{week.focus}</h3>
              </div>

              <div className="space-y-2">
                {week.problems.map((problem, idx) => {
                  const ds = difficultyStyles[problem.difficulty] ?? difficultyStyles.Medium;
                  return (
                    <a
                      key={idx}
                      href={`https://leetcode.com/problems/${problem.slug}`}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-start gap-3 p-3 rounded-lg border transition-colors hover:opacity-90"
                      style={{ backgroundColor: "var(--surface)", borderColor: "var(--border)" }}
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-sm font-semibold transition-colors" style={{ color: "var(--text)" }}>
                            {problem.title}
                          </span>
                          <span className="text-[10px] px-2 py-0.5 rounded border font-semibold" style={{ color: ds.color, backgroundColor: ds.bg, borderColor: ds.border }}>
                            {problem.difficulty}
                          </span>
                          <span className="text-[10px]" style={{ color: "var(--muted)" }}>{problem.pattern}</span>
                        </div>
                        <p className="text-xs leading-relaxed" style={{ color: "var(--text-2)" }}>{problem.reason}</p>
                      </div>
                      <ExternalLink size={14} className="shrink-0 mt-1 transition-colors" style={{ color: "var(--muted)" }} />
                    </a>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="border rounded-2xl p-6 space-y-5" style={{ backgroundColor: "var(--surface)", borderColor: "var(--border)" }}>
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded flex items-center justify-center border" style={{ backgroundColor: "var(--green-dim)", borderColor: "var(--border-green)" }}>
          <Sparkles size={18} style={{ color: "var(--green)" }} />
        </div>
        <div>
          <h2 className="text-lg font-bold" style={{ color: "var(--text)" }}>Generate Study Plan</h2>
          <p className="text-xs" style={{ color: "var(--muted)" }}>AI-powered personalized roadmap</p>
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <label className="text-xs font-semibold uppercase tracking-wider mb-2 block" style={{ color: "var(--text-2)" }}>
            Target Timeline
          </label>
          <div className="flex items-center gap-3">
            <input
              type="range"
              min="1"
              max="12"
              value={weeks}
              onChange={(e) => setWeeks(Number(e.target.value))}
              className="flex-1"
            />
            <span className="text-sm font-semibold min-w-[60px]" style={{ color: "var(--text)" }}>{weeks} {weeks === 1 ? "week" : "weeks"}</span>
          </div>
        </div>

        <div>
          <label className="text-xs font-semibold uppercase tracking-wider mb-2 block" style={{ color: "var(--text-2)" }}>
            Problems Per Week
          </label>
          <div className="flex items-center gap-3">
            <input
              type="range"
              min="3"
              max="15"
              value={problemsPerWeek}
              onChange={(e) => setProblemsPerWeek(Number(e.target.value))}
              className="flex-1"
            />
            <span className="text-sm font-semibold min-w-[80px]" style={{ color: "var(--text)" }}>{problemsPerWeek} problems</span>
          </div>
        </div>

        {error && (
          <div
            className="flex items-center gap-2 px-4 py-3 rounded-lg border text-sm"
            style={{ backgroundColor: "var(--red-dim)", borderColor: "rgba(239,68,68,0.3)", color: "var(--red)" }}
          >
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        <button
          onClick={generatePlan}
          disabled={loading}
          className="w-full py-3 rounded-xl font-semibold flex items-center justify-center gap-2 transition-colors border disabled:opacity-50 disabled:cursor-not-allowed"
          style={{ backgroundColor: "var(--green)", color: "#000000", borderColor: "var(--green)" }}
        >
          {loading ? (
            <>
              <Loader2 size={16} className="animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <Sparkles size={16} />
              Generate Plan
            </>
          )}
        </button>
      </div>
    </div>
  );
}
