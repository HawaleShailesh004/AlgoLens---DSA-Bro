// how-it-works.jsx — AlgoLens (Redesigned)

"use client";

import Link from "next/link";
import { Download, BookOpen, PenLine, RotateCcw, ArrowRight, BrainCircuit } from "lucide-react";

const steps = [
  {
    step: "01",
    title: "Install the extension",
    description:
      "Add the AlgoLens Chrome extension to your browser. It embeds directly into LeetCode — no context-switching, no friction.",
    icon: Download,
    accent: "text-violet-400",
    bg: "bg-violet-400/8 border-violet-400/20",
    glow: "shadow-violet-900/30",
  },
  {
    step: "02",
    title: "Solve on LeetCode",
    description:
      "Open any problem. Use the in-page AI coach for targeted hints (not full answers), track your session timer, and work through it on your own terms.",
    icon: BookOpen,
    accent: "text-sky-400",
    bg: "bg-sky-400/8 border-sky-400/20",
    glow: "shadow-sky-900/30",
  },
  {
    step: "03",
    title: "Log your workout",
    description:
      "Rate how it felt, add notes, and save your solution. AlgoLens auto-generates a pattern tag and complexity summary so future-you has everything needed to revise.",
    icon: PenLine,
    accent: "text-emerald-400",
    bg: "bg-emerald-400/8 border-emerald-400/20",
    glow: "shadow-emerald-900/30",
  },
  {
    step: "04",
    title: "Revise when due",
    description:
      "Return to the dashboard when items surface. Review your saved approach, then re-attempt on LeetCode. Spaced repetition ensures you're spending time where it matters most.",
    icon: RotateCcw,
    accent: "text-amber-400",
    bg: "bg-amber-400/8 border-amber-400/20",
    glow: "shadow-amber-900/30",
  },
];

const intervals = [
  { label: "Hard", days: "1 day",  cls: "text-rose-400 bg-rose-400/10 border-rose-400/20" },
  { label: "Medium", days: "3 days", cls: "text-amber-400 bg-amber-400/10 border-amber-400/20" },
  { label: "Easy", days: "7 days",  cls: "text-emerald-400 bg-emerald-400/10 border-emerald-400/20" },
];

export default function HowItWorksPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      {/* Ambient */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-violet-600/4 rounded-full blur-3xl" />
      </div>

      <div className="relative max-w-6xl mx-auto px-4 lg:px-12 sm:px-6 py-14 sm:py-20">

        {/* Header */}
        <div className="text-center mb-14">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-400 text-xs font-semibold tracking-wide mb-5">
            <span className="w-1.5 h-1.5 rounded-full bg-violet-400" />
            How AlgoLens Works
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold text-white tracking-tight leading-tight">
            A training loop built<br />for interview prep
          </h1>
          <p className="mt-4 text-slate-500 text-lg max-w-xl mx-auto leading-relaxed">
            Solve on LeetCode, log here, revise when due. Simple, proven, effective.
          </p>
        </div>

        {/* Steps */}
        <div className="relative">
          {/* Vertical connector */}
          <div className="absolute left-[27px] top-10 bottom-10 w-px bg-gradient-to-b from-violet-500/30 via-slate-700/30 to-transparent hidden sm:block" />

          <div className="space-y-5">
            {steps.map(({ step, title, description, icon: Icon, accent, bg, glow }) => (
              <div
                key={step}
                className="relative flex gap-5 p-5 rounded-2xl bg-slate-900/50 border border-slate-800/80 hover:border-slate-700/80 hover:bg-slate-900/70 transition-all group"
              >
                {/* Icon */}
                <div className={`shrink-0 w-14 h-14 rounded-xl border flex flex-col items-center justify-center gap-0.5 shadow-lg ${bg} ${glow} group-hover:scale-105 transition-transform`}>
                  <Icon className={`w-5 h-5 ${accent}`} />
                  <span className={`text-xs font-black tracking-wider ${accent} opacity-70`}>{step}</span>
                </div>

                {/* Content */}
                <div className="min-w-0 pt-1">
                  <h2 className="text-lg font-bold text-slate-100 leading-snug">{title}</h2>
                  <p className="mt-1.5 text-base text-slate-500 leading-relaxed">{description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Spaced repetition explainer */}
        <div className="mt-10 rounded-2xl bg-slate-900/40 border border-slate-800/80 p-6">
          <div className="flex items-center gap-2.5 mb-4">
            <div className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center">
              <BrainCircuit size={16} className="text-violet-400" />
            </div>
            <h3 className="text-lg font-bold text-slate-200">Why spaced repetition?</h3>
          </div>
          <p className="text-base text-slate-500 leading-relaxed mb-5">
            Problems you struggled with reappear sooner. Problems you nailed come back later. You spend time where you actually need it — not re-grinding what you already know.
          </p>
          <div className="flex flex-col sm:flex-row gap-2">
            {intervals.map(({ label, days, cls }) => (
              <div key={label} className={`flex-1 flex items-center justify-between px-4 py-2.5 rounded-xl border text-xs font-semibold ${cls}`}>
                <span>{label}</span>
                <span className="font-normal opacity-75">→ {days}</span>
              </div>
            ))}
          </div>
        </div>

        {/* CTAs */}
        <div className="mt-10 flex flex-col sm:flex-row gap-3">
          <Link
            href="/dashboard"
            className="flex-1 inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-violet-600 hover:bg-violet-500 text-white font-bold rounded-xl transition-all shadow-lg shadow-violet-900/30 text-base"
          >
            Go to Dashboard
            <ArrowRight size={16} />
          </Link>
          <a
            href="https://leetcode.com"
            target="_blank"
            rel="noreferrer"
            className="flex-1 inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-slate-800/80 hover:bg-slate-800 text-slate-300 font-medium rounded-xl border border-slate-700/80 hover:border-slate-600 transition-all text-base"
          >
            Open LeetCode
          </a>
        </div>
      </div>
    </div>
  );
}