"use client";

import { Flame } from "lucide-react";

export function StreakTracker({ data }: { data: any }) {
  if (!data) return null;

  const { currentStreak, longestStreak } = data;

  return (
    <div className="border rounded-2xl p-6" style={{ backgroundColor: "var(--surface)", borderColor: "var(--border)" }}>
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded flex items-center justify-center border" style={{ backgroundColor: "var(--green-dim)", borderColor: "var(--border-green)" }}>
          <Flame className="w-5 h-5" style={{ color: "var(--green)" }} />
        </div>
        <div>
          <h3 className="text-sm font-bold uppercase tracking-wider" style={{ color: "var(--text-2)" }}>Current Streak</h3>
          <p className="text-2xl font-bold text-white mt-0.5">{currentStreak} days</p>
        </div>
      </div>
      {longestStreak > 0 && (
        <p className="text-xs" style={{ color: "var(--muted)" }}>
          Longest: <span className="font-semibold" style={{ color: "var(--text-2)" }}>{longestStreak} days</span>
        </p>
      )}
    </div>
  );
}
