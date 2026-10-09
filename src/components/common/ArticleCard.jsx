import React, { useState } from 'react';
import { useJournal } from '../../context/JournalContext';
import { Link } from 'react-router-dom';
import { FileText, Download, ExternalLink, ChevronDown, ChevronUp, Copy, Check, Quote, Calendar, Tag, ShieldCheck } from 'lucide-react';

export const ArticleCard = ({ article }) => {
  const { volumes, issues, setPdfModalData, settings } = useJournal();
  const [showAbstract, setShowAbstract] = useState(false);
  const [showCitation, setShowCitation] = useState(false);
  const [copiedCitation, setCopiedCitation] = useState(false);

  const issueObj = issues.find(i => i.id === article.issue_id);
  const volObj = issueObj ? volumes.find(v => v.id === issueObj.volume_id) : null;

  // Citation generator formatting
  const mainAuthor = article.authors?.[0]?.name || 'IJRT Author';
  // PHASE 11: Use current year as fallback instead of hardcoded 2026  
  const yearStr = issueObj ? issueObj.year : new Date().getFullYear();
  const volStr = volObj ? `Vol. ${volObj.volume_number}` : '';
  const issStr = issueObj ? `No. ${issueObj.issue_number}` : '';

  // PHASE 10: Fixed citation formatting - only include DOI when actually present
  const apaCitation = `${mainAuthor} et al. (${yearStr}). ${article.title}. ${settings.journal_name}, ${volStr}(${issStr}), ${article.page_numbers || '1-10'}.${article.doi ? ` https://doi.org/${article.doi}` : ''}`;

  const handleCopyCitation = () => {
    navigator.clipboard.writeText(apaCitation);
    setCopiedCitation(true);
    setTimeout(() => setCopiedCitation(false), 2000);
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm hover:shadow-md transition-all space-y-4">
      {/* Badges & Meta */}
      <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
        <div className="flex flex-wrap items-center gap-2">
          <span className="px-2.5 py-1 bg-amber-50 text-amber-800 font-semibold border border-amber-200/60 rounded-lg">
            {article.research_area}
          </span>
          <span className="px-2 py-0.5 bg-slate-100 text-slate-700 font-medium rounded">
            {article.article_type || 'Research Paper'}
          </span>
          {volObj && issueObj && (
            <span className="text-slate-500 font-medium">
              Vol. {volObj.volume_number} | Issue {issueObj.issue_number} ({issueObj.year})
            </span>
          )}
        </div>
        {article.published_date && (
          <span className="text-slate-500 flex items-center space-x-1">
            <Calendar className="w-3.5 h-3.5 text-slate-400" />
            <span>Published: {article.published_date}</span>
          </span>
        )}
      </div>

      {/* Title */}
      <h3 className="text-lg font-bold text-slate-900 font-serif leading-snug hover:text-amber-700 transition-colors">
        <Link to={`/article/${article.id}`}>{article.title}</Link>
      </h3>

      {/* Authors & Affiliations */}
      <div className="text-xs text-slate-700 space-y-1">
        <p className="font-medium text-slate-900">
          {article.authors?.map((a, idx) => (
            <span key={idx}>
              {a.name}
              {a.is_corresponding && <sup className="text-amber-600 font-bold ml-0.5">*</sup>}
              {idx < article.authors.length - 1 ? ', ' : ''}
            </span>
          ))}
        </p>
        <p className="text-slate-500 text-[11px] line-clamp-1">
          {article.authors?.map(a => a.affiliation).filter(Boolean).join(' | ')}
        </p>
      </div>

      {/* DOI & Pages */}
      <div className="flex flex-wrap items-center gap-4 text-xs text-slate-600 border-t border-slate-100 pt-3">
        {article.doi && (
          <span className="flex items-center space-x-1">
            <span className="font-semibold text-slate-700">DOI:</span>
            <a
              href={`https://doi.org/${article.doi}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-amber-700 hover:underline font-mono text-[11px]"
            >
              https://doi.org/{article.doi}
            </a>
          </span>
        )}
        {article.page_numbers && (
          <span><strong>Pages:</strong> {article.page_numbers}</span>
        )}
      </div>

      {/* Abstract Toggle */}
      {article.abstract && (
        <div>
          <button
            onClick={() => setShowAbstract(!showAbstract)}
            className="flex items-center space-x-1 text-xs font-semibold text-amber-700 hover:text-amber-800 transition-colors"
          >
            <span>{showAbstract ? 'Hide Abstract' : 'View Abstract'}</span>
            {showAbstract ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
          {showAbstract && (
            <div className="mt-2 p-4 bg-slate-50 border border-slate-100 rounded-xl text-xs text-slate-700 leading-relaxed">
              <p className="font-semibold text-slate-900 mb-1">Abstract:</p>
              <p>{article.abstract}</p>

              {article.keywords && article.keywords.length > 0 && (
                <div className="mt-3 flex flex-wrap items-center gap-1.5 pt-2 border-t border-slate-200/60">
                  <span className="font-semibold text-slate-900">Keywords:</span>
                  {article.keywords.map((kw, i) => (
                    <span key={i} className="px-2 py-0.5 bg-white border border-slate-200 text-slate-600 rounded text-[11px]">
                      {kw}
                    </span>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Actions: View Article, Citation, Preview PDF, Download PDF */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
        <div className="flex flex-wrap items-center gap-2">
          <Link
            to={`/article/${article.id}`}
            className="px-3 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-medium rounded-lg transition-colors"
          >
            View Full Article
          </Link>
          <button
            onClick={() => setShowCitation(!showCitation)}
            className="flex items-center space-x-1 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium rounded-lg transition-colors"
          >
            <Quote className="w-3.5 h-3.5 text-slate-500" />
            <span>Cite</span>
          </button>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {article.pdf_url && (
            <>
              <button
                onClick={() => setPdfModalData({ url: article.pdf_url, title: article.title })}
                className="flex items-center space-x-1 px-3 py-2 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 text-xs font-medium rounded-lg transition-colors"
              >
                <FileText className="w-3.5 h-3.5" />
                <span>Preview PDF</span>
              </button>
              <a
                href={article.pdf_url}
                download
                className="flex items-center space-x-1 px-3 py-2 bg-amber-600 hover:bg-amber-700 text-white text-xs font-medium rounded-lg shadow-sm transition-colors"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download PDF</span>
              </a>
            </>
          )}
        </div>
      </div>

      {/* Citation Box */}
      {showCitation && (
        <div className="p-3 bg-amber-50/70 border border-amber-200/80 rounded-xl text-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="font-semibold text-amber-900">Format: APA Citation</span>
            <button
              onClick={handleCopyCitation}
              className="flex items-center space-x-1 text-amber-800 hover:text-amber-950 font-medium"
            >
              {copiedCitation ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedCitation ? 'Copied' : 'Copy Citation'}</span>
            </button>
          </div>
          <p className="font-mono text-slate-800 text-[11px] bg-white p-2.5 rounded border border-amber-200/50 leading-relaxed select-all">
            {apaCitation}
          </p>
        </div>
      )}
    </div>
  );
};


