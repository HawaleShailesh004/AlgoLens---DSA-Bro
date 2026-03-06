"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { getStoredToken } from "../layout";
import { AnalyticsDashboard } from "../components/AnalyticsDashboard";

export default function AnalyticsPage() {
  const router = useRouter();

  useEffect(() => {
    if (!getStoredToken()) router.push("/login");
  }, [router]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold" style={{ color: "var(--text)" }}>
          Analytics
        </h1>
        <p className="text-sm mt-1" style={{ color: "var(--muted)" }}>
          Pattern coverage, confidence trend, and weak spots
        </p>
      </div>
      <AnalyticsDashboard />
    </div>
  );
}
