import {
  Sparkles,
  Bug,
  Zap,
  Lightbulb,
  Search,
  Box,
  Scale,
  Eye,
} from "lucide-react";

const PROMPTS = [
  {
    label: "Hint",
    icon: Lightbulb,
    text: "Give me a small hint to get started, but don't give the answer.",
  },
  {
    label: "Complexity",
    icon: Zap,
    text: "What is the Time and Space complexity of my approach?",
  },
  {
    label: "Edge Cases",
    icon: Box,
    text: "What are some critical edge cases I should handle?",
  },
  {
    label: "Find Bug",
    icon: Bug,
    text: "I suspect there's a bug in my logic. Can you help me find it?",
  },
  {
    label: "Approach",
    icon: Search,
    text: "Explain the high-level logic for this problem without code.",
  },
  {
    label: "Optimize",
    icon: Sparkles,
    text: "Is there a more optimized way to solve this?",
  },
  {
    label: "Rate Code",
    icon: Scale,
    text: "Here is my approach. Rate my code on Cleanliness (variable names), Time Complexity, and Space Complexity. Be strict.",
  },
  {
    label: "Visualize",
    icon: Eye,
    text: "Visualize this data structure or algorithm logic with a diagram.",
  },
];

export const QuickPrompts = ({
  onSelect,
}: {
  onSelect: (text: string) => void;
}) => {
  return (
    <div className="flex gap-2 overflow-x-auto px-4 py-3 pb-4 scrollbar-thin scrollbar-thumb-zinc-800 scrollbar-track-transparent">
      {PROMPTS.map((p, i) => (
        <button
          key={i}
          onClick={() => onSelect(p.text)}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 hover:border-zinc-700 rounded-full text-xs text-zinc-400 hover:text-orange-400 transition-all whitespace-nowrap shrink-0 group"
        >
          <p.icon
            size={12}
            className="text-zinc-500 group-hover:text-orange-500 transition-colors"
          />
          {p.label}
        </button>
      ))}
    </div>
  );
};
