import React, { useState } from 'react';
import { useJournal } from '../context/JournalContext';
import { Trophy, FileText, Download, ChevronDown, ChevronUp, Globe, Calendar, MapPin, Users, BookOpen } from 'lucide-react';

export function Conferences() {
  const { conferences } = useJournal();
  const [expandedId, setExpandedId] = useState(null);

  const published = (conferences || [])
    .filter(c => c.is_published)
    .sort((a, b) => new Date(b.conference_date || 0) - new Date(a.conference_date || 0));

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-8 py-12 space-y-10">

      {/* Hero Header */}
      <div className="bg-slate-900 text-white p-8 sm:p-12 rounded-3xl border border-slate-800 shadow-xl space-y-4">
        <div className="inline-flex items-center space-x-2 px-3 py-1 bg-amber-500/10 border border-amber-500/20 text-amber-400 rounded-full text-xs font-semibold uppercase tracking-wider">
          <Trophy className="w-3.5 h-3.5" />
          <span>Academic Events</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold font-serif">Conferences</h1>
        <p className="text-sm text-slate-300 max-w-3xl leading-relaxed">
          Conference proceedings, presented papers and reports from academic conferences organized or associated with IJRT and Gyan Akshar Sanskriti Foundation.
        </p>

        {/* Stats */}
        <div className="flex flex-wrap gap-4 pt-2">
          <div className="px-4 py-2 bg-slate-800 rounded-xl text-center">
            <p className="text-2xl font-bold text-amber-400">{published.length}</p>
            <p className="text-[11px] text-slate-400">Conferences</p>
          </div>
          <div className="px-4 py-2 bg-slate-800 rounded-xl text-center">
            <p className="text-2xl font-bold text-sky-400">
              {published.reduce((sum, c) => sum + (parseInt(c.num_papers) || 0), 0)}
            </p>
            <p className="text-[11px] text-slate-400">Total Papers</p>
          </div>
        </div>
      </div>

      {/* Conference Cards */}
      {published.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-slate-200">
          <Trophy className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <p className="font-medium text-slate-700">No conferences available yet.</p>
          <p className="text-slate-400 text-sm mt-1">Check back soon.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {published.map(conf => {
            const isExpanded = expandedId === conf.id;
            const areas = Array.isArray(conf.research_areas) ? conf.research_areas : [];
            const papers = Array.isArray(conf.paper_titles) ? conf.paper_titles : [];
            const dateStr = conf.conference_date
              ? conf.end_date && conf.end_date !== conf.conference_date
                ? `${conf.conference_date} – ${conf.end_date}`
                : conf.conference_date
              : '';

            return (
              <div key={conf.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md hover:border-amber-300 transition-all overflow-hidden">
                <div className="p-6 sm:p-8 space-y-4">
                  {/* Title + badges */}
                  <div className="space-y-2">
                    <div className="flex flex-wrap items-center gap-2 text-[11px]">
                      <span className="px-2.5 py-1 bg-amber-50 text-amber-800 border border-amber-200 rounded-lg font-bold flex items-center gap-1">
                        <Trophy className="w-3 h-3" /> Conference
                      </span>
                      {conf.num_papers && (
                        <span className="px-2.5 py-1 bg-sky-50 text-sky-800 border border-sky-200 rounded-lg font-semibold">
                          {conf.num_papers} Papers
                        </span>
                      )}
                    </div>
                    <h2 className="text-xl sm:text-2xl font-bold font-serif text-slate-900 leading-snug">{conf.conference_name}</h2>
                  </div>

                  {/* Meta info grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                    {conf.organizer && (
                      <div className="flex items-start gap-2">
                        <Users className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="text-slate-400 uppercase text-[10px] font-bold tracking-wide">Organizer</p>
                          <p className="text-slate-800 font-medium">{conf.organizer}</p>
                        </div>
                      </div>
                    )}
                    {dateStr && (
                      <div className="flex items-start gap-2">
                        <Calendar className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="text-slate-400 uppercase text-[10px] font-bold tracking-wide">Date(s)</p>
                          <p className="text-slate-800 font-medium">{dateStr}</p>
                        </div>
                      </div>
                    )}
                    {conf.venue && (
                      <div className="flex items-start gap-2">
                        <MapPin className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="text-slate-400 uppercase text-[10px] font-bold tracking-wide">Venue</p>
                          <p className="text-slate-800 font-medium">{conf.venue}</p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Research Areas */}
                  {areas.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                      {areas.map((a, i) => (
                        <span key={i} className="px-2.5 py-1 bg-slate-100 text-slate-700 rounded-full text-[11px] font-medium">{a}</span>
                      ))}
                    </div>
                  )}

                  {/* Action row */}
                  <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-100">
                    <div className="flex flex-wrap gap-2">
                      {/* Papers toggle */}
                      {papers.length > 0 && (
                        <button onClick={() => setExpandedId(isExpanded ? null : conf.id)}
                          className="flex items-center gap-1.5 text-xs font-semibold text-amber-700 hover:text-amber-800 transition-colors">
                          <BookOpen className="w-3.5 h-3.5" />
                          <span>{isExpanded ? 'Hide Papers' : `View ${papers.length} Paper${papers.length !== 1 ? 's' : ''}`}</span>
                          {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                        </button>
                      )}
                      {/* Website */}
                      {conf.website_url && (
                        <a href={conf.website_url} target="_blank" rel="noopener noreferrer"
                          className="flex items-center gap-1.5 text-xs font-semibold text-sky-700 hover:underline">
                          <Globe className="w-3.5 h-3.5" /> Website
                        </a>
                      )}
                    </div>
                    {/* PDF Downloads */}
                    <div className="flex flex-wrap gap-2">
                      {conf.proceedings_pdf_url && (
                        <a href={conf.proceedings_pdf_url} target="_blank" rel="noopener noreferrer" download
                          className="flex items-center gap-1.5 px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-xl shadow transition-colors">
                          <Download className="w-3.5 h-3.5" /> Proceedings PDF
                        </a>
                      )}
                      {conf.report_pdf_url && (
                        <a href={conf.report_pdf_url} target="_blank" rel="noopener noreferrer" download
                          className="flex items-center gap-1.5 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold rounded-xl shadow transition-colors">
                          <Download className="w-3.5 h-3.5" /> Report PDF
                        </a>
                      )}
                    </div>
                  </div>
                </div>

                {/* Expanded papers list */}
                {isExpanded && papers.length > 0 && (
                  <div className="border-t border-slate-100 bg-slate-50 px-6 sm:px-8 py-5">
                    <p className="text-xs font-bold text-slate-700 mb-3 uppercase tracking-wide">Papers Presented</p>
                    <ol className="space-y-2">
                      {papers.map((p, i) => (
                        <li key={i} className="flex items-start gap-2 text-xs text-slate-700">
                          <span className="text-amber-600 font-bold font-mono flex-shrink-0 w-5">{i + 1}.</span>
                          <span className="leading-relaxed">{p}</span>
                        </li>
                      ))}
                    </ol>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

