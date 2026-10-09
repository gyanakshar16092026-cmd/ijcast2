import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useJournal } from '../context/JournalContext';
import { FileText, Download, ExternalLink, Quote, Calendar, Award, Mail, ShieldCheck, ArrowLeft, Copy, Check } from 'lucide-react';

export const ArticleDetail = () => {
  const { id } = useParams();
  const { articles, volumes, issues, settings, setPdfModalData } = useJournal();
  const [citationFormat, setCitationFormat] = useState('APA');
  const [copied, setCopied] = useState(false);

  const article = articles.find(a => a.id === id);

  // PHASE 9: CRITICAL FIX - Prevent public access to unpublished articles
  if (!article || !article.is_published) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center space-y-4">
        <h2 className="text-2xl font-bold font-serif text-slate-900">Article Not Found</h2>
        <p className="text-sm text-slate-500">The requested article could not be found or has been unpublished.</p>
        <Link to="/current-issue" className="inline-block px-4 py-2 bg-amber-600 text-white font-bold rounded-xl text-xs">
          Return to Current Issue
        </Link>
      </div>
    );
  }

  const issueObj = issues.find(i => i.id === article.issue_id);
  const volObj = issueObj ? volumes.find(v => v.id === issueObj.volume_id) : null;

  const mainAuthor = article.authors?.[0]?.name || 'IJRT Author';
  // PHASE 11: Use current year as fallback instead of hardcoded 2026
  const yearStr = issueObj ? issueObj.year : new Date().getFullYear();
  const volStr = volObj ? `Vol. ${volObj.volume_number}` : '';
  const issStr = issueObj ? `No. ${issueObj.issue_number}` : '';
  const pagesStr = article.page_numbers || '1-10';

  // PHASE 10: Fixed citation formatting - only include DOI when actually present
  // PHASE 11: Use actual volume/issue numbers from database, fallback to current year
  const apaCitation = `${mainAuthor} et al. (${yearStr}). ${article.title}. ${settings.journal_name}, ${volStr}(${issStr}), ${pagesStr}.${article.doi ? ` https://doi.org/${article.doi}` : ''}`;
  const mlaCitation = `${mainAuthor}, et al. "${article.title}." ${settings.journal_name}, vol. ${volObj?.volume_number || 'N/A'}, no. ${issueObj?.issue_number || 'N/A'}, ${yearStr}, pp. ${pagesStr}.`;
  const bibtexCitation = `@article{IJRT_${article.id},\n  title={${article.title}},\n  author={${article.authors?.map(a => a.name).join(' and ')}},\n  journal={${settings.journal_name}},\n  volume={${volObj?.volume_number || 'N/A'}},\n  number={${issueObj?.issue_number || 'N/A'}},\n  pages={${pagesStr}},\n  year={${yearStr}}${article.doi ? `,\n  doi={${article.doi}}` : ''}\n}`;

  const currentCitation = citationFormat === 'APA' ? apaCitation : citationFormat === 'MLA' ? mlaCitation : bibtexCitation;

  const handleCopyCitation = () => {
    navigator.clipboard.writeText(currentCitation);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-8 py-12 space-y-10">
      {/* Back Link */}
      <Link to="/current-issue" className="inline-flex items-center space-x-1.5 text-xs font-bold text-amber-700 hover:text-amber-800">
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Current Issue</span>
      </Link>

      {/* Article Header & Main Card */}
      <div className="bg-white p-8 sm:p-12 rounded-3xl border border-slate-200 shadow-sm space-y-6">
        {/* Badges */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span className="px-3 py-1 bg-amber-50 text-amber-900 font-bold border border-amber-200 rounded-lg">
            {article.research_area}
          </span>
          <span className="px-2.5 py-1 bg-slate-100 text-slate-700 font-medium rounded-lg">
            {article.article_type || 'Research Paper'}
          </span>
          {volObj && issueObj && (
            <span className="text-slate-500 font-medium">
              Volume {volObj.volume_number} | Issue {issueObj.issue_number} ({issueObj.year})
            </span>
          )}
        </div>

        {/* Title */}
        <h1 className="text-2xl sm:text-4xl font-bold font-serif text-slate-900 leading-tight">
          {article.title}
        </h1>

        {/* Authors & Corresponding Author */}
        <div className="p-6 bg-slate-50 border border-slate-100 rounded-2xl space-y-3">
          <h4 className="text-xs uppercase font-bold text-slate-500 tracking-wider">Authors & Affiliations</h4>
          <div className="space-y-2">
            {article.authors?.map((a, idx) => (
              <div key={idx} className="text-xs space-y-0.5">
                <div className="flex items-center space-x-2">
                  <span className="font-bold text-slate-900 text-sm">{a.name}</span>
                  {a.is_corresponding && (
                    <span className="px-2 py-0.5 bg-amber-100 text-amber-800 text-[10px] font-bold rounded">
                      Corresponding Author
                    </span>
                  )}
                  {a.orcid && (
                    <a href={`https://orcid.org/${a.orcid}`} target="_blank" rel="noopener noreferrer" className="flex items-center space-x-1 text-emerald-700 hover:underline font-mono text-[11px]">
                      <Award className="w-3.5 h-3.5 text-emerald-600" />
                      <span>{a.orcid}</span>
                    </a>
                  )}
                </div>
                <p className="text-slate-600 text-xs">{a.affiliation}</p>
                {a.email && <p className="text-slate-500 text-[11px] font-mono">Email: {a.email}</p>}
              </div>
            ))}
          </div>

          {article.corresponding_author_email && (
            <div className="pt-2 border-t border-slate-200/60 text-xs text-amber-900 flex items-center space-x-2">
              <Mail className="w-4 h-4 text-amber-700" />
              <span><strong>Corresponding Author Email:</strong> {article.corresponding_author_email}</span>
            </div>
          )}
        </div>

        {/* Key Timeline Dates & DOI */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs bg-slate-900 text-white p-4 rounded-2xl">
          {article.received_date && (
            <div>
              <span className="text-slate-400 text-[11px] block">Received Date:</span>
              <span className="font-semibold text-slate-200">{article.received_date}</span>
            </div>
          )}
          {article.revised_date && (
            <div>
              <span className="text-slate-400 text-[11px] block">Revised Date:</span>
              <span className="font-semibold text-slate-200">{article.revised_date}</span>
            </div>
          )}
          {article.accepted_date && (
            <div>
              <span className="text-slate-400 text-[11px] block">Accepted Date:</span>
              <span className="font-semibold text-slate-200">{article.accepted_date}</span>
            </div>
          )}
          {article.published_date && (
            <div>
              <span className="text-slate-400 text-[11px] block">Published Date:</span>
              <span className="font-semibold text-amber-400">{article.published_date}</span>
            </div>
          )}
        </div>

        {/* DOI Link */}
        {article.doi && (
          <div className="p-4 bg-amber-50/80 border border-amber-200 rounded-2xl flex items-center justify-between text-xs text-amber-950">
            <div>
              <span className="font-semibold text-slate-700 mr-2">Digital Object Identifier (DOI):</span>
              <a
                href={`https://doi.org/${article.doi}`}
                target="_blank"
                rel="noopener noreferrer"
                className="font-mono font-bold text-amber-800 hover:underline"
              >
                https://doi.org/{article.doi}
              </a>
            </div>
            <span className="text-[10px] bg-amber-200 text-amber-900 font-bold px-2 py-0.5 rounded">Clickable DOI</span>
          </div>
        )}

        {/* Abstract */}
        <div className="space-y-3 pt-2">
          <h3 className="text-lg font-bold font-serif text-slate-900 border-b border-slate-100 pb-2">Abstract</h3>
          <p className="text-sm text-slate-700 leading-relaxed font-sans">{article.abstract}</p>

          {article.keywords && article.keywords.length > 0 && (
            <div className="flex flex-wrap items-center gap-2 pt-3">
              <span className="text-xs font-bold text-slate-900">Keywords:</span>
              {article.keywords.map((kw, i) => (
                <span key={i} className="px-2.5 py-1 bg-slate-100 text-slate-700 text-xs rounded-lg font-medium">
                  {kw}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* PDF Actions Banner */}
        {article.pdf_url && (
          <div className="p-6 bg-slate-950 text-white rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-amber-500/20 text-amber-400 rounded-xl">
                <FileText className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-sm font-bold font-serif text-white">Full Manuscript PDF</h4>
                <p className="text-xs text-slate-400">Download or open complete article document</p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => setPdfModalData({ url: article.pdf_url, title: article.title })}
                className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl border border-slate-700 transition-colors"
              >
                Preview PDF
              </button>
              <a
                href={article.pdf_url}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl border border-slate-700 transition-colors inline-flex items-center space-x-1"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>Open PDF</span>
              </a>
              <a
                href={article.pdf_url}
                download
                className="px-5 py-2.5 bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs rounded-xl shadow transition-colors inline-flex items-center space-x-1.5"
              >
                <Download className="w-4 h-4" />
                <span>Download PDF</span>
              </a>
            </div>
          </div>
        )}

        {/* Citation Generator */}
        <div className="p-6 bg-slate-50 border border-slate-200 rounded-2xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-200 pb-3">
            <h4 className="text-sm font-bold font-serif text-slate-900 flex items-center space-x-2">
              <Quote className="w-4 h-4 text-amber-600" />
              <span>Cite This Article</span>
            </h4>

            <div className="flex flex-wrap items-center gap-2 text-xs">
              {['APA', 'MLA', 'BibTeX'].map(fmt => (
                <button
                  key={fmt}
                  onClick={() => setCitationFormat(fmt)}
                  className={`px-3 py-2 rounded-lg font-semibold transition-colors ${
                    citationFormat === fmt ? 'bg-amber-600 text-white' : 'bg-white text-slate-600 border border-slate-200'
                  }`}
                >
                  {fmt}
                </button>
              ))}
            </div>
          </div>

          <div className="relative">
            <pre className="p-4 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 font-mono whitespace-pre-wrap leading-relaxed select-all">
              {currentCitation}
            </pre>
            <button
              onClick={handleCopyCitation}
              className="absolute top-3 right-3 px-3 py-1.5 bg-slate-900 text-white text-xs font-medium rounded-lg shadow flex items-center space-x-1 hover:bg-slate-800 transition-colors"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied' : 'Copy'}</span>
            </button>
          </div>
        </div>

        {/* References Section */}
        {article.references && (
          <div className="space-y-3 pt-4 border-t border-slate-100">
            <h3 className="text-lg font-bold font-serif text-slate-900">References</h3>
            <div className="p-5 bg-slate-50 border border-slate-100 rounded-2xl text-xs text-slate-700 leading-relaxed font-mono whitespace-pre-wrap">
              {article.references}
            </div>
          </div>
        )}

        {/* Licensing & Copyright */}
        <div className="p-4 bg-slate-100 border border-slate-200 rounded-2xl flex items-center space-x-3 text-xs text-slate-700">
          <ShieldCheck className="w-5 h-5 text-amber-700 flex-shrink-0" />
          <div>
            <p className="font-semibold text-slate-900">{settings.license_name || 'Creative Commons Attribution 4.0 International (CC BY 4.0)'}</p>
            <p className="text-[11px] text-slate-600">{settings.copyright_statement}</p>
          </div>
        </div>
      </div>
    </div>
  );
};


