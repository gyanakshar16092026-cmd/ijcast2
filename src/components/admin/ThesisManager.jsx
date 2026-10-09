import React, { useState, useRef } from 'react';
import { useJournal } from '../../context/JournalContext';
import { GraduationCap, Plus, Trash2, Eye, EyeOff, Edit, X, Save, Check, Upload, FileText, HardDrive, Link as LinkIcon } from 'lucide-react';

const DEGREE_TYPES = ['PhD', 'M.Tech', 'M.Phil', 'M.Sc', 'MBA'];
const STREAMS = [
  'Commerce & Management',
  'Arts & Humanities',
  'Social Sciences',
  'Science',
  'Computer Science & Technology',
  'Engineering',
  'Education',
  'Interdisciplinary Research',
];

const emptyForm = {
  degree_type: 'PhD',
  title: '',
  scholar_name: '',
  guide_names: '',
  university: '',
  stream: '',
  year: new Date().getFullYear(),
  abstract: '',
  keywords: '',
  pdf_url: '',
  is_published: true,
};

export const ThesisManager = () => {
  const { theses, saveThesis, deleteThesis, toggleThesisPublish } = useJournal();
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saved, setSaved] = useState(false);
  const [filterDegree, setFilterDegree] = useState('All');
  const [filterStream, setFilterStream] = useState('All');

  // PDF upload state
  const [pdfMode, setPdfMode] = useState('upload'); // 'upload' | 'url'
  const [dragActive, setDragActive] = useState(false);
  const [uploadedFileName, setUploadedFileName] = useState('');
  const fileInputRef = useRef(null);

  const handlePdfFile = (file) => {
    if (!file) return;
    if (!file.type.includes('pdf') && !file.name.endsWith('.pdf')) {
      alert('Please upload a PDF file only.');
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      setForm(prev => ({ ...prev, pdf_url: e.target.result }));
      setUploadedFileName(file.name);
    };
    reader.readAsDataURL(file);
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') setDragActive(true);
    else if (e.type === 'dragleave') setDragActive(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files?.[0]) handlePdfFile(e.dataTransfer.files[0]);
  };

  const openAdd = () => {
    setForm(emptyForm);
    setEditingId(null);
    setUploadedFileName('');
    setPdfMode('upload');
    setShowForm(true);
  };

  const openEdit = (thesis) => {
    setForm({
      ...thesis,
      guide_names: Array.isArray(thesis.guide_names) ? thesis.guide_names.join(', ') : thesis.guide_names,
      keywords: Array.isArray(thesis.keywords) ? thesis.keywords.join(', ') : thesis.keywords,
    });
    setEditingId(thesis.id);
    // If existing pdf_url is a real URL (not base64), show URL mode
    setPdfMode(thesis.pdf_url && !thesis.pdf_url.startsWith('data:') ? 'url' : 'upload');
    setUploadedFileName('');
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.pdf_url) {
      alert('PDF is required — please upload a file or paste a URL.');
      return;
    }
    await saveThesis(editingId ? { ...form, id: editingId } : form);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
    setShowForm(false);
    setEditingId(null);
    setForm(emptyForm);
  };

  const filtered = theses.filter(t => {
    if (filterDegree !== 'All' && t.degree_type !== filterDegree) return false;
    if (filterStream !== 'All' && t.stream !== filterStream) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b border-slate-800 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs uppercase font-bold text-amber-500 tracking-wider">Repository</span>
          <h2 className="text-xl font-bold font-serif text-white">PhD & M.Tech Thesis Manager</h2>
          <p className="text-xs text-slate-400 mt-0.5">Add, edit, and manage doctoral and post-graduate theses.</p>
        </div>
        <div className="flex items-center gap-2">
          {saved && (
            <span className="flex items-center space-x-1 text-xs text-emerald-400 font-bold bg-emerald-500/10 px-3 py-1.5 rounded-xl border border-emerald-500/30">
              <Check className="w-4 h-4" /><span>Saved!</span>
            </span>
          )}
          <button
            onClick={openAdd}
            className="flex items-center space-x-2 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs rounded-xl shadow transition-colors"
          >
            <Plus className="w-4 h-4" /><span>Add Thesis</span>
          </button>
        </div>
      </div>

      {/* Add / Edit Form */}
      {showForm && (
        <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6 space-y-5">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="text-sm font-bold text-white font-serif">
              {editingId ? 'Edit Thesis' : 'Add New Thesis'}
            </h3>
            <button onClick={() => setShowForm(false)} className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors">
              <X className="w-4 h-4" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            {/* Row 1: Degree type + Stream */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-300 mb-1">Degree Type *</label>
                <select
                  required
                  value={form.degree_type}
                  onChange={e => setForm({ ...form, degree_type: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white"
                >
                  {DEGREE_TYPES.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-slate-300 mb-1">Stream / Research Area *</label>
                <select
                  required
                  value={form.stream}
                  onChange={e => setForm({ ...form, stream: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white"
                >
                  <option value="">— Select Stream —</option>
                  {STREAMS.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
            </div>

            {/* Title */}
            <div>
              <label className="block text-slate-300 mb-1">Thesis Title *</label>
              <input
                type="text"
                required
                value={form.title}
                onChange={e => setForm({ ...form, title: e.target.value })}
                placeholder="Full title of the thesis"
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white"
              />
            </div>

            {/* Row 2: Scholar + Year */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-300 mb-1">Scholar / Author Name *</label>
                <input
                  type="text"
                  required
                  value={form.scholar_name}
                  onChange={e => setForm({ ...form, scholar_name: e.target.value })}
                  placeholder="e.g. Mr. Arvind Sharma"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white"
                />
              </div>
              <div>
                <label className="block text-slate-300 mb-1">Year of Submission *</label>
                <input
                  type="number"
                  required
                  min="1990"
                  max="2099"
                  value={form.year}
                  onChange={e => setForm({ ...form, year: parseInt(e.target.value) })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white"
                />
              </div>
            </div>

            {/* Guide(s) */}
            <div>
              <label className="block text-slate-300 mb-1">Guide(s) / Supervisor(s) *</label>
              <input
                type="text"
                required
                value={form.guide_names}
                onChange={e => setForm({ ...form, guide_names: e.target.value })}
                placeholder="e.g. Prof. R. K. Mehra, Dr. Sunita Patel  (comma-separated)"
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white"
              />
              <p className="text-slate-500 mt-1">Separate multiple guides with commas</p>
            </div>

            {/* University */}
            <div>
              <label className="block text-slate-300 mb-1">University / Institution *</label>
              <input
                type="text"
                required
                value={form.university}
                onChange={e => setForm({ ...form, university: e.target.value })}
                placeholder="e.g. Jawaharlal Nehru University, New Delhi"
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white"
              />
            </div>

            {/* Abstract */}
            <div>
              <label className="block text-slate-300 mb-1">Abstract</label>
              <textarea
                rows={4}
                value={form.abstract}
                onChange={e => setForm({ ...form, abstract: e.target.value })}
                placeholder="Brief summary of the research..."
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white resize-none"
              />
            </div>

            {/* Keywords + PDF Upload */}
            <div>
              <label className="block text-slate-300 mb-1">Keywords</label>
              <input
                type="text"
                value={form.keywords}
                onChange={e => setForm({ ...form, keywords: e.target.value })}
                placeholder="Keyword1, Keyword2, ..."
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white"
              />
            </div>

            {/* PDF Upload Section */}
            <div className="space-y-2">
              <label className="block text-slate-300">Thesis PDF Document <span className="text-rose-400 font-bold">*</span></label>

              {/* Mode toggle */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setPdfMode('upload')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${pdfMode === 'upload' ? 'bg-amber-500 text-slate-950' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
                >
                  <Upload className="w-3.5 h-3.5" /> Upload File
                </button>
                <button
                  type="button"
                  onClick={() => setPdfMode('url')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${pdfMode === 'url' ? 'bg-amber-500 text-slate-950' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
                >
                  <LinkIcon className="w-3.5 h-3.5" /> Paste URL
                </button>
              </div>

              {/* Drag & Drop zone */}
              {pdfMode === 'upload' && (
                <div
                  onDragEnter={handleDrag}
                  onDragOver={handleDrag}
                  onDragLeave={handleDrag}
                  onDrop={handleDrop}
                  className={`rounded-xl border-2 border-dashed p-6 text-center transition-all cursor-pointer ${
                    dragActive
                      ? 'border-amber-400 bg-amber-500/10'
                      : uploadedFileName
                      ? 'border-emerald-500/50 bg-emerald-500/5'
                      : !form.pdf_url
                      ? 'border-rose-500/50 hover:border-rose-400 bg-slate-950'
                      : 'border-slate-700 hover:border-slate-500 bg-slate-950'
                  }`}
                  onClick={() => fileInputRef.current?.click()}
                >
                  {uploadedFileName ? (
                    <div className="flex items-center justify-center gap-2 text-emerald-400">
                      <FileText className="w-5 h-5 flex-shrink-0" />
                      <span className="text-xs font-semibold truncate max-w-xs">{uploadedFileName}</span>
                      <button
                        type="button"
                        onClick={e => { e.stopPropagation(); setUploadedFileName(''); setForm(prev => ({ ...prev, pdf_url: '' })); }}
                        className="ml-1 p-0.5 rounded hover:bg-emerald-500/20 text-emerald-300"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <div className="w-10 h-10 bg-amber-500/10 rounded-xl flex items-center justify-center mx-auto border border-amber-500/20">
                        <Upload className="w-5 h-5 text-amber-400" />
                      </div>
                      <p className="text-xs font-semibold text-white">Drag & drop PDF here</p>
                      <p className="text-[11px] text-slate-400">or click to browse</p>
                      <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs rounded-lg">
                        <HardDrive className="w-3.5 h-3.5" /> Browse File
                      </div>
                    </div>
                  )}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".pdf"
                    className="hidden"
                    onChange={e => e.target.files?.[0] && handlePdfFile(e.target.files[0])}
                  />
                </div>
              )}

              {/* URL input */}
              {pdfMode === 'url' && (
                <input
                  type="url"
                  value={form.pdf_url}
                  onChange={e => setForm({ ...form, pdf_url: e.target.value })}
                  placeholder="https://example.com/thesis.pdf"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono text-xs"
                />
              )}
            </div>

            {/* Publish toggle */}
            <div className="flex items-center space-x-3">
              <input
                type="checkbox"
                id="thesis-publish"
                checked={form.is_published}
                onChange={e => setForm({ ...form, is_published: e.target.checked })}
                className="rounded text-amber-500"
              />
              <label htmlFor="thesis-publish" className="text-slate-300">Publish immediately (visible on public site)</label>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                className="flex items-center space-x-2 px-5 py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-xl shadow transition-colors"
              >
                <Save className="w-4 h-4" />
                <span>{editingId ? 'Update Thesis' : 'Save Thesis'}</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-wrap gap-3 text-xs">
        <div className="flex items-center space-x-2">
          <span className="text-slate-400">Degree:</span>
          <div className="flex gap-1 flex-wrap">
            {['All', ...DEGREE_TYPES].map(d => (
              <button
                key={d}
                onClick={() => setFilterDegree(d)}
                className={`px-3 py-1 rounded-lg font-semibold transition-colors ${filterDegree === d ? 'bg-amber-500 text-slate-950' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
              >{d}</button>
            ))}
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <span className="text-slate-400">Stream:</span>
          <select
            value={filterStream}
            onChange={e => setFilterStream(e.target.value)}
            className="bg-slate-800 border border-slate-700 rounded-lg px-2 py-1 text-slate-300"
          >
            <option value="All">All Streams</option>
            {STREAMS.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
        {DEGREE_TYPES.slice(0, 4).map(d => (
          <div key={d} className="bg-slate-900 border border-slate-800 rounded-xl p-4 text-center">
            <p className="text-2xl font-bold text-white">{theses.filter(t => t.degree_type === d).length}</p>
            <p className="text-slate-400 mt-0.5">{d} Theses</p>
          </div>
        ))}
      </div>

      {/* Thesis list */}
      <div className="space-y-3">
        {filtered.length === 0 ? (
          <div className="text-center py-16 bg-slate-900 border border-slate-800 rounded-2xl text-slate-400 text-sm">
            <GraduationCap className="w-10 h-10 mx-auto mb-3 text-slate-600" />
            <p>No theses found. Click "Add Thesis" to get started.</p>
          </div>
        ) : (
          filtered.map(thesis => (
            <div key={thesis.id} className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3">
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-1.5 flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 text-[10px]">
                    <span className={`px-2.5 py-1 rounded-lg font-bold ${thesis.degree_type === 'PhD' ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30' : 'bg-sky-500/20 text-sky-300 border border-sky-500/30'}`}>
                      {thesis.degree_type}
                    </span>
                    <span className="px-2 py-0.5 bg-amber-500/10 text-amber-400 rounded font-semibold">{thesis.stream}</span>
                    <span className="text-slate-500">{thesis.year}</span>
                    <span className={`px-2 py-0.5 rounded font-bold ${thesis.is_published ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-700 text-slate-400'}`}>
                      {thesis.is_published ? 'Published' : 'Draft'}
                    </span>
                  </div>
                  <h4 className="text-sm font-bold text-white font-serif leading-snug">{thesis.title}</h4>
                  <p className="text-xs text-slate-300"><span className="text-slate-500">Scholar:</span> {thesis.scholar_name}</p>
                  <p className="text-xs text-slate-300">
                    <span className="text-slate-500">Guide(s):</span> {(Array.isArray(thesis.guide_names) ? thesis.guide_names : [thesis.guide_names]).join(', ')}
                  </p>
                  <p className="text-xs text-slate-400"><span className="text-slate-500">University:</span> {thesis.university}</p>
                </div>

                <div className="flex items-center gap-1.5 flex-shrink-0">
                  <button
                    onClick={() => toggleThesisPublish(thesis.id)}
                    title={thesis.is_published ? 'Unpublish' : 'Publish'}
                    className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
                  >
                    {thesis.is_published ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                  <button
                    onClick={() => openEdit(thesis)}
                    className="p-2 rounded-xl bg-slate-800 hover:bg-amber-500/20 text-slate-400 hover:text-amber-400 transition-colors"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => deleteThesis(thesis.id)}
                    className="p-2 rounded-xl bg-slate-800 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {thesis.abstract && (
                <p className="text-[11px] text-slate-400 leading-relaxed line-clamp-2 border-t border-slate-800 pt-2">{thesis.abstract}</p>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

