import type { FactionTheme } from '@/types/roster';

export const FACTION_THEMES: Record<string, FactionTheme> = {
  Ultramarines:  { primary: 'bg-blue-700',    secondary: 'bg-slate-900',   accent: 'text-yellow-400', border: 'border-blue-500/50',   icon: 'text-white' },
  BlackTemplars: { primary: 'bg-slate-950',   secondary: 'bg-slate-800',   accent: 'text-slate-200',  border: 'border-slate-500/50',  icon: 'text-white' },
  ImperialFists: { primary: 'bg-yellow-600',  secondary: 'bg-yellow-950',  accent: 'text-yellow-500', border: 'border-yellow-500/50', icon: 'text-yellow-100' },
  BloodAngels:   { primary: 'bg-red-700',     secondary: 'bg-red-950',     accent: 'text-yellow-400', border: 'border-red-600/50',    icon: 'text-yellow-100' },
  Necrons:       { primary: 'bg-green-600',   secondary: 'bg-green-900',   accent: 'text-green-400',  border: 'border-green-500/50',  icon: 'text-green-900' },
  Tyranids:      { primary: 'bg-purple-700',  secondary: 'bg-purple-950',  accent: 'text-pink-300',   border: 'border-purple-500/50', icon: 'text-purple-100' },
  Chaos:         { primary: 'bg-red-900',     secondary: 'bg-slate-900',   accent: 'text-red-400',    border: 'border-red-600/50',    icon: 'text-red-100' },
  Aeldari:       { primary: 'bg-teal-600',    secondary: 'bg-slate-900',   accent: 'text-teal-200',   border: 'border-teal-500/50',   icon: 'text-teal-100' },
  Tau:           { primary: 'bg-orange-600',  secondary: 'bg-slate-800',   accent: 'text-orange-200', border: 'border-orange-500/50', icon: 'text-white' },
  Orks:          { primary: 'bg-emerald-700', secondary: 'bg-slate-900',   accent: 'text-yellow-400', border: 'border-emerald-600/50',icon: 'text-emerald-100' },
  Custodes:      { primary: 'bg-yellow-600',  secondary: 'bg-yellow-950',  accent: 'text-yellow-200', border: 'border-yellow-500/50', icon: 'text-yellow-100' },
  Default:       { primary: 'bg-slate-800',   secondary: 'bg-slate-950',   accent: 'text-amber-400',  border: 'border-amber-500/50',  icon: 'text-slate-900' },
};

export function getTheme(catalogueName?: string): FactionTheme {
  if (!catalogueName) return FACTION_THEMES.Default;
  const n = catalogueName.toLowerCase();

  if (n.includes('ultramarine'))                               return FACTION_THEMES.Ultramarines;
  if (n.includes('black templar'))                             return FACTION_THEMES.BlackTemplars;
  if (n.includes('imperial fist'))                             return FACTION_THEMES.ImperialFists;
  if (n.includes('blood angel') || n.includes('flesh tearer')) return FACTION_THEMES.BloodAngels;
  if (n.includes('death guard'))                               return FACTION_THEMES.Necrons;
  if (n.includes('world eater'))                               return FACTION_THEMES.Chaos;
  if (n.includes('necron'))                                    return FACTION_THEMES.Necrons;
  if (n.includes('tyranid'))                                   return FACTION_THEMES.Tyranids;
  if (n.includes('chaos') || n.includes('thousand sons'))      return FACTION_THEMES.Chaos;
  if (n.includes('aeldari') || n.includes('eldar'))            return FACTION_THEMES.Aeldari;
  if (n.includes('tau') || n.includes("t'au"))                 return FACTION_THEMES.Tau;
  if (n.includes('ork'))                                       return FACTION_THEMES.Orks;
  if (n.includes('custodes'))                                  return FACTION_THEMES.Custodes;

  return FACTION_THEMES.Default;
}
