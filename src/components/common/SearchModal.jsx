import React, { useState, useMemo, useEffect } from 'react';
import { useJournal } from '../../context/JournalContext';
import { Link } from 'react-router-dom';
import { Search, X, BookOpen, User, Tag, Layers, Filter } from 'lucide-react';

export const SearchModal = () => {
  const { articles, volumes, issues, isSearchOpen, setIsSearchOpen } = useJournal();
  const [query, setQuery] = useState('');
  const [selectedDomain, setSelectedDomain] = useState('All');

  // PHASE 8: Add keyboard shortcut (Cmd/Ctrl + K) for search
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsSearchOpen(true);
      }
      if (e.key === 'Escape' && isSearchOpen) {
        setIsSearchOpen(false);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isSearchOpen, setIsSearchOpen]);

  const filteredArticles = useMemo(() => {
    if (!query.trim() && selectedDomain === 'All') return [];

    const q = query.toLowerCase().trim();

    return articles.filter(art => {
      if (!art.is_published) return false;

      const matchesDomain = selectedDomain === 'All' || art.research_area === selectedDomain;

      if (!q) return matchesDomain;

      // 6-dimension search: Title, Author, Keyword, Volume, Issue, Research Area
      const titleMatch = art.title?.toLowerCase().includes(q);
      const authorMatch = art.authors?.some(a => a.name?.toLowerCase().includes(q));
      const keywordMatch = art.keywords?.some(k => k?.toLowerCase().includes(q));

      const issueObj = issues.find(i => i.id === art.issue_id);
      const volObj = issueObj ? volumes.find(v => v.id === issueObj.volume_id) : null;

      const volMatch = volObj ? `volume ${volObj.volume_number}`.includes(q) || `vol ${volObj.volume_number}`.includes(q) : false;
      const issueMatch = issueObj ? `issue ${issueObj.issue_number}`.includes(q) || `number ${issueObj.issue_number}`.includes(q) : false;
      const raMatch = art.research_area?.toLowerCase().includes(q);

      return matchesDomain && (titleMatch || authorMatch || keywordMatch || volMatch || issueMatch || raMatch);
    });
  }, [query, selectedDomain, articles, volumes, issues]);

  if (!isSearchOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-slate-900/80 backdrop-blur-sm p-4 pt-16 sm:pt-24">
      <div className="bg-white w-full max-w-3xl rounded-2xl shadow-2xl border border-slate-100 overflow-hidden flex flex-col max-h-[80vh]">
        {/* Search Input Bar */}
        <div className="p-4 border-b border-slate-100 flex items-center space-x-3 bg-slate-50">
          <Search className="w-5 h-5 text-slate-400 flex-shrink-0" />
          <input
            type="text"
            placeholder="Search articles by title, author, keywords, volume, issue, or domain... (Ctrl+K)"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full bg-transparent text-sm text-slate-900 focus:outline-none placeholder-slate-400 font-sans"
            autoFocus
          />
          {query && (
            <button onClick={() => setQuery('')} className="text-slate-400 hover:text-slate-600">
              <X className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={() => setIsSearchOpen(false)}
            className="px-3 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-semibold rounded-lg transition-colors"
          >
            Close
          </button>
        </div>

        {/* Filter Bar */}
        <div className="px-4 py-2.5 bg-white border-b border-slate-100 flex items-center space-x-2 text-xs overflow-x-auto custom-scrollbar">
          <span className="text-slate-500 font-medium flex items-center space-x-1 flex-shrink-0">
            <Filter className="w-3.5 h-3.5" />
            <span>Domain:</span>
          </span>
          {['All', 'Commerce & Management', 'Arts & Humanities', 'Social Sciences', 'Science', 'Computer Science & Technology', 'Engineering', 'Education'].map(domain => (
            <button
              key={domain}
              onClick={() => setSelectedDomain(domain)}
              className={`px-2.5 py-1 rounded-full whitespace-nowrap transition-colors ${
                selectedDomain === domain
                  ? 'bg-amber-600 text-white font-semibold shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {domain}
            </button>
          ))}
        </div>

        {/* Search Results List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
          {filteredArticles.length === 0 ? (
            <div className="text-center py-12 text-slate-400 text-sm">
              {query || selectedDomain !== 'All'
                ? 'No published research articles matched your search query.'
                : 'Type above to search articles across all volumes and issues.'}
            </div>
          ) : (
            filteredArticles.map(art => {
              const issueObj = issues.find(i => i.id === art.issue_id);
              const volObj = issueObj ? volumes.find(v => v.id === issueObj.volume_id) : null;

              return (
                <Link
                  key={art.id}
                  to={`/article/${art.id}`}
                  onClick={() => setIsSearchOpen(false)}
                  className="block p-4 rounded-xl border border-slate-100 hover:border-amber-300 hover:shadow-md transition-all bg-slate-50/50 hover:bg-white group"
                >
                  <div className="flex items-center space-x-2 text-xs text-amber-700 font-semibold mb-1">
                    <span className="px-2 py-0.5 bg-amber-100 rounded text-amber-800">{art.research_area}</span>
                    {volObj && issueObj && (
                      <span className="text-slate-500 font-normal">
                        Vol {volObj.volume_number}, Issue {issueObj.issue_number} ({issueObj.year})
                      </span>
                    )}
                  </div>
                  <h4 className="text-sm font-bold text-slate-900 group-hover:text-amber-700 transition-colors font-serif leading-snug">
                    {art.title}
                  </h4>
                  <p className="text-xs text-slate-600 mt-1 line-clamp-1">
                    By {art.authors?.map(a => a.name).join(', ')}
                  </p>
                </Link>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
