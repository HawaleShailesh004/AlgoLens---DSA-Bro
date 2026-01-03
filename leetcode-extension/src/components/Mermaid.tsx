import { useEffect, useState, useRef } from "react";
import mermaid from "mermaid";
import { Loader2, AlertTriangle, ExternalLink, ZoomIn } from "lucide-react";

// Initialize configuration
// Initialize configuration
mermaid.initialize({
  startOnLoad: false,
  suppressErrorRendering: true,
  theme: "base", // Use 'base' to allow full custom override
  securityLevel: "loose",
  fontFamily:
    "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",

  flowchart: {
    useMaxWidth: false,
    htmlLabels: true,
    curve: "basis",
    nodeSpacing: 30,
    rankSpacing: 30,
    padding: 10,
  },

  themeVariables: {
    // 🎨 NODES (The Bubbles)
    primaryColor: "#27272a", // Dark Zinc-800 background
    primaryTextColor: "#ffffff", // Pure White Text
    primaryBorderColor: "#f97316", // 🔥 Neon Orange Border

    // ➖ LINES (The Arrows)
    lineColor: "#fb923c", // Light Orange Lines (High Visibility)

    // 🔳 SECONDARY NODES (Subgraphs/Backgrounds)
    secondaryColor: "#18181b", // Darker Zinc-900
    secondaryBorderColor: "#52525b", // Zinc-600
    secondaryTextColor: "#e4e4e7", // Zinc-200

    // 🔠 TEXT & EXTRAS
    tertiaryColor: "#18181b", // Background
    fontSize: "16px", // Large readable text
  },
});

const fixChart = (code: string) => {
  let fixed = code;
  fixed = fixed.replace(/\[\[\]\]/g, '["[]"]');
  fixed = fixed.replace(/\[\[(.*?)\]\]/g, '["$1"]');
  if (!fixed.includes("graph ") && !fixed.includes("sequenceDiagram")) {
    fixed = "graph TD;\n" + fixed;
  }
  return fixed;
};

export const Mermaid = ({ chart }: { chart: string }) => {
  const [svg, setSvg] = useState("");
  const [status, setStatus] = useState<"loading" | "error" | "success">(
    "loading"
  );

  // 🛑 CACHE: Keeps track of the last code we successfully rendered
  // This prevents re-rendering if the component re-mounts with the same data.
  const lastRenderedChart = useRef<string | null>(null);

  useEffect(() => {
    // 1. OPTIMIZATION: If code hasn't changed, DO NOT re-render
    if (chart === lastRenderedChart.current) {
      if (svg) setStatus("success"); // Restore success state immediately
      return;
    }

    const renderChart = async () => {
      if (!chart || chart.length < 5) return;

      try {
        // Only show loading if we don't have an SVG yet (prevents flashing)
        if (!svg) setStatus("loading");

        const id = `mermaid-${Math.random().toString(36).substr(2, 9)}`;
        const cleanCode = fixChart(chart);

        const { svg: output } = await mermaid.render(id, cleanCode);

        setSvg(output);
        setStatus("success");
        lastRenderedChart.current = chart; // Update cache
      } catch (err) {
        console.warn("Mermaid Render Retrying...", err);
        // Only error if it's been incomplete for a while
        if (chart.length > 50) setStatus("error");
      }
    };

    const timeout = setTimeout(renderChart, 500);
    return () => clearTimeout(timeout);
  }, [chart]); // Dependency on 'chart' only

  // 🔗 OPEN IN NEW TAB FUNCTION
  const handleOpenNewTab = () => {
    if (!svg) return;
    // Create a Blob from the SVG string
    const blob = new Blob([svg], { type: "image/svg+xml" });
    const url = URL.createObjectURL(blob);
    // Open in new tab
    window.open(url, "_blank");
  };

  if (status === "success" && svg) {
    return (
      <div className="my-4 w-full relative group">
        <div className="bg-zinc-950/50 rounded-xl border border-zinc-800 overflow-hidden relative">
          {/* 🛠️ TOOLBAR (Visible on Hover) */}
          <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity z-10">
            <button
              onClick={handleOpenNewTab}
              title="Open in new tab"
              className="p-1.5 bg-black/60 backdrop-blur hover:bg-orange-500 text-zinc-300 hover:text-white rounded-md transition-colors shadow-sm"
            >
              <ExternalLink size={14} />
            </button>
            <div className="p-1.5 bg-black/60 backdrop-blur rounded-md text-zinc-400 cursor-default">
              <ZoomIn size={14} />
            </div>
          </div>

          {/* Scrollable Container */}
          <div className="overflow-x-auto p-6 scrollbar-thin scrollbar-thumb-zinc-700 scrollbar-track-transparent">
            <div
              dangerouslySetInnerHTML={{ __html: svg }}
              className="min-w-full w-fit mx-auto"
            />
          </div>
        </div>
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="my-4 p-3 bg-red-900/10 border border-red-900/30 rounded-lg flex flex-col gap-2">
        <div className="flex items-center gap-2 text-red-400 text-xs font-mono">
          <AlertTriangle className="w-4 h-4" />
          <span>Diagram Syntax Error</span>
        </div>
      </div>
    );
  }

  // Loading State
  return (
    <div className="my-4 p-8 bg-zinc-900/30 border border-dashed border-zinc-800 rounded-lg flex flex-col items-center justify-center gap-2 text-zinc-500">
      <Loader2 className="w-5 h-5 animate-spin text-orange-500" />
      <span className="text-xs font-mono opacity-75">Drawing structure...</span>
    </div>
  );
};
