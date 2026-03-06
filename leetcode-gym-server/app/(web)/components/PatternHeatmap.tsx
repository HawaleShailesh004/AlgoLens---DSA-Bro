"use client";

import { BarChart3 } from "lucide-react";

export function PatternHeatmap({ data }: { data: any }) {
  if (!data || !data.patterns || data.patterns.length === 0) {
    return (
      <div className="border rounded-2xl p-6" style={{ backgroundColor: "var(--surface)", borderColor: "var(--border)" }}>
        <div className="flex items-center gap-2 mb-4">
          <BarChart3 className="w-5 h-5" style={{ color: "var(--green)" }} />
          <h3 className="text-sm font-bold uppercase tracking-wider" style={{ color: "var(--text-2)" }}>Pattern Coverage</h3>
        </div>
        <p className="text-sm" style={{ color: "var(--muted)" }}>No data yet. Start logging workouts to see your pattern coverage.</p>
      </div>
    );
  }

  const getConfidenceColor = (avg: number) => {
    if (avg < 1.5) return "bg-rose-500/20 border-rose-500/40 text-rose-400";
    if (avg < 2.5) return "bg-amber-500/20 border-amber-500/40 text-amber-400";
    return "bg-emerald-500/20 border-emerald-500/40 text-emerald-400";
  };

  // Standard DSA patterns list
  const standardPatterns = [
    "Arrays", "Hashing", "Two Pointers", "Sliding Window", "Binary Search",
    "Dynamic Programming", "Graph", "Tree", "Heap", "Backtracking",
    "Greedy", "String", "Math", "Bit Manipulation", "Stack", "Queue",
    "Linked List", "Trie", "Union Find", "Topological Sort",
  ];

  type PatternEntry = { pattern: string; avgConfidence?: number; count?: number };
  const patternMap = new Map<string, PatternEntry>(
    data.patterns.map((p: PatternEntry) => [p.pattern, p])
  );

  return (
    <div className="border rounded-2xl p-6" style={{ backgroundColor: "var(--surface)", borderColor: "var(--border)" }}>
      <div className="flex items-center gap-2 mb-4">
        <BarChart3 className="w-5 h-5" style={{ color: "var(--green)" }} />
        <h3 className="text-sm font-bold uppercase tracking-wider" style={{ color: "var(--text-2)" }}>Pattern Coverage</h3>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
        {standardPatterns.map((pattern) => {
          const patternData = patternMap.get(pattern);
          const avgConfidence = patternData?.avgConfidence ?? 0;
          const count = patternData?.count ?? 0;

          return (
            <div
              key={pattern}
              className={`p-2.5 rounded-lg border text-xs font-medium text-center transition-all ${
                count > 0
                  ? getConfidenceColor(avgConfidence)
                  : "bg-slate-950/50 border-slate-800/50 text-slate-600"
              }`}
              title={count > 0 ? `${pattern}: ${avgConfidence.toFixed(1)}/3 avg (${count} solves)` : `${pattern}: Not attempted`}
            >
              <div className="font-semibold truncate">{pattern}</div>
              {count > 0 && (
                <div className="text-[10px] mt-1 opacity-75">
                  {avgConfidence.toFixed(1)}/3
                </div>
              )}
            </div>
          );
        })}
      </div>
      <div className="mt-4 flex items-center gap-4 text-xs text-slate-500">
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded bg-emerald-500/20 border border-emerald-500/40" />
          <span>Strong (2.5+)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded bg-amber-500/20 border border-amber-500/40" />
          <span>Okay (1.5-2.5)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded bg-rose-500/20 border border-rose-500/40" />
          <span>Weak (&lt;1.5)</span>
        </div>
      </div>
    </div>
  );
}
