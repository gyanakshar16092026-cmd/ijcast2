import React from 'react';
import { useJournal } from '../context/JournalContext';
import { ShieldCheck, BookOpen, CheckCircle2, Lock } from 'lucide-react';

export const Copyright = () => {
  const { settings } = useJournal();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-8 py-12 space-y-10">
      {/* Header */}
      <div className="bg-slate-900 text-white p-8 sm:p-12 rounded-3xl border border-slate-800 shadow-xl space-y-4">
        <div className="inline-flex items-center space-x-2 px-3 py-1 bg-amber-500/10 border border-amber-500/20 text-amber-400 rounded-full text-xs font-semibold uppercase tracking-wider">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Rights & Licensing</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold font-serif">Copyright & Licensing Policy</h1>
        <p className="text-sm text-slate-300 max-w-3xl leading-relaxed">
          Comprehensive terms regarding author copyright ownership, publisher rights, reader reuse terms, and open-access licensing.
        </p>
      </div>

      {/* Main Grid */}
      <div className="bg-white p-8 sm:p-12 rounded-2xl border border-slate-200 shadow-sm space-y-8">
        <div className="space-y-3">
          <h2 className="text-xl font-bold font-serif text-slate-900 border-b border-slate-100 pb-2">1. Author Copyright Ownership</h2>
          <p className="text-sm text-slate-700 leading-relaxed">
            Authors publishing in IJRT retain full copyright ownership of their scholarly work. Authors grant the publisher a non-exclusive license to publish, archive, and distribute the article under an open-access format.
          </p>
        </div>

        <div className="space-y-3">
          <h2 className="text-xl font-bold font-serif text-slate-900 border-b border-slate-100 pb-2">2. Reader Reuse & Licensing Terms</h2>
          <p className="text-sm text-slate-700 leading-relaxed">
            Unless otherwise specified, all articles published in IJRT are licensed under the <strong>{settings.license_name || 'Creative Commons Attribution 4.0 International License (CC BY 4.0)'}</strong>.
          </p>
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 space-y-2">
            <p className="font-semibold text-slate-900">Under CC BY 4.0 terms, readers are free to:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li><strong>Share</strong> — Copy and redistribute the material in any medium or format.</li>
              <li><strong>Adapt</strong> — Remix, transform, and build upon the material for any purpose.</li>
            </ul>
            <p className="pt-1 text-slate-500">Provided proper credit is given to the original authors and IJRT is cited as the original venue of publication.</p>
          </div>
        </div>

        <div className="space-y-3">
          <h2 className="text-xl font-bold font-serif text-slate-900 border-b border-slate-100 pb-2">3. Rights Granted to Publisher</h2>
          <ul className="space-y-2 text-sm text-slate-700 list-disc pl-5 leading-relaxed">
            <li>The right to publish, reproduce, display, and distribute the article worldwide in digital and print formats.</li>
            <li>The right to deposit published article metadata into international abstracting services, indexing databases, and crossref repositories.</li>
          </ul>
        </div>
      </div>
    </div>
  );
};


