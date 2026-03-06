"use client";

import { useState, useEffect } from "react";
import { Loader2, TrendingUp, Target, Flame, AlertTriangle } from "lucide-react";
import { getStoredToken } from "../layout";
import { PatternHeatmap } from "./PatternHeatmap";
import { ConfidenceTrend } from "./ConfidenceTrend";
import { WeakSpotAlert } from "./WeakSpotAlert";
import { StreakTracker } from "./StreakTracker";

export function AnalyticsDashboard() {
  const [loading, setLoading] = useState(true);
  const [patternData, setPatternData] = useState<any>(null);
  const [trendData, setTrendData] = useState<any>(null);
  const [weakSpots, setWeakSpots] = useState<any>(null);
  const [streak, setStreak] = useState<any>(null);

  useEffect(() => {
    const token = getStoredToken();
    if (!token) return;

    const fetchAnalytics = async () => {
      try {
        const [patternsRes, trendRes, weakRes, streakRes] = await Promise.all([
          fetch("/api/analytics/pattern-coverage", {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch("/api/analytics/confidence-trend", {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch("/api/analytics/weak-spots", {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch("/api/analytics/streak", {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        if (patternsRes.ok) {
          const data = await patternsRes.json();
          setPatternData(data);
        }
        if (trendRes.ok) {
          const data = await trendRes.json();
          setTrendData(data);
        }
        if (weakRes.ok) {
          const data = await weakRes.json();
          setWeakSpots(data);
        }
        if (streakRes.ok) {
          const data = await streakRes.json();
          setStreak(data);
        }
      } catch (error) {
        console.error("Analytics fetch error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-6 h-6 animate-spin" style={{ color: "var(--green)" }} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StreakTracker data={streak} />
        {weakSpots && weakSpots.weakSpots && weakSpots.weakSpots.length > 0 && (
          <WeakSpotAlert data={weakSpots} />
        )}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {patternData && <PatternHeatmap data={patternData} />}
        {trendData && <ConfidenceTrend data={trendData} />}
      </div>
    </div>
  );
}
