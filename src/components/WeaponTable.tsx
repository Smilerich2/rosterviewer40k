import type { ElementType } from 'react';
import type { Profile, FactionTheme } from '@/types/roster';
import { KeywordChip } from '@/components/KeywordChip';
import { formatText } from '@/lib/utils';

interface Props {
  title: string;
  weapons: Profile[];
  icon: ElementType;
  compact?: boolean;
  rules?: Record<string, string>;
  theme: FactionTheme;
}

const STAT_ABBREV: Record<string, string> = {
  'Range': 'RNG',
  'Attacks': 'A',
  'Ballistic Skill': 'BS',
  'Weapon Skill': 'WS',
  'Strength': 'S',
  'Armour Penetration': 'AP',
  'Damage': 'D',
};

function isKeywordCol(name: string) {
  return name === 'Keywords' || name === 'Fähigkeiten';
}

function KeywordCell({ text, rules }: { text: string; rules?: Record<string, string> }) {
  const parts = text.split(',').map(p => p.trim());
  return (
    <div className="flex flex-wrap gap-1">
      {parts.map((part, i) => (
        <span key={i} className="inline-block">
          <KeywordChip keyword={part} rules={rules} />
          {i < parts.length - 1 ? ',' : ''}
        </span>
      ))}
    </div>
  );
}

function cellContent(colName: string, text: string, rules?: Record<string, string>) {
  if (!text || text === '-') return <span className="text-slate-300 dark:text-slate-600">—</span>;
  if (colName === 'Keywords' || colName === 'Fähigkeiten') {
    return <KeywordCell text={text} rules={rules} />;
  }
  return formatText(text);
}

// ─── Compact mode (used inside CompactRow) ────────────────────────────────────

function CompactWeaponTable({ title, weapons, rules }: Pick<Props, 'title' | 'weapons' | 'rules'>) {
  const headers = weapons[0].characteristics.map(c => c.name);
  const statHeaders = headers.filter(h => !isKeywordCol(h));

  return (
    <div className="overflow-x-auto -mx-1">
      <table className="min-w-full text-xs text-left border-collapse">
        <thead>
          <tr className="border-b-2 border-slate-200 dark:border-slate-700">
            <th className="py-1 px-1 font-bold text-slate-500 uppercase text-[10px] tracking-wide whitespace-nowrap">{title}</th>
            {statHeaders.map(h => (
              <th key={h} className="py-1 px-2 font-semibold text-slate-400 text-[10px] text-center uppercase whitespace-nowrap">
                {STAT_ABBREV[h] ?? h}
              </th>
            ))}
            <th className="py-1 px-1 font-semibold text-slate-400 text-[10px] uppercase">Abilities</th>
          </tr>
        </thead>
        <tbody>
          {weapons.map((w, idx) => (
            <tr key={idx} className="border-b border-slate-100 dark:border-slate-800/80 last:border-0 hover:bg-slate-50 dark:hover:bg-slate-800/30">
              <td className="py-1.5 px-1 font-semibold text-slate-800 dark:text-slate-200 whitespace-nowrap pr-3 max-w-[160px]">
                {w.name}
              </td>
              {w.characteristics.map((char, cIdx) => {
                if (isKeywordCol(char.name)) {
                  return (
                    <td key={cIdx} className="py-1.5 px-1 text-slate-500 dark:text-slate-400 min-w-[80px]">
                      {cellContent(char.name, char.$text, rules)}
                    </td>
                  );
                }
                return (
                  <td key={cIdx} className="py-1.5 px-2 text-center font-mono text-slate-700 dark:text-slate-300 whitespace-nowrap tabular-nums">
                    {char.$text || '—'}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ─── Full mode (used inside UnitCard) ─────────────────────────────────────────

function FullWeaponTable({ title, weapons, icon: Icon, rules, theme }: Omit<Props, 'compact'>) {
  return (
    <div className="mb-4">
      <h4 className="flex items-center gap-2 font-bold text-slate-700 dark:text-slate-300 uppercase text-xs tracking-widest mb-2 pb-1.5 border-b border-slate-200 dark:border-slate-700">
        <Icon size={14} /> {title}
      </h4>

      <div className="flex flex-col gap-2">
        {weapons.map((w, idx) => {
          const statChars = w.characteristics.filter(c => !isKeywordCol(c.name));
          const keywordChar = w.characteristics.find(c => isKeywordCol(c.name));

          return (
            <div key={idx} className="flex rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700 shadow-sm">
              {/* Faction-colored accent bar */}
              <div className={`w-1 shrink-0 ${theme.primary}`} />

              <div className="flex-1 min-w-0">
                {/* Weapon name */}
                <div className="bg-slate-50 dark:bg-slate-800/60 px-3 py-1.5 border-b border-slate-100 dark:border-slate-700/50">
                  <span className="font-bold text-sm text-slate-800 dark:text-slate-200">{w.name}</span>
                </div>

                {/* Stat boxes */}
                <div
                  className="bg-white dark:bg-slate-900 px-2 py-2 grid gap-1"
                  style={{ gridTemplateColumns: `repeat(${statChars.length}, 1fr)` }}
                >
                  {statChars.map(char => (
                    <div
                      key={char.name}
                      className="flex flex-col items-center rounded py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700/50"
                    >
                      <span className="text-[8px] font-bold uppercase tracking-wide text-slate-400 leading-none mb-0.5">
                        {STAT_ABBREV[char.name] ?? char.name}
                      </span>
                      <span className="font-black text-sm leading-none tabular-nums text-slate-900 dark:text-slate-100">
                        {char.$text || '–'}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Keywords / Abilities */}
                {keywordChar && keywordChar.$text && keywordChar.$text !== '-' && (
                  <div className="px-3 py-1.5 border-t border-slate-100 dark:border-slate-700/50 bg-slate-50/50 dark:bg-slate-800/30 text-xs">
                    <KeywordCell text={keywordChar.$text} rules={rules} />
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Export ───────────────────────────────────────────────────────────────────

export function WeaponTable({ compact = false, ...props }: Props) {
  if (!props.weapons || props.weapons.length === 0) return null;

  return compact
    ? <CompactWeaponTable title={props.title} weapons={props.weapons} rules={props.rules} />
    : <FullWeaponTable {...props} />;
}
