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
  const statHeaders = headers.filter(h => h !== 'Keywords' && h !== 'Fähigkeiten');

  return (
    <div className="overflow-x-auto -mx-1">
      <table className="min-w-full text-xs text-left border-collapse">
        <thead>
          <tr className="border-b-2 border-slate-200 dark:border-slate-700">
            <th className="py-1 px-1 font-bold text-slate-500 uppercase text-[10px] tracking-wide whitespace-nowrap">{title}</th>
            {statHeaders.map(h => (
              <th key={h} className="py-1 px-2 font-semibold text-slate-400 text-[10px] text-center uppercase whitespace-nowrap">{h}</th>
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
                if (char.name === 'Keywords' || char.name === 'Fähigkeiten') {
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

const ABBREV: Record<string, string> = {
  Range: 'RNG', Attacks: 'A', 'Ballistic Skill': 'BS', 'Weapon Skill': 'WS',
  Strength: 'S', 'Armour Penetration': 'AP', Damage: 'D',
  Keywords: 'Abilities', Fähigkeiten: 'Fähigk.',
};

function FullWeaponTable({ title, weapons, icon: Icon, rules, theme }: Omit<Props, 'compact'>) {
  const headers = weapons[0].characteristics.map(c => c.name);

  return (
    <div className="mb-4">
      <h4 className="flex items-center gap-2 font-bold text-slate-700 dark:text-slate-300 uppercase text-xs tracking-widest mb-2 pb-1.5 border-b border-slate-200 dark:border-slate-700">
        <Icon size={14} /> {title}
      </h4>
      <div className="overflow-x-auto rounded-lg border border-slate-200 dark:border-slate-700">
        <table className="min-w-full text-xs sm:text-sm text-left border-collapse">
          <thead>
            <tr className={`${theme.secondary} text-white uppercase tracking-wide`}>
              <th className="px-2 sm:px-3 py-2 font-semibold whitespace-nowrap text-[10px] sm:text-xs">Waffe</th>
              {headers.map(h => (
                <th key={h} className="px-1 sm:px-3 py-2 font-semibold whitespace-nowrap text-center last:text-left text-[10px] sm:text-xs">
                  <span className="sm:hidden">{ABBREV[h] ?? h}</span>
                  <span className="hidden sm:inline">{h}</span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {weapons.map((w, idx) => (
              <tr
                key={idx}
                className="border-b border-slate-100 dark:border-slate-800 last:border-0 even:bg-slate-50/60 dark:even:bg-slate-800/20 hover:bg-slate-100 dark:hover:bg-slate-800/40 transition-colors"
              >
                <td className="px-2 sm:px-3 py-1.5 sm:py-2 font-semibold text-slate-900 dark:text-slate-100 whitespace-nowrap text-[11px] sm:text-sm">{w.name}</td>
                {w.characteristics.map((char, cIdx) => {
                  const isKeyword = char.name === 'Keywords' || char.name === 'Fähigkeiten';
                  return (
                    <td
                      key={cIdx}
                      className={`px-1 sm:px-3 py-1.5 sm:py-2 text-slate-600 dark:text-slate-300 text-[11px] sm:text-sm ${isKeyword ? 'min-w-[100px] sm:min-w-[140px]' : 'text-center whitespace-nowrap tabular-nums'}`}
                    >
                      {cellContent(char.name, char.$text, rules)}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
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
