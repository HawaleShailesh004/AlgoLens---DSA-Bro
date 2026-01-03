import { Lock, Key, Zap } from "lucide-react";

export const QuotaCard = ({ onEnterKey }: { onEnterKey: () => void }) => {
  return (
    <div className="border border-red-500/30 bg-red-500/5 rounded-xl p-4 my-2">
      <div className="flex items-center gap-2 mb-2">
        <div className="p-1.5 bg-red-500/10 rounded-lg">
          <Lock size={14} className="text-red-400" />
        </div>
        <span className="text-xs font-bold text-red-200 uppercase tracking-wider">
          Limit Reached
        </span>
      </div>
      
      <p className="text-sm text-zinc-300 mb-3 leading-relaxed">
        The community pool is exhausted for now. To keep coding without limits, just add your own free API Key.
      </p>

      <button 
        onClick={onEnterKey}
        className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-500 hover:to-red-500 text-white text-xs font-bold py-2.5 rounded-lg transition-all shadow-lg shadow-orange-900/20 active:scale-[0.98]"
      >
        <Key size={14} />
        Add Free Groq Key
      </button>

      <div className="mt-2 text-center">
        <a 
          href="https://console.groq.com/keys" 
          target="_blank" 
          rel="noreferrer"
          className="text-[10px] text-zinc-500 hover:text-zinc-300 underline flex items-center justify-center gap-1"
        >
          Get a key here <Zap size={10} />
        </a>
      </div>
    </div>
  );
};