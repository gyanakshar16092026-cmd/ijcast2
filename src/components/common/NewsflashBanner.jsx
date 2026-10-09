import React, { useState, useEffect } from 'react';
import { useJournal } from '../../context/JournalContext';
import { Bell, X, ChevronLeft, ChevronRight } from 'lucide-react';

const TYPE_STYLES = {
  call_for_papers: { bg: 'bg-amber-500',     text: 'text-slate-950', badge: 'Call for Papers',       icon: '📢' },
  new_issue:       { bg: 'bg-emerald-600',   text: 'text-white',     badge: 'New Issue Published',   icon: '📖' },
  indexing:        { bg: 'bg-sky-600',        text: 'text-white',     badge: 'Indexing & Recognition',icon: '🏆' },
  general:         { bg: 'bg-slate-700',      text: 'text-slate-100', badge: 'Notice',                icon: '🔔' },
};

export const NewsflashBanner = () => {
  const { announcements } = useJournal();
  const [dismissed, setDismissed] = useState(false);
  const [current, setCurrent] = useState(0);

  const today = new Date().toISOString().split('T')[0];
  const active = (announcements || []).filter(
    a => a.is_active && (!a.expires_at || a.expires_at >= today)
  );

  // Auto-rotate every 6 seconds when multiple announcements
  useEffect(() => {
    if (active.length <= 1) return;
    const timer = setInterval(() => {
      setCurrent(prev => (prev + 1) % active.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [active.length]);

  if (dismissed || active.length === 0) return null;

  const ann = active[current];
  const style = TYPE_STYLES[ann.type] || TYPE_STYLES.general;

  return (
    <div className={`${style.bg} ${style.text} w-full`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-2.5 flex items-center gap-3">
        {/* Badge */}
        <span className="hidden sm:flex items-center gap-1.5 flex-shrink-0 bg-black/20 px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider whitespace-nowrap">
          <Bell className="w-3 h-3" />
          {style.badge}
        </span>

        {/* Icon for mobile */}
        <span className="sm:hidden text-base flex-shrink-0">{style.icon}</span>

        {/* Text — scrolling marquee on mobile, static on desktop */}
        <div className="flex-1 min-w-0 overflow-hidden">
          <p className="text-xs sm:text-sm font-semibold truncate">
            <span className="font-bold">{ann.title}</span>
            {ann.message && <span className="opacity-90 ml-2 hidden sm:inline">— {ann.message}</span>}
          </p>
          {ann.message && (
            <p className="text-[11px] opacity-80 sm:hidden truncate">{ann.message}</p>
          )}
        </div>

        {/* Pagination dots when multiple */}
        {active.length > 1 && (
          <div className="hidden sm:flex items-center gap-1.5 flex-shrink-0">
            <button onClick={() => setCurrent(prev => (prev - 1 + active.length) % active.length)}
              className="p-0.5 rounded hover:bg-black/20 transition-colors">
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-[11px] font-mono opacity-80">{current + 1}/{active.length}</span>
            <button onClick={() => setCurrent(prev => (prev + 1) % active.length)}
              className="p-0.5 rounded hover:bg-black/20 transition-colors">
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Dismiss */}
        <button
          onClick={() => setDismissed(true)}
          className="flex-shrink-0 p-1 rounded hover:bg-black/20 transition-colors opacity-70 hover:opacity-100"
          aria-label="Dismiss"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

