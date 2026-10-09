import React from 'react';
import { useJournal } from '../context/JournalContext';
import { Award, CheckCircle2, Clock, ShieldCheck } from 'lucide-react';

export const Indexing = () => {
  const { settings } = useJournal();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-8 py-12 space-y-10">
      {/* Header */}
      <div className="bg-slate-900 text-white p-8 sm:p-12 rounded-3xl border border-slate-800 shadow-xl space-y-4">
        <div className="inline-flex items-center space-x-2 px-3 py-1 bg-amber-500/10 border border-amber-500/20 text-amber-400 rounded-full text-xs font-semibold uppercase tracking-wider">
          <Award className="w-3.5 h-3.5" />
          <span>Academic Recognition</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold font-serif">Indexing & Abstracting</h1>
        <p className="text-sm text-slate-300 max-w-3xl leading-relaxed">
          Official indexing repositories, digital databases, and scientific abstracting services listing IJRT research publications.
        </p>
      </div>

      {/* Currently Indexed Section */}
      <div className="space-y-6">
        <div className="border-b border-slate-200 pb-3">
          <span className="text-xs uppercase font-bold text-amber-700 tracking-wider">Active Listings</span>
          <h2 className="text-2xl font-bold font-serif text-slate-900">Currently Listed & Indexed Services</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {[
            { name: 'Google Scholar', desc: 'Full-text automated index for academic literature search.', status: 'Active' },
            { name: 'Crossref', desc: 'Official DOI registration agency for scholarly publication metadata.', status: 'Active' },
            { name: 'ORCID Directory', desc: 'Author identifier and publication linkage repository.', status: 'Active' },
            { name: 'ROAD (Directory of Open Access Scholarly Resources)', desc: 'UNESCO & ISSN International Centre repository.', status: 'Active' },
            { name: 'PKP Index & Open Archives Initiative (OAI-PMH)', desc: 'Protocol for metadata harvesting standards.', status: 'Active' },
            { name: 'ResearchBib & Eurasian Scientific Journal Index', desc: 'International academic database index.', status: 'Active' },
          ].map((item, idx) => (
            <div key={idx} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-2">
              <div className="flex items-center justify-between">
                <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold rounded flex items-center space-x-1">
                  <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                  <span>{item.status}</span>
                </span>
              </div>
              <h3 className="text-base font-bold text-slate-900 font-serif">{item.name}</h3>
              <p className="text-xs text-slate-600 leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Under Application Section */}
      <div className="space-y-6 pt-4">
        <div className="border-b border-slate-200 pb-3">
          <span className="text-xs uppercase font-bold text-amber-700 tracking-wider">Genuine Verification</span>
          <h2 className="text-2xl font-bold font-serif text-slate-900">Under Application & Evaluation</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {[
            { name: 'DOAJ (Directory of Open Access Journals)', desc: 'Application in progress following volume criteria.' },
            { name: 'EBSCO Academic Search Repository', desc: 'Under formal evaluation by database review team.' },
            { name: 'ICI Journals Master List', desc: 'Index Copernicus evaluation in progress.' }
          ].map((item, idx) => (
            <div key={idx} className="bg-slate-50 p-6 rounded-2xl border border-slate-200 space-y-2">
              <span className="px-2 py-0.5 bg-amber-100 text-amber-900 text-[10px] font-bold rounded flex items-center space-x-1 w-max">
                <Clock className="w-3 h-3 text-amber-700" />
                <span>Under Evaluation</span>
              </span>
              <h3 className="text-base font-bold text-slate-900 font-serif">{item.name}</h3>
              <p className="text-xs text-slate-600 leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};


