import React from 'react';
import { useJournal } from '../context/JournalContext';
import { ShieldCheck, Lock } from 'lucide-react';

export const Privacy = () => {
  const { settings, pageContents } = useJournal();

  const privacyContent = pageContents.find(p => p.page_key === 'privacy' && p.section_key === 'editorial_privacy')?.content || `The names, institutional affiliations, and email addresses entered into the IJRT website will be used exclusively for the stated academic purposes of this journal. They will not be made available for any other purpose or shared with third parties.`;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-8 py-12 space-y-10">
      {/* Header */}
      <div className="bg-slate-900 text-white p-8 sm:p-12 rounded-3xl border border-slate-800 shadow-xl space-y-4">
        <div className="inline-flex items-center space-x-2 px-3 py-1 bg-amber-500/10 border border-amber-500/20 text-amber-400 rounded-full text-xs font-semibold uppercase tracking-wider">
          <Lock className="w-3.5 h-3.5" />
          <span>Data Protection</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold font-serif">Privacy Policy</h1>
        <p className="text-sm text-slate-300 max-w-3xl leading-relaxed">
          Editorial data protection terms and author privacy statement.
        </p>
      </div>

      {/* Content */}
      <div className="bg-white p-8 sm:p-12 rounded-2xl border border-slate-200 shadow-sm space-y-6">
        <h2 className="text-xl font-bold font-serif text-slate-900 border-b border-slate-100 pb-2">Editorial Data Protection Statement</h2>
        <div className="prose prose-slate text-sm text-slate-700 leading-relaxed font-sans">
          <p>{privacyContent}</p>
        </div>

        <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2 text-xs text-slate-600">
          <h4 className="font-bold text-slate-900 text-sm">Key Privacy Guarantees:</h4>
          <ul className="list-disc pl-5 space-y-1">
            <li>Author email addresses and personal metadata are used solely for manuscript correspondence and attribution.</li>
            <li>No personal data is sold, rented, or commercialized to external advertising networks.</li>
            <li>Reviewer identities remain strictly confidential under double-blind peer review protocols.</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

