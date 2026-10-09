import React from 'react';
import { useJournal } from '../context/JournalContext';
import { ArticleCard } from '../components/common/ArticleCard';
import { BookOpen, Layers, Calendar, Sparkles } from 'lucide-react';

export const CurrentIssue = () => {
  const { volumes, issues, articles } = useJournal();

  // PHASE 11: Improved current issue detection logic
  // Find latest active volume
  const activeVolume = volumes.find(v => v.status === 'Active') || volumes[0];
  
  // Find the most recently published issue in the active volume
  const activeIssue = issues
    .filter(i => activeVolume && i.volume_id === activeVolume.id)
    .sort((a, b) => {
      // Primary sort by publication date if available
      if (a.pub_date && b.pub_date) {
        return new Date(b.pub_date) - new Date(a.pub_date);
      }
      // Secondary sort by issue number (highest first)
      return b.issue_number - a.issue_number;
    })[0] || issues[0];

  const currentArticles = activeIssue
    ? articles.filter(a => a.issue_id === activeIssue.id && a.is_published)
    : [];

  // Fallback: if no articles linked to the issue, show all published articles
  const displayArticles = currentArticles.length > 0
    ? currentArticles.sort((a, b) => new Date(b.published_date || b.created_at) - new Date(a.published_date || a.created_at))
    : articles
        .filter(a => a.is_published)
        .sort((a, b) => new Date(b.published_date || b.created_at) - new Date(a.published_date || a.created_at));

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-8 py-12 space-y-10">
      {/* Issue Banner */}
      <div className="bg-slate-900 text-white p-8 sm:p-12 rounded-3xl border border-slate-800 shadow-xl space-y-4 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-10 text-amber-400">
          <BookOpen className="w-48 h-48" />
        </div>

        <div className="relative z-10 space-y-3">
          <div className="inline-flex items-center space-x-2 px-3 py-1 bg-amber-500/10 border border-amber-500/20 text-amber-400 rounded-full text-xs font-semibold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Latest Publication</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-bold font-serif">Current Issue</h1>

          {activeVolume && activeIssue && (
            <div className="p-4 bg-slate-950/80 border border-slate-800 rounded-2xl inline-block space-y-1 text-sm text-slate-200">
              <p className="font-bold text-amber-400 font-serif text-lg">
                Volume {activeVolume.volume_number} | Number {activeIssue.issue_number} | {activeIssue.month_range} {activeIssue.year}
              </p>
              <p className="text-xs text-slate-400">Published: {activeIssue.pub_date}</p>
              {activeIssue.editorial_note && (
                <p className="text-xs text-slate-300 italic pt-1 border-t border-slate-800/80 mt-2">
                  "{activeIssue.editorial_note}"
                </p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Articles List */}
      <div className="space-y-6">
        <div className="flex items-center justify-between border-b border-slate-200 pb-3">
          <h2 className="text-xl font-bold font-serif text-slate-900">
            Published Articles ({displayArticles.length})
          </h2>
        </div>

        {displayArticles.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl border border-slate-200 text-slate-400 text-sm">
            No published articles in this current issue yet.
          </div>
        ) : (
          <div className="space-y-6">
            {displayArticles.map(art => (
              <ArticleCard key={art.id} article={art} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

