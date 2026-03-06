import {
  Sparkles, Bug, Zap, Lightbulb, Search, Box, Scale, Eye, MessageSquare,
} from "lucide-react";

export type QuickPromptItem = { label: string; text: string };

const DEFAULT_PROMPTS: { label: string; icon: typeof Lightbulb; text: string }[] = [
  { label: "Hint",       icon: Lightbulb, text: "Give me a small hint to get started, but don't give the answer." },
  { label: "Complexity", icon: Zap,       text: "What is the Time and Space complexity of my approach?" },
  { label: "Edge Cases", icon: Box,       text: "What are some critical edge cases I should handle?" },
  { label: "Find Bug",   icon: Bug,       text: "I suspect there's a bug in my logic. Can you help me find it?" },
  { label: "Approach",   icon: Search,    text: "Explain the high-level logic for this problem without code." },
  { label: "Optimize",   icon: Sparkles,  text: "Is there a more optimized way to solve this?" },
  { label: "Rate Code",  icon: Scale,     text: "Here is my approach. Rate my code on Cleanliness, Time Complexity, and Space Complexity. Be strict." },
  { label: "Visualize",  icon: Eye,       text: "Visualize this data structure or algorithm logic with a diagram." },
];

const labelToIcon: Record<string, typeof Lightbulb> = {
  Hint: Lightbulb, Complexity: Zap, "Edge Cases": Box, "Find Bug": Bug,
  Approach: Search, Optimize: Sparkles, "Rate Code": Scale, Visualize: Eye,
};

interface QuickPromptsProps {
  onSelect: (text: string) => void;
  /** When provided (e.g. from API), use these instead of default prompts. */
  prompts?: QuickPromptItem[] | null;
}

export const QuickPrompts = ({ onSelect, prompts }: QuickPromptsProps) => {
  const list = prompts && prompts.length > 0
    ? prompts.map((p) => ({ ...p, icon: labelToIcon[p.label] ?? MessageSquare }))
    : DEFAULT_PROMPTS;

  return (
    <div className="flex gap-1.5 overflow-x-auto overflow-y-hidden px-3 pt-2 pb-2.5">
      {list.map(({ label, icon: Icon, text }, i) => (
        <button
          key={i}
          onClick={() => onSelect(text)}
          className="flex items-center gap-1.5 px-2.5 py-1.5 shrink-0 rounded-full border transition-all group"
          style={{
            backgroundColor: 'var(--card)',
            borderColor: 'var(--border)',
            color: 'var(--text-2)',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = 'var(--green-dim)';
            e.currentTarget.style.borderColor = 'var(--green)';
            e.currentTarget.style.color = 'var(--green)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'var(--card)';
            e.currentTarget.style.borderColor = 'var(--border)';
            e.currentTarget.style.color = 'var(--text-2)';
          }}
        >
          <Icon size={11} className="transition-colors" />
          <span className="text-[11px] font-medium whitespace-nowrap">{label}</span>
        </button>
      ))}
    </div>
  );
};