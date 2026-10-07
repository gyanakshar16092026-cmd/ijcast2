import React, { useState, useRef } from 'react';
import { useJournal } from '../../context/JournalContext';
import { Plus, Edit, Trash2, CheckCircle2, XCircle, Users, ArrowUp, ArrowDown, Upload, Image as ImageIcon, Link as LinkIcon, X } from 'lucide-react';

export const EditorialManager = () => {
  const { editorialMembers, saveEditorialMember, deleteEditorialMember, toggleEditorialActive, reorderEditorialMembers, testStorageBuckets } = useJournal();
  const [editingMember, setEditingMember] = useState(null);

  const moveUp = (index) => {
    if (index === 0) return;
    const reordered = [...editorialMembers];
    const temp = reordered[index];
    reordered[index] = reordered[index - 1];
    reordered[index - 1] = temp;
    reorderEditorialMembers(reordered);
  };

  const moveDown = (index) => {
    if (index === editorialMembers.length - 1) return;
    const reordered = [...editorialMembers];
    const temp = reordered[index];
    reordered[index] = reordered[index + 1];
    reordered[index + 1] = temp;
    reorderEditorialMembers(reordered);
  };

  const initialForm = {
    name: '',
    role: 'Associate Editors',
    designation: '',
    institution: '',
    department: '',
    country: '',
    email: '',
    orcid: '',
    photo_url: '/gyan-akshar-logo.png',
    bio: '',
    research_area: '',
    is_active: true
  };

  const [formData, setFormData] = useState(initialForm);
  const [photoMode, setPhotoMode] = useState('upload'); // 'upload' | 'url'
  const [photoDragActive, setPhotoDragActive] = useState(false);
  const [uploadedPhotoName, setUploadedPhotoName] = useState('');
  const photoInputRef = useRef(null);

  const handlePhotoFile = (file) => {
    if (!file) return;
    const isImage = file.type.startsWith('image/') || file.name.match(/\.(jpg|jpeg|png|webp|gif)$/i);
    if (!isImage) { alert('Please upload an image file (JPG, PNG, WEBP).'); return; }
    const reader = new FileReader();
    reader.onload = (e) => {
      setFormData(prev => ({ ...prev, photo_url: e.target.result }));
      setUploadedPhotoName(file.name);
    };
    reader.readAsDataURL(file);
  };

  const handlePhotoDrag = (e) => {
    e.preventDefault(); e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') setPhotoDragActive(true);
    else if (e.type === 'dragleave') setPhotoDragActive(false);
  };

  const handlePhotoDrop = (e) => {
    e.preventDefault(); e.stopPropagation();
    setPhotoDragActive(false);
    if (e.dataTransfer.files?.[0]) handlePhotoFile(e.dataTransfer.files[0]);
  };

  const handleOpenNew = () => {
    setEditingMember('new');
    setFormData(initialForm);
    setPhotoMode('upload');
    setUploadedPhotoName('');
  };

  const handleEdit = (mem) => {
    setEditingMember(mem.id);
    setPhotoMode(mem.photo_url && !mem.photo_url.startsWith('data:') ? 'url' : 'upload');
    setUploadedPhotoName('');
    setFormData({
      name: mem.name,
      role: mem.role,
      designation: mem.designation || '',
      institution: mem.institution,
      department: mem.department || '',
      country: mem.country,
      email: mem.email || '',
      orcid: mem.orcid || '',
      photo_url: mem.photo_url || '',
      bio: mem.bio || '',
      research_area: mem.research_area || '',
      is_active: mem.is_active ?? true
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    await saveEditorialMember({
      ...(editingMember !== 'new' ? { id: editingMember } : {}),
      ...formData
    });
    setEditingMember(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <div>
          <h2 className="text-xl font-bold font-serif text-white">Editorial Board Management</h2>
          <p className="text-xs text-slate-400">Add, Edit, Delete, Activate/Deactivate, and Reorder editorial board members.</p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => {
              console.log('🔍 EDITORIAL MEMBERS DEBUG:', editorialMembers);
              editorialMembers.forEach((mem, idx) => {
                console.log(`${idx + 1}. ${mem.name}:`);
                console.log(`   - ID: ${mem.id}`);
                console.log(`   - Photo URL: ${mem.photo_url || '(no photo)'}`);
                console.log(`   - Active: ${mem.is_active}`);
                console.log(`   - Role: ${mem.role}`);
              });
              alert(`📊 Editorial Members Debug Info\n\nTotal members: ${editorialMembers.length}\nActive members: ${editorialMembers.filter(m => m.is_active).length}\n\nCheck browser console for detailed photo URL info`);
            }}
            className="flex items-center space-x-1.5 px-3 py-2 bg-blue-800 hover:bg-blue-700 text-blue-200 font-semibold text-xs rounded-xl shadow transition-colors border border-blue-700"
            title="Debug editorial member data and photo URLs"
          >
            <Users className="w-4 h-4" />
            <span>Debug Data</span>
          </button>
          
          <button
            onClick={testStorageBuckets}
            className="flex items-center space-x-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs rounded-xl shadow transition-colors border border-slate-700"
            title="Test if storage buckets exist for image uploads"
          >
            <Upload className="w-4 h-4" />
            <span>Test Storage</span>
          </button>
          
          <button
            onClick={handleOpenNew}
            className="flex items-center space-x-1.5 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs rounded-xl shadow transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>+ Add Editor</span>
          </button>
        </div>
      </div>

      {/* Form Modal */}
      {editingMember && (
        <form onSubmit={handleSubmit} className="bg-slate-900 border border-slate-800 p-6 rounded-2xl space-y-4">
          <h3 className="text-sm font-bold text-amber-400 font-serif">
            {editingMember === 'new' ? 'Add New Editorial Board Member' : 'Edit Member Profile'}
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block text-slate-300 mb-1">Full Name</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
              />
            </div>

            <div>
              <label className="block text-slate-300 mb-1">Editorial Role / Position</label>
              <select
                value={formData.role}
                onChange={e => setFormData({ ...formData, role: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
              >
                <option value="Editor-in-Chief">Editor-in-Chief</option>
                <option value="Managing Editor">Managing Editor</option>
                <option value="Technical Advisory Board">Technical Advisory Board</option>
                <option value="Associate Editors">Associate Editors</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div>
              <label className="block text-slate-300 mb-1">Designation</label>
              <input
                type="text"
                value={formData.designation}
                onChange={e => setFormData({ ...formData, designation: e.target.value })}
                placeholder="Senior Professor of Economics"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
              />
            </div>

            <div>
              <label className="block text-slate-300 mb-1">Institution</label>
              <input
                type="text"
                required
                value={formData.institution}
                onChange={e => setFormData({ ...formData, institution: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
              />
            </div>

            <div>
              <label className="block text-slate-300 mb-1">Department</label>
              <input
                type="text"
                value={formData.department}
                onChange={e => setFormData({ ...formData, department: e.target.value })}
                placeholder="Department of Commerce"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div>
              <label className="block text-slate-300 mb-1">Country</label>
              <input
                type="text"
                required
                value={formData.country}
                onChange={e => setFormData({ ...formData, country: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
              />
            </div>

            <div>
              <label className="block text-slate-300 mb-1">Email</label>
              <input
                type="email"
                value={formData.email}
                onChange={e => setFormData({ ...formData, email: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono"
              />
            </div>

            <div>
              <label className="block text-slate-300 mb-1">ORCID ID</label>
              <input
                type="text"
                value={formData.orcid}
                onChange={e => setFormData({ ...formData, orcid: e.target.value })}
                placeholder="0000-0001-8842-1200"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="space-y-2">
              <label className="block text-slate-300">Profile Photo</label>

              {/* Mode toggle */}
              <div className="flex items-center gap-2">
                <button type="button" onClick={() => setPhotoMode('upload')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${photoMode === 'upload' ? 'bg-amber-500 text-slate-950' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}>
                  <Upload className="w-3.5 h-3.5" /> Upload Image
                </button>
                <button type="button" onClick={() => setPhotoMode('url')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${photoMode === 'url' ? 'bg-amber-500 text-slate-950' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}>
                  <LinkIcon className="w-3.5 h-3.5" /> Paste URL
                </button>
              </div>

              {/* Drag & drop zone */}
              {photoMode === 'upload' && (
                <div
                  onDragEnter={handlePhotoDrag} onDragOver={handlePhotoDrag}
                  onDragLeave={handlePhotoDrag} onDrop={handlePhotoDrop}
                  onClick={() => photoInputRef.current?.click()}
                  className={`rounded-xl border-2 border-dashed p-4 cursor-pointer transition-all ${
                    photoDragActive ? 'border-amber-400 bg-amber-500/10'
                    : (uploadedPhotoName || (formData.photo_url && formData.photo_url.startsWith('data:')))
                    ? 'border-emerald-500/50 bg-emerald-500/5'
                    : 'border-slate-700 hover:border-slate-500 bg-slate-950'
                  }`}
                >
                  {(uploadedPhotoName || (formData.photo_url && formData.photo_url.startsWith('data:'))) ? (
                    <div className="flex items-center gap-2">
                      <img src={formData.photo_url} alt="preview" className="w-10 h-10 rounded-full object-cover border-2 border-amber-500 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-emerald-400 font-semibold truncate">{uploadedPhotoName || 'Uploaded photo'}</p>
                        <p className="text-[10px] text-slate-400">Click to change</p>
                      </div>
                      <button type="button"
                        onClick={e => { e.stopPropagation(); setUploadedPhotoName(''); setFormData(prev => ({ ...prev, photo_url: '' })); }}
                        className="p-0.5 rounded hover:bg-slate-700 text-slate-400">
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ) : (
                    <div className="text-center space-y-1.5">
                      <div className="w-9 h-9 bg-amber-500/10 rounded-xl flex items-center justify-center mx-auto border border-amber-500/20">
                        <ImageIcon className="w-4 h-4 text-amber-400" />
                      </div>
                      <p className="text-xs font-semibold text-white">Drag & drop photo here</p>
                      <p className="text-[11px] text-slate-400">JPG, PNG, WEBP — or click to browse</p>
                    </div>
                  )}
                  <input ref={photoInputRef} type="file" accept="image/*" className="hidden"
                    onChange={e => e.target.files?.[0] && handlePhotoFile(e.target.files[0])} />
                </div>
              )}

              {/* URL input */}
              {photoMode === 'url' && (
                <input type="url" value={formData.photo_url}
                  onChange={e => setFormData({ ...formData, photo_url: e.target.value })}
                  placeholder="https://example.com/photo.jpg"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono text-xs"
                />
              )}
            </div>

            <div>
              <label className="block text-slate-300 mb-1">Research Area Domain</label>
              <input type="text" value={formData.research_area}
                onChange={e => setFormData({ ...formData, research_area: e.target.value })}
                placeholder="Commerce & Management"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs text-slate-300 mb-1">Short Bio</label>
            <textarea
              rows={2}
              value={formData.bio}
              onChange={e => setFormData({ ...formData, bio: e.target.value })}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
            />
          </div>

          <div className="flex justify-end space-x-2 pt-2">
            <button
              type="button"
              onClick={() => setEditingMember(null)}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs rounded-xl shadow"
            >
              Save Board Member
            </button>
          </div>
        </form>
      )}

      {/* Table with Actions: Add | Edit | Delete | Activate | Deactivate | Reorder */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-x-auto shadow-xl">
        <table className="w-full text-left text-xs text-slate-300 min-w-[700px]">
          <thead className="bg-slate-950 text-slate-400 uppercase font-mono text-[10px] border-b border-slate-800">
            <tr>
              <th className="p-4">Reorder</th>
              <th className="p-4">Photograph & Name</th>
              <th className="p-4">Role / Position</th>
              <th className="p-4">Institution & Country</th>
              <th className="p-4">Status</th>
              <th className="p-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {editorialMembers.map((mem, idx) => (
              <tr key={mem.id} className="hover:bg-slate-800/40 transition-colors">
                <td className="p-4">
                  <div className="flex items-center space-x-1">
                    <button
                      onClick={() => moveUp(idx)}
                      disabled={idx === 0}
                      title="Move Up in Order"
                      className="p-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded disabled:opacity-30"
                    >
                      <ArrowUp className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => moveDown(idx)}
                      disabled={idx === editorialMembers.length - 1}
                      title="Move Down in Order"
                      className="p-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded disabled:opacity-30"
                    >
                      <ArrowDown className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </td>
                <td className="p-4">
                  <div className="flex items-center space-x-3 font-bold text-white font-serif">
                    <img
                      src={mem.photo_url || '/gyan-akshar-logo.png'}
                      alt={mem.name}
                      className="w-9 h-9 rounded-full object-cover border-2 border-amber-500 flex-shrink-0"
                    />
                    <div>
                      <p className="text-white text-sm">{mem.name}</p>
                      <p className="text-[10px] text-slate-400 font-mono">{mem.email}</p>
                    </div>
                  </div>
                </td>
                <td className="p-4 font-semibold text-amber-400">{mem.role}</td>
                <td className="p-4 text-slate-300">
                  <p>{mem.institution}</p>
                  <p className="text-[10px] text-slate-500">{mem.country}</p>
                </td>
                <td className="p-4">
                  <button
                    onClick={() => toggleEditorialActive(mem.id)}
                    className={`px-2.5 py-1 rounded-lg text-[10px] font-bold ${
                      mem.is_active ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-slate-800 text-slate-400 border border-slate-700'
                    }`}
                  >
                    {mem.is_active ? 'Active' : 'Inactive'}
                  </button>
                </td>
                <td className="p-4 text-right space-x-2">
                  <button
                    onClick={() => handleEdit(mem)}
                    title="Edit Member Profile"
                    className="p-1.5 bg-slate-800 hover:bg-slate-700 text-amber-400 rounded-lg transition-colors"
                  >
                    <Edit className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => deleteEditorialMember(mem.id)}
                    title="Delete Member"
                    className="p-1.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 rounded-lg transition-colors"
                  >
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
