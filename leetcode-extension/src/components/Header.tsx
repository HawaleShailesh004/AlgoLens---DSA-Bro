import { Terminal, Settings, Trash2 } from 'lucide-react';

export const Header = ({ title, difficulty, onSettings, onClear }: any) => (
  <div className="flex items-center justify-between p-3 bg-zinc-950/95 backdrop-blur border-b border-zinc-800 sticky top-0 z-20">
    
    {/* Left: Branding & Title */}
    <div className="flex items-center gap-3 overflow-hidden">
      <div className="bg-orange-500/10 p-2 rounded-lg border border-orange-500/20">
        <Terminal className="w-4 h-4 text-orange-500" />
      </div>
      <div className="flex flex-col min-w-0">
        <h1 className="font-bold text-zinc-100 text-xs truncate max-w-[160px]">
          {title || "No Problem Detected"}
        </h1>
        {difficulty && (
          <span className={`text-[10px] font-medium px-1.5 rounded w-fit ${
            difficulty === 'Easy' ? 'text-emerald-400 bg-emerald-400/10' :
            difficulty === 'Medium' ? 'text-amber-400 bg-amber-400/10' :
            'text-rose-400 bg-rose-400/10'
          }`}>
            {difficulty}
          </span>
        )}
      </div>
    </div>

    {/* Right: Actions */}
    <div className="flex items-center gap-1">
      <button 
        onClick={onClear}
        title="Clear Chat"
        className="p-2 hover:bg-zinc-800 rounded-md text-zinc-500 hover:text-red-400 transition-colors"
      >
        <Trash2 size={16} />
      </button>
      <button 
        onClick={onSettings} 
        className="p-2 hover:bg-zinc-800 rounded-md text-zinc-500 hover:text-zinc-300 transition-colors"
      >
        <Settings size={16} />
      </button>
    </div>
  </div>
);