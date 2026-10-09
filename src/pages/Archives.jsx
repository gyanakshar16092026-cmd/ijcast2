import React, { useState } from 'react';
import { useJournal } from '../context/JournalContext';
import { ArticleCard } from '../components/common/ArticleCard';
import { Archive, Folder, Calendar, BookOpen, Layers } from 'lucide-react';

export const Archives = () => {
  const { volumes, issues, articles } = useJournal();
  const [selectedIssueId, setSelectedIssueId] = useState(null);

  // Group volumes by Year
  const years = Array.from(new Set(volumes.map(v => v.year))).sort((a, b) => b - a);

  // Articles for currently selected issue filter
  const selectedIssueObj = issues.find(i => i.id === selectedIssueId);
  const selectedVolumeObj = selectedIssueObj ? volumes.find(v => v.id === selectedIssueObj.volume_id) : null;

  const filteredArticles = selectedIssueId
    ? articles.filter(a => a.issue_id === selectedIssueId && a.is_published)
    : [];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-8 py-12 space-y-10">
      {/* Header */}
      <div className="bg-slate-900 text-white p-8 sm:p-12 rounded-3xl border border-slate-800 shadow-xl space-y-4">
        <div className="inline-flex items-center space-x-2 px-3 py-1 bg-amber-500/10 border border-amber-500/20 text-amber-400 rounded-full text-xs font-semibold uppercase tracking-wider">
          <Archive className="w-3.5 h-3.5" />
          <span>Historical Repository</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold font-serif">Journal Archives</h1>
        <p className="text-sm text-slate-300 max-w-3xl leading-relaxed">
          Access all historical volumes, back-issues, and archived peer-reviewed papers published by IJRT.
        </p>
      </div>

      {/* Year -> Volume -> Issue Tree Hierarchy */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
        {/* Left Column: Archives Tree Selector */}
        <div className="lg:col-span-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
          <h3 className="text-base font-bold font-serif text-slate-900 border-b border-slate-100 pb-3 flex items-center justify-between">
            <span>Browse Archives Tree</span>
            <Folder className="w-4 h-4 text-amber-600" />
          </h3>

          <div className="space-y-6">
            {years.map(yr => {
              const yearVolumes = volumes.filter(v => v.year === yr);
              return (
                <div key={yr} className="space-y-3">
                  <div className="flex items-center space-x-2 text-sm font-bold text-slate-900">
                    <Calendar className="w-4 h-4 text-amber-600" />
                    <span>Year {yr}</span>
                  </div>

                  <div className="pl-4 border-l-2 border-slate-100 space-y-3">
                    {yearVolumes.map(vol => {
                      const volIssues = issues.filter(i => i.volume_id === vol.id);
                      return (
                        <div key={vol.id} className="space-y-1.5">
                          <span className="text-xs font-semibold text-slate-700 block">
                            Volume {vol.volume_number} {vol.status === 'Archived' && <span className="text-[10px] text-slate-400">(Archived)</span>}
                          </span>

                          <div className="space-y-1 pl-2">
                            {volIssues.map(iss => {
                              const isSelected = selectedIssueId === iss.id;
                              const artCount = articles.filter(a => a.issue_id === iss.id && a.is_published).length;
                              return (
                                <button
                                  key={iss.id}
                                  onClick={() => setSelectedIssueId(iss.id)}
                                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs text-left transition-all ${
                                    isSelected
                                      ? 'bg-amber-600 text-white font-bold shadow-sm'
                                      : 'bg-slate-50 hover:bg-slate-100 text-slate-700'
                                  }`}
                                >
                                  <span>Number {iss.issue_number} ({iss.month_range})</span>
                                  <span className={`text-[10px] px-1.5 py-0.5 rounded ${isSelected ? 'bg-amber-700 text-amber-100' : 'bg-slate-200 text-slate-600'}`}>
                                    {artCount} papers
                                  </span>
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Articles in Selected Issue */}
        <div className="lg:col-span-8 space-y-6">
          {selectedIssueObj && selectedVolumeObj ? (
            <div className="space-y-6">
              <div className="p-6 bg-slate-900 text-white rounded-2xl border border-slate-800 space-y-2">
                <span className="text-xs uppercase font-bold text-amber-400">Selected Archive Issue</span>
                <h3 className="text-xl font-bold font-serif text-white">
                  Year {selectedIssueObj.year} | Volume {selectedVolumeObj.volume_number} | Number {selectedIssueObj.issue_number}
                </h3>
                <p className="text-xs text-slate-300">{selectedIssueObj.month_range} {selectedIssueObj.year}</p>
              </div>

              <div className="space-y-4">
                {filteredArticles.length === 0 ? (
                  <div className="text-center py-16 bg-white rounded-2xl border border-slate-200 text-slate-400 text-sm">
                    No articles found in this archived issue.
                  </div>
                ) : (
                  filteredArticles.map(art => (
                    <ArticleCard key={art.id} article={art} />
                  ))
                )}
              </div>
            </div>
          ) : (
            <div className="text-center py-20 bg-white rounded-2xl border border-slate-200 text-slate-500 text-sm space-y-3">
              <BookOpen className="w-12 h-12 text-slate-300 mx-auto" />
              <p className="font-medium text-slate-800">Select a Year, Volume, and Issue Number from the tree on the left to view archived papers.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};


