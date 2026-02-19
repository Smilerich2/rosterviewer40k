'use client';

import { BookOpen, Database, FileJson, Upload } from 'lucide-react';

// ─── SVG decorations ──────────────────────────────────────────────────────────

function CornerBracket({ className }: { className: string }) {
  return (
    <svg width="40" height="40" viewBox="0 0 40 40" fill="none" className={className}>
      <path
        d="M2 22 L2 2 L22 2"
        stroke="#8b6914"
        strokeWidth="1.5"
        strokeLinecap="square"
        strokeDasharray="80"
        strokeDashoffset="80"
        style={{ animation: 'cornerDraw 0.8s ease forwards', animationDelay: '0.4s' }}
      />
    </svg>
  );
}

function OrnamentalDivider() {
  return (
    <div className="flex items-center gap-3 w-full max-w-sm mx-auto">
      <div className="flex-1 h-px bg-gradient-to-r from-transparent to-[#8b6914]/50" />
      <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
        <rect x="8" y="8" width="4" height="4" fill="#8b6914" transform="rotate(45 10 10)" />
        <rect x="6" y="6" width="8" height="8" stroke="#8b6914" strokeWidth="0.8" fill="none" transform="rotate(45 10 10)" />
      </svg>
      <div className="flex-1 h-px bg-gradient-to-l from-transparent to-[#8b6914]/50" />
    </div>
  );
}

function FeatureChip({ icon: Icon, label, sub }: { icon: React.ElementType; label: string; sub: string }) {
  return (
    <div className="flex flex-col items-center gap-2 text-center">
      <div className="w-10 h-10 rounded border border-[#8b6914]/30 bg-[#8b6914]/5 flex items-center justify-center">
        <Icon size={18} className="text-[#8b6914]" />
      </div>
      <div>
        <div className="text-[11px] font-bold uppercase tracking-widest text-slate-700 font-cinzel">{label}</div>
        <div className="text-[10px] text-slate-400 mt-0.5 font-crimson italic">{sub}</div>
      </div>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

interface Props {
  onFileUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  error?: string | null;
}

export function LandingHero({ onFileUpload, error }: Props) {
  return (
    <div className="relative min-h-screen bg-slate-50 flex flex-col items-center justify-center overflow-hidden px-6 py-16">

      {/* ── Subtle tactical grid ─────────────────────────────────────────── */}
      <div
        className="absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage: `
            linear-gradient(rgba(139,105,20,1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(139,105,20,1) 1px, transparent 1px)
          `,
          backgroundSize: '60px 60px',
        }}
      />

      {/* ── Warm radial center glow ───────────────────────────────────────── */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse 80% 60% at 50% 50%, rgba(255,250,240,0.9) 0%, transparent 80%)',
        }}
      />

      {/* ── Corner brackets ───────────────────────────────────────────────── */}
      <div className="absolute top-6 left-6 animate-fade-in delay-400">
        <CornerBracket className="" />
      </div>
      <div className="absolute top-6 right-6 animate-fade-in delay-400 rotate-90">
        <CornerBracket className="" />
      </div>
      <div className="absolute bottom-6 left-6 animate-fade-in delay-400 -rotate-90">
        <CornerBracket className="" />
      </div>
      <div className="absolute bottom-6 right-6 animate-fade-in delay-400 rotate-180">
        <CornerBracket className="" />
      </div>

      {/* ── Content ──────────────────────────────────────────────────────── */}
      <div className="relative z-10 flex flex-col items-center text-center max-w-2xl mx-auto w-full">

        {/* Eyebrow */}
        <div className="animate-fade-up font-cinzel text-[10px] font-bold tracking-[0.4em] text-[#8b6914]/80 uppercase mb-5">
          Warhammer 40,000
        </div>

        {/* Title */}
        <h1 className="font-cinzel animate-fade-up delay-100 leading-none mb-2">
          <span className="block text-5xl sm:text-7xl font-black text-slate-800 tracking-widest">
            TACTICAL
          </span>
          <span
            className="block text-5xl sm:text-7xl font-black tracking-widest"
            style={{ color: '#8b6914' }}
          >
            VIEWER
          </span>
        </h1>

        {/* Divider */}
        <div className="mt-5 mb-5 w-full animate-fade-up delay-200">
          <OrnamentalDivider />
        </div>

        {/* Subtitle */}
        <p className="font-crimson text-lg text-slate-500 italic animate-fade-up delay-200 max-w-md leading-relaxed mb-10">
          Lade deine Armeeliste hoch — Stats, Waffen, Abilities und Stratagems
          auf einen Blick. Für das Spiel gemacht.
        </p>

        {/* ── Upload CTA ─────────────────────────────────────────────────── */}
        <label className="animate-fade-up delay-300 cursor-pointer group relative block w-full max-w-md">
          <input type="file" accept=".json" onChange={onFileUpload} className="hidden" />

          <div className="relative border border-[#8b6914]/40 rounded-sm bg-white px-8 py-8 transition-all duration-300 shadow-sm group-hover:shadow-md group-hover:border-[#8b6914]/70 group-hover:bg-[#8b6914]/[0.02]">
            {/* Corner accents */}
            <span className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-[#8b6914] -translate-x-0.5 -translate-y-0.5" />
            <span className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-[#8b6914] translate-x-0.5 -translate-y-0.5" />
            <span className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-[#8b6914] -translate-x-0.5 translate-y-0.5" />
            <span className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-[#8b6914] translate-x-0.5 translate-y-0.5" />

            <div className="flex flex-col items-center gap-3">
              <div className="w-12 h-12 rounded-full border border-[#8b6914]/40 bg-[#8b6914]/5 flex items-center justify-center group-hover:bg-[#8b6914]/10 transition-colors">
                <Upload size={22} className="text-[#8b6914]" />
              </div>
              <div>
                <div className="font-cinzel text-sm font-bold tracking-[0.2em] text-[#8b6914] uppercase">
                  Roster Hochladen
                </div>
                <div className="text-[11px] text-slate-400 mt-1 font-crimson italic">
                  New Recruit · JSON-Format
                </div>
              </div>
            </div>
          </div>
        </label>

        {/* Error */}
        {error && (
          <div className="mt-4 w-full max-w-md bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded text-xs font-crimson animate-fade-in">
            {error}
          </div>
        )}

        {/* ── Feature row ──────────────────────────────────────────────────── */}
        <div className="mt-12 animate-fade-up delay-500 grid grid-cols-3 gap-6 sm:gap-10 w-full max-w-sm">
          <FeatureChip icon={Database}  label="Wahapedia"  sub="Stats & Special Rules" />
          <FeatureChip icon={FileJson}  label="New Recruit" sub="JSON Export" />
          <FeatureChip icon={BookOpen}  label="In-Game"    sub="Schnelle Referenz" />
        </div>

        {/* ── Credits ───────────────────────────────────────────────────────── */}
        <div className="mt-14 animate-fade-up delay-600 text-center space-y-1">
          <p className="text-[10px] text-slate-400 uppercase tracking-[0.2em]">
            Daten & Sonderregeln
          </p>
          <p className="font-crimson text-xs text-slate-400 italic">
            Stats, Abilities und Stratagems bereitgestellt durch{' '}
            <span className="text-[#8b6914] not-italic font-semibold">wahapedia.ru</span>
            {' '}— inoffiziell & ohne Gewähr.
          </p>
          <p className="font-crimson text-xs text-slate-300 italic mt-1">
            Armeelisten via{' '}
            <span className="text-slate-400 not-italic font-semibold">New Recruit</span>
            {' '}erstellen und als JSON exportieren.
          </p>
        </div>

        {/* ── Footer quote ──────────────────────────────────────────────────── */}
        <div className="mt-10 animate-fade-up delay-700">
          <OrnamentalDivider />
          <p className="font-cinzel text-[9px] tracking-[0.15em] text-slate-300 uppercase mt-4">
            In the Grim Dark Future, There Is Only War
          </p>
        </div>

      </div>
    </div>
  );
}
