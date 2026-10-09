import React, { useState, useEffect } from 'react';
import { useJournal } from '../context/JournalContext';
import { useLocation } from 'react-router-dom';
import { BookOpen, History, Target, ShieldCheck, Clock, Award, Building, Compass } from 'lucide-react';

export const About = () => {
  const { settings, pageContents } = useJournal();
  const { hash } = useLocation();
  const [activeTab, setActiveTab] = useState('about');

  // Sync active tab with hash from URL
  useEffect(() => {
    const id = hash.replace('#', '');
    const validTabs = ['about', 'aims', 'scope', 'history', 'frequency', 'open-access', 'publisher'];
    if (validTabs.includes(id)) setActiveTab(id);
  }, [hash]);

  const historyContent = pageContents.find(p => p.page_key === 'about' && p.section_key === 'history')?.content || `The **International Journal of Research in Technology (IJRT)** was originally established to provide a dedicated academic forum for technology research and innovation. 

Following a strategic editorial revitalization in 2026, IJCAST was relaunched as a modernized, open-access, multidisciplinary peer-reviewed publication. The journal continues its legacy of rigorous academic oversight while introducing seamless digital archiving, universal DOI integration, and enhanced editorial standards.`;

  const tabs = [
    { id: 'about', label: 'About IJCAST', icon: BookOpen },
    { id: 'aims', label: 'Aims & Objectives', icon: Target },
    { id: 'scope', label: 'Scope of Journal', icon: Compass },
    { id: 'history', label: 'Journal History', icon: History },
    { id: 'frequency', label: 'Publication Frequency', icon: Clock },
    { id: 'open-access', label: 'Open Access Policy', icon: ShieldCheck },
    { id: 'publisher', label: 'Publisher Information', icon: Building },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-8 py-12 space-y-10">
      {/* Page Header */}
      <div className="bg-slate-900 text-white p-8 sm:p-12 rounded-3xl border border-slate-800 shadow-xl space-y-4">
        <div className="inline-flex items-center space-x-2 px-3 py-1 bg-amber-500/10 border border-amber-500/20 text-amber-400 rounded-full text-xs font-semibold uppercase">
          <span>Journal Profile & Policies</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold font-serif">About IJRT Journal</h1>
        <p className="text-sm text-slate-300 max-w-3xl leading-relaxed">
          Comprehensive information regarding the International Journal of Research in Technology, its editorial ethos, and publishing framework.
        </p>
      </div>

      {/* Sub-Navigation Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-slate-200 pb-4">
        {tabs.map((t) => {
          const Icon = t.icon;
          const isActive = activeTab === t.id;
          return (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              className={`flex items-center space-x-2 px-4 py-3 rounded-xl text-xs font-bold transition-all ${
                isActive
                  ? 'bg-amber-600 text-white shadow-md'
                  : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{t.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab Content Display */}
      <div id="tab-content" className="bg-white p-8 sm:p-10 rounded-2xl border border-slate-200 shadow-sm space-y-6">
        {activeTab === 'about' && (
          <div id="about" className="space-y-4">
            <h2 className="text-2xl font-bold font-serif text-slate-900 border-b border-slate-100 pb-3">About IJRT</h2>
            <p className="text-sm text-slate-700 leading-relaxed">
              The <strong>International Journal of Research in Technology (IJRT)</strong> is a peer-reviewed academic journal. IJRT provides an open-access platform for academics, scientists, research scholars, and industry professionals to publish innovative research findings in technology and related fields.
            </p>
            <p className="text-sm text-slate-700 leading-relaxed">
              The journal enforces double-blind peer review to maintain high editorial standards, ensuring all published works contribute substantially to global academic literature.
            </p>
          </div>
        )}

        {activeTab === 'aims' && (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold font-serif text-slate-900 border-b border-slate-100 pb-3">Aims & Objectives</h2>
            <ul className="space-y-3 text-sm text-slate-700 list-disc pl-5 leading-relaxed">
              <li>To provide a global multidisciplinary open-access forum for original research papers, reviews, and case studies.</li>
              <li>To bridge the gap between technological innovation, commercial applications, and socio-humanistic insights.</li>
              <li>To uphold rigorous double-blind peer-review standards and ethical publishing practices.</li>
              <li>To ensure universal research visibility through DOI assignment and international metadata indexing.</li>
            </ul>
          </div>
        )}

        {activeTab === 'scope' && (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold font-serif text-slate-900 border-b border-slate-100 pb-3">Scope of the Journal</h2>
            <p className="text-sm text-slate-700 leading-relaxed">
              IJCAST accepts papers across eight core multidisciplinary domains:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              {[
                'Commerce & Management Studies',
                'Arts & Humanities',
                'Social Sciences & Public Policy',
                'Pure & Applied Sciences',
                'Computer Science & Artificial Intelligence',
                'Engineering & Applied Technologies',
                'Educational Pedagogy & Technology',
                'Interdisciplinary & Cross-Domain Research'
              ].map((domain, idx) => (
                <div key={idx} className="p-3 bg-slate-50 border border-slate-100 rounded-xl text-xs font-semibold text-slate-800 flex items-center space-x-2">
                  <div className="w-2 h-2 rounded-full bg-amber-600"></div>
                  <span>{domain}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'history' && (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold font-serif text-slate-900 border-b border-slate-100 pb-3">Journal History & Revival Relaunch</h2>
            <div className="prose prose-slate text-sm text-slate-700 leading-relaxed space-y-3">
              {historyContent.split('\n\n').map((paragraph, idx) => (
                <p key={idx}>{paragraph}</p>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'frequency' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold font-serif text-slate-900 border-b border-slate-100 pb-3">Publication Frequency</h2>
            <p className="text-sm text-slate-700 leading-relaxed">
              IJCAST publishes on a <strong>Bimonthly</strong> schedule — <strong>6 issues per volume year</strong>. Each issue covers a 2-month period as follows:
            </p>

            {/* 6 Bimonthly issue cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 text-xs">
              {[
                { num: 1, months: 'January – February',   label: 'Number 1',  color: 'bg-amber-50 border-amber-200 text-amber-900' },
                { num: 2, months: 'March – April',        label: 'Number 2',  color: 'bg-sky-50 border-sky-200 text-sky-900' },
                { num: 3, months: 'May – June',           label: 'Number 3',  color: 'bg-emerald-50 border-emerald-200 text-emerald-900' },
                { num: 4, months: 'July – August',        label: 'Number 4',  color: 'bg-purple-50 border-purple-200 text-purple-900' },
                { num: 5, months: 'September – October',  label: 'Number 5',  color: 'bg-rose-50 border-rose-200 text-rose-900' },
                { num: 6, months: 'November – December',  label: 'Number 6',  color: 'bg-indigo-50 border-indigo-200 text-indigo-900' },
              ].map((iss) => (
                <div key={iss.num} className={`p-4 border rounded-2xl space-y-2 text-center shadow-sm ${iss.color}`}>
                  <p className="text-2xl font-extrabold font-serif opacity-30">0{iss.num}</p>
                  <p className="font-bold text-sm">Issue {iss.num}</p>
                  <p className="font-semibold text-xs">{iss.months}</p>
                  <span className="inline-block px-2 py-0.5 bg-white/60 rounded-full text-[9px] font-bold uppercase tracking-wider border border-current/20">
                    {iss.label}
                  </span>
                </div>
              ))}
            </div>

            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-600 space-y-1">
              <p><strong className="text-slate-800">Volume Year:</strong> One volume per calendar year, containing 6 bimonthly issues.</p>
              <p><strong className="text-slate-800">Submission Deadline:</strong> Manuscripts are accepted on a rolling basis throughout the year.</p>
              <p><strong className="text-slate-800">Publication Mode:</strong> Open Access — all articles freely available online immediately upon publication.</p>
            </div>
          </div>
        )}

        {activeTab === 'open-access' && (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold font-serif text-slate-900 border-b border-slate-100 pb-3">Open Access Policy</h2>
            <p className="text-sm text-slate-700 leading-relaxed">
              {settings.open_access_statement || 'IJCAST is an open access journal. All published articles are immediately available online without subscription fees.'}
            </p>
            <p className="text-sm text-slate-700 leading-relaxed">
              Articles are licensed under the Creative Commons Attribution 4.0 International License (CC BY 4.0), permitting unrestricted use, distribution, and reproduction in any medium, provided the original work is properly cited.
            </p>
          </div>
        )}

        {activeTab === 'publisher' && (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold font-serif text-slate-900 border-b border-slate-100 pb-3">Publisher Information</h2>
            <div className="p-5 bg-slate-50 border border-slate-200 rounded-xl space-y-2 text-sm text-slate-700">
              <p><strong>Publisher Name:</strong> {settings.publisher}</p>
              {settings.eissn && <p><strong>e-ISSN (Online):</strong> {settings.eissn}</p>}
              <p><strong>Official Email:</strong> {settings.contact_email}</p>
              <p><strong>Postal Address:</strong> {settings.postal_address}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

