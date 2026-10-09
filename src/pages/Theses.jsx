import React, { useState } from 'react';
import { useJournal } from '../context/JournalContext';
import { GraduationCap, Search, BookOpen, ChevronDown, ChevronUp, FileText, Download, Filter } from 'lucide-react';

const DEGREE_TYPES = ['All', 'PhD', 'M.Tech', 'M.Phil', 'M.Sc', 'MBA'];

export function Theses() {
  const { theses } = useJournal();
  const [filterDegree, setFilterDegree] = useState('All');
  const [filterStream, setFilterStream] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedId, setExpandedId] = useState(null);

  const published = theses.filter(t => t.is_published);

  const streams = ['All', ...Array.from(new Set(published.map(t => t.stream).filter(Boolean))).sort()];

  const filtered = published.filter(t => {
    if (filterDegree !== 'All' && t.degree_type !== filterDegree) return false;
    if (filterStream !== 'All' && t.stream !== filterStream) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        t.title?.toLowerCase().includes(q) ||
        t.scholar_name?.toLowerCase().includes(q) ||
        t.university?.toLowerCase().includes(q) ||
        (Array.isArray(t.guide_names) ? t.guide_names : []).some(g => g.toLowerCase().includes(q))
      );
    }
    return true;
  });

  const phdCount = published.filter(t => t.degree_type === 'PhD').length;
  const mtechCount = published.filter(t => t.degree_type === 'M.Tech').length;
  const otherCount = published.length - phdCount - mtechCount;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-8 py-12 space-y-10">

      {/* Hero Header */}
      <div className="bg-slate-900 text-white p-8 sm:p-12 rounded-3xl border border-slate-800 shadow-xl space-y-4">
        <div className="inline-flex items-center space-x-2 px-3 py-1 bg-amber-500/10 border border-amber-500/20 text-amber-400 rounded-full text-xs font-semibold uppercase tracking-wider">
          <GraduationCap className="w-3.5 h-3.5" />
          <span>Research Repository</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold font-serif">PhD & M.Tech Theses</h1>
        <p className="text-sm text-slate-300 max-w-3xl leading-relaxed">
          A curated repository of doctoral and post-graduate research theses indexed by IJCAST across multidisciplinary fields.
        </p>

        {/* Stats row */}
        <div className="flex flex-wrap gap-4 pt-2">
          <div className="px-4 py-2 bg-slate-800 rounded-xl text-center">
            <p className="text-2xl font-bold text-amber-400">{published.length}</p>
            <p className="text-[11px] text-slate-400">Total Theses</p>
          </div>
          <div className="px-4 py-2 bg-slate-800 rounded-xl text-center">
            <p className="text-2xl font-bold text-purple-400">{phdCount}</p>
            <p className="text-[11px] text-slate-400">PhD</p>
          </div>
          <div className="px-4 py-2 bg-slate-800 rounded-xl text-center">
            <p className="text-2xl font-bold text-sky-400">{mtechCount}</p>
            <p className="text-[11px] text-slate-400">M.Tech</p>
          </div>
          {otherCount > 0 && (
            <div className="px-4 py-2 bg-slate-800 rounded-xl text-center">
              <p className="text-2xl font-bold text-emerald-400">{otherCount}</p>
              <p className="text-[11px] text-slate-400">Others</p>
            </div>
          )}
        </div>
      </div>

      {/* Search + Filter bar */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 space-y-4">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search by title, scholar, guide, or university..."
            className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 transition"
          />
        </div>

        {/* Filter pills */}
        <div className="flex flex-wrap items-center gap-4">
          {/* Degree filter */}
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-xs font-semibold text-slate-500 flex items-center gap-1"><Filter className="w-3 h-3" />Degree:</span>
            {DEGREE_TYPES.map(d => (
              <button
                key={d}
                onClick={() => setFilterDegree(d)}
                className={`px-3 py-2 rounded-lg text-xs font-semibold transition-colors ${filterDegree === d ? 'bg-amber-500 text-slate-950' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
              >{d}</button>
            ))}
          </div>

          {/* Stream filter */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-500">Stream:</span>
            <select
              value={filterStream}
              onChange={e => setFilterStream(e.target.value)}
              className="bg-slate-100 border border-slate-200 rounded-lg px-2 py-2 text-xs text-slate-700 focus:outline-none focus:border-amber-400"
            >
              {streams.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
        </div>
      </div>

      {/* Results count */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-500">
          Showing <span className="font-semibold text-slate-700">{filtered.length}</span> {filtered.length === 1 ? 'thesis' : 'theses'}
          {(filterDegree !== 'All' || filterStream !== 'All' || searchQuery) && ' (filtered)'}
        </p>
      </div>

      {/* Thesis Cards */}
      {filtered.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-slate-200">
          <GraduationCap className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <p className="font-medium text-slate-700">No theses match your search.</p>
          <button
            onClick={() => { setSearchQuery(''); setFilterDegree('All'); setFilterStream('All'); }}
            className="mt-3 text-xs text-amber-700 font-bold hover:underline"
          >
            Clear filters
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map(thesis => {
            const isExpanded = expandedId === thesis.id;
            const guides = Array.isArray(thesis.guide_names) ? thesis.guide_names : [thesis.guide_names].filter(Boolean);
            const keywords = Array.isArray(thesis.keywords) ? thesis.keywords : [];
            return (
              <div key={thesis.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md hover:border-amber-300 transition-all overflow-hidden">
                <div className="p-6 space-y-4">
                  {/* Badges */}
                  <div className="flex flex-wrap items-center gap-2 text-[11px]">
                    <span className={`px-2.5 py-1 rounded-lg font-bold ${thesis.degree_type === 'PhD' ? 'bg-purple-100 text-purple-800 border border-purple-200' : 'bg-sky-100 text-sky-800 border border-sky-200'}`}>
                      {thesis.degree_type}
                    </span>
                    {thesis.stream && (
                      <span className="px-2.5 py-1 bg-amber-50 text-amber-800 border border-amber-200 rounded-lg font-semibold">
                        {thesis.stream}
                      </span>
                    )}
                    <span className="px-2.5 py-1 bg-slate-100 text-slate-600 rounded-lg font-medium">
                      {thesis.year}
                    </span>
                  </div>

                  {/* Title */}
                  <h3 className="text-lg font-bold font-serif text-slate-900 leading-snug">{thesis.title}</h3>

                  {/* Scholar + Guides + University */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                    <div>
                      <span className="text-slate-400 block mb-0.5 font-medium uppercase tracking-wide text-[10px]">Scholar</span>
                      <p className="text-slate-800 font-semibold">{thesis.scholar_name}</p>
                    </div>
                    <div>
                      <span className="text-slate-400 block mb-0.5 font-medium uppercase tracking-wide text-[10px]">Guide{guides.length > 1 ? 's' : ''}</span>
                      <p className="text-slate-800">{guides.join(', ')}</p>
                    </div>
                    <div>
                      <span className="text-slate-400 block mb-0.5 font-medium uppercase tracking-wide text-[10px]">University</span>
                      <p className="text-slate-800">{thesis.university}</p>
                    </div>
                  </div>

                  {/* Actions row */}
                  <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-100">
                    <div className="flex items-center gap-2">
                      {thesis.abstract && (
                        <button
                          onClick={() => setExpandedId(isExpanded ? null : thesis.id)}
                          className="flex items-center space-x-1 text-xs font-semibold text-amber-700 hover:text-amber-800 transition-colors"
                        >
                          <BookOpen className="w-3.5 h-3.5" />
                          <span>{isExpanded ? 'Hide Abstract' : 'View Abstract'}</span>
                          {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                        </button>
                      )}
                    </div>
                    {thesis.pdf_url && (
                      <a
                        href={thesis.pdf_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        download
                        className="flex items-center space-x-1.5 px-3 py-2.5 bg-amber-600 hover:bg-amber-700 text-white text-xs font-medium rounded-lg shadow-sm transition-colors"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>Download Thesis</span>
                      </a>
                    )}
                  </div>
                </div>

                {/* Expanded abstract */}
                {isExpanded && (
                  <div className="border-t border-slate-100 bg-slate-50 px-6 py-5 space-y-3">
                    <div>
                      <p className="text-xs font-bold text-slate-700 mb-1">Abstract</p>
                      <p className="text-xs text-slate-600 leading-relaxed">{thesis.abstract}</p>
                    </div>
                    {keywords.length > 0 && (
                      <div className="flex flex-wrap items-center gap-1.5">
                        <span className="text-[11px] font-bold text-slate-700">Keywords:</span>
                        {keywords.map((kw, i) => (
                          <span key={i} className="px-2 py-0.5 bg-white border border-slate-200 text-slate-600 rounded text-[11px]">{kw}</span>
                        ))}
                      </div>
                    )}
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

