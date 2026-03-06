import { useState, useEffect, useRef } from "react";
import { Play, Pause, RotateCcw, X } from "lucide-react";

interface TimerProps {
  slug: string;
  difficulty: string;
  onTimeUpdate: (time: number) => void;
  /** When true, render as overlay panel; when false, render nothing (state preserved) */
  showOverlay?: boolean;
  /** Called when user closes the overlay (e.g. X) */
  onClose?: () => void;
}

interface SavedTimerState {
  currentTime: number;
  isRunning: boolean;
  lastSaved: number;
}

export const Timer = ({ slug, onTimeUpdate, showOverlay = false }: TimerProps) => {
  const [time, setTime] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  const intervalRef = useRef<number | null>(null);

  // When overlay opens, show panel again
  useEffect(() => {
    if (showOverlay) setIsDismissed(false);
  }, [showOverlay]);

  // ── Load saved state ──────────────────────────────────────────────────────
  useEffect(() => {
    chrome.storage.local.get([`timer_${slug}`], (res) => {
      const saved = res[`timer_${slug}`] as SavedTimerState | undefined;
      if (saved) {
        setIsRunning(saved.isRunning);
        if (saved.isRunning) {
          const elapsed = Math.floor((Date.now() - saved.lastSaved) / 1000);
          setTime(saved.currentTime + elapsed);
        } else {
          setTime(saved.currentTime);
        }
      } else {
        setTime(0);
        setIsRunning(false);
      }
    });
  }, [slug]);

  // ── Ticker ────────────────────────────────────────────────────────────────
  useEffect(() => {
    if (isRunning) {
      intervalRef.current = window.setInterval(() => {
        setTime(prev => prev + 1);
      }, 1000);
    } else {
      if (intervalRef.current) window.clearInterval(intervalRef.current);
    }
    return () => { if (intervalRef.current) window.clearInterval(intervalRef.current); };
  }, [isRunning]);

  // ── Persist & notify parent (always, so footer keeps updating when modal closed) ──
  useEffect(() => {
    chrome.storage.local.set({
      [`timer_${slug}`]: { currentTime: time, isRunning, lastSaved: Date.now() },
    });
    onTimeUpdate(time);
  }, [time, isRunning, slug, onTimeUpdate]);

  const fmt = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m.toString().padStart(2, "0")}:${sec.toString().padStart(2, "0")}`;
  };

  // No timer UI when parent closed the overlay entirely
  if (!showOverlay) return null;

  // Dismissed: show compact bar at bottom so countdown stays visible and keeps running
  if (isDismissed) {
    return (
      <div
        className="absolute bottom-0 left-0 right-0 z-10 flex items-center justify-between px-3 py-1.5 border-t"
        style={{
          backgroundColor: "var(--surface)",
          borderColor: "var(--border)",
          fontFamily: "var(--mono)",
          fontSize: "11px",
        }}
      >
        <span style={{ color: "var(--text-2)" }}>Stopwatch</span>
        <div className="flex items-center gap-2">
          <span className="tabular-nums font-medium" style={{ color: "var(--green)" }}>
            {fmt(time)}
          </span>
          <button
            onClick={() => setIsDismissed(false)}
            className="px-2 py-0.5 rounded border transition-colors"
            style={{ borderColor: "var(--border-2)", color: "var(--text-2)" }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = "var(--green)";
              e.currentTarget.style.color = "var(--green)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = "var(--border-2)";
              e.currentTarget.style.color = "var(--text-2)";
            }}
          >
            Open
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      className="absolute inset-0 z-10 flex items-center justify-center p-4"
      style={{ backgroundColor: "rgba(0,0,0,0.6)" }}
      aria-label="Timer"
    >
      <div
        className="w-[240px] rounded border p-5 flex flex-col gap-4"
        style={{
          backgroundColor: "var(--card)",
          borderColor: "var(--border-2)",
          boxShadow: "var(--shadow-lg)",
        }}
      >
        <div className="flex items-center justify-between">
          <span className="text-[9px] font-bold uppercase tracking-wider" style={{ color: "var(--muted)" }}>
            Stopwatch
          </span>
          <button
            onClick={() => setIsDismissed(true)}
            title="Minimize (timer keeps running)"
            className="w-6 h-6 rounded flex items-center justify-center transition-colors"
            style={{ color: "var(--text-2)" }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = "var(--text)";
              e.currentTarget.style.backgroundColor = "var(--surface)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = "var(--text-2)";
              e.currentTarget.style.backgroundColor = "transparent";
            }}
          >
            <X size={12} aria-hidden />
          </button>
        </div>
        <div
          className="font-mono text-[32px] font-medium tabular-nums text-center"
          style={{ color: "var(--text)" }}
        >
          {fmt(time)}
        </div>
        <div className="flex items-center justify-center gap-2">
          <button
            onClick={() => setIsRunning((r) => !r)}
            className="w-9 h-9 rounded flex items-center justify-center transition-colors"
            style={{
              backgroundColor: "var(--green)",
              color: "#000000",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = "var(--green-hover)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "var(--green)";
            }}
          >
            {isRunning ? <Pause size={16} fill="currentColor" /> : <Play size={16} fill="currentColor" />}
          </button>
          <button
            onClick={() => {
              setIsRunning(false);
              setTime(0);
            }}
            className="w-9 h-9 rounded flex items-center justify-center transition-colors border"
            style={{ color: "var(--red)", borderColor: "var(--border-2)" }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = "var(--red-dim)";
              e.currentTarget.style.borderColor = "var(--red)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "transparent";
              e.currentTarget.style.borderColor = "var(--border-2)";
            }}
          >
            <RotateCcw size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}
