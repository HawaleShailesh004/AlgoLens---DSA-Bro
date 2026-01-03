import { useState } from "react";
import { CheckCircle, AlertCircle, Dumbbell } from "lucide-react";

export const WorkoutLogger = ({ slug, title, userId, onLogComplete }: any) => {
  const [loading, setLoading] = useState(false);

  const logWorkout = async (confidence: number) => {
    setLoading(true);
    const res = await fetch(`${import.meta.env.VITE_API_URL}/log`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ userId, slug, title, confidence }),
    });

    if (!res.ok) {
      setLoading(false);
      alert("Failed to log workout");
      return;
    }
    setLoading(false);
    onLogComplete();
  };

  return (
    <div className="p-4 bg-zinc-900 border-t border-zinc-800">
      <h3 className="text-xs font-bold text-zinc-400 mb-3 uppercase tracking-wider text-center">
        Rate this Set
      </h3>
      <div className="flex gap-2 justify-center">
        <button
          onClick={() => logWorkout(1)}
          disabled={loading}
          className="flex flex-col items-center gap-1 p-3 rounded-lg bg-red-900/20 border border-red-900/50 hover:bg-red-900/40 w-1/3 transition-all"
        >
          <AlertCircle size={16} className="text-red-500" />
          <span className="text-[10px] text-red-200">Failed</span>
        </button>

        <button
          onClick={() => logWorkout(2)}
          disabled={loading}
          className="flex flex-col items-center gap-1 p-3 rounded-lg bg-yellow-900/20 border border-yellow-900/50 hover:bg-yellow-900/40 w-1/3 transition-all"
        >
          <Dumbbell size={16} className="text-yellow-500" />
          <span className="text-[10px] text-yellow-200">Struggled</span>
        </button>

        <button
          onClick={() => logWorkout(3)}
          disabled={loading}
          className="flex flex-col items-center gap-1 p-3 rounded-lg bg-green-900/20 border border-green-900/50 hover:bg-green-900/40 w-1/3 transition-all"
        >
          <CheckCircle size={16} className="text-green-500" />
          <span className="text-[10px] text-green-200">Crushed It</span>
        </button>
      </div>
    </div>
  );
};
