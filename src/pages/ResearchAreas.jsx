import React from 'react';
import { useJournal } from '../context/JournalContext';
import { Compass, BookOpen, Layers } from 'lucide-react';

export const ResearchAreas = () => {
  const { researchAreas } = useJournal();

  // Domain Icon & Color mapping matching exact requirements
  const getDomainStyle = (category) => {
    switch (category) {
      case 'Arts & Humanities':
        return { icon: '🎨', bg: 'bg-rose-50 border-rose-100', iconBg: 'bg-rose-100' };
      case 'Commerce & Management':
        return { icon: '📊', bg: 'bg-emerald-50 border-emerald-100', iconBg: 'bg-emerald-100' };
      case 'Computer Science & Technology':
        return { icon: '💻', bg: 'bg-sky-50 border-sky-100', iconBg: 'bg-sky-100' };
      case 'Education':
        return { icon: '📚', bg: 'bg-amber-50 border-amber-100', iconBg: 'bg-amber-100' };
      case 'Engineering':
        return { icon: '⚙️', bg: 'bg-purple-50 border-purple-100', iconBg: 'bg-purple-100' };
      case 'Interdisciplinary Research':
        return { icon: '🔗', bg: 'bg-indigo-50 border-indigo-100', iconBg: 'bg-indigo-100' };
      case 'Science':
        return { icon: '🔬', bg: 'bg-blue-50 border-blue-100', iconBg: 'bg-blue-100' };
      case 'Social Sciences':
        return { icon: '🌍', bg: 'bg-teal-50 border-teal-100', iconBg: 'bg-teal-100' };
      default:
        return { icon: '💡', bg: 'bg-slate-50 border-slate-100', iconBg: 'bg-slate-100' };
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-8 py-12 space-y-10">
      {/* Header Banner */}
      <div className="bg-slate-900 text-white p-8 sm:p-12 rounded-3xl border border-slate-800 shadow-xl space-y-4 text-center sm:text-left">
        <div className="inline-flex items-center space-x-2 px-3 py-1 bg-amber-500/10 border border-amber-500/20 text-amber-400 rounded-full text-xs font-semibold uppercase tracking-wider">
          <Compass className="w-3.5 h-3.5" />
          <span>Multidisciplinary Research Domains</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold font-serif">Research Areas & Scope</h1>
        <p className="text-sm text-slate-300 max-w-3xl leading-relaxed">
          IJRT is a multidisciplinary journal that covers a broad range of subjects. The following categories represent the primary research areas covered by the journal. Interdisciplinary research involving two or more disciplines is also welcome.
        </p>
      </div>

      {/* Grid of 8 Research Domain Cards matching user screenshot */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {researchAreas.map((area) => {
          const style = getDomainStyle(area.category);
          return (
            <div
              key={area.id}
              className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-sm hover:shadow-md hover:border-amber-300 transition-all flex flex-col justify-between space-y-5"
            >
              {/* Category Header */}
              <div className="flex items-center space-x-3">
                <div className={`w-11 h-11 rounded-xl ${style.iconBg} flex items-center justify-center text-xl shadow-sm flex-shrink-0`}>
                  {style.icon}
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900 font-serif leading-snug">{area.category}</h3>
                  <span className="text-[11px] text-slate-500 font-medium">{(Array.isArray(area.subcategories) ? area.subcategories : []).length} Specialized Disciplines</span>
                </div>
              </div>

              {/* Subcategories Pill Badges */}
              <div className="flex flex-wrap gap-2">
                {(Array.isArray(area.subcategories) ? area.subcategories : []).map((sub, i) => (
                  <span
                    key={i}
                    className="px-3 py-1 bg-slate-50 hover:bg-slate-100 border border-slate-200/80 text-slate-700 text-xs font-medium rounded-full transition-colors"
                  >
                    {sub}
                  </span>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

