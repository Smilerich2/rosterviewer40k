import { Crosshair, Sword, Link as LinkIcon } from 'lucide-react';
import type { ParsedUnit, FactionTheme } from '@/types/roster';
import { CompactStats } from '@/components/CompactStats';
import { WeaponTable } from '@/components/WeaponTable';
import { KeywordChip } from '@/components/KeywordChip';

interface Props {
  unit: ParsedUnit;
  rules: Record<string, string>;
  theme: FactionTheme;
  attachedUnits?: ParsedUnit[];
}

export function CompactRow({ unit, rules, theme, attachedUnits }: Props) {
  return (
    <div id={`unit-${unit.id}`} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-sm break-inside-avoid shadow-sm mb-3 rounded-xl overflow-hidden">

      {/* ── Header: name + pts ─────────────────────────────────────────────── */}
      <div className={`${theme.secondary} text-white px-4 py-2.5 flex items-center justify-between gap-3`}>
        <div className="flex items-center gap-3 min-w-0">
          <div className={`${theme.primary} font-black w-7 h-7 flex items-center justify-center rounded-full text-xs shrink-0 border border-white/20 shadow`}>
            {unit.name.charAt(0)}
          </div>
          <div className="min-w-0">
            <div className="font-bold text-sm leading-tight truncate">
              {unit.customName || unit.name}
            </div>
            {attachedUnits && attachedUnits.length > 0 && (
              <div className="flex items-center gap-1 text-[10px] text-white/60 mt-0.5">
                <LinkIcon size={9} />
                {attachedUnits.map(l => l.customName || l.name).join(' + ')}
              </div>
            )}
          </div>
        </div>
        <span className={`font-mono font-bold text-sm shrink-0 ${theme.accent}`}>
          {unit.cost} pts
        </span>
      </div>

      {/* ── Stats: full width ──────────────────────────────────────────────── */}
      <div className="px-3 pt-3 pb-1">
        <CompactStats stats={unit.stats} theme={theme} />
      </div>

      {/* ── Keywords ──────────────────────────────────────────────────────── */}
      <div className="px-3 py-1.5 flex flex-wrap gap-x-2 gap-y-0.5 text-[10px] text-slate-400 uppercase tracking-wide border-b border-slate-100 dark:border-slate-800">
        {unit.keywords.slice(0, 6).map((k, i) => (
          <span key={i}>
            <KeywordChip keyword={k} rules={rules} />
          </span>
        ))}
      </div>

      {/* ── Weapons: side by side, each in its own scroll container ───────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-slate-100 dark:divide-slate-800">
        <div className="p-3">
          {unit.ranged.length > 0
            ? <WeaponTable title="Fernkampf" weapons={unit.ranged} icon={Crosshair} compact rules={rules} theme={theme} />
            : <p className="text-xs text-slate-300 dark:text-slate-600 italic py-1">Keine Fernkampfwaffen</p>
          }
        </div>
        <div className="p-3">
          {unit.melee.length > 0
            ? <WeaponTable title="Nahkampf" weapons={unit.melee} icon={Sword} compact rules={rules} theme={theme} />
            : <p className="text-xs text-slate-300 dark:text-slate-600 italic py-1">Keine Nahkampfwaffen</p>
          }
        </div>
      </div>

      {/* ── Abilities footer ───────────────────────────────────────────────── */}
      {unit.abilities.length > 0 && (
        <div className="bg-slate-50 dark:bg-slate-950/40 px-3 py-2 text-xs border-t border-slate-100 dark:border-slate-800 flex flex-wrap gap-x-3 gap-y-1">
          <span className="font-bold text-slate-400 uppercase text-[10px] tracking-wide self-center">Abilities:</span>
          {unit.abilities.map((a, i) => (
            <span key={i} className="text-slate-600 dark:text-slate-400">
              <KeywordChip keyword={a.name} rules={rules} />
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
