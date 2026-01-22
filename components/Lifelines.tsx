
import React from 'react';

interface LifelinesProps {
  counts: {
    fiftyFifty: number;
    skip: number;
    timeFreeze: number;
    hint: number;
  };
  onUse: (type: 'fiftyFifty' | 'skip' | 'timeFreeze' | 'hint') => void;
  disabled: boolean;
}

const Lifelines: React.FC<LifelinesProps> = ({ counts, onUse, disabled }) => {
  const lifelines = [
    { id: 'fiftyFifty', icon: 'fas fa-columns', label: '50/50', color: 'text-blue-400' },
    { id: 'skip', icon: 'fas fa-forward', label: 'Skip', color: 'text-purple-400' },
    { id: 'timeFreeze', icon: 'fas fa-snowflake', label: 'Freeze', color: 'text-cyan-400' },
    { id: 'hint', icon: 'fas fa-magic', label: 'Hint', color: 'text-yellow-400' },
  ] as const;

  return (
    <div className="grid grid-cols-4 gap-3 w-full">
      {lifelines.map((ll) => (
        <button
          key={ll.id}
          disabled={disabled || counts[ll.id] <= 0}
          onClick={() => onUse(ll.id)}
          className={`glass flex flex-col items-center justify-center py-3 rounded-2xl transition-all duration-300 
            ${disabled || counts[ll.id] <= 0 ? 'opacity-30 grayscale cursor-not-allowed' : 'hover:bg-slate-700/80 hover:scale-105 active:scale-95'}`}
        >
          <i className={`${ll.icon} ${ll.color} text-xl mb-1`}></i>
          <span className="text-[10px] font-bold uppercase text-slate-400">{ll.label}</span>
          <span className="text-xs font-bold text-white mt-1 px-2 py-0.5 bg-slate-800 rounded-full">{counts[ll.id]}</span>
        </button>
      ))}
    </div>
  );
};

export default Lifelines;
