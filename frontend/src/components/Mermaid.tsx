import { useEffect, useRef, useState } from "react";
import mermaid from "mermaid";
import { AlertTriangle, ExternalLink, Maximize2 } from "lucide-react";

// ─── Init ─────────────────────────────────────────────────────────────────────
mermaid.initialize({
  startOnLoad: false,
  suppressErrorRendering: true,
  theme: "base",
  securityLevel: "loose",
  fontFamily: "JetBrains Mono, Fira Code, Consolas, monospace",
  flowchart: {
    useMaxWidth: false,
    htmlLabels: true,
    curve: "basis",
    nodeSpacing: 30,
    rankSpacing: 30,
    padding: 10,
  },
  themeVariables: {
    primaryColor: "#16161a",
    primaryTextColor: "#e4e4e7",
    primaryBorderColor: "#22c55e",
    lineColor: "#22c55e",
    secondaryColor: "#111113",
    secondaryBorderColor: "#2e2e38",
    secondaryTextColor: "#a1a1aa",
    tertiaryColor: "#09090b",
    fontSize: "14px",
  },
});

// ─── Sanitise mermaid syntax ──────────────────────────────────────────────────
const fixChart = (code: string): string => {
  let fixed = code
    .replace(/\[\[\]\]/g, '["[]"]')
    .replace(/\[\[(.*?)\]\]/g, '["$1"]')
    .replace(/([A-Za-z0-9_]+)\[(?!"|')(.*?)[\(\)\=\*](.*?)\]/g, '$1["$2$3"]');

  if (!fixed.includes("graph ") && !fixed.includes("sequenceDiagram")) {
    fixed = "graph TD;\n" + fixed;
  }
  return fixed;
};

// ─── Spinner ──────────────────────────────────────────────────────────────────
const Spinner = () => (
  <svg
    className="w-4 h-4 animate-spin text-orange-500"
    viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
  >
    <line x1="12" y1="2" x2="12" y2="6" />
    <line x1="12" y1="18" x2="12" y2="22" />
    <line x1="4.93" y1="4.93" x2="7.76" y2="7.76" />
    <line x1="16.24" y1="16.24" x2="19.07" y2="19.07" />
    <line x1="2" y1="12" x2="6" y2="12" />
    <line x1="18" y1="12" x2="22" y2="12" />
    <line x1="4.93" y1="19.07" x2="7.76" y2="16.24" />
    <line x1="16.24" y1="7.76" x2="19.07" y2="4.93" />
  </svg>
);

// ─── Component ────────────────────────────────────────────────────────────────
export const Mermaid = ({ chart }: { chart: string }) => {
  const [svg,    setSvg]    = useState("");
  const [status, setStatus] = useState<"loading" | "error" | "success">("loading");
  const lastChart = useRef<string | null>(null);

  useEffect(() => {
    // Skip if unchanged and we already have an SVG
    if (chart === lastChart.current && svg) {
      setStatus("success");
      return;
    }

    const render = async () => {
      if (!chart || chart.length < 5) return;
      if (!svg) setStatus("loading");

      try {
        const id = `mermaid-${Math.random().toString(36).slice(2, 11)}`;
        const { svg: output } = await mermaid.render(id, fixChart(chart));
        setSvg(output);
        setStatus("success");
        lastChart.current = chart;
      } catch {
        if (chart.length > 50) setStatus("error");
      }
    };

    const t = setTimeout(render, 500);
    return () => clearTimeout(t);
  }, [chart]);

  const openInTab = () => {
    if (!svg) return;
    const url = URL.createObjectURL(new Blob([svg], { type: "image/svg+xml" }));
    window.open(url, "_blank");
  };

  // ── Loading ────────────────────────────────────────────────────────────────
  if (status !== "success" || !svg) {
    if (status === "error") {
      return (
        <div className="my-3 flex items-center gap-2 px-3 py-2.5 bg-rose-500/[0.06] border border-rose-500/18 rounded-[9px] text-[11px] text-rose-300 font-mono">
          <AlertTriangle size={12} className="text-rose-400 shrink-0" />
          Diagram syntax error
        </div>
      );
    }

    return (
      <div className="my-3 flex flex-col items-center justify-center gap-2 py-6 bg-zinc-900/30 border border-dashed border-zinc-800 rounded-[10px]">
        <Spinner />
        <span className="text-[10px] font-mono text-zinc-600">Drawing structure…</span>
      </div>
    );
  }

  // ── Success ────────────────────────────────────────────────────────────────
  return (
    <div className="my-3 relative group rounded-[10px] border border-zinc-800 bg-zinc-950/50 overflow-hidden">

      {/* Toolbar — fades in on hover */}
      <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-150 z-10">
        <button
          onClick={openInTab}
          title="Open in new tab"
          className="w-6 h-6 rounded-[6px] bg-black/60 backdrop-blur flex items-center justify-center text-zinc-400 hover:bg-orange-500 hover:text-white transition-all"
        >
          <ExternalLink size={12} />
        </button>
        <div className="w-6 h-6 rounded-[6px] bg-black/60 backdrop-blur flex items-center justify-center text-zinc-600 cursor-default">
          <Maximize2 size={11} />
        </div>
      </div>

      {/* Scrollable SVG */}
      <div className="overflow-x-auto px-4 py-3 scrollbar-thin scrollbar-thumb-zinc-800 scrollbar-track-transparent">
        <div
          className="min-w-full w-fit mx-auto"
          dangerouslySetInnerHTML={{ __html: svg }}
        />
      </div>
    </div>
  );
};