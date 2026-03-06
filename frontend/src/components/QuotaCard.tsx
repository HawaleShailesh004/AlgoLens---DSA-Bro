import { Lock, Key, ArrowUpRight } from "lucide-react";

export const QuotaCard = ({ onEnterKey }: { onEnterKey: () => void }) => (
  <div 
    className="mx-1 my-1 border rounded-[11px] p-3"
    style={{ 
      backgroundColor: 'rgba(251, 113, 133, 0.05)', 
      borderColor: 'rgba(251, 113, 133, 0.2)' 
    }}
  >
    {/* Title row */}
    <div className="flex items-center gap-2 mb-2.5">
      <div 
        className="w-[26px] h-[26px] rounded-[7px] border flex items-center justify-center shrink-0"
        style={{ 
          backgroundColor: 'rgba(251, 113, 133, 0.1)', 
          borderColor: 'rgba(251, 113, 133, 0.2)' 
        }}
      >
        <Lock size={12} style={{ color: 'var(--red)' }} />
      </div>
      <span className="text-[11px] font-black uppercase tracking-[.1em]" style={{ color: 'var(--red)' }}>
        Community Limit Reached
      </span>
    </div>

    {/* Body */}
    <p className="text-[12px] leading-[1.65] mb-3" style={{ color: 'var(--text-2)' }}>
      The shared pool is exhausted. Add your own{" "}
      <span className="font-semibold" style={{ color: 'var(--text)' }}>free Groq key</span> to
      keep going — takes 30 seconds.
    </p>

    {/* CTA */}
    <button
      onClick={onEnterKey}
      className="w-full flex items-center justify-center gap-2 py-[9px] rounded-[8px] text-[12px] font-bold transition-all active:scale-[0.99] border"
      style={{
        backgroundColor: 'var(--green)',
        color: '#000000',
        borderColor: 'var(--green)',
        boxShadow: 'var(--shadow-green)',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.backgroundColor = 'var(--green-hover)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.backgroundColor = 'var(--green)';
      }}
    >
      <Key size={12} />
      Add Your Free Groq Key
    </button>

    {/* Secondary link */}
    <a
      href="https://console.groq.com/keys"
      target="_blank"
      rel="noreferrer"
      className="mt-2 flex items-center justify-center gap-1 text-[10px] transition-colors"
      style={{ color: 'var(--text-2)' }}
      onMouseEnter={(e) => {
        e.currentTarget.style.color = 'var(--text)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.color = 'var(--text-2)';
      }}
    >
      Get a key at console.groq.com
      <ArrowUpRight size={9} />
    </a>
  </div>
);