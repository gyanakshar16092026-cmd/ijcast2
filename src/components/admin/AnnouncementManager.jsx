import React, { useState } from 'react';
import { useJournal } from '../../context/JournalContext';
import { Plus, Trash2, Edit, X, Save, Check, Bell, Eye, EyeOff } from 'lucide-react';

const TYPES = [
  { value: 'call_for_papers', label: 'Call for Papers', color: 'bg-amber-500/20 text-amber-400 border-amber-500/30' },
  { value: 'new_issue',       label: 'New Issue Published', color: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' },
  { value: 'indexing',        label: 'Indexing / Recognition', color: 'bg-sky-500/20 text-sky-400 border-sky-500/30' },
  { value: 'general',         label: 'General Notice', color: 'bg-slate-500/20 text-slate-300 border-slate-500/30' },
];

const emptyForm = {
  title: '',
  message: '',
  type: 'call_for_papers',
  expires_at: '',
  is_active: true,
};

export const AnnouncementManager = () => {
  const { announcements, saveAnnouncement, deleteAnnouncement, toggleAnnouncement } = useJournal();
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saved, setSaved] = useState(false);

  const openAdd = () => { setForm(emptyForm); setEditingId(null); setShowForm(true); };
  const openEdit = (ann) => {
    setForm({ title: ann.title, message: ann.message, type: ann.type, expires_at: ann.expires_at || '', is_active: ann.is_active });
    setEditingId(ann.id);
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    await saveAnnouncement(editingId ? { ...form, id: editingId } : form);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
    setShowForm(false);
    setEditingId(null);
    setForm(emptyForm);
  };

  const typeInfo = (type) => TYPES.find(t => t.value === type) || TYPES[3];

  const today = new Date().toISOString().split('T')[0];
  const activeAnns = announcements.filter(a => a.is_active && (!a.expires_at || a.expires_at >= today));
  const inactiveAnns = announcements.filter(a => !a.is_active || (a.expires_at && a.expires_at < today));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b border-slate-800 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs uppercase font-bold text-amber-500 tracking-wider">Newsflash</span>
          <h2 className="text-xl font-bold font-serif text-white">Announcement Manager</h2>
          <p className="text-xs text-slate-400 mt-0.5">Create and manage newsflash banners shown on the public home page.</p>
        </div>
        <div className="flex items-center gap-2">
          {saved && (
            <span className="flex items-center space-x-1 text-xs text-emerald-400 font-bold bg-emerald-500/10 px-3 py-1.5 rounded-xl border border-emerald-500/30">
              <Check className="w-4 h-4" /><span>Saved!</span>
            </span>
          )}
          <button onClick={openAdd} className="flex items-center space-x-2 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs rounded-xl shadow transition-colors">
            <Plus className="w-4 h-4" /><span>New Announcement</span>
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 text-center">
          <p className="text-2xl font-bold text-white">{announcements.length}</p>
          <p className="text-slate-400 mt-0.5">Total</p>
        </div>
        <div className="bg-slate-900 border border-emerald-800/40 rounded-xl p-4 text-center">
          <p className="text-2xl font-bold text-emerald-400">{activeAnns.length}</p>
          <p className="text-slate-400 mt-0.5">Live Now</p>
        </div>
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 text-center">
          <p className="text-2xl font-bold text-slate-400">{inactiveAnns.length}</p>
          <p className="text-slate-400 mt-0.5">Inactive / Expired</p>
        </div>
      </div>

      {/* Form */}
      {showForm && (
        <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="text-sm font-bold text-white font-serif">{editingId ? 'Edit Announcement' : 'New Announcement'}</h3>
            <button type="button" onClick={() => setShowForm(false)} className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors">
              <X className="w-4 h-4" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-300 mb-1">Announcement Type *</label>
                <select required value={form.type} onChange={e => setForm({ ...form, type: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white">
                  {TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-slate-300 mb-1">Expiry Date (leave blank = never expires)</label>
                <input type="date" value={form.expires_at} onChange={e => setForm({ ...form, expires_at: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white" />
              </div>
            </div>

            <div>
              <label className="block text-slate-300 mb-1">Headline / Title *</label>
              <input type="text" required value={form.title} onChange={e => setForm({ ...form, title: e.target.value })}
                placeholder="e.g. Call for Papers — Volume 2, Issue 1 (Jan–Mar 2027)"
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white" />
            </div>

            <div>
              <label className="block text-slate-300 mb-1">Full Message *</label>
              <textarea required rows={3} value={form.message} onChange={e => setForm({ ...form, message: e.target.value })}
                placeholder="e.g. Submissions are open for Issue 1. Submit manuscripts to editor.ijcast.in@gmail.com by December 31, 2026."
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white resize-none" />
            </div>

            <div className="flex items-center space-x-3">
              <input type="checkbox" id="ann-active" checked={form.is_active} onChange={e => setForm({ ...form, is_active: e.target.checked })}
                className="rounded text-amber-500" />
              <label htmlFor="ann-active" className="text-slate-300">Show on public home page immediately</label>
            </div>

            <div className="flex justify-end pt-2">
              <button type="submit" className="flex items-center space-x-2 px-5 py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-xl shadow transition-colors">
                <Save className="w-4 h-4" /><span>{editingId ? 'Update' : 'Publish Announcement'}</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* List */}
      <div className="space-y-3">
        {announcements.length === 0 ? (
          <div className="text-center py-16 bg-slate-900 border border-slate-800 rounded-2xl text-slate-400 text-sm">
            <Bell className="w-10 h-10 mx-auto mb-3 text-slate-600" />
            <p>No announcements yet. Click "New Announcement" to create one.</p>
          </div>
        ) : (
          announcements.map(ann => {
            const ti = typeInfo(ann.type);
            const isExpired = ann.expires_at && ann.expires_at < today;
            return (
              <div key={ann.id} className={`bg-slate-900 border rounded-2xl p-5 space-y-2 ${isExpired ? 'border-rose-800/30 opacity-60' : 'border-slate-800'}`}>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0 space-y-1.5">
                    <div className="flex flex-wrap items-center gap-2 text-[10px]">
                      <span className={`px-2.5 py-1 rounded-lg font-bold border ${ti.color}`}>{ti.label}</span>
                      {ann.is_active && !isExpired && <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded font-bold">● LIVE</span>}
                      {isExpired && <span className="px-2 py-0.5 bg-rose-500/20 text-rose-400 rounded font-bold">EXPIRED</span>}
                      {!ann.is_active && !isExpired && <span className="px-2 py-0.5 bg-slate-700 text-slate-400 rounded font-bold">INACTIVE</span>}
                      {ann.expires_at && <span className="text-slate-500">Expires: {ann.expires_at}</span>}
                    </div>
                    <h4 className="text-sm font-bold text-white font-serif">{ann.title}</h4>
                    <p className="text-xs text-slate-400 leading-relaxed">{ann.message}</p>
                  </div>
                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    <button onClick={() => toggleAnnouncement(ann.id)} title={ann.is_active ? 'Deactivate' : 'Activate'}
                      className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors">
                      {ann.is_active ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                    <button onClick={() => openEdit(ann)}
                      className="p-2 rounded-xl bg-slate-800 hover:bg-amber-500/20 text-slate-400 hover:text-amber-400 transition-colors">
                      <Edit className="w-4 h-4" />
                    </button>
                    <button onClick={() => deleteAnnouncement(ann.id)}
                      className="p-2 rounded-xl bg-slate-800 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

