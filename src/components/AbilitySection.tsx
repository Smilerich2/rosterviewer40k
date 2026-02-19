'use client';

import { useTooltip } from '@/context/TooltipContext';
import type { Profile } from '@/types/roster';

interface Props {
  abilities: Profile[];
}

export function AbilitySection({ abilities }: Props) {
  const { showTooltip } = useTooltip();
  if (!abilities || abilities.length === 0) return null;

  return (
    <div className="mb-3">
      <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">Abilities</div>
      <div className="flex flex-wrap gap-1.5">
        {abilities.map((ab, idx) => {
          const desc = ab.characteristics.map(c => c.$text).filter(Boolean).join('\n\n');
          return (
            <button
              key={idx}
              onClick={e => {
                e.stopPropagation();
                showTooltip(desc, ab.name, e.currentTarget.getBoundingClientRect());
              }}
              className="text-xs px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors cursor-pointer select-none"
            >
              {ab.name}
            </button>
          );
        })}
      </div>
    </div>
  );
}
