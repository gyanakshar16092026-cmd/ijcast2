import React, { useState } from 'react';
import { useJournal } from '../../context/JournalContext';
import { Plus, Edit, Trash2, Tag } from 'lucide-react';

export const ResearchAreaManager = () => {
  const { researchAreas, saveResearchArea, deleteResearchArea } = useJournal();
  const [editingArea, setEditingArea] = useState(null);
  const [formData, setFormData] = useState({ category: '', subcategories: '' });

  const handleOpenNew = () => {
    setEditingArea('new');
    setFormData({ category: '', subcategories: '' });
  };

  const handleEdit = (ra) => {
    setEditingArea(ra.id);
    setFormData({
      category: ra.category,
      subcategories: Array.isArray(ra.subcategories) ? ra.subcategories.join(', ') : ra.subcategories || ''
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const subArray = formData.subcategories.split(',').map(s => s.trim()).filter(Boolean);
    await saveResearchArea({
      ...(editingArea !== 'new' ? { id: editingArea } : {}),
      category: formData.category,
      subcategories: subArray
    });
    setEditingArea(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <div>
          <h2 className="text-xl font-bold font-serif text-white">Research Areas Management</h2>
          <p className="text-xs text-slate-400">Add, edit, or delete multidisciplinary domain categories and subcategories.</p>
        </div>

        <button
          onClick={handleOpenNew}
          className="flex items-center space-x-1.5 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs rounded-xl shadow transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Add Category</span>
        </button>
      </div>

      {editingArea && (
        <form onSubmit={handleSubmit} className="bg-slate-900 border border-slate-800 p-6 rounded-2xl space-y-4">
          <h3 className="text-sm font-bold text-amber-400 font-serif">
            {editingArea === 'new' ? 'Add Research Category' : 'Edit Research Category'}
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block text-slate-300 mb-1">Category Title</label>
              <input
                type="text"
                required
                value={formData.category}
                onChange={e => setFormData({ ...formData, category: e.target.value })}
                placeholder="Commerce & Management"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
              />
            </div>
            <div>
              <label className="block text-slate-300 mb-1">Subcategories (Comma Separated)</label>
              <input
                type="text"
                required
                value={formData.subcategories}
                onChange={e => setFormData({ ...formData, subcategories: e.target.value })}
                placeholder="Banking, Finance, Marketing, HR"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
              />
            </div>
          </div>

          <div className="flex justify-end space-x-2 pt-2">
            <button
              type="button"
              onClick={() => setEditingArea(null)}
              className="px-4 py-2 bg-slate-800 text-slate-300 text-xs font-semibold rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs rounded-xl shadow"
            >
              Save Category
            </button>
          </div>
        </form>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {researchAreas.map(ra => (
          <div key={ra.id} className="bg-slate-900 border border-slate-800 p-6 rounded-2xl space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold font-serif text-white">{ra.category}</h3>
              <div className="flex items-center space-x-2">
                <button onClick={() => handleEdit(ra)} className="p-1 bg-slate-800 text-amber-400 rounded">
                  <Edit className="w-3.5 h-3.5" />
                </button>
                <button onClick={() => deleteResearchArea(ra.id)} className="p-1 bg-rose-500/10 text-rose-400 rounded">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            <div className="flex flex-wrap gap-1">
              {ra.subcategories.map((sub, i) => (
                <span key={i} className="px-2 py-0.5 bg-slate-950 text-slate-300 text-[10px] rounded border border-slate-800">
                  {sub}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

