"use client";

import { AlertTriangle, ArrowRight } from "lucide-react";
import Link from "next/link";

export function WeakSpotAlert({ data }: { data: any }) {
  if (!data || !data.weakSpots || data.weakSpots.length === 0) return null;

  const getConfidenceColor = (avg: number) => {
    if (avg < 1.5) return "text-rose-400";
    if (avg < 2.5) return "text-amber-400";
    return "text-emerald-400";
  };

  return (
    <div className="border rounded-2xl p-6" style={{ backgroundColor: "var(--surface)", borderColor: "var(--border)" }}>
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded flex items-center justify-center border" style={{ backgroundColor: "var(--red-dim)", borderColor: "rgba(239,68,68,0.3)" }}>
          <AlertTriangle className="w-5 h-5" style={{ color: "var(--red)" }} />
        </div>
        <div>
          <h3 className="text-sm font-bold uppercase tracking-wider" style={{ color: "var(--text-2)" }}>Weak Spots</h3>
          <p className="text-xs mt-0.5" style={{ color: "var(--muted)" }}>Focus areas to improve</p>
        </div>
      </div>
      <div className="space-y-2">
        {data.weakSpots.slice(0, 3).map((spot: any, i: number) => (
          <div
            key={i}
            className="flex items-center justify-between p-2.5 rounded-lg border"
            style={{ backgroundColor: "var(--card)", borderColor: "var(--border)" }}
          >
            <span className="text-sm font-medium" style={{ color: "var(--text-2)" }}>{spot.pattern}</span>
            <div className="flex items-center gap-2">
              <span className={`text-xs font-bold ${getConfidenceColor(spot.avgConfidence)}`}>
                {(spot.avgConfidence).toFixed(1)}/3
              </span>
              <div className="flex gap-0.5">
                {[1, 2, 3].map((level) => {
                  const filled = level <= Math.round(spot.avgConfidence);
                  const color = filled
                    ? level <= 1
                      ? "var(--red)"
                      : level <= 2
                        ? "var(--amber)"
                        : "var(--green)"
                    : "var(--card)";
                  return <div key={level} className="w-2 h-2 rounded" style={{ backgroundColor: color }} />;
                })}
              </div>
            </div>
          </div>
        ))}
      </div>
      <Link
        href="/dashboard?filter=all"
        className="mt-4 inline-flex items-center gap-1.5 text-xs font-medium transition-colors hover:opacity-90"
        style={{ color: "var(--green)" }}
      >
        Drill these patterns <ArrowRight size={12} />
      </Link>
    </div>
  );
}
