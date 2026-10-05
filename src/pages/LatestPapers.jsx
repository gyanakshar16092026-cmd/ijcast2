import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useJournal } from '../context/JournalContext';
import { Calendar, User, BookOpen, Download, ExternalLink, Search, Filter, X } from 'lucide-react';

export const LatestPapers = () => {
  const { articles, volumes, issues, researchAreas } = useJournal();
  const [filteredArticles, setFilteredArticles] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedYear, setSelectedYear] = useState('');
  const [selectedArea, setSelectedArea] = useState('');
  const [selectedVolume, setSelectedVolume] = useState('');
  const [selectedIssue, setSelectedIssue] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  // Get published articles sorted by published date (most recent first)
  const publishedArticles = articles
    .filter(a => a.is_published && a.published_date)
    .sort((a, b) => new Date(b.published_date) - new Date(a.published_date));

  // Extract unique years from published dates
  const years = [...new Set(publishedArticles.map(a => new Date(a.published_date).getFullYear()))].sort((a, b) => b - a);

  // Filter issues by selected volume
  const availableIssues = selectedVolume
    ? issues.filter(i => i.volume_id === selectedVolume)
    : issues;

  // Apply filters
  useEffect(() => {
    let filtered = [...publishedArticles];

    // Text search (title, abstract, keywords, authors)
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(article => {
        const titleMatch = article.title?.toLowerCase().includes(query);
        const abstractMatch = article.abstract?.toLowerCase().includes(query);
        const keywordsMatch = article.keywords?.some(k => k.toLowerCase().includes(query));
        const authorsMatch = article.authors?.some(a => a.name?.toLowerCase().includes(query));
        return titleMatch || abstractMatch || keywordsMatch || authorsMatch;
      });
    }

    // Year filter
    if (selectedYear) {
      filtered = filtered.filter(a => new Date(a.published_date).getFullYear() === parseInt(selectedYear));
    }

    // Research area filter
    if (selectedArea) {
      filtered = filtered.filter(a => a.research_area === selectedArea);
    }

    // Volume filter
    if (selectedVolume) {
      filtered = filtered.filter(a => {
        const issue = issues.find(i => i.id === a.issue_id);
        return issue?.volume_id === selectedVolume;
      });
    }

    // Issue filter
    if (selectedIssue) {
      filtered = filtered.filter(a => a.issue_id === selectedIssue);
    }

    setFilteredArticles(filtered);
  }, [searchQuery, selectedYear, selectedArea, selectedVolume, selectedIssue, publishedArticles.length]);

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedYear('');
    setSelectedArea('');
    setSelectedVolume('');
    setSelectedIssue('');
  };

  const hasActiveFilters = searchQuery || selectedYear || selectedArea || selectedVolume || selectedIssue;

  const getIssueInfo = (issueId) => {
    const issue = issues.find(i => i.id === issueId);
    if (!issue) return null;
    const volume = volumes.find(v => v.id === issue.volume_id);
    return { issue, volume };
  };

  const formatAuthors = (authors) => {
    if (!authors || authors.length === 0) return 'Unknown Author';
    if (authors.length === 1) return authors[0].name;
    if (authors.length === 2) return `${authors[0].name} and ${authors[1].name}`;
    return `${authors[0].name} et al.`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 py-12 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4 font-serif">
            Latest Published Papers
          </h1>
          <p className="text-lg text-slate-600 max-w-3xl mx-auto">
            Browse our most recent research publications. Use filters to narrow down by year, research area, volume, or issue.
          </p>
          <p className="text-sm text-slate-500 mt-2">
            Total Published: <span className="font-semibold text-amber-600">{publishedArticles.length}</span> papers
          </p>
        </div>

        {/* Search & Filter Bar */}
        <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6 mb-8">
          {/* Search Input */}
          <div className="relative mb-4">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by title, author, keyword, or abstract..."
              className="w-full pl-12 pr-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent text-sm"
            />
          </div>

          {/* Toggle Filters Button */}
          <div className="flex items-center justify-between">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center space-x-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors text-sm font-medium"
            >
              <Filter className="w-4 h-4" />
              <span>{showFilters ? 'Hide Filters' : 'Show Filters'}</span>
            </button>

            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="flex items-center space-x-2 px-4 py-2 bg-rose-100 hover:bg-rose-200 text-rose-700 rounded-lg transition-colors text-sm font-medium"
              >
                <X className="w-4 h-4" />
                <span>Clear All Filters</span>
              </button>
            )}
          </div>

          {/* Filter Dropdowns */}
          {showFilters && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-4 pt-4 border-t border-slate-200">
              {/* Year Filter */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-2">Year</label>
                <select
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                >
                  <option value="">All Years</option>
                  {years.map(year => (
                    <option key={year} value={year}>{year}</option>
                  ))}
                </select>
              </div>

              {/* Research Area Filter */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-2">Research Area</label>
                <select
                  value={selectedArea}
                  onChange={(e) => setSelectedArea(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                >
                  <option value="">All Areas</option>
                  {researchAreas.map(area => (
                    <option key={area.id} value={area.category}>{area.category}</option>
                  ))}
                </select>
              </div>

              {/* Volume Filter */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-2">Volume</label>
                <select
                  value={selectedVolume}
                  onChange={(e) => {
                    setSelectedVolume(e.target.value);
                    setSelectedIssue(''); // Reset issue when volume changes
                  }}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                >
                  <option value="">All Volumes</option>
                  {volumes.map(vol => (
                    <option key={vol.id} value={vol.id}>
                      Volume {vol.volume_number} ({vol.year})
                    </option>
                  ))}
                </select>
              </div>

              {/* Issue Filter */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-2">Issue</label>
                <select
                  value={selectedIssue}
                  onChange={(e) => setSelectedIssue(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  disabled={!selectedVolume}
                >
                  <option value="">All Issues</option>
                  {availableIssues.map(iss => (
                    <option key={iss.id} value={iss.id}>
                      Issue {iss.issue_number} - {iss.month_range}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {/* Active Filters Summary */}
          {hasActiveFilters && (
            <div className="mt-4 pt-4 border-t border-slate-200">
              <p className="text-xs text-slate-600 mb-2 font-semibold">Active Filters:</p>
              <div className="flex flex-wrap gap-2">
                {searchQuery && (
                  <span className="px-3 py-1 bg-amber-100 text-amber-800 text-xs rounded-full font-medium">
                    Search: "{searchQuery}"
                  </span>
                )}
                {selectedYear && (
                  <span className="px-3 py-1 bg-blue-100 text-blue-800 text-xs rounded-full font-medium">
                    Year: {selectedYear}
                  </span>
                )}
                {selectedArea && (
                  <span className="px-3 py-1 bg-green-100 text-green-800 text-xs rounded-full font-medium">
                    Area: {selectedArea}
                  </span>
                )}
                {selectedVolume && (
                  <span className="px-3 py-1 bg-purple-100 text-purple-800 text-xs rounded-full font-medium">
                    Volume: {volumes.find(v => v.id === selectedVolume)?.volume_number}
                  </span>
                )}
                {selectedIssue && (
                  <span className="px-3 py-1 bg-pink-100 text-pink-800 text-xs rounded-full font-medium">
                    Issue: {issues.find(i => i.id === selectedIssue)?.issue_number}
                  </span>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Results Count */}
        <div className="mb-6">
          <p className="text-sm text-slate-600">
            Showing <span className="font-semibold text-slate-900">{filteredArticles.length}</span> {filteredArticles.length === 1 ? 'paper' : 'papers'}
            {hasActiveFilters && ` (filtered from ${publishedArticles.length} total)`}
          </p>
        </div>

        {/* Articles List */}
        {filteredArticles.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl shadow-lg border border-slate-200">
            <BookOpen className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-slate-900 mb-2">No Papers Found</h3>
            <p className="text-slate-600 mb-4">
              {hasActiveFilters 
                ? 'Try adjusting your filters or search query.' 
                : 'No published papers available yet.'}
            </p>
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="px-6 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg font-medium transition-colors"
              >
                Clear Filters
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-6">
            {filteredArticles.map(article => {
              const issueInfo = getIssueInfo(article.issue_id);
              
              return (
                <div key={article.id} className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6 hover:shadow-xl transition-shadow">
                  {/* Issue Badge */}
                  {issueInfo && (
                    <div className="mb-3">
                      <span className="inline-block px-3 py-1 bg-amber-100 text-amber-800 text-xs font-semibold rounded-full">
                        Volume {issueInfo.volume?.volume_number}, Issue {issueInfo.issue?.issue_number} ({issueInfo.issue?.year})
                      </span>
                    </div>
                  )}

                  {/* Title */}
                  <h2 className="text-2xl font-bold text-slate-900 mb-3 hover:text-amber-600 transition-colors">
                    <Link to={`/article/${article.id}`}>{article.title}</Link>
                  </h2>

                  {/* Authors & Date */}
                  <div className="flex flex-wrap items-center gap-4 text-sm text-slate-600 mb-4">
                    <div className="flex items-center space-x-2">
                      <User className="w-4 h-4" />
                      <span>{formatAuthors(article.authors)}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Calendar className="w-4 h-4" />
                      <span>{new Date(article.published_date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                    </div>
                    {article.research_area && (
                      <div className="px-2 py-1 bg-slate-100 text-slate-700 rounded text-xs font-medium">
                        {article.research_area}
                      </div>
                    )}
                  </div>

                  {/* Abstract */}
                  <p className="text-slate-700 leading-relaxed mb-4 line-clamp-3">
                    {article.abstract}
                  </p>

                  {/* Keywords */}
                  {article.keywords && article.keywords.length > 0 && (
                    <div className="mb-4">
                      <p className="text-xs text-slate-500 mb-2">Keywords:</p>
                      <div className="flex flex-wrap gap-2">
                        {article.keywords.map((keyword, idx) => (
                          <span key={idx} className="px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded-full">
                            {keyword}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex flex-wrap items-center gap-3 pt-4 border-t border-slate-200">
                    <Link
                      to={`/article/${article.id}`}
                      className="flex items-center space-x-2 px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg font-medium transition-colors text-sm"
                    >
                      <ExternalLink className="w-4 h-4" />
                      <span>View Full Paper</span>
                    </Link>

                    {article.pdf_url && (
                      <a
                        href={article.pdf_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center space-x-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-medium transition-colors text-sm"
                      >
                        <Download className="w-4 h-4" />
                        <span>Download PDF</span>
                      </a>
                    )}

                    {article.doi && (
                      <a
                        href={`https://doi.org/${article.doi}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                      >
                        DOI: {article.doi}
                      </a>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
