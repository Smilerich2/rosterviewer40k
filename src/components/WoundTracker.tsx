'use client';

import { useState } from 'react';
import { Skull } from 'lucide-react';

interface Props {
  maxWounds: number;
}

export function WoundTracker({ maxWounds }: Props) {
  const [wounds, setWounds] = useState(maxWounds);

  return (
    <div
      className="flex items-center gap-2 bg-slate-900 dark:bg-slate-950 rounded-lg p-1 pr-3 shadow-inner border border-slate-700"
      onClick={e => e.stopPropagation()}
    >
      <button
        className="w-8 h-8 flex items-center justify-center bg-red-600 hover:bg-red-700 active:bg-red-800 text-white rounded text-lg font-bold transition touch-manipulation"
        onClick={() => setWounds(prev => Math.max(0, prev - 1))}
      >
        −
      </button>
      <span className={`text-base sm:text-lg font-bold font-mono min-w-[24px] text-center ${wounds === 0 ? 'text-red-500' : 'text-white'}`}>
        {wounds}
      </span>
      <button
        className="w-8 h-8 flex items-center justify-center bg-green-600 hover:bg-green-700 active:bg-green-800 text-white rounded text-lg font-bold transition touch-manipulation"
        onClick={() => setWounds(prev => prev + 1)}
      >
        +
      </button>
      {wounds === 0 && <Skull className="text-red-500 ml-1" size={16} />}
    </div>
  );
}
