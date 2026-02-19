'use client';

import { useState } from 'react';
import { ChevronDown, ChevronUp, Crosshair, Info, Link as LinkIcon, Sword, X, Zap } from 'lucide-react';
import type { ParsedUnit, FactionTheme } from '@/types/roster';
import type { WahapediaDatasheet } from '@/types/wahapedia';
import { useTooltip } from '@/context/TooltipContext';
import { StatBlock } from '@/components/StatBlock';
import { WeaponTable } from '@/components/WeaponTable';
import { AbilitySection } from '@/components/AbilitySection';
import { WoundTracker } from '@/components/WoundTracker';
import { KeywordChip } from '@/components/KeywordChip';

// ─── Wahapedia sub-components ────────────────────────────────────────────────

function WahapediaStatBlock({ ds, theme }: { ds: WahapediaDatasheet; theme: FactionTheme }) {
  return (
    <div className="mb-4 overflow-x-auto">
      <table className="w-full text-center text-xs sm:text-sm border-collapse">
        <thead>
          <tr className={`${theme.secondary} text-white`}>
            {ds.models.length > 1 && <th className="px-2 py-1.5 text-left font-bold uppercase text-[10px]">Model</th>}
            <th className="px-2 py-1.5 font-bold uppercase text-[10px]">M</th>
            <th className="px-2 py-1.5 font-bold uppercase text-[10px]">T</th>
            <th className="px-2 py-1.5 font-bold uppercase text-[10px]">SV</th>
            <th className={`px-2 py-1.5 font-bold uppercase text-[10px] ${theme.accent}`}>INV</th>
            <th className="px-2 py-1.5 font-bold uppercase text-[10px]">W</th>
            <th className="px-2 py-1.5 font-bold uppercase text-[10px]">LD</th>
            <th className="px-2 py-1.5 font-bold uppercase text-[10px]">OC</th>
          </tr>
        </thead>
        <tbody>
          {ds.models.map((m, i) => (
            <tr key={i} className="border-b border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900">
              {ds.models.length > 1 && (
                <td className="px-2 py-1.5 text-left font-medium text-slate-700 dark:text-slate-300 text-xs whitespace-nowrap">{m.name}</td>
              )}
              <td className="px-2 py-1.5 font-mono font-bold text-slate-700 dark:text-slate-200">{m.m}</td>
              <td className="px-2 py-1.5 font-mono font-bold text-slate-700 dark:text-slate-200">{m.t}</td>
              <td className="px-2 py-1.5 font-mono font-bold text-slate-700 dark:text-slate-200">{m.sv}</td>
              <td className={`px-2 py-1.5 font-mono font-bold ${m.invSv ? theme.accent : 'text-slate-300 dark:text-slate-600'}`}>
                {m.invSv ?? '–'}
              </td>
              <td className="px-2 py-1.5 font-mono font-bold text-slate-700 dark:text-slate-200">{m.w}</td>
              <td className="px-2 py-1.5 font-mono font-bold text-slate-700 dark:text-slate-200">{m.ld}</td>
              <td className="px-2 py-1.5 font-mono font-bold text-slate-700 dark:text-slate-200">{m.oc}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function DamageChip({ damagedW, description }: { damagedW: string; description: string }) {
  const { showTooltip } = useTooltip();
  return (
    <button
      onClick={e => {
        e.stopPropagation();
        showTooltip(description, `Damaged (${damagedW})`, e.currentTarget.getBoundingClientRect());
      }}
      className="text-xs px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-700/50 hover:bg-amber-200 dark:hover:bg-amber-800/40 transition-colors cursor-pointer select-none"
    >
      ⚠ Damaged ({damagedW})
    </button>
  );
}

function UnitInfoToggle({ ds }: { ds: WahapediaDatasheet }) {
  const [open, setOpen] = useState(false);
  const hasExtra = ds.composition.length > 0 || ds.points.length > 0 || ds.leaderFooter || ds.transport || ds.loadout;
  if (!hasExtra) return null;

  return (
    <div className="mt-2">
      <button
        onClick={e => { e.stopPropagation(); setOpen(v => !v); }}
        className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors select-none"
      >
        <Info size={11} />
        {open ? 'Hide details' : 'Composition / Transport / Leader'}
        {open ? <ChevronUp size={10} /> : <ChevronDown size={10} />}
      </button>

      {open && (
        <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-600 dark:text-slate-400 border-t border-slate-100 dark:border-slate-800 pt-2">
          {ds.composition.length > 0 && (
            <div>
              <span className="font-bold uppercase text-[10px] text-slate-400 block mb-0.5">Composition</span>
              {ds.composition.map((c, i) => <div key={i}>{c}</div>)}
            </div>
          )}
          {ds.points.length > 0 && (
            <div>
              <span className="font-bold uppercase text-[10px] text-slate-400 block mb-0.5">Points</span>
              {ds.points.map((p, i) => <div key={i}>{p.models} → {p.cost} pts</div>)}
            </div>
          )}
          {ds.transport && (
            <div className="sm:col-span-2">
              <span className="font-bold uppercase text-[10px] text-slate-400 block mb-0.5">Transport</span>
              <div>{ds.transport}</div>
            </div>
          )}
          {ds.loadout && (
            <div className="sm:col-span-2">
              <span className="font-bold uppercase text-[10px] text-slate-400 block mb-0.5">Loadout</span>
              <div>{ds.loadout}</div>
            </div>
          )}
          {ds.leaderFooter && (
            <div className="sm:col-span-2">
              <span className="font-bold uppercase text-[10px] text-slate-400 block mb-0.5">Leader</span>
              <div className="leading-relaxed">{ds.leaderFooter}</div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function WahapediaAbilityChips({ abilities }: { abilities: { name: string; description: string }[] }) {
  const { showTooltip } = useTooltip();
  if (abilities.length === 0) return null;
  return (
    <div className="mb-3">
      <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">Abilities</div>
      <div className="flex flex-wrap gap-1.5">
        {abilities.map((a, i) => (
          <button
            key={i}
            onClick={e => {
              e.stopPropagation();
              showTooltip(a.description, a.name, e.currentTarget.getBoundingClientRect());
            }}
            className="text-xs px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors cursor-pointer select-none"
          >
            {a.name}
          </button>
        ))}
      </div>
    </div>
  );
}

// ─── Main UnitCard ────────────────────────────────────────────────────────────

interface Props {
  unit: ParsedUnit;
  rules: Record<string, string>;
  theme: FactionTheme;
  wahapedia?: WahapediaDatasheet | null;
  attachableUnits?: ParsedUnit[];
  attachedUnits?: ParsedUnit[];
  onAttach?: (leaderId: string, targetId: string) => void;
  onDetach?: (leaderId: string) => void;
}

export function UnitCard({ unit, rules, theme, wahapedia, attachableUnits, attachedUnits, onAttach, onDetach }: Props) {
  const [isOpen, setIsOpen] = useState(true);
  const [showAttachMenu, setShowAttachMenu] = useState(false);

  const useWahapediaStats = !!wahapedia?.models.length;
  const wahapediaAbilities = wahapedia?.abilities ?? [];

  return (
    <div id={`unit-${unit.id}`} className={`bg-white dark:bg-slate-900 rounded-xl shadow-lg border overflow-hidden break-inside-avoid mb-6 ${theme.border} border-opacity-50`}>
      {/* Card header */}
      <div
        className={`${theme.secondary} text-white p-3 flex justify-between items-center cursor-pointer select-none touch-manipulation`}
        onClick={() => setIsOpen(o => !o)}
      >
        <div className="flex items-center gap-3 overflow-hidden">
          <div className={`${theme.primary} ${theme.icon} font-bold w-10 h-10 sm:w-8 sm:h-8 flex items-center justify-center rounded-full text-base sm:text-sm shrink-0 shadow-sm border border-white/20`}>
            {unit.name.charAt(0)}
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-bold text-base sm:text-lg leading-tight truncate pr-1">
                {unit.customName || unit.name}
              </h3>
              {wahapedia?.role && (
                <span className="text-[10px] font-bold uppercase tracking-wider bg-white/15 px-1.5 py-0.5 rounded shrink-0">
                  {wahapedia.role}
                </span>
              )}
            </div>
            <div className="text-xs opacity-70 font-mono truncate">
              {unit.keywords.slice(0, 4).join(' • ')}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <div className="hidden sm:block">
            <WoundTracker maxWounds={unit.maxWounds} />
          </div>
          <span className={`font-mono font-bold ${theme.accent} text-sm sm:text-base`}>{unit.cost} pts</span>

          {/* Attach menu */}
          {unit.isCharacter && attachableUnits && (
            <div className="relative" onClick={e => e.stopPropagation()}>
              <button
                onClick={() => setShowAttachMenu(v => !v)}
                className="p-2 sm:p-1.5 hover:bg-white/10 rounded text-white/80 hover:text-white transition touch-manipulation"
                title="Einheit anschließen"
              >
                <LinkIcon size={20} />
              </button>
              {showAttachMenu && (
                <div className="absolute right-0 top-full mt-2 w-64 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 rounded-lg shadow-xl border border-slate-200 dark:border-slate-700 z-50 p-2 max-h-64 overflow-y-auto">
                  <div className="text-xs font-bold uppercase text-slate-500 mb-2 px-2">Anschließen an:</div>
                  {attachableUnits.length === 0 && (
                    <div className="text-xs px-2 italic text-slate-400">Keine Einheiten verfügbar</div>
                  )}
                  {attachableUnits.map(target => (
                    <button
                      key={target.id}
                      className="w-full text-left px-3 py-3 hover:bg-slate-100 dark:hover:bg-slate-700 rounded text-sm flex justify-between touch-manipulation border-b border-slate-100 dark:border-slate-700/50 last:border-0"
                      onClick={() => { onAttach?.(unit.id, target.id); setShowAttachMenu(false); }}
                    >
                      <span className="truncate font-medium">{target.customName || target.name}</span>
                      <span className="text-xs text-slate-500">{target.cost}pts</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {isOpen ? <ChevronUp size={24} className="sm:w-5 sm:h-5" /> : <ChevronDown size={24} className="sm:w-5 sm:h-5" />}
        </div>
      </div>

      {/* Card body */}
      {isOpen && (
        <div className="p-3 sm:p-4">
          {/* Wound tracker (mobile) */}
          <div className="sm:hidden mb-4 flex justify-center">
            <WoundTracker maxWounds={unit.maxWounds} />
          </div>

          {/* Stats: Wahapedia (with InvSv) preferred, BattleScribe as fallback */}
          {useWahapediaStats
            ? <WahapediaStatBlock ds={wahapedia!} theme={theme} />
            : <StatBlock stats={unit.stats} theme={theme} />
          }

          {/* Weapons: always from BattleScribe (player's selection) */}
          <WeaponTable title="Fernkampf" weapons={unit.ranged} icon={Crosshair} rules={rules} theme={theme} />
          <WeaponTable title="Nahkampf"  weapons={unit.melee}  icon={Sword}     rules={rules} theme={theme} />

          {/* Abilities: Wahapedia preferred (chips), BattleScribe as fallback */}
          {wahapediaAbilities.length > 0
            ? <WahapediaAbilityChips abilities={wahapediaAbilities} />
            : <AbilitySection abilities={unit.abilities} />
          }

          {/* Damage indicator chip + Composition toggle */}
          {(wahapedia?.damagedW || wahapedia) && (
            <div className="mt-2 flex flex-wrap gap-1.5">
              {wahapedia?.damagedW && wahapedia.damagedDescription && (
                <DamageChip damagedW={wahapedia.damagedW} description={wahapedia.damagedDescription} />
              )}
            </div>
          )}
          {wahapedia && <UnitInfoToggle ds={wahapedia} />}

          {/* Attached leaders */}
          {attachedUnits && attachedUnits.length > 0 && (
            <div className="mt-6 border-l-4 border-slate-300 dark:border-slate-700 pl-4 ml-1">
              <h4 className="flex items-center gap-2 font-bold text-slate-600 dark:text-slate-400 uppercase text-xs mb-3">
                <LinkIcon size={14} /> Angeschlossene Anführer
              </h4>
              <div className="flex flex-col gap-4">
                {attachedUnits.map(leader => (
                  <div key={leader.id} className="bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-700 p-3 relative">
                    <button
                      onClick={() => onDetach?.(leader.id)}
                      className="absolute top-2 right-2 p-2 hover:bg-red-100 dark:hover:bg-red-900/30 text-slate-400 hover:text-red-500 rounded touch-manipulation"
                      title="Trennen"
                    >
                      <X size={18} />
                    </button>
                    <div className="flex justify-between items-start mb-2 pr-8">
                      <div className="font-bold text-base text-slate-800 dark:text-slate-200">
                        {leader.customName || leader.name}
                      </div>
                      <div className="flex items-center gap-2">
                        <WoundTracker maxWounds={leader.maxWounds} />
                        <span className="text-xs font-mono text-slate-500">{leader.cost}pts</span>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                      {leader.ranged.length > 0 && (
                        <div>
                          <div className="font-bold text-slate-500 mb-1 flex items-center gap-1">
                            <Crosshair size={10} /> Fernkampf
                          </div>
                          {leader.ranged.map((w, i) => (
                            <div key={i} className="flex justify-between border-b border-slate-200 dark:border-slate-700/50 py-1">
                              <span>{w.name}</span>
                              <span className="text-slate-500">
                                {w.characteristics.find(c => c.name === 'S')?.$text}/
                                {w.characteristics.find(c => c.name === 'AP')?.$text}/
                                {w.characteristics.find(c => c.name === 'D')?.$text}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                      {leader.abilities.length > 0 && (
                        <div>
                          <div className="font-bold text-slate-500 mb-1 flex items-center gap-1">
                            <Zap size={10} /> Buffs
                          </div>
                          <div className="flex flex-wrap gap-1">
                            {leader.abilities.map((a, i) => (
                              <span key={i} className="bg-amber-100 dark:bg-amber-900/20 text-amber-800 dark:text-amber-500 px-1.5 py-0.5 rounded border border-amber-200 dark:border-amber-800/50">
                                <KeywordChip keyword={a.name} rules={rules} />
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Keywords */}
          <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-400">
            <span className="font-bold uppercase mr-2">Keywords:</span>
            {unit.keywords.map((k, i) => (
              <span key={i} className="mr-1 after:content-[','] last:after:content-[''] inline-block leading-loose">
                <KeywordChip keyword={k} rules={rules} />
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
