import React, { useState, useEffect } from 'react';
import { useJournal } from '../../context/JournalContext';
import { Plus, Edit, Trash2, ArrowUp, ArrowDown, BookMarked, Layers } from 'lucide-react';

export const IssueManager = () => {
  const { volumes, issues, saveIssue, deleteIssue, reorderIssues } = useJournal();

  const [selectedVolId, setSelectedVolId] = useState('');
  const [editingIssue, setEditingIssue] = useState(null);

  // Sync selectedVolId when volumes arrive
  useEffect(() => {
    if (volumes.length > 0 && !selectedVolId) {
      setSelectedVolId(volumes[0].id);
    }
  }, [volumes, selectedVolId]);

  const currentVolume = volumes.find(v => v.id === selectedVolId) || volumes[0];

  const [formData, setFormData] = useState({
    volume_id: '',
    issue_number: 1,
    month_range: 'January - June',
    year: new Date().getFullYear(),
    pub_date: new Date().toISOString().split('T')[0],
    cover_url: '',
    editorial_note: ''
  });

  const filteredIssues = issues
    .filter(i => !selectedVolId || i.volume_id === selectedVolId)
    .sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0));

  const handleOpenNew = () => {
    const volId = selectedVolId || volumes[0]?.id || '';
    const volObj = volumes.find(v => v.id === volId) || volumes[0];
    const volIssues = issues.filter(i => i.volume_id === volId);

    setEditingIssue('new');
    setFormData({
      volume_id: volId,
      issue_number: volIssues.length + 1,
      month_range: 'January - June',
      year: volObj ? volObj.year : new Date().getFullYear(),
      pub_date: new Date().toISOString().split('T')[0],
      cover_url: '',
      editorial_note: ''
    });
  };

  const handleEdit = (iss) => {
    setEditingIssue(iss.id);
    setFormData({
      volume_id: iss.volume_id,
      issue_number: iss.issue_number,
      month_range: iss.month_range,
      year: iss.year,
      pub_date: iss.pub_date || '',
      cover_url: iss.cover_url || '',
      editorial_note: iss.editorial_note || ''
    });
  };

  const handleTargetVolumeChange = (volId) => {
    const volObj = volumes.find(v => v.id === volId);
    setFormData(prev => ({
      ...prev,
      volume_id: volId,
      year: volObj ? volObj.year : prev.year
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const targetVol = volumes.find(v => v.id === formData.volume_id);

    await saveIssue({
      ...(editingIssue !== 'new' ? { id: editingIssue } : {}),
      ...formData,
      volume_id: formData.volume_id || volumes[0]?.id,
      issue_number: Number(formData.issue_number),
      year: targetVol ? targetVol.year : Number(formData.year)
    });
    setEditingIssue(null);
  };

  const moveUp = (index) => {
    if (index === 0) return;
    const reordered = [...filteredIssues];
    const temp = reordered[index];
    reordered[index] = reordered[index - 1];
    reordered[index - 1] = temp;
    reorderIssues(reordered.map((item, idx) => ({ ...item, sort_order: idx + 1 })));
  };

  const moveDown = (index) => {
    if (index === filteredIssues.length - 1) return;
    const reordered = [...filteredIssues];
    const temp = reordered[index];
    reordered[index] = reordered[index + 1];
    reordered[index + 1] = temp;
    reorderIssues(reordered.map((item, idx) => ({ ...item, sort_order: idx + 1 })));
  };

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <h2 className="text-xl font-bold font-serif text-white">Issue / Number Management</h2>
          <p className="text-xs text-slate-400">Inside each Volume: Add, Edit, Delete, and Reorder Issues (e.g. Volume 15, Number 1, January–June 2026).</p>
        </div>

        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2">
            <span className="text-xs text-slate-400 font-medium hidden sm:inline">Select Volume:</span>
            <select
              value={selectedVolId}
              onChange={e => setSelectedVolId(e.target.value)}
              className="bg-slate-900 border border-amber-500/40 text-xs text-amber-400 font-bold rounded-xl px-3 py-2"
            >
              <option value="">All Volumes</option>
              {volumes.map(v => (
                <option key={v.id} value={v.id}>Volume {v.volume_number} ({v.year})</option>
              ))}
            </select>
          </div>

          <button
            onClick={handleOpenNew}
            className="flex items-center space-x-1.5 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs rounded-xl shadow transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Number/Issue</span>
          </button>
        </div>
      </div>

      {/* Editor Form Modal */}
      {editingIssue && (
        <form onSubmit={handleSubmit} className="bg-slate-900 border border-slate-800 p-6 rounded-2xl space-y-4 shadow-2xl">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="text-sm font-bold text-amber-400 font-serif">
              {editingIssue === 'new' ? 'Add New Issue inside Volume' : 'Edit Issue / Number Details'}
            </h3>
            <button type="button" onClick={() => setEditingIssue(null)} className="text-xs text-slate-400 hover:text-white">Cancel</button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            {/* Target Volume Selection */}
            <div>
              <label className="block text-slate-300 font-medium mb-1">Target Volume (Select Volume)</label>
              <select
                required
                value={formData.volume_id}
                onChange={e => handleTargetVolumeChange(e.target.value)}
                className="w-full bg-slate-950 border border-amber-500/40 rounded-xl px-3 py-2 text-amber-400 font-bold"
              >
                <option value="">Choose Volume</option>
                {volumes.map(v => (
                  <option key={v.id} value={v.id}>
                    Volume {v.volume_number} ({v.year})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-slate-300 font-medium mb-1">Number / Issue</label>
              <input
                type="number"
                required
                value={formData.issue_number}
                onChange={e => setFormData({ ...formData, issue_number: e.target.value })}
                placeholder="1"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-medium mb-1">Month (e.g. January–June)</label>
              <input
                type="text"
                required
                value={formData.month_range}
                onChange={e => setFormData({ ...formData, month_range: e.target.value })}
                placeholder="January–June"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div>
              <label className="block text-slate-300 font-medium mb-1">Year</label>
              <input
                type="number"
                required
                value={formData.year}
                onChange={e => setFormData({ ...formData, year: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-medium mb-1">Publication Date</label>
              <input
                type="date"
                value={formData.pub_date}
                onChange={e => setFormData({ ...formData, pub_date: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-medium mb-1">Issue Cover Image URL</label>
              <input
                type="text"
                value={formData.cover_url}
                onChange={e => setFormData({ ...formData, cover_url: e.target.value })}
                placeholder="https://..."
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs text-slate-300 mb-1">Editorial Note, if applicable</label>
            <textarea
              rows={2}
              value={formData.editorial_note}
              onChange={e => setFormData({ ...formData, editorial_note: e.target.value })}
              placeholder="e.g. Special issue on Interdisciplinary Advances"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
            />
          </div>

          <div className="flex justify-end space-x-2 pt-2 border-t border-slate-800">
            <button
              type="button"
              onClick={() => setEditingIssue(null)}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs rounded-xl shadow"
            >
              Save Issue Record
            </button>
          </div>
        </form>
      )}

      {/* Issues Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-x-auto shadow-xl">
        <table className="w-full text-left text-xs text-slate-300 min-w-[600px]">
          <thead className="bg-slate-950 text-slate-400 uppercase font-mono text-[10px] border-b border-slate-800">
            <tr>
              <th className="p-4">Reorder</th>
              <th className="p-4">Volume & Issue (Format Example)</th>
              <th className="p-4">Month & Year</th>
              <th className="p-4">Publication Date</th>
              <th className="p-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {filteredIssues.map((iss, idx) => {
              const vol = volumes.find(v => v.id === iss.volume_id);
              const formattedTitle = `Volume ${vol?.volume_number || 1}, Number ${iss.issue_number}, ${iss.month_range} ${iss.year}`;
              return (
                <tr key={iss.id} className="hover:bg-slate-800/40 transition-colors">
                  <td className="p-4">
                    <div className="flex items-center space-x-1">
                      <button
                        onClick={() => moveUp(idx)}
                        disabled={idx === 0}
                        title="Move Up in Issue Order"
                        className="p-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded disabled:opacity-30"
                      >
                        <ArrowUp className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => moveDown(idx)}
                        disabled={idx === filteredIssues.length - 1}
                        title="Move Down in Issue Order"
                        className="p-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded disabled:opacity-30"
                      >
                        <ArrowDown className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                  <td className="p-4">
                    <p className="font-bold text-white font-serif">{formattedTitle}</p>
                    {iss.editorial_note && <p className="text-[11px] text-slate-400 italic">"{iss.editorial_note}"</p>}
                  </td>
                  <td className="p-4 font-semibold text-amber-400">{iss.month_range} ({iss.year})</td>
                  <td className="p-4 text-slate-300">{iss.pub_date || 'N/A'}</td>
                  <td className="p-4 text-right space-x-2">
                    <button
                      onClick={() => handleEdit(iss)}
                      title="Edit Issue"
                      className="p-1.5 bg-slate-800 hover:bg-slate-700 text-amber-400 rounded-lg transition-colors"
                    >
                      <Edit className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => deleteIssue(iss.id)}
                      title="Delete Issue"
                      className="p-1.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

