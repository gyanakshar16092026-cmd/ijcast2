import React, { useState } from 'react';
import { useJournal } from '../../context/JournalContext';
import { Plus, Edit, Trash2, CheckCircle2, FolderTree } from 'lucide-react';

export const VolumeManager = () => {
  const { volumes, saveVolume, deleteVolume } = useJournal();
  const [editingVol, setEditingVol] = useState(null);
  const [formData, setFormData] = useState({
    volume_number: 1,
    year: new Date().getFullYear(),
    description: '',
    status: 'Active'
  });

  const handleOpenNew = () => {
    setEditingVol('new');
    setFormData({
      volume_number: volumes.length + 1,
      year: new Date().getFullYear(),
      description: '',
      status: 'Active'
    });
  };

  const handleEdit = (vol) => {
    setEditingVol(vol.id);
    setFormData({
      volume_number: vol.volume_number,
      year: vol.year,
      description: vol.description || '',
      status: vol.status || 'Active'
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    await saveVolume({
      ...(editingVol !== 'new' ? { id: editingVol } : {}),
      ...formData,
      volume_number: Number(formData.volume_number),
      year: Number(formData.year)
    });
    setEditingVol(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <div>
          <h2 className="text-xl font-bold font-serif text-white">Volume Management</h2>
          <p className="text-xs text-slate-400">Add, edit, archive, or delete journal volume records.</p>
          <p className="text-xs text-emerald-400 mt-1">✓ 6 bimonthly issues are automatically created for each new volume</p>
        </div>
        <button
          onClick={handleOpenNew}
          className="flex items-center space-x-1.5 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs rounded-xl shadow transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Volume</span>
        </button>
      </div>

      {/* Editor Modal / Form */}
      {editingVol && (
        <form onSubmit={handleSubmit} className="bg-slate-900 border border-slate-800 p-6 rounded-2xl space-y-4">
          <h3 className="text-sm font-bold text-amber-400 font-serif">
            {editingVol === 'new' ? 'Add New Volume Record' : 'Edit Volume Record'}
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div>
              <label className="block text-slate-300 mb-1">Volume Number</label>
              <input
                type="number"
                required
                value={formData.volume_number}
                onChange={e => setFormData({ ...formData, volume_number: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
              />
            </div>
            <div>
              <label className="block text-slate-300 mb-1">Publication Year</label>
              <input
                type="number"
                required
                value={formData.year}
                onChange={e => setFormData({ ...formData, year: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
              />
            </div>
            <div>
              <label className="block text-slate-300 mb-1">Status</label>
              <select
                value={formData.status}
                onChange={e => setFormData({ ...formData, status: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
              >
                <option value="Active">Active</option>
                <option value="Archived">Archived</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs text-slate-300 mb-1">Description / Editorial Note</label>
            <input
              type="text"
              value={formData.description}
              onChange={e => setFormData({ ...formData, description: e.target.value })}
              placeholder="e.g. Volume 1 (2026) - Relaunched Multidisciplinary Series"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
            />
          </div>

          <div className="flex justify-end space-x-2 pt-2">
            <button
              type="button"
              onClick={() => setEditingVol(null)}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs rounded-xl shadow"
            >
              Save Volume
            </button>
          </div>
        </form>
      )}

      {/* Volumes Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-x-auto">
        <table className="w-full text-left text-xs text-slate-300 min-w-[500px]">
          <thead className="bg-slate-950 text-slate-400 uppercase font-mono text-[10px] border-b border-slate-800">
            <tr>
              <th className="p-4">Volume</th>
              <th className="p-4">Year</th>
              <th className="p-4">Description</th>
              <th className="p-4">Status</th>
              <th className="p-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {volumes.map(vol => (
              <tr key={vol.id} className="hover:bg-slate-800/40">
                <td className="p-4 font-bold text-white font-serif">Volume {vol.volume_number}</td>
                <td className="p-4">{vol.year}</td>
                <td className="p-4 text-slate-400">{vol.description || 'N/A'}</td>
                <td className="p-4">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    vol.status === 'Active' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-800 text-slate-400'
                  }`}>
                    {vol.status}
                  </span>
                </td>
                <td className="p-4 text-right space-x-2">
                  <button onClick={() => handleEdit(vol)} className="p-1.5 bg-slate-800 hover:bg-slate-700 text-amber-400 rounded-lg">
                    <Edit className="w-3.5 h-3.5" />
                  </button>
                  <button onClick={() => deleteVolume(vol.id)} className="p-1.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 rounded-lg">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
