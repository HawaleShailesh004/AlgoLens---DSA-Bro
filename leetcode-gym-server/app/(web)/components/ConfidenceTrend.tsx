"use client";

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { TrendingUp } from "lucide-react";

export function ConfidenceTrend({ data }: { data: any }) {
  if (!data || !data.trend || data.trend.length === 0) {
    return (
      <div className="border rounded-2xl p-6" style={{ backgroundColor: "var(--surface)", borderColor: "var(--border)" }}>
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp className="w-5 h-5" style={{ color: "var(--green)" }} />
          <h3 className="text-sm font-bold uppercase tracking-wider" style={{ color: "var(--text-2)" }}>Confidence Trend</h3>
        </div>
        <p className="text-sm" style={{ color: "var(--muted)" }}>No data yet. Start logging workouts to see your confidence trend.</p>
      </div>
    );
  }

  // Format dates for display
  const chartData = data.trend.map((item: any) => ({
    date: new Date(item.date).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
    confidence: Number(item.avgConfidence.toFixed(2)),
    count: item.count,
  }));

  return (
    <div className="border rounded-2xl p-6" style={{ backgroundColor: "var(--surface)", borderColor: "var(--border)" }}>
      <div className="flex items-center gap-2 mb-4">
        <TrendingUp className="w-5 h-5" style={{ color: "var(--green)" }} />
        <h3 className="text-sm font-bold uppercase tracking-wider" style={{ color: "var(--text-2)" }}>Confidence Trend (14 days)</h3>
      </div>
      <ResponsiveContainer width="100%" height={200}>
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
          <XAxis
            dataKey="date"
            stroke="var(--muted)"
            fontSize={11}
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            domain={[0, 3]}
            stroke="var(--muted)"
            fontSize={11}
            tickLine={false}
            axisLine={false}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "var(--card)",
              border: "1px solid var(--border)",
              borderRadius: "8px",
              color: "var(--text)",
            }}
            labelStyle={{ color: "var(--text-2)" }}
          />
          <Line
            type="monotone"
            dataKey="confidence"
            stroke="var(--green)"
            strokeWidth={2}
            dot={{ fill: "var(--green)", r: 4 }}
            activeDot={{ r: 6 }}
          />
        </LineChart>
      </ResponsiveContainer>
      <p className="text-xs mt-2 text-center" style={{ color: "var(--muted)" }}>
        Rolling average confidence over the last 14 days
      </p>
    </div>
  );
}
