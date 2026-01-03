import { useState, useEffect } from "react";
import { Calendar, Loader2, Trophy, ArrowUpRight, Clock } from "lucide-react";

export const Dashboard = ({ userId }: { userId: string }) => {
  const [dueProblems, setDueProblems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) return;

    fetch(`${import.meta.env.VITE_API_URL}/log?userId=${userId}`)
      .then((res) => res.json())
      .then((data) => {
        setDueProblems(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [userId]);

  // Helper: Calculate "Days Left" text
  const getDueText = (dateStr: string) => {
    const diff = new Date(dateStr).getTime() - Date.now();
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
    if (days < 0) return { text: "Overdue", color: "text-red-400" };
    if (days === 0) return { text: "Due Today", color: "text-orange-400" };
    return { text: `In ${days} days`, color: "text-zinc-500" };
  };

  return (
    <div className="h-screen bg-zinc-950 flex flex-col font-sans text-zinc-100">
      {/* Header */}
      <div className="p-6 border-b border-zinc-900 bg-zinc-950/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-orange-500/10 rounded-xl border border-orange-500/20 ring-1 ring-orange-500/10">
            <Calendar className="w-6 h-6 text-orange-500" />
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-tight">Daily Workout</h1>
            <p className="text-xs text-zinc-500 font-medium">
              Spaced Repetition Queue
            </p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-zinc-800 scrollbar-track-transparent">
        {loading ? (
          <div className="h-full flex flex-col items-center justify-center text-zinc-500 gap-2">
            <Loader2 className="animate-spin w-6 h-6" />
            <span className="text-xs">Loading your sets...</span>
          </div>
        ) : dueProblems.length === 0 ? (
          <div className="h-[60%] flex flex-col items-center justify-center text-center p-6 border border-dashed border-zinc-900 rounded-2xl bg-zinc-900/20 mt-4">
            <div className="bg-zinc-900 p-4 rounded-full mb-3">
              <Trophy className="w-8 h-8 text-yellow-500" />
            </div>
            <h3 className="text-sm font-bold text-zinc-300">All Caught Up!</h3>
            <p className="text-xs text-zinc-500 mt-1 max-w-[200px] leading-relaxed">
              Your repetition queue is empty. Go solve a new problem to build
              your muscle memory.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="flex justify-between items-end px-1">
              <h2 className="text-xs font-bold text-zinc-500 uppercase tracking-wider">
                Your Queue
              </h2>
              <span className="text-[10px] text-zinc-600 bg-zinc-900 px-2 py-0.5 rounded-full">
                {dueProblems.length} items
              </span>
            </div>

            {dueProblems.map((log) => {
              const due = getDueText(log.nextReviewAt);

              return (
                <a
                  key={log.id}
                  href={`https://leetcode.com/problems/${log.slug}`}
                  target="_blank"
                  rel="noreferrer"
                  className="flex flex-col gap-3 p-4 bg-zinc-900/50 border border-zinc-800 rounded-xl hover:border-orange-500/30 hover:bg-zinc-900 transition-all group relative overflow-hidden"
                >
                  {/* Top Row: Title & Confidence */}
                  <div className="flex justify-between items-start z-10 relative">
                    <div>
                      <h3 className="text-sm font-bold text-zinc-200 group-hover:text-orange-400 transition-colors">
                        {log.title}
                      </h3>
                      <span
                        className={`text-[9px] mt-1 inline-block px-1.5 py-0.5 rounded font-medium border ${
                          log.difficulty === "Hard"
                            ? "bg-red-500/10 text-red-400 border-red-500/20"
                            : log.difficulty === "Medium"
                            ? "bg-yellow-500/10 text-yellow-400 border-yellow-500/20"
                            : "bg-green-500/10 text-green-400 border-green-500/20"
                        }`}
                      >
                        {log.difficulty}
                      </span>
                    </div>

                    {/* Confidence Signal Meter */}
                    <div className="flex flex-col items-end gap-1">
                      <div
                        className="flex gap-0.5"
                        title={`Confidence Level: ${log.confidence}/3`}
                      >
                        {[1, 2, 3].map((level) => (
                          <div
                            key={level}
                            className={`w-1.5 rounded-sm transition-all ${
                              level <= log.confidence
                                ? log.confidence === 1
                                  ? "h-2 bg-red-500"
                                  : log.confidence === 2
                                  ? "h-3 bg-yellow-500"
                                  : "h-4 bg-green-500"
                                : "h-2 bg-zinc-800"
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Bottom Row: Date Info */}
                  <div className="flex items-center justify-between border-t border-zinc-800/50 pt-3 z-10 relative">
                    <div className="flex items-center gap-1.5 text-xs">
                      <Clock size={12} className={due.color} />
                      <span className={`${due.color} font-medium`}>
                        {due.text}
                      </span>
                    </div>

                    <div className="flex items-center gap-1 text-[10px] text-zinc-600 group-hover:text-zinc-400 transition-colors">
                      <span>Review Now</span>
                      <ArrowUpRight size={12} />
                    </div>
                  </div>

                  {/* Hover Glow Effect */}
                  <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                </a>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
