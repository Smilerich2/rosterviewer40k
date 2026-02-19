import type { Profile, FactionTheme } from '@/types/roster';

interface Props {
  stats: Profile[];
  theme: FactionTheme;
}

export function StatBlock({ stats, theme }: Props) {
  if (!stats || stats.length === 0) return null;

  return (
    <div className="mb-4 rounded-xl overflow-hidden flex flex-col gap-1">
      {stats.map((stat, idx) => (
        <div key={idx}>
          {stats.length > 1 && (
            <div className={`${theme.secondary} text-white/50 text-[9px] font-bold uppercase tracking-widest px-3 py-1 border-b border-white/10`}>
              {stat.name}
            </div>
          )}
          <div
            className={`${theme.secondary} px-2 py-2.5 grid gap-1`}
            style={{ gridTemplateColumns: `repeat(${stat.characteristics.length}, 1fr)` }}
          >
            {stat.characteristics.map((char, cIdx) => (
              <div
                key={cIdx}
                className="flex flex-col items-center justify-center rounded-md py-1.5 sm:py-2 bg-white dark:bg-slate-100"
              >
                <span className="text-[8px] sm:text-[9px] font-bold uppercase tracking-wide leading-none mb-0.5 text-slate-400">
                  {char.name}
                </span>
                <span className="font-black text-sm sm:text-base leading-none tabular-nums text-slate-900">
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
