import type { Profile, FactionTheme } from '@/types/roster';

interface Props {
  stats: Profile[];
  theme: FactionTheme;
}

export function StatBlock({ stats, theme }: Props) {
  if (!stats || stats.length === 0) return null;

  return (
    <div className="flex flex-col gap-2 mb-4">
      {stats.map((stat, idx) => (
        <div key={idx}>
          {stats.length > 1 && (
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 pl-1">
              {stat.name}
            </div>
          )}
          {/* Equal-width columns filling the full container — no overflow needed */}
          <div
            className="grid w-full rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700 shadow-sm"
            style={{ gridTemplateColumns: `repeat(${stat.characteristics.length}, 1fr)` }}
          >
            {stat.characteristics.map((char, cIdx) => (
              <div
                key={cIdx}
                className="flex flex-col border-r border-white/20 last:border-r-0"
              >
                <span className={`text-white text-[10px] font-extrabold py-1 text-center uppercase tracking-wider ${theme.primary}`}>
                  {char.name}
                </span>
                <span className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 font-bold text-sm py-2 text-center tabular-nums border-t-0 border-r border-slate-100 dark:border-slate-800 last:border-r-0">
                  {char.$text}
                </span>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
