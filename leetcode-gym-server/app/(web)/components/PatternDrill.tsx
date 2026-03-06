"use client";

import { useState, useEffect } from "react";
import { Target, BrainCircuit, ChevronDown, ChevronRight, X } from "lucide-react";
import { getStoredToken } from "../layout";

type PatternDrillProps = {
  onPatternSelect: (pattern: string | null) => void;
  selectedPattern: string | null;
};

export function PatternDrill({ onPatternSelect, selectedPattern }: PatternDrillProps) {
  const [patterns, setPatterns] = useState<Array<{ pattern: string; avgConfidence: number; count: number }>>([]);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const fetchPatterns = async () => {
      const token = getStoredToken();
      if (!token) return;

      setLoading(true);
      try {
        const res = await fetch("/api/analytics/weak-spots", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          // Get all patterns, not just top 3
          const allPatternsRes = await fetch("/api/analytics/pattern-coverage", {
            headers: { Authorization: `Bearer ${token}` },
          });
          if (allPatternsRes.ok) {
            const allData = await allPatternsRes.json();
            setPatterns(allData.patterns || []);
          } else {
            setPatterns(data.weakSpots || []);
          }
        }
      } catch (error) {
        console.error("Failed to fetch patterns:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPatterns();
  }, []);

  const sortedPatterns = [...patterns].sort((a, b) => a.avgConfidence - b.avgConfidence);

  if (selectedPattern) {
    return (
      <div
        className="border rounded-xl p-4 flex items-center justify-between"
        style={{ backgroundColor: "var(--green-dim)", borderColor: "var(--border-green)" }}
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded flex items-center justify-center border" style={{ backgroundColor: "var(--green-dim)", borderColor: "var(--border-green)" }}>
            <Target size={14} style={{ color: "var(--green)" }} />
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-wider" style={{ color: "var(--green)" }}>Drilling</p>
            <p className="text-sm font-semibold" style={{ color: "var(--text)" }}>{selectedPattern}</p>
          </div>
        </div>
        <button
          onClick={() => {
            onPatternSelect(null);
            setIsOpen(false);
          }}
          className="transition-colors hover:opacity-90"
          style={{ color: "var(--text-2)" }}
        >
          <X size={16} />
        </button>
      </div>
    );
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between gap-2 px-4 py-3 border rounded-xl transition-colors hover:opacity-90"
        style={{ backgroundColor: "var(--surface)", borderColor: "var(--border)" }}
      >
        <div className="flex items-center gap-2">
          <BrainCircuit size={16} style={{ color: "var(--green)" }} />
          <span className="text-sm font-semibold" style={{ color: "var(--text)" }}>Pattern Drill</span>
        </div>
        <ChevronDown size={16} className={`transition-transform ${isOpen ? "rotate-180" : ""}`} style={{ color: "var(--text-2)" }} />
      </button>

      {isOpen && (
        <div
          className="absolute top-full left-0 right-0 mt-2 rounded-xl z-50 max-h-[300px] overflow-y-auto border"
          style={{ backgroundColor: "var(--surface)", borderColor: "var(--border)", boxShadow: "var(--shadow-lg)" }}
        >
          <div className="p-2 space-y-1">
            {loading ? (
              <div className="px-4 py-3 text-sm text-center" style={{ color: "var(--text-2)" }}>Loading patterns...</div>
            ) : sortedPatterns.length === 0 ? (
              <div className="px-4 py-3 text-sm text-center" style={{ color: "var(--text-2)" }}>No patterns found</div>
            ) : (
              <>
                <div className="px-3 py-2 text-xs font-bold uppercase tracking-wider" style={{ color: "var(--muted)" }}>
                  Select Pattern to Drill
                </div>
                {sortedPatterns.map((p) => (
                  <button
                    key={p.pattern}
                    onClick={() => {
                      onPatternSelect(p.pattern);
                      setIsOpen(false);
                    }}
                    className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg transition-colors text-left hover:opacity-90"
                    style={{ color: "var(--text)" }}
                  >
                    <div className="flex-1">
                      <p className="text-sm font-semibold">{p.pattern}</p>
                      <p className="text-xs" style={{ color: "var(--muted)" }}>
                        {p.count} problem{p.count !== 1 ? "s" : ""} • Avg confidence: {p.avgConfidence.toFixed(1)}/3
                      </p>
                    </div>
                    <div className="flex items-center gap-1">
                      {p.avgConfidence < 2 && (
                        <span className="text-xs font-semibold" style={{ color: "var(--green)" }}>Weak</span>
                      )}
                      <ChevronRight size={14} style={{ color: "var(--muted)" }} />
                    </div>
                  </button>
                ))}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
