import { useState } from "react";
import {
  CheckCircle,
  AlertCircle,
  Dumbbell,
  Sparkles,
  Save,
  Loader2,
  X,
  RefreshCw,
  CheckCircle2,
} from "lucide-react";

interface WorkoutLoggerProps {
  slug: string;
  title: string;
  token: string | null;
  messages: any[];
  problemContext: any;
  timeTaken: number;
  language: string;
  onLogComplete: () => void;
  onCancel: () => void;
}

const PanelHeader = ({
  icon: Icon,
  label,
  onClose,
  onRegenerate,
}: {
  icon: React.ElementType;
  label: string;
  onClose: () => void;
  onRegenerate?: () => void;
}) => (
  <div className="flex items-center justify-between px-3 py-2.5">
    <div className="flex items-center gap-2">
      <div 
        className="w-[22px] h-[22px] rounded-[6px] border flex items-center justify-center"
        style={{ backgroundColor: 'var(--green-dim)', borderColor: 'var(--border-green)' }}
      >
        <Icon size={11} style={{ color: 'var(--green)' }} />
      </div>
      <span className="text-[11px] font-bold uppercase tracking-[.1em]" style={{ color: 'var(--text-2)' }}>
        {label}
      </span>
    </div>
    <div className="flex gap-0.5">
      {onRegenerate && (
        <button
          type="button"
          onClick={onRegenerate}
          title="Regenerate"
          className="w-[22px] h-[22px] rounded-[6px] flex items-center justify-center transition-all"
          style={{ color: 'var(--text-2)' }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = 'var(--green)';
            e.currentTarget.style.backgroundColor = 'var(--card)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = 'var(--text-2)';
            e.currentTarget.style.backgroundColor = 'transparent';
          }}
        >
          <RefreshCw size={11} />
        </button>
      )}
      <button
        type="button"
        onClick={onClose}
        className="w-[22px] h-[22px] rounded-[6px] flex items-center justify-center transition-all"
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
        <X size={11} />
      </button>
    </div>
  </div>
);

const RATINGS = [
  {
    score: 1,
    label: "Struggled",
    icon: AlertCircle,
  },
  {
    score: 2,
    label: "Got it",
    icon: Dumbbell,
  },
  {
    score: 3,
    label: "Crushed",
    icon: CheckCircle,
  },
];

export const WorkoutLogger = ({
  slug,
  title,
  token,
  messages,
  problemContext,
  timeTaken,
  language,
  onLogComplete,
  onCancel,
}: WorkoutLoggerProps) => {
  const [step, setStep] = useState<"rate" | "notes" | "success">("rate");
  const [confidence, setConfidence] = useState(2);
  const [notes, setNotes] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const authHeaders = (): Record<string, string> => {
    const h: Record<string, string> = { "Content-Type": "application/json" };
    if (token) h.Authorization = `Bearer ${token}`;
    return h;
  };

  const generateNotes = async () => {
    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/generate-notes`,
        {
          method: "POST",
          headers: authHeaders(),
          body: JSON.stringify({
            messages,
            problemContext,
            userApiKey: "",
            language,
          }),
        },
      );
      setNotes(await res.json());
    } catch {
      setNotes({
        category: "General Logic",
        approach: "Could not generate summary. Please review manually.",
        complexity: "N/A",
      });
    }
  };

  const handleRate = async (score: number) => {
    setConfidence(score);
    setLoading(true);
    await generateNotes();
    setStep("notes");
    setLoading(false);
  };

  const handleSave = async () => {
    if (!token) {
      setSaveError("You need to be logged in to save your workout. Please log in and try again.");
      return;
    }
    setLoading(true);
    setSaveError(null);
    setSaveSuccess(false);
    
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/log`, {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify({
          slug,
          title,
          confidence,
          ...notes,
          language,
          timeTaken: timeTaken,
        }),
      });
      
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        let errorMessage = "Failed to save your workout. Please try again.";
        
        if (res.status === 401) {
          errorMessage = "Your session has expired. Please log in again.";
        } else if (res.status === 400) {
          errorMessage = data.error || "Invalid data. Please check your input and try again.";
        } else if (res.status === 500) {
          errorMessage = "Server error occurred. Please try again in a moment.";
        } else if (data.message) {
          errorMessage = data.message;
        }
        
        setSaveError(errorMessage);
        setLoading(false);
        return;
      }
      
      // Success - update timer state
      chrome.storage.local.get([`timer_${slug}`], (r) => {
        const cur = r[`timer_${slug}`];
        if (cur)
          chrome.storage.local.set({
            [`timer_${slug}`]: {
              ...cur,
              isRunning: false,
              lastSaved: Date.now(),
            },
          });
      });
      
      setSaveSuccess(true);
      setLoading(false);
      
      // Show success message for 2 seconds before closing
      setTimeout(() => {
        onLogComplete();
      }, 2000);
    } catch (error) {
      setSaveError("Network error. Please check your connection and try again.");
      setLoading(false);
    }
  };

  const fmtTime = (s: number) => `${Math.floor(s / 60)}m ${s % 60}s`;

  if (loading && !saveSuccess) {
    return (
      <div 
        className="border-t flex flex-col items-center justify-center gap-2.5 py-8 min-h-[130px]"
        style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)' }}
      >
        <div className="relative">
          <Loader2 className="w-6 h-6 animate-spin" style={{ color: 'var(--green)' }} />
          <div className="absolute inset-0 blur-lg rounded-full" style={{ backgroundColor: 'var(--green-dim)' }} />
        </div>
        <span className="text-[10px] font-mono animate-pulse" style={{ color: 'var(--text-2)' }}>
          {step === "rate"
            ? "Synthesizing insights…"
            : step === "success"
            ? "Workout saved successfully!"
            : "Saving to knowledge base…"}
        </span>
      </div>
    );
  }

  if (step === "rate") {
    return (
      <div className="border-t" style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border-default)' }}>
        <PanelHeader icon={Dumbbell} label="Log Workout" onClose={onCancel} />
        <p className="px-3 pb-2 text-[11px] leading-relaxed" style={{ color: 'var(--text-2)' }}>
          How did this one feel? Sets your next review interval.
        </p>
        <div className="flex gap-1.5 px-3 pb-3">
          {RATINGS.map(({ score, label, icon: Icon }) => {
            const ratingStyles = {
              1: { color: 'var(--red)', bg: 'var(--red-dim)', border: 'rgba(239, 68, 68, 0.3)' },
              2: { color: 'var(--amber)', bg: 'var(--amber-dim)', border: 'rgba(245, 158, 11, 0.3)' },
              3: { color: 'var(--green)', bg: 'var(--green-dim)', border: 'var(--border-green)' },
            };
            const style = ratingStyles[score as keyof typeof ratingStyles];
            return (
              <button
                key={score}
                type="button"
                onClick={() => handleRate(score)}
                className="flex-1 flex flex-col items-center gap-1.5 py-2.5 rounded-[10px] border transition-all group"
                style={{ color: style.color, backgroundColor: style.bg, borderColor: style.border }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = style.bg.replace('0.1', '0.2');
                  e.currentTarget.style.borderColor = style.border.replace('0.2', '0.4');
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = style.bg;
                  e.currentTarget.style.borderColor = style.border;
                }}
              >
                <Icon
                  size={17}
                  className="group-hover:scale-110 transition-transform"
                />
                <span className="text-[10px] font-bold">{label}</span>
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div className="border-t" style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border-default)' }}>
      <PanelHeader
        icon={Sparkles}
        label="Smart Notes"
        onClose={onCancel}
        onRegenerate={async () => {
          setLoading(true);
          await generateNotes();
          setLoading(false);
        }}
      />
      <div className="px-3 pb-3 space-y-2">
        <div 
          className="border rounded-[9px] p-2.5 space-y-2.5"
          style={{ 
            backgroundColor: 'var(--card)', 
            borderColor: 'var(--border)' 
          }}
        >
          <div className="flex items-start justify-between gap-2">
            <div>
              <p className="text-[9px] font-bold uppercase tracking-[.1em] mb-0.5" style={{ color: 'var(--text-2)' }}>
                Pattern
              </p>
              <p className="text-[11px] font-semibold" style={{ color: 'var(--green)' }}>
                {notes?.category}
              </p>
            </div>
            <div className="text-right">
              <p className="text-[9px] font-bold uppercase tracking-[.1em] mb-0.5" style={{ color: 'var(--text-2)' }}>
                Complexity
              </p>
              <p className="text-[10px] font-mono" style={{ color: 'var(--text)' }}>
                {notes?.complexity}
              </p>
            </div>
          </div>
          <div>
            <p className="text-[9px] font-bold uppercase tracking-[.1em] mb-0.5" style={{ color: 'var(--text-2)' }}>
              Approach
            </p>
            <p className="text-[11px] leading-[1.65]" style={{ color: 'var(--text)' }}>
              {notes?.approach}
            </p>
          </div>
          {timeTaken > 0 && (
            <div className="flex gap-1.5 flex-wrap">
            <span 
              className="text-[10px] font-mono px-2 py-1 rounded-[5px] border"
              style={{ 
                backgroundColor: 'var(--surface)', 
                borderColor: 'var(--border)',
                color: 'var(--text-2)',
              }}
            >
              ⏱ {fmtTime(timeTaken)}
            </span>
            </div>
          )}
          <div 
            className="border rounded-[7px] overflow-hidden"
            style={{ 
              backgroundColor: 'var(--surface)', 
              borderColor: 'var(--border)' 
            }}
          >
            <div 
              className="flex items-center justify-between px-2.5 py-1.5 border-b"
              style={{ 
                backgroundColor: 'var(--card)', 
                borderColor: 'var(--border)' 
              }}
            >
              <span className="text-[9px] font-mono" style={{ color: 'var(--text-2)' }}>
                optimal · {language}
              </span>
              <button
                type="button"
                onClick={() =>
                  navigator.clipboard?.writeText(notes?.optimalSolution || "")
                }
                className="text-[9px] transition-colors font-sans"
                style={{ color: 'var(--green)' }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.opacity = '0.8';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.opacity = '1';
                }}
              >
                Copy
              </button>
            </div>
            <textarea
              value={notes?.optimalSolution || ""}
              onChange={(e) =>
                setNotes({ ...notes, optimalSolution: e.target.value })
              }
              className="w-full h-[72px] bg-transparent text-[10px] font-mono outline-none resize-none px-2.5 py-2 leading-[1.65]"
              style={{ color: 'var(--code-text)', backgroundColor: 'var(--code-bg)' }}
            />
          </div>
        </div>
        {saveSuccess && (
          <div 
            className="flex items-center gap-2 px-3 py-2 rounded-[8px] border text-[11px]"
            style={{ 
              backgroundColor: 'rgba(52, 211, 153, 0.1)', 
              borderColor: 'rgba(52, 211, 153, 0.3)',
              color: 'var(--green)',
            }}
          >
            <CheckCircle2 size={13} className="shrink-0" />
            <span className="font-medium">Workout saved successfully! Your progress has been logged.</span>
          </div>
        )}
        {saveError && (
          <div 
            className="flex items-start gap-2 px-3 py-2 rounded-[8px] border text-[11px]"
            style={{ 
              backgroundColor: 'rgba(251, 113, 133, 0.1)', 
              borderColor: 'rgba(251, 113, 133, 0.3)',
              color: 'var(--red)',
            }}
          >
            <AlertCircle size={13} className="shrink-0 mt-0.5" />
            <span className="flex-1">{saveError}</span>
          </div>
        )}
        {!saveSuccess && (
          <button
            type="button"
            onClick={handleSave}
            disabled={loading}
            className="w-full py-2.5 rounded-[9px] active:scale-[0.99] text-[12px] font-bold flex items-center justify-center gap-2 transition-all border disabled:opacity-50 disabled:cursor-not-allowed"
            style={{
              backgroundColor: 'var(--green)',
              color: '#000000',
              borderColor: 'var(--green)',
              boxShadow: 'var(--shadow-green)',
            }}
            onMouseEnter={(e) => {
              if (!loading) {
                e.currentTarget.style.backgroundColor = 'var(--green-hover)';
              }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--green)';
            }}
          >
            {loading ? (
              <>
                <Loader2 size={13} className="animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save size={13} />
                Confirm & Save Log
              </>
            )}
          </button>
        )}
      </div>
    </div>
  );
};
