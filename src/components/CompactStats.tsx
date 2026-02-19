import type { Profile, FactionTheme } from '@/types/roster';

interface Props {
  stats: Profile[];
  theme: FactionTheme;
}

export function CompactStats({ stats, theme }: Props) {
  if (!stats || stats.length === 0) return null;
  const statLine = stats[0];

  return (
    <div
      className="grid w-full border border-slate-300 dark:border-slate-600 rounded overflow-hidden"
      style={{ gridTemplateColumns: `repeat(${statLine.characteristics.length}, 1fr)` }}
    >
      {statLine.characteristics.map((char, i) => (
        <div key={i} className="flex flex-col border-r border-slate-200 dark:border-slate-700 last:border-r-0">
          <div className={`text-[10px] font-extrabold text-white uppercase py-0.5 text-center tracking-wider ${theme.secondary}`}>
            {char.name}
          </div>
          <div className="bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-bold text-sm py-1 text-center tabular-nums">
            {char.$text}
          </div>
        </div>
      ))}
    </div>
  );
}
