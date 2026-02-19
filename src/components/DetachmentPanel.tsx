'use client';

import { useState } from 'react';
import { ChevronDown, ChevronUp, Shield, Sparkles, Swords } from 'lucide-react';
import type { WahapediaDetachment, WahapediaDetachmentStratagem } from '@/types/wahapedia';
import type { FactionTheme } from '@/types/roster';

// ─── Data helpers ─────────────────────────────────────────────────────────────

/** "Reclamation Force – Battle Tactic Stratagem" → "Battle Tactic" */
function extractType(raw: string): string {
  const parts = raw.split('–');
  return parts[parts.length - 1].trim().replace(/\s*Stratagem\s*$/i, '').trim();
}

/** "Either player's turn – Fight phase" → "Fight Phase" */
function extractPhase(when: string | null): string {
  if (!when) return 'Any';
  const parts = when.split('–');
  const phase = parts[parts.length - 1].trim();
  // Normalize "Charge or Fight phase" → "Fight Phase"
  if (/charge.*fight/i.test(phase)) return 'Fight Phase';
  if (/fight.*charge/i.test(phase)) return 'Fight Phase';
  return phase.replace(/\b\w/g, c => c.toUpperCase());
}

const PHASE_ORDER = [
  'Command Phase',
  'Movement Phase',
  'Shooting Phase',
  'Charge Phase',
  'Fight Phase',
  'Any',
];

function phaseOrder(phase: string): number {
  const idx = PHASE_ORDER.indexOf(phase);
  return idx === -1 ? PHASE_ORDER.length : idx;
}

// ─── Colour maps ──────────────────────────────────────────────────────────────

const TYPE_COLOURS: Record<string, string> = {
  'Battle Tactic':  'bg-blue-100   dark:bg-blue-900/40   text-blue-700   dark:text-blue-300',
  'Strategic Ploy': 'bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300',
  'Epic Deed':      'bg-amber-100  dark:bg-amber-900/40  text-amber-700  dark:text-amber-300',
  'Wargear':        'bg-green-100  dark:bg-green-900/40  text-green-700  dark:text-green-300',
};

const PHASE_STYLES: Record<string, { bg: string; text: string; border: string }> = {
  'Command Phase':  { bg: 'bg-slate-100  dark:bg-slate-800',  text: 'text-slate-600  dark:text-slate-300', border: 'border-slate-300 dark:border-slate-700' },
  'Movement Phase': { bg: 'bg-teal-50    dark:bg-teal-900/20', text: 'text-teal-700   dark:text-teal-300',  border: 'border-teal-200  dark:border-teal-700/50' },
  'Shooting Phase': { bg: 'bg-sky-50     dark:bg-sky-900/20',  text: 'text-sky-700    dark:text-sky-300',   border: 'border-sky-200   dark:border-sky-700/50'  },
  'Charge Phase':   { bg: 'bg-orange-50  dark:bg-orange-900/20', text: 'text-orange-700 dark:text-orange-300', border: 'border-orange-200 dark:border-orange-700/50' },
  'Fight Phase':    { bg: 'bg-red-50     dark:bg-red-900/20',  text: 'text-red-700    dark:text-red-300',   border: 'border-red-200   dark:border-red-700/50'  },
  'Any':            { bg: 'bg-violet-50  dark:bg-violet-900/20', text: 'text-violet-700 dark:text-violet-300', border: 'border-violet-200 dark:border-violet-700/50' },
};

function phaseStyle(phase: string) {
  return PHASE_STYLES[phase] ?? PHASE_STYLES['Any'];
}

function typeColour(type: string): string {
  return TYPE_COLOURS[type] ?? 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400';
}

// ─── Single stratagem row ─────────────────────────────────────────────────────

function StratagemRow({
  s, accent,
}: {
  s: WahapediaDetachmentStratagem & { _type: string };
  accent: string;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div
      className="border-b border-slate-100 dark:border-slate-800 last:border-0 cursor-pointer select-none"
      onClick={() => setOpen(v => !v)}
    >
      {/* Collapsed row */}
      <div className="flex items-center gap-3 px-3 py-2.5 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
        {/* CP cost */}
        <span className={`font-mono font-black text-base w-8 text-right shrink-0 ${accent}`}>
          {s.cost}
          <span className="text-[9px] font-normal opacity-50">CP</span>
        </span>

        {/* Name */}
        <span className="flex-1 font-bold text-sm text-slate-800 dark:text-slate-100 uppercase tracking-wide leading-tight truncate">
          {s.name}
        </span>

        {/* Type badge */}
        <span className={`hidden sm:inline text-[10px] font-bold px-1.5 py-0.5 rounded ${typeColour(s._type)} shrink-0`}>
          {s._type}
        </span>

        {open
          ? <ChevronUp size={14} className="text-slate-400 shrink-0" />
          : <ChevronDown size={14} className="text-slate-400 shrink-0" />
        }
      </div>

      {/* Expanded details */}
      {open && (
        <div className="px-4 pb-3 pt-1 space-y-2 text-xs bg-slate-50 dark:bg-slate-800/40">
          {/* Type badge (mobile) */}
          <span className={`sm:hidden inline text-[10px] font-bold px-1.5 py-0.5 rounded ${typeColour(s._type)}`}>
            {s._type}
          </span>
          {s.when && (
            <div className="text-slate-500 dark:text-slate-400 italic">{s.when}</div>
          )}
          <div className="text-slate-700 dark:text-slate-300 leading-relaxed">{s.description}</div>
        </div>
      )}
    </div>
  );
}

// ─── Phase group ──────────────────────────────────────────────────────────────

function PhaseGroup({
  phase,
  stratagems,
  accent,
}: {
  phase: string;
  stratagems: (WahapediaDetachmentStratagem & { _type: string })[];
  accent: string;
}) {
  const [open, setOpen] = useState(true);
  const style = phaseStyle(phase);

  return (
    <div className={`rounded-lg border overflow-hidden ${style.border}`}>
      {/* Phase header */}
      <button
        className={`w-full flex items-center justify-between px-3 py-2 ${style.bg} ${style.text} cursor-pointer select-none`}
        onClick={() => setOpen(v => !v)}
      >
        <span className="font-black text-xs uppercase tracking-widest">{phase}</span>
        <div className="flex items-center gap-2">
          <span className="font-mono text-xs opacity-60">{stratagems.length}</span>
          {open ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
        </div>
      </button>

      {/* Stratagem rows */}
      {open && (
        <div className="bg-white dark:bg-slate-900">
          {stratagems.map((s, i) => (
            <StratagemRow key={i} s={s} accent={accent} />
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Main panel ───────────────────────────────────────────────────────────────

interface Props {
  detachment: WahapediaDetachment;
  detachmentName: string;
  theme: FactionTheme;
}

export function DetachmentPanel({ detachment, detachmentName, theme }: Props) {
  const [open, setOpen] = useState(true);
  const [activeTab, setActiveTab] = useState<'stratagems' | 'rules' | 'enhancements'>('stratagems');

  const hasEnhancements = detachment.enhancements.length > 0;

  // Enrich each stratagem with parsed type & phase, then group by phase
  const enriched = detachment.stratagems.map(s => ({
    ...s,
    _type:  extractType(s.type),
    _phase: extractPhase(s.when),
  }));

  const grouped = enriched.reduce<Record<string, typeof enriched>>((acc, s) => {
    (acc[s._phase] ??= []).push(s);
    return acc;
  }, {});

  const phases = Object.keys(grouped).sort((a, b) => phaseOrder(a) - phaseOrder(b));

  return (
    <div className={`bg-white dark:bg-slate-900 rounded-xl shadow-md border mb-5 overflow-hidden print:hidden ${theme.border} border-opacity-40`}>
      {/* Panel header */}
      <div
        className={`${theme.secondary} text-white px-4 py-3 flex items-center justify-between cursor-pointer select-none`}
        onClick={() => setOpen(v => !v)}
      >
        <div className="flex items-center gap-2">
          <Shield size={16} className="opacity-70" />
          <span className="text-xs font-bold uppercase tracking-wider opacity-70">Detachment</span>
          <span className="font-bold text-sm sm:text-base ml-1">{detachmentName}</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-white/50 text-xs">{detachment.stratagems.length} Stratagems</span>
          {open ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
        </div>
      </div>

      {open && (
        <div className="p-3 sm:p-4">
          {/* Tabs */}
          <div className="flex gap-1 mb-4 bg-slate-100 dark:bg-slate-800 rounded-lg p-1 w-fit">
            <button
              onClick={() => setActiveTab('stratagems')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-bold transition ${
                activeTab === 'stratagems'
                  ? `bg-white dark:bg-slate-700 shadow ${theme.accent}`
                  : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
              }`}
            >
              <Swords size={13} /> Stratagems
            </button>
            <button
              onClick={() => setActiveTab('rules')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-bold transition ${
                activeTab === 'rules'
                  ? `bg-white dark:bg-slate-700 shadow ${theme.accent}`
                  : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
              }`}
            >
              <Shield size={13} /> Rules
            </button>
            {hasEnhancements && (
              <button
                onClick={() => setActiveTab('enhancements')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-bold transition ${
                  activeTab === 'enhancements'
                    ? `bg-white dark:bg-slate-700 shadow ${theme.accent}`
                    : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                }`}
              >
                <Sparkles size={13} /> Enhancements
              </button>
            )}
          </div>

          {/* Stratagems — phase-grouped */}
          {activeTab === 'stratagems' && (
            <div className="space-y-2">
              {phases.map(phase => (
                <PhaseGroup
                  key={phase}
                  phase={phase}
                  stratagems={grouped[phase]}
                  accent={theme.accent}
                />
              ))}
            </div>
          )}

          {/* Detachment rules */}
          {activeTab === 'rules' && (
            <div className="space-y-3">
              {detachment.rules.length === 0 && (
                <p className="text-sm text-slate-400 italic">Keine Detachment Rules gefunden.</p>
              )}
              {detachment.rules.map((r, i) => (
                <div key={i} className="bg-slate-50 dark:bg-slate-800/60 rounded-lg px-4 py-3">
                  <div className="font-bold text-sm text-slate-800 dark:text-slate-100 mb-1">{r.name}</div>
                  <div className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">{r.description}</div>
                </div>
              ))}
            </div>
          )}

          {/* Enhancements */}
          {activeTab === 'enhancements' && (
            <div className="space-y-3">
              {detachment.enhancements.map((e, i) => (
                <div key={i} className="bg-slate-50 dark:bg-slate-800/60 rounded-lg px-4 py-3 flex justify-between gap-4">
                  <div className="min-w-0">
                    <div className="font-bold text-sm text-slate-800 dark:text-slate-100 mb-1">{e.name}</div>
                    <div className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">{e.description}</div>
                  </div>
                  <div className={`font-mono font-bold text-sm shrink-0 ${theme.accent}`}>{e.cost} pts</div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
