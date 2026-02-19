'use client';

import { useState, useMemo, useEffect } from 'react';
import { Grid, LayoutList, Menu, Upload } from 'lucide-react';
import type { ParsedRoster, ParsedUnit, ViewMode } from '@/types/roster';
import type { WahapediaFaction, WahapediaLookup } from '@/types/wahapedia';
import { FACTION_THEMES, getTheme } from '@/data/themes';
import { parseRoster } from '@/lib/parser';
import { loadWahapediaFaction, buildLookup, lookupUnit, lookupDetachment } from '@/lib/wahapediaLoader';
import { TooltipManager } from '@/context/TooltipContext';
import { UnitCard } from '@/components/UnitCard';
import { CompactRow } from '@/components/CompactRow';
import { NavSidebar } from '@/components/NavSidebar';
import { DetachmentPanel } from '@/components/DetachmentPanel';
import { LandingHero } from '@/components/LandingHero';

// ─── Helpers ──────────────────────────────────────────────────────────────────

type Attachments = Record<string, string>;

function buildDisplayUnits(units: ParsedUnit[], attachments: Attachments): ParsedUnit[] {
  const attached = new Set(Object.keys(attachments));
  return units
    .filter(u => !attached.has(u.id))
    .map(unit => ({
      ...unit,
      attachedLeaders: units.filter(l => attachments[l.id] === unit.id),
    }));
}

function buildAttachableTargets(units: ParsedUnit[]): ParsedUnit[] {
  return units.filter(
    u => !u.isCharacter && (!u.keywords.includes('Vehicle') || u.keywords.includes('Infantry')),
  );
}

// ─── View toggle button ───────────────────────────────────────────────────────

function ViewButton({
  active, onClick, title, children, accent,
}: {
  active: boolean; onClick: () => void; title: string;
  children: React.ReactNode; accent: string;
}) {
  return (
    <button
      onClick={onClick}
      title={title}
      className={`h-full px-3 rounded flex items-center gap-2 text-sm font-bold transition ${
        active
          ? `bg-white dark:bg-slate-600 shadow ${accent}`
          : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
      }`}
    >
      {children}
    </button>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export function RosterViewer() {
  const [parsedData, setParsedData]   = useState<ParsedRoster | null>(null);
  const [error, setError]             = useState<string | null>(null);
  const [fileName, setFileName]       = useState('');
  const [viewMode, setViewMode]       = useState<ViewMode>('cards');
  const [attachments, setAttachments] = useState<Attachments>({});
  const [sidebarOpen, setSidebarOpen]           = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [searchQuery, setSearchQuery]           = useState('');
  const [activeUnitId, setActiveUnitId]         = useState<string | null>(null);
  const [wahapediaFaction, setWahapediaFaction] = useState<WahapediaFaction | null>(null);
  const [wahapediaLookup, setWahapediaLookup]   = useState<WahapediaLookup | null>(null);
  const [wahapediaLoading, setWahapediaLoading] = useState(false);

  const theme = useMemo(
    () => parsedData ? getTheme(parsedData.catalogueName) : FACTION_THEMES.Default,
    [parsedData],
  );

  const displayUnits = useMemo(
    () => parsedData ? buildDisplayUnits(parsedData.units, attachments) : [],
    [parsedData, attachments],
  );

  const attachableTargets = useMemo(
    () => parsedData ? buildAttachableTargets(parsedData.units) : [],
    [parsedData],
  );

  const wahapediaDetachment = useMemo(() => {
    if (!wahapediaFaction || !parsedData?.detachmentName) return null;
    return lookupDetachment(wahapediaFaction, parsedData.detachmentName);
  }, [wahapediaFaction, parsedData]);

  // ── Active-unit tracking via IntersectionObserver ────────────────────────────

  useEffect(() => {
    if (!parsedData || displayUnits.length === 0) return;

    const intersecting = new Set<string>();

    const observer = new IntersectionObserver(
      entries => {
        entries.forEach(e => {
          const id = e.target.id.replace('unit-', '');
          if (e.isIntersecting) intersecting.add(id);
          else intersecting.delete(id);
        });
        const topmost = displayUnits.find(u => intersecting.has(u.id));
        if (topmost) setActiveUnitId(topmost.id);
      },
      { threshold: 0.15 },
    );

    displayUnits.forEach(u => {
      const el = document.getElementById(`unit-${u.id}`);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [displayUnits, parsedData]);

  // ── File handling ─────────────────────────────────────────────────────────────

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFileName(file.name);

    const reader = new FileReader();
    reader.onload = ev => {
      try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const json = JSON.parse(ev.target!.result as string) as any;
        const data = parseRoster(json);
        if (data) {
          setParsedData(data);
          setError(null);
          setAttachments({});
          setSearchQuery('');
          setActiveUnitId(null);
          setWahapediaFaction(null);
          setWahapediaLookup(null);
          setWahapediaLoading(true);
          loadWahapediaFaction(data.catalogueName).then(faction => {
            if (faction) {
              setWahapediaFaction(faction);
              setWahapediaLookup(buildLookup(faction));
            }
            setWahapediaLoading(false);
          });
        } else {
          setError('Ungültiges Roster-Format. Bitte lade eine gültige JSON Datei (BattleScribe/NewRecruit) hoch.');
        }
      } catch {
        setError('Fehler beim Lesen der Datei. Ist es valides JSON?');
      }
    };
    reader.readAsText(file);
  };

  // ── Attachment handlers ───────────────────────────────────────────────────────

  const handleAttach = (leaderId: string, targetId: string) =>
    setAttachments(prev => ({ ...prev, [leaderId]: targetId }));

  const handleDetach = (leaderId: string) =>
    setAttachments(prev => { const next = { ...prev }; delete next[leaderId]; return next; });

  // ── Render ────────────────────────────────────────────────────────────────────

  // Landing page when no roster loaded
  if (!parsedData) {
    return (
      <TooltipManager>
        <LandingHero onFileUpload={handleFileUpload} error={error} />
      </TooltipManager>
    );
  }

  return (
    <TooltipManager>
      {/* Sidebar */}
      <NavSidebar
        units={displayUnits}
        theme={theme}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        activeUnitId={activeUnitId}
        totalPoints={parsedData.totalPoints}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        collapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(v => !v)}
      />

      {/* Main content */}
      <div
        className={[
          'min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100',
          'p-3 sm:p-5 md:p-8 font-sans transition-[padding] duration-300',
          sidebarCollapsed
            ? 'md:pl-[calc(48px+2rem)]'
            : 'md:pl-[calc(256px+2rem)]',
        ].join(' ')}
      >
        {/* Subtle faction tint */}
        <div className={`fixed inset-0 -z-10 ${theme.primary} opacity-[0.03] pointer-events-none`} />

        {/* ── Top bar ───────────────────────────────────────────────────────── */}
        <div className="max-w-5xl mx-auto mb-6 print:hidden">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            {/* Left: mobile menu + title */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => setSidebarOpen(true)}
                className={`md:hidden flex items-center justify-center w-10 h-10 rounded-lg ${theme.primary} text-white shadow transition hover:opacity-90`}
                aria-label="Navigation öffnen"
              >
                <Menu size={20} />
              </button>
              <div>
                <h1 className="font-cinzel text-xl font-black tracking-widest text-slate-800 dark:text-white uppercase">
                  Tactical <span className={theme.accent}>Viewer</span>
                </h1>
                <p className="text-slate-400 text-xs">Warhammer 40,000</p>
              </div>
            </div>

            {/* Right: controls */}
            <div className="flex flex-wrap items-center gap-2">
              <label
                className={`flex items-center gap-2 px-4 py-2 ${theme.primary} hover:opacity-90 text-white rounded-lg cursor-pointer transition shadow min-h-[42px]`}
              >
                <Upload size={18} />
                <span className="font-bold text-sm">JSON Upload</span>
                <input type="file" accept=".json" onChange={handleFileUpload} className="hidden" />
              </label>

              <div className="flex bg-slate-200 dark:bg-slate-800 rounded-lg p-1 border border-slate-300 dark:border-slate-700 h-[42px] items-center">
                <ViewButton active={viewMode === 'cards'} onClick={() => setViewMode('cards')} title="Kartenansicht" accent={theme.accent}>
                  <Grid size={18} />
                </ViewButton>
                <ViewButton active={viewMode === 'table'} onClick={() => setViewMode('table')} title="Listenansicht" accent={theme.accent}>
                  <LayoutList size={18} />
                </ViewButton>
              </div>
            </div>
          </div>

          {error && (
            <div className="mt-4 bg-red-50 border border-red-300 text-red-700 px-4 py-3 rounded-lg text-sm" role="alert">
              {error}
            </div>
          )}
        </div>

        {/* ── Roster content ────────────────────────────────────────────────── */}
        {parsedData && (
          <div className="max-w-5xl mx-auto pb-16">
            {/* Army banner */}
            <div className={`${theme.secondary} text-white px-5 py-4 rounded-xl shadow-md mb-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b-4 ${theme.border} print:hidden`}>
              <div>
                <h2 className="text-lg sm:text-xl font-bold uppercase truncate">{parsedData.armyName}</h2>
                <div className="text-white/50 text-xs truncate mt-0.5">{fileName}</div>
              </div>
              <div className="flex items-center gap-4 shrink-0">
                {wahapediaLoading && (
                  <span className="text-white/50 text-xs animate-pulse">Wahapedia…</span>
                )}
                {wahapediaLookup && !wahapediaLoading && (
                  <span className="text-white/40 text-xs">Wahapedia ✓</span>
                )}
                <div className={`font-mono font-bold text-2xl ${theme.accent} tabular-nums`}>
                  {parsedData.totalPoints} <span className="text-sm font-normal text-white/40 uppercase">pts</span>
                </div>
              </div>
            </div>

            {/* Detachment panel */}
            {wahapediaDetachment && parsedData.detachmentName && (
              <DetachmentPanel
                detachment={wahapediaDetachment}
                detachmentName={parsedData.detachmentName}
                theme={theme}
              />
            )}


            {/* Cards view */}
            {viewMode === 'cards' && (
              <div className="grid grid-cols-1 gap-4 print:hidden">
                {displayUnits.map(unit => (
                  <UnitCard
                    key={unit.id}
                    unit={unit}
                    rules={parsedData.rules}
                    theme={theme}
                    wahapedia={wahapediaLookup ? lookupUnit(wahapediaLookup, unit.name) : null}
                    attachableUnits={attachableTargets.filter(t => t.id !== unit.id)}
                    attachedUnits={unit.attachedLeaders}
                    onAttach={handleAttach}
                    onDetach={handleDetach}
                  />
                ))}
              </div>
            )}

            {/* Table view */}
            {viewMode === 'table' && (
              <div className="space-y-3">
                {displayUnits.map(unit => (
                  <CompactRow
                    key={unit.id}
                    unit={unit}
                    rules={parsedData.rules}
                    theme={theme}
                    attachedUnits={unit.attachedLeaders}
                  />
                ))}
              </div>
            )}

            {/* Print layout */}
            <div className="hidden print:block space-y-2">
              {displayUnits.map(unit => (
                <CompactRow key={unit.id} unit={unit} rules={parsedData.rules} theme={theme} attachedUnits={unit.attachedLeaders} />
              ))}
            </div>
          </div>
        )}
      </div>
    </TooltipManager>
  );
}
