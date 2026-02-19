'use client';

import React, {
  createContext,
  useContext,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from 'react';
import { X } from 'lucide-react';
import { formatText } from '@/lib/utils';

// ─── Types ────────────────────────────────────────────────────────────────────

interface TooltipData {
  text: string;
  title: string;
  rect: DOMRect;
}

interface TooltipContextValue {
  showTooltip: (text: string, title: string, rect: DOMRect) => void;
  hideTooltip: () => void;
}

// ─── Context ──────────────────────────────────────────────────────────────────

export const TooltipContext = createContext<TooltipContextValue>({
  showTooltip: () => {},
  hideTooltip: () => {},
});

export function useTooltip() {
  return useContext(TooltipContext);
}

// ─── Floating tooltip ─────────────────────────────────────────────────────────

function FloatingTooltip({ data, onClose }: { data: TooltipData; onClose: () => void }) {
  const { text, title, rect } = data;
  const ref = useRef<HTMLDivElement>(null);
  const [coords, setCoords] = useState({ top: 0, left: 0 });

  useLayoutEffect(() => {
    if (!ref.current) return;
    const tip = ref.current.getBoundingClientRect();
    const vw  = window.innerWidth;

    let top  = rect.top - tip.height - 12;
    let left = rect.left + rect.width / 2 - tip.width / 2;

    if (top  < 10)                    top  = rect.bottom + 12;
    if (left < 10)                    left = 10;
    if (left + tip.width > vw - 10)  left = vw - tip.width - 10;

    setCoords({ top, left });
  }, [rect]);

  return (
    <div
      ref={ref}
      className="fixed z-[9999] w-72 sm:w-80 max-w-[95vw] bg-slate-900 text-white text-sm rounded-lg shadow-2xl border border-slate-600 flex flex-col"
      style={{ top: coords.top, left: coords.left }}
      onClick={e => e.stopPropagation()}
    >
      <div className="flex justify-between items-center p-3 bg-slate-950 rounded-t-lg border-b border-slate-700">
        <strong className="text-amber-400 font-bold tracking-wide truncate pr-2">{title}</strong>
        <button
          onClick={onClose}
          className="text-slate-400 hover:text-white transition-colors p-1 bg-white/5 rounded-full"
        >
          <X size={16} />
        </button>
      </div>
      <div className="p-4 leading-relaxed text-slate-200 max-h-[50vh] overflow-y-auto custom-scrollbar text-xs sm:text-sm">
        {formatText(text)}
      </div>
    </div>
  );
}

// ─── Provider ─────────────────────────────────────────────────────────────────

export function TooltipManager({ children }: { children: React.ReactNode }) {
  const [tooltip, setTooltip] = useState<TooltipData | null>(null);

  // Lock background scroll while tooltip is open
  useEffect(() => {
    if (tooltip) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [tooltip]);

  const showTooltip = (text: string, title: string, rect: DOMRect) => {
    setTooltip(prev =>
      prev && prev.title === title && prev.rect.top === rect.top ? null : { text, title, rect },
    );
  };

  const hideTooltip = () => setTooltip(null);

  return (
    <TooltipContext.Provider value={{ showTooltip, hideTooltip }}>
      <div onClick={() => tooltip && hideTooltip()} className="min-h-screen">
        {children}
      </div>
      {tooltip && <FloatingTooltip data={tooltip} onClose={hideTooltip} />}
    </TooltipContext.Provider>
  );
}
