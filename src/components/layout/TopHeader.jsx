import React from 'react';
import { useJournal } from '../../context/JournalContext';
import { Search, Globe, Award, BookOpen, Layers } from 'lucide-react';

export const TopHeader = () => {
  const { settings, setIsSearchOpen, setIsSubmitOpen } = useJournal();

  return (
    <div className="bg-slate-950 text-slate-300 text-xs border-b border-slate-800 py-2.5 px-4 sm:px-8">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3">
        {/* ISSN & Journal Metadata Specs */}
        <div className="flex flex-wrap items-center justify-center md:justify-start gap-4">
          {settings.issn && (
            <span className="flex items-center space-x-1 text-slate-200 font-medium">
              <Award className="w-3.5 h-3.5 text-amber-500" />
              <span>{settings.issn}</span>
            </span>
          )}
          {settings.eissn && (
            <span className="flex items-center space-x-1 text-slate-300">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
              <span>{settings.eissn}</span>
            </span>
          )}
          {settings.doi_prefix && (
            <span className="flex items-center space-x-1 text-slate-400 hidden sm:inline-flex">
              <span className="text-slate-500 font-semibold">DOI Prefix:</span>
              <span className="font-mono text-slate-300">{settings.doi_prefix}</span>
            </span>
          )}
          {settings.publication_frequency && (
            <span className="text-slate-400 hidden md:inline-flex border-l border-slate-800 pl-4">
              <span>{settings.publication_frequency}</span>
            </span>
          )}
          {/* Submission Always Open */}
          <span className="hidden sm:flex items-center space-x-2 px-3 py-1.5 bg-gradient-to-r from-amber-500 to-amber-600 rounded-lg text-slate-950 font-bold shadow-md shadow-amber-500/30">
            <span className="w-2 h-2 rounded-full bg-slate-950/40 animate-pulse flex-shrink-0"></span>
            <span>Submission: Always Open</span>
          </span>
        </div>

        {/* Global Search & Quick CTA */}
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setIsSearchOpen(true)}
            className="flex items-center space-x-2 px-3 py-2 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-200 rounded-lg transition-colors"
            title="Search articles (Ctrl+K)"
          >
            <Search className="w-3.5 h-3.5 text-amber-500" />
            <span>Search Articles...</span>
          </button>
          <button
            onClick={() => setIsSubmitOpen(true)}
            className="px-3 py-2 bg-amber-600 hover:bg-amber-500 text-white font-semibold rounded-lg shadow-sm transition-colors text-xs"
          >
            Submit Manuscript
          </button>
        </div>
      </div>
    </div>
  );
};
