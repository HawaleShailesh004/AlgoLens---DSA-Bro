import { useState } from "react";
import { Lightbulb, ArrowRight } from "lucide-react";

export const ManualContext = ({ onConfirm }: { onConfirm: (text: string) => void }) => {
  const [text, setText] = useState("");

  return (
    <div
      className="h-full flex flex-col items-center justify-center px-5 py-6 text-center"
      style={{ backgroundColor: "var(--bg)" }}
    >
      <div
        className="w-12 h-12 rounded flex items-center justify-center mb-3 shrink-0 border"
        style={{
          backgroundColor: "var(--card)",
          borderColor: "var(--border)",
        }}
      >
        <Lightbulb size={20} style={{ color: "var(--muted)" }} />
      </div>

      <h2
        className="text-[14px] font-extrabold tracking-tight mb-1.5"
        style={{ color: "var(--text)" }}
      >
        Context Missing
      </h2>
      <p
        className="text-[11px] leading-[1.65] max-w-[210px] mb-4"
        style={{ color: "var(--muted)" }}
      >
        Couldn&apos;t auto-detect the problem. Paste the description below and the coach will analyze it.
      </p>

      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Paste the problem text here…"
        className="w-full h-[88px] rounded px-3 py-2.5 text-[11px] outline-none resize-none leading-[1.65] transition-all mb-3 border"
        style={{
          backgroundColor: "var(--surface)",
          borderColor: "var(--border)",
          color: "var(--text)",
          fontFamily: "var(--mono)",
        }}
        onFocus={(e) => {
          e.target.style.borderColor = "var(--green)";
          e.target.style.boxShadow = "var(--shadow-green)";
        }}
        onBlur={(e) => {
          e.target.style.borderColor = "var(--border)";
          e.target.style.boxShadow = "none";
        }}
      />

      <button
        type="button"
        onClick={() => onConfirm(text)}
        disabled={!text.trim()}
        className="w-full py-[10px] rounded border text-[12px] font-bold flex items-center justify-center gap-2 transition-all disabled:opacity-40 disabled:cursor-not-allowed active:translate-y-px"
        style={{
          backgroundColor: "var(--green)",
          color: "#000000",
          borderColor: "var(--green)",
          boxShadow: "var(--shadow-sm)",
          fontFamily: "var(--mono)",
        }}
        onMouseEnter={(e) => {
          if (text.trim()) {
            e.currentTarget.style.backgroundColor = "var(--green-hover)";
            e.currentTarget.style.boxShadow = "var(--shadow-green)";
          }
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = "var(--green)";
          e.currentTarget.style.boxShadow = "var(--shadow-sm)";
        }}
      >
        Analyze Context
        <ArrowRight size={13} />
      </button>
    </div>
  );
};
