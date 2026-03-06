import { Clock, Settings, Trash2, LogOut } from "lucide-react";
import { ThemeToggle } from "./ThemeToggle";

const diffConfig: Record<string, { color: string; bg: string; dot: string }> = {
  Easy:   { color: "var(--green)", bg: "var(--green-dim)", dot: "var(--green)" },
  Medium: { color: "var(--amber)", bg: "var(--amber-dim)", dot: "var(--amber)" },
  Hard:   { color: "var(--red)", bg: "var(--red-dim)", dot: "var(--red)" },
};

export const Header = ({
  title,
  difficulty,
  onToggleTimer,
  onSettings,
  onClear,
  onLogout,
}: {
  title: string;
  difficulty: string;
  onToggleTimer?: () => void;
  onSettings: () => void;
  onClear: () => void;
  onLogout: () => void;
}) => {
  const diff = diffConfig[difficulty] ?? diffConfig.Medium;

  return (
    <header
      className="flex items-center justify-between border-b sticky top-0 z-20 shrink-0"
      style={{
        height: "48px",
        padding: "12px 16px",
        backgroundColor: "var(--surface)",
        borderColor: "var(--border)",
      }}
      aria-label="Problem context and controls"
    >
      {/* Left: title + difficulty pill (spec: 9px mono, 2px radius) */}
      <div className="flex items-center gap-2 min-w-0 flex-1">
        <h1
          className="font-bold truncate leading-tight"
          style={{ color: "var(--text)", fontSize: "var(--text-sm)" }}
          title={title || "No Problem Detected"}
        >
          {title ? (title.length > 30 ? title.slice(0, 30) + "…" : title) : "No Problem Detected"}
        </h1>
        {difficulty && (
          <span
            className="inline-flex items-center gap-1 shrink-0 font-bold uppercase border"
            style={{
              color: diff.color,
              backgroundColor: diff.bg,
              borderColor: diff.color,
              borderRadius: "2px",
              fontSize: "9px",
              padding: "2px 8px",
              letterSpacing: "0.2em",
            }}
          >
            {difficulty}
          </span>
        )}
      </div>

      {/* Right: Timer toggle, Settings, Clear, Logout (spec) */}
      <div className="flex items-center gap-0.5 shrink-0">
        {onToggleTimer != null && (
          <button
            onClick={onToggleTimer}
            title="Timer"
            className="w-7 h-7 rounded-[7px] flex items-center justify-center transition-all"
            style={{ color: "var(--text-2)" }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = "var(--text)";
              e.currentTarget.style.backgroundColor = "var(--card)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = "var(--text-2)";
              e.currentTarget.style.backgroundColor = "transparent";
            }}
          >
            <Clock size={13} aria-hidden />
          </button>
        )}
        <ThemeToggle />
        <div className="w-px h-3.5" style={{ backgroundColor: "var(--border)" }} />
        <button
          onClick={onClear}
          title="Clear chat"
          className="w-7 h-7 rounded-[7px] flex items-center justify-center transition-all"
          style={{ color: 'var(--text-2)' }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = 'var(--red)';
            e.currentTarget.style.backgroundColor = 'var(--red-dim)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = 'var(--text-2)';
            e.currentTarget.style.backgroundColor = 'transparent';
          }}
        >
          <Trash2 size={13} />
        </button>

        <button
          onClick={onSettings}
          title="Settings"
          className="w-7 h-7 rounded-[7px] flex items-center justify-center transition-all"
          style={{ color: 'var(--text-2)' }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = 'var(--text)';
            e.currentTarget.style.backgroundColor = 'var(--card)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = 'var(--text-2)';
            e.currentTarget.style.backgroundColor = 'transparent';
          }}
        >
          <Settings size={13} />
        </button>
        <button
          onClick={onLogout}
          title="Sign out"
          className="w-7 h-7 rounded-[7px] flex items-center justify-center transition-all"
          style={{ color: 'var(--text-2)' }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = 'var(--red)';
            e.currentTarget.style.backgroundColor = 'var(--red-dim)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = 'var(--text-2)';
            e.currentTarget.style.backgroundColor = 'transparent';
          }}
        >
          <LogOut size={13} />
        </button>
      </div>
    </header>
  );
};