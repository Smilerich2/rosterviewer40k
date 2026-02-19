'use client';

import { ChevronsLeft, ChevronsRight, Search, X } from 'lucide-react';
import type { ParsedUnit, FactionTheme } from '@/types/roster';

interface Props {
  units: ParsedUnit[];
  theme: FactionTheme;
  searchQuery: string;
  onSearchChange: (v: string) => void;
  activeUnitId: string | null;
  totalPoints: number;
  isOpen: boolean;
  onClose: () => void;
  collapsed: boolean;
  onToggleCollapse: () => void;
}

function scrollToUnit(id: string, onClose: () => void) {
  const el = document.getElementById(`unit-${id}`);
  if (!el) return;
  const y = el.getBoundingClientRect().top + window.scrollY - 16;
  window.scrollTo({ top: y, behavior: 'smooth' });
  onClose();
}

export function NavSidebar({
  units,
  theme,
  searchQuery,
  onSearchChange,
  activeUnitId,
  totalPoints,
  isOpen,
  onClose,
  collapsed,
  onToggleCollapse,
}: Props) {
  const q = searchQuery.toLowerCase().trim();
  const filtered = q
    ? units.filter(
        u =>
          (u.customName || u.name).toLowerCase().includes(q) ||
          u.keywords.some(k => k.toLowerCase().includes(q)),
      )
    : units;

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-30 md:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar panel */}
      <aside
        className={[
          'fixed top-0 left-0 h-full z-40 flex flex-col',
          'bg-white dark:bg-slate-900',
          'border-r border-slate-200 dark:border-slate-800',
          'shadow-xl md:shadow-sm',
          // Width transitions between expanded and collapsed
          'transition-[width,transform] duration-300 ease-in-out overflow-hidden',
          collapsed ? 'w-12' : 'w-64',
          // Mobile: slide in/out
          isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0',
        ].join(' ')}
      >
        {/* ── Header ──────────────────────────────────────────────────────── */}
        <div
          className={`${theme.secondary} px-2 py-3 flex items-center shrink-0 overflow-hidden ${
            collapsed ? 'justify-center' : 'justify-between px-4'
          }`}
        >
          {!collapsed && (
            <span className="text-white font-bold text-xs uppercase tracking-widest whitespace-nowrap">
              Einheiten
            </span>
          )}
          {collapsed && (
            // Small faction dot when collapsed
            <span className={`w-4 h-4 rounded-full ${theme.primary} border-2 border-white/30`} />
          )}
          <button
            onClick={onClose}
            className="md:hidden text-white/70 hover:text-white p-1 rounded transition shrink-0"
            aria-label="Sidebar schließen"
          >
            <X size={18} />
          </button>
        </div>

        {/* ── Search (hidden when collapsed) ──────────────────────────────── */}
        <div
          className={[
            'border-b border-slate-200 dark:border-slate-800 shrink-0 overflow-hidden',
            'transition-[max-height,opacity,padding] duration-300',
            collapsed ? 'max-h-0 opacity-0 py-0' : 'max-h-20 opacity-100 px-3 py-2.5',
          ].join(' ')}
        >
          <div className="relative">
            <Search
              size={13}
              className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
            />
            <input
              type="text"
              value={searchQuery}
              onChange={e => onSearchChange(e.target.value)}
              placeholder="Name oder Keyword…"
              className="w-full pl-7 pr-7 py-1.5 text-xs rounded-md bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-400/50 transition"
            />
            {searchQuery && (
              <button
                onClick={() => onSearchChange('')}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition"
                aria-label="Suche leeren"
              >
                <X size={12} />
              </button>
            )}
          </div>
        </div>

        {/* ── Unit list ────────────────────────────────────────────────────── */}
        <nav className="flex-1 overflow-y-auto py-1">
          {!collapsed && filtered.length === 0 && (
            <p className="px-4 py-8 text-center text-xs text-slate-400 italic">
              Keine Einheiten gefunden
            </p>
          )}

          {filtered.map(unit => {
            const isActive = unit.id === activeUnitId;
            const name = unit.customName || unit.name;

            if (collapsed) {
              // ── Collapsed: icon-only button with native tooltip ──
              return (
                <button
                  key={unit.id}
                  onClick={() => scrollToUnit(unit.id, onClose)}
                  title={`${name} · ${unit.cost}pts`}
                  className="w-full py-1.5 flex justify-center transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/60"
                >
                  <span
                    className={[
                      'w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold transition-all',
                      isActive
                        ? `${theme.primary} text-white shadow-sm ring-2 ring-offset-1 ring-offset-white dark:ring-offset-slate-900 ${theme.border.replace('border-', 'ring-')}`
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700',
                    ].join(' ')}
                  >
                    {name.charAt(0).toUpperCase()}
                  </span>
                </button>
              );
            }

            // ── Expanded: full row ──
            return (
              <button
                key={unit.id}
                onClick={() => scrollToUnit(unit.id, onClose)}
                className={[
                  'w-full text-left px-3 py-2 flex items-center gap-2',
                  'border-l-[3px] transition-all',
                  'hover:bg-slate-50 dark:hover:bg-slate-800/60',
                  isActive
                    ? `${theme.border} bg-slate-50 dark:bg-slate-800/60`
                    : 'border-transparent',
                ].join(' ')}
              >
                <span
                  className={`w-2 h-2 rounded-full shrink-0 ${
                    isActive ? theme.primary : 'bg-slate-300 dark:bg-slate-600'
                  }`}
                />
                <span className="flex-1 min-w-0">
                  <span
                    className={`block text-sm truncate ${
                      isActive
                        ? 'font-bold text-slate-900 dark:text-white'
                        : 'font-medium text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    {name}
                  </span>
                  <span className="block text-[10px] text-slate-400 truncate uppercase tracking-wide">
                    {unit.keywords.slice(0, 3).join(' · ')}
                  </span>
                </span>
                <span
                  className={`text-[11px] font-mono shrink-0 tabular-nums ${
                    isActive ? theme.accent : 'text-slate-400'
                  }`}
                >
                  {unit.cost}
                </span>
              </button>
            );
          })}
        </nav>

        {/* ── Footer: stats + collapse toggle ─────────────────────────────── */}
        <div
          className={[
            'border-t border-slate-200 dark:border-slate-800 shrink-0',
            'bg-slate-50 dark:bg-slate-950/50',
            collapsed ? 'flex justify-center py-3' : 'px-4 py-3',
          ].join(' ')}
        >
          {collapsed ? (
            // Only the expand button when collapsed
            <button
              onClick={onToggleCollapse}
              title="Seitenleiste erweitern"
              className="flex items-center justify-center w-8 h-8 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 transition"
            >
              <ChevronsRight size={16} />
            </button>
          ) : (
            <div className="flex justify-between items-center">
              <span className="text-[10px] uppercase tracking-widest text-slate-400">
                {filtered.length === units.length
                  ? `${units.length} Einheiten`
                  : `${filtered.length} / ${units.length}`}
              </span>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold text-slate-600 dark:text-slate-300 tabular-nums">
                  {totalPoints} pts
                </span>
                {/* Collapse button — desktop only */}
                <button
                  onClick={onToggleCollapse}
                  title="Seitenleiste einklappen"
                  className="hidden md:flex items-center justify-center w-6 h-6 rounded text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 transition"
                >
                  <ChevronsLeft size={14} />
                </button>
              </div>
            </div>
          )}
        </div>
      </aside>
    </>
  );
}
