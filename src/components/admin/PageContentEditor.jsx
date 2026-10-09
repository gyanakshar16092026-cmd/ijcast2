import React, { useState } from 'react';
import { useJournal } from '../../context/JournalContext';
import { FileCode, Save, Check } from 'lucide-react';

export const PageContentEditor = () => {
  const { pageContents, savePageContent } = useJournal();

  const [selectedPage, setSelectedPage] = useState('about');
  const [selectedSection, setSelectedSection] = useState('history');

  const currentContentObj = pageContents.find(p => p.page_key === selectedPage && p.section_key === selectedSection);

  const [title, setTitle] = useState(currentContentObj?.title || '');
  const [content, setContent] = useState(currentContentObj?.content || '');
  const [saved, setSaved] = useState(false);

  const handleSelectSection = (pageKey, sectionKey) => {
    setSelectedPage(pageKey);
    setSelectedSection(sectionKey);
    const obj = pageContents.find(p => p.page_key === pageKey && p.section_key === sectionKey);
    setTitle(obj?.title || '');
    setContent(obj?.content || '');
  };

  const handleSave = async (e) => {
    e.preventDefault();
    await savePageContent(selectedPage, selectedSection, title, content);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const sectionsList = [
    { page: 'about', section: 'history', label: 'About: Journal History & Revival' },
    { page: 'ethics', section: 'ai_policy', label: 'Publication Ethics: AI / Generative AI Policy' },
    { page: 'apc', section: 'charges', label: 'APC: Processing Charges & Refund Policy' },
    { page: 'privacy', section: 'editorial_privacy', label: 'Privacy Policy: Data Protection' },
    { page: 'copyright', section: 'terms', label: 'Copyright & Licensing Terms' },
    { page: 'other', section: 'custom_section', label: 'Other Content: Custom Page Announcement' },
  ];

  return (
    <div className="space-y-6">
      <div className="border-b border-slate-800 pb-4">
        <h2 className="text-xl font-bold font-serif text-white">Website Pages Content Editor (CMS)</h2>
        <p className="text-xs text-slate-400">Edit static content sections for About, Policies, Contact, and Other custom sections.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Section Selector */}
        <div className="lg:col-span-4 bg-slate-900 border border-slate-800 p-4 rounded-2xl space-y-2">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider px-2 py-1">Select Page Section</h3>
          {sectionsList.map(item => {
            const isActive = selectedPage === item.page && selectedSection === item.section;
            return (
              <button
                key={`${item.page}-${item.section}`}
                onClick={() => handleSelectSection(item.page, item.section)}
                className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-medium transition-colors ${
                  isActive ? 'bg-amber-500 text-slate-950 font-bold shadow' : 'text-slate-300 hover:bg-slate-800'
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </div>

        {/* Right Column: Content Form */}
        <div className="lg:col-span-8 bg-slate-900 border border-slate-800 p-6 rounded-2xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="text-sm font-bold text-amber-400 font-serif">
              Editing: Page '{selectedPage}' / Section '{selectedSection}'
            </h3>
            {saved && (
              <span className="flex items-center space-x-1 text-xs text-emerald-400 font-bold">
                <Check className="w-4 h-4" />
                <span>Saved to Supabase / Local CMS</span>
              </span>
            )}
          </div>

          <form onSubmit={handleSave} className="space-y-4 text-xs">
            <div>
              <label className="block text-slate-300 mb-1">Section Title</label>
              <input
                type="text"
                value={title}
                onChange={e => setTitle(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
              />
            </div>

            <div>
              <label className="block text-slate-300 mb-1">Section Content (Markdown & Text Supported)</label>
              <textarea
                rows={12}
                value={content}
                onChange={e => setContent(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-4 text-xs text-white font-mono leading-relaxed"
              />
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                className="flex items-center space-x-2 px-6 py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs rounded-xl shadow transition-colors"
              >
                <Save className="w-4 h-4" />
                <span>Save Section Changes</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

