"use client";

import Link from "next/link";
import { Download, BookOpen, PenLine, RotateCcw, ArrowRight, BrainCircuit } from "lucide-react";

const steps = [
  { step: "01", title: "Install the extension", description: "Add the Grindset Chrome extension to your browser. It embeds directly into LeetCode — no context-switching, no friction.", icon: Download, color: "var(--green)" },
  { step: "02", title: "Solve on LeetCode", description: "Open any problem. Use the in-page AI coach for targeted hints (not full answers), track your session timer, and work through it on your own terms.", icon: BookOpen, color: "var(--cyan)" },
  { step: "03", title: "Log your workout", description: "Rate how it felt, add notes, and save your solution. Grindset auto-generates a pattern tag and complexity summary so future-you has everything needed to revise.", icon: PenLine, color: "var(--green)" },
  { step: "04", title: "Revise when due", description: "Return to the dashboard when items surface. Review your saved approach, then re-attempt on LeetCode. Spaced repetition ensures you're spending time where it matters most.", icon: RotateCcw, color: "var(--amber)" },
];

const intervals = [
  { label: "Hard", days: "1 day", color: "var(--red)", bg: "var(--red-dim)", border: "rgba(239,68,68,0.3)" },
  { label: "Medium", days: "3 days", color: "var(--amber)", bg: "var(--amber-dim)", border: "rgba(245,158,11,0.3)" },
  { label: "Easy", days: "7 days", color: "var(--green)", bg: "var(--green-dim)", border: "var(--border-green)" },
];

export default function HowItWorksPage() {
  return (
    <div className="min-h-screen" style={{ backgroundColor: "var(--bg)", color: "var(--text)" }}>
      <div className="max-w-6xl mx-auto px-4 lg:px-12 sm:px-6 py-14 sm:py-20">
        <div className="text-center mb-14">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold tracking-wide mb-5 border" style={{ backgroundColor: "var(--green-dim)", borderColor: "var(--border-green)", color: "var(--green)" }}>
            <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: "var(--green)" }} />
            How Grindset Works
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight leading-tight" style={{ color: "var(--text)" }}>
            A training loop built<br />for interview prep
          </h1>
          <p className="mt-4 text-lg max-w-xl mx-auto leading-relaxed" style={{ color: "var(--muted)" }}>
            Solve on LeetCode, log here, revise when due. Simple, proven, effective.
          </p>
        </div>

        <div className="relative">
          <div className="absolute left-[27px] top-10 bottom-10 w-px hidden sm:block" style={{ background: "linear-gradient(to bottom, var(--border-2), transparent)" }} />
          <div className="space-y-5">
            {steps.map(({ step, title, description, icon: Icon, color }) => (
              <div
                key={step}
                className="relative flex gap-5 p-5 rounded-2xl border transition-all hover:opacity-95"
                style={{ backgroundColor: "var(--card)", borderColor: "var(--border)" }}
              >
                <div className="shrink-0 w-14 h-14 rounded border flex flex-col items-center justify-center gap-0.5" style={{ backgroundColor: "var(--surface)", borderColor: "var(--border)", color }}>
                  <Icon className="w-5 h-5" style={{ color }} />
                  <span className="text-xs font-black tracking-wider opacity-70" style={{ color }}>{step}</span>
                </div>
                <div className="min-w-0 pt-1">
                  <h2 className="text-lg font-bold leading-snug" style={{ color: "var(--text)" }}>{title}</h2>
                  <p className="mt-1.5 text-base leading-relaxed" style={{ color: "var(--muted)" }}>{description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-10 rounded-2xl border p-6" style={{ backgroundColor: "var(--card)", borderColor: "var(--border)" }}>
          <div className="flex items-center gap-2.5 mb-4">
            <div className="w-8 h-8 rounded flex items-center justify-center border" style={{ backgroundColor: "var(--surface)", borderColor: "var(--border)" }}>
              <BrainCircuit size={16} style={{ color: "var(--green)" }} />
            </div>
            <h3 className="text-lg font-bold" style={{ color: "var(--text)" }}>Why spaced repetition?</h3>
          </div>
          <p className="text-base leading-relaxed mb-5" style={{ color: "var(--muted)" }}>
            Problems you struggled with reappear sooner. Problems you nailed come back later. You spend time where you actually need it — not re-grinding what you already know.
          </p>
          <div className="flex flex-col sm:flex-row gap-2">
            {intervals.map(({ label, days, color, bg, border }) => (
              <div key={label} className="flex-1 flex items-center justify-between px-4 py-2.5 rounded-xl border text-xs font-semibold" style={{ color, backgroundColor: bg, borderColor: border }}>
                <span>{label}</span>
                <span className="font-normal opacity-75">→ {days}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-10 flex flex-col sm:flex-row gap-3">
          <Link
            href="/dashboard"
            className="flex-1 inline-flex items-center justify-center gap-2 px-6 py-3.5 font-bold rounded-xl transition-all text-base border"
            style={{ backgroundColor: "var(--green)", color: "#000000", borderColor: "var(--green)" }}
          >
            Go to Dashboard
            <ArrowRight size={16} />
          </Link>
          <a
            href="https://leetcode.com"
            target="_blank"
            rel="noreferrer"
            className="flex-1 inline-flex items-center justify-center gap-2 px-6 py-3.5 font-medium rounded-xl border text-base transition-colors hover:opacity-90"
            style={{ backgroundColor: "var(--card)", borderColor: "var(--border)", color: "var(--text-2)" }}
          >
            Open LeetCode
          </a>
        </div>
      </div>
    </div>
  );
}
