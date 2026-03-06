"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { getStoredToken } from "../layout";
import { StudyPlanGenerator } from "../components/StudyPlanGenerator";

export default function StudyPlanPage() {
  const router = useRouter();

  useEffect(() => {
    if (!getStoredToken()) router.push("/login");
  }, [router]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold" style={{ color: "var(--text)" }}>
          Study Plan
        </h1>
        <p className="text-sm mt-1" style={{ color: "var(--muted)" }}>
          Generate a personalized plan based on your weak spots and timeline
        </p>
      </div>
      <StudyPlanGenerator />
    </div>
  );
}
