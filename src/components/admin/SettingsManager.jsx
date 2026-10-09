import React, { useState } from 'react';
import { useJournal } from '../../context/JournalContext';
import { Settings, Save, Check } from 'lucide-react';

export const SettingsManager = () => {
  const { settings, updateSettings } = useJournal();
  const [formData, setFormData] = useState({ ...settings });
  const [saved, setSaved] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    await updateSettings(formData);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <div>
          <h2 className="text-xl font-bold font-serif text-white">Journal System Settings</h2>
          <p className="text-xs text-slate-400">Configure global metadata, e-ISSN, contact details, and licensing settings.</p>
        </div>

        {saved && (
          <span className="flex items-center space-x-1 text-xs text-emerald-400 font-bold bg-emerald-500/10 px-3 py-1.5 rounded-xl border border-emerald-500/30">
            <Check className="w-4 h-4" />
            <span>Settings Saved!</span>
          </span>
        )}
      </div>

      <form onSubmit={handleSubmit} className="bg-slate-900 border border-slate-800 p-6 rounded-2xl space-y-6">
        {/* Basic Metadata */}
        <div className="space-y-4">
          <h3 className="text-xs font-bold text-amber-400 uppercase tracking-wider border-b border-slate-800 pb-2">Journal Identity</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block text-slate-300 mb-1">Journal Full Name</label>
              <input
                type="text"
                required
                value={formData.journal_name}
                onChange={e => setFormData({ ...formData, journal_name: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
              />
            </div>
            <div>
              <label className="block text-slate-300 mb-1">Journal Short Name</label>
              <input
                type="text"
                required
                value={formData.short_name}
                onChange={e => setFormData({ ...formData, short_name: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block text-slate-300 mb-1">Online e-ISSN</label>
              <input
                type="text"
                value={formData.eissn}
                onChange={e => setFormData({ ...formData, eissn: e.target.value })}
                placeholder="e-ISSN XXXX-XXXX"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono"
              />
            </div>
            <div>
              <label className="block text-slate-300 mb-1">DOI Prefix</label>
              <input
                type="text"
                value={formData.doi_prefix}
                onChange={e => setFormData({ ...formData, doi_prefix: e.target.value })}
                placeholder="10.5281/IJRT"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div>
              <label className="block text-slate-300 mb-1">Publisher Name</label>
              <input
                type="text"
                value={formData.publisher}
                onChange={e => setFormData({ ...formData, publisher: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
              />
            </div>
            <div>
              <label className="block text-slate-300 mb-1">Publication Frequency</label>
              <input
                type="text"
                value={formData.publication_frequency}
                onChange={e => setFormData({ ...formData, publication_frequency: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
              />
            </div>
            <div>
              <label className="block text-slate-300 mb-1">Primary Language</label>
              <input
                type="text"
                value={formData.language}
                onChange={e => setFormData({ ...formData, language: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
              />
            </div>
          </div>
        </div>

        {/* Contact Info */}
        <div className="space-y-4">
          <h3 className="text-xs font-bold text-amber-400 uppercase tracking-wider border-b border-slate-800 pb-2">Official Contact & Communications</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div>
              <label className="block text-slate-300 mb-1">Official Submission Email</label>
              <input
                type="email"
                required
                value={formData.contact_email}
                onChange={e => setFormData({ ...formData, contact_email: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono"
              />
            </div>
            <div>
              <label className="block text-slate-300 mb-1">Secondary Office Email</label>
              <input
                type="email"
                value={formData.alternate_email}
                onChange={e => setFormData({ ...formData, alternate_email: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono"
              />
            </div>
            <div>
              <label className="block text-slate-300 mb-1">Phone Number</label>
              <input
                type="text"
                value={formData.phone}
                onChange={e => setFormData({ ...formData, phone: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs text-slate-300 mb-1">Postal Address</label>
            <input
              type="text"
              value={formData.postal_address}
              onChange={e => setFormData({ ...formData, postal_address: e.target.value })}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
            />
          </div>
        </div>

        {/* Licensing & Open Access */}
        <div className="space-y-4">
          <h3 className="text-xs font-bold text-amber-400 uppercase tracking-wider border-b border-slate-800 pb-2">Open Access & Licensing Terms</h3>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block text-slate-300 mb-1">Creative Commons License Name</label>
              <input
                type="text"
                value={formData.license_name}
                onChange={e => setFormData({ ...formData, license_name: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
              />
            </div>
            <div>
              <label className="block text-slate-300 mb-1">Open Access Status</label>
              <label className="flex items-center space-x-2 pt-2 text-slate-200">
                <input
                  type="checkbox"
                  checked={formData.is_open_access}
                  onChange={e => setFormData({ ...formData, is_open_access: e.target.checked })}
                  className="rounded text-amber-500"
                />
                <span>Enable Open Access Designation for Journal</span>
              </label>
            </div>
          </div>

          <div>
            <label className="block text-xs text-slate-300 mb-1">Copyright Statement</label>
            <input
              type="text"
              value={formData.copyright_statement}
              onChange={e => setFormData({ ...formData, copyright_statement: e.target.value })}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
            />
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <button
            type="submit"
            className="flex items-center space-x-2 px-6 py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs rounded-xl shadow transition-colors"
          >
            <Save className="w-4 h-4" />
            <span>Save Global Journal Settings</span>
          </button>
        </div>
      </form>
    </div>
  );
};


