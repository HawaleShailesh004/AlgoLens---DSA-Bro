"use client";

import { useState, useEffect } from "react";
import { Target, TrendingUp, AlertCircle, CheckCircle2, Info } from "lucide-react";
import { getStoredToken } from "../layout";
import Link from "next/link";

type ReadinessScoreData = {
  score: number;
  breakdown: {
    patternCoverage: number;
    srsHealth: number;
    confidenceTrajectory: number;
    recency: number;
    consistency: number;
  };
  diagnosis: string;
  details?: {
    solvedPatterns: string[];
    totalPatterns: number;
    overdueCount: number;
    totalProblems: number;
    recentProblems: number;
    activeDays: number;
  };
};

export function ReadinessScore() {
  const [data, setData] = useState<ReadinessScoreData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchScore = async () => {
      const token = getStoredToken();
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const res = await fetch("/api/analytics/readiness-score", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const scoreData: ReadinessScoreData = await res.json();
          setData(scoreData);
        }
      } catch (error) {
        console.error("Failed to fetch readiness score:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchScore();
  }, []);

  if (loading) {
    return (
      <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-slate-800 rounded w-1/3" />
          <div className="h-20 bg-slate-800 rounded" />
        </div>
      </div>
    );
  }

  if (!data) {
    return null;
  }

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-emerald-400";
    if (score >= 60) return "text-amber-400";
    return "text-rose-400";
  };

  const getScoreBgColor = (score: number) => {
    if (score >= 80) return "bg-emerald-500";
    if (score >= 60) return "bg-amber-500";
    return "bg-rose-500";
  };

  const getScoreLabel = (score: number) => {
    if (score >= 80) return "Ready";
    if (score >= 60) return "Getting Close";
    return "Needs Work";
  };

  return (
    <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-6 space-y-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-violet-500/20 border border-violet-500/30 flex items-center justify-center">
            <Target size={18} className="text-violet-400" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">Interview Readiness</h2>
            <p className="text-xs text-slate-500">Your readiness score</p>
          </div>
        </div>
        <span className={`text-xs font-bold px-3 py-1 rounded-full border ${getScoreColor(data.score)} ${getScoreColor(data.score).replace("text-", "bg-").replace("-400", "-500/10")} ${getScoreColor(data.score).replace("text-", "border-").replace("-400", "-500/20")}`}>
          {getScoreLabel(data.score)}
        </span>
      </div>

      {/* Score Display */}
      <div className="relative">
        <div className="flex items-end gap-4">
          <div className="flex-1">
            <div className="flex items-baseline gap-2 mb-2">
              <span className={`text-5xl font-bold tabular-nums ${getScoreColor(data.score)}`}>
                {data.score}
              </span>
              <span className="text-2xl text-slate-600">/100</span>
            </div>
            <div className="h-3 bg-slate-800 rounded-full overflow-hidden">
              <div
                className={`h-full ${getScoreBgColor(data.score)} transition-all duration-500`}
                style={{ width: `${data.score}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Diagnosis */}
      <div className="bg-slate-800/40 border border-slate-700/60 rounded-xl p-4">
        <div className="flex items-start gap-2">
          <Info size={16} className="text-violet-400 shrink-0 mt-0.5" />
          <p className="text-sm text-slate-300 leading-relaxed">{data.diagnosis}</p>
        </div>
      </div>

      {/* Breakdown */}
      <div className="space-y-2">
        <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Score Breakdown</h3>
        {[
          {
            label: "Pattern Coverage",
            value: data.breakdown.patternCoverage,
            max: 30,
            icon: Target,
            color: "text-violet-400",
            detail: data.details
              ? `${data.details.solvedPatterns.length}/${data.details.totalPatterns} patterns`
              : undefined,
          },
          {
            label: "SRS Health",
            value: data.breakdown.srsHealth,
            max: 25,
            icon: CheckCircle2,
            color: "text-emerald-400",
            detail: data.details
              ? `${data.details.overdueCount} overdue`
              : undefined,
          },
          {
            label: "Confidence Trend",
            value: data.breakdown.confidenceTrajectory,
            max: 25,
            icon: TrendingUp,
            color: "text-amber-400",
          },
          {
            label: "Recency",
            value: data.breakdown.recency,
            max: 10,
            icon: AlertCircle,
            color: "text-blue-400",
            detail: data.details
              ? `${data.details.recentProblems} problems this week`
              : undefined,
          },
          {
            label: "Consistency",
            value: data.breakdown.consistency,
            max: 10,
            icon: Target,
            color: "text-purple-400",
            detail: data.details ? `${data.details.activeDays} active days` : undefined,
          },
        ].map((item) => (
          <div key={item.label} className="flex items-center gap-3">
            <div className="flex items-center gap-2 min-w-[140px]">
              <item.icon size={14} className={item.color} />
              <span className="text-xs text-slate-400">{item.label}</span>
            </div>
            <div className="flex-1 h-2 bg-slate-800 rounded-full overflow-hidden">
              <div
                className={`h-full ${item.color.replace("text-", "bg-")} transition-all duration-500`}
                style={{ width: `${(item.value / item.max) * 100}%` }}
              />
            </div>
            <div className="text-right min-w-[60px]">
              <span className="text-xs font-semibold text-slate-300">
                {item.value.toFixed(1)}/{item.max}
              </span>
              {item.detail && (
                <p className="text-[10px] text-slate-600">{item.detail}</p>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* CTA */}
      <Link
        href="/dashboard?filter=due"
        className="block w-full py-2.5 px-4 bg-violet-600 hover:bg-violet-500 text-white text-sm font-semibold rounded-xl transition-colors text-center"
      >
        Improve Score
      </Link>
    </div>
  );
}
