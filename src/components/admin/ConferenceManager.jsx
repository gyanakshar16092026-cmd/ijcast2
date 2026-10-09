import React, { useState, useRef } from 'react';
import { useJournal } from '../../context/JournalContext';
import { Plus, Trash2, Edit, X, Save, Check, Upload, FileText, Link as LinkIcon, HardDrive } from 'lucide-react';

const emptyForm = {
  conference_name: '',
  organizer: '',
  conference_date: '',
  end_date: '',
  venue: '',
  research_areas: '',
  num_papers: '',
  paper_titles: '',
  proceedings_pdf_url: '',
  report_pdf_url: '',
  website_url: '',
  is_published: true,
};

export const ConferenceManager = () => {
  const { conferences, saveConference, deleteConference } = useJournal();
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saved, setSaved] = useState(false);
  const [saveError, setSaveError] = useState('');

  // PDF upload states
  const [proceedingsDrag, setProceedingsDrag] = useState(false);
  const [reportDrag, setReportDrag] = useState(false);
  const [proceedingsFileName, setProceedingsFileName] = useState('');
  const [reportFileName, setReportFileName] = useState('');
  const [proceedingsMode, setProceedingsMode] = useState('upload');
  const [reportMode, setReportMode] = useState('upload');
  const proceedingsRef = useRef(null);
  const reportRef = useRef(null);

  const handlePdfFile = (file, field, setFileName) => {
    if (!file) return;
    if (!file.type.includes('pdf') && !file.name.endsWith('.pdf')) {
      alert('Please upload a PDF file only.');
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      setForm(prev => ({ ...prev, [field]: e.target.result }));
      setFileName(file.name);
    };
    reader.readAsDataURL(file);
  };

  const openAdd = () => {
    setForm(emptyForm);
    setEditingId(null);
    setProceedingsFileName('');
    setReportFileName('');
    setProceedingsMode('upload');
    setReportMode('upload');
    setSaveError('');
    setShowForm(true);
  };

  const openEdit = (conf) => {
    setForm({
      ...conf,
      research_areas: Array.isArray(conf.research_areas) ? conf.research_areas.join(', ') : conf.research_areas || '',
      paper_titles: Array.isArray(conf.paper_titles) ? conf.paper_titles.join('\n') : conf.paper_titles || '',
    });
    setEditingId(conf.id);
    setProceedingsFileName('');
    setReportFileName('');
    setProceedingsMode(conf.proceedings_pdf_url && !conf.proceedings_pdf_url.startsWith('data:') ? 'url' : 'upload');
    setReportMode(conf.report_pdf_url && !conf.report_pdf_url.startsWith('data:') ? 'url' : 'upload');
    setSaveError('');
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaveError('');
    if (!form.proceedings_pdf_url) {
      setSaveError('Conference Proceedings PDF is required.');
      return;
    }
    try {
      await saveConference(editingId ? { ...form, id: editingId } : form);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
      setShowForm(false);
      setEditingId(null);
      setForm(emptyForm);
    } catch (err) {
      setSaveError(err.message || 'Save failed');
    }
  };

  const PdfUploader = ({ field, dragState, setDragState, fileName, setFileName, mode, setMode, inputRef }) => (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <button type="button" onClick={() => setMode('upload')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${mode === 'upload' ? 'bg-amber-500 text-slate-950' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}>
          <Upload className="w-3.5 h-3.5" /> Upload PDF
        </button>
        <button type="button" onClick={() => setMode('url')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${mode === 'url' ? 'bg-amber-500 text-slate-950' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}>
          <LinkIcon className="w-3.5 h-3.5" /> Paste URL
        </button>
      </div>
      {mode === 'upload' ? (
        <div
          onDragEnter={e => { e.preventDefault(); setDragState(true); }}
          onDragOver={e => { e.preventDefault(); setDragState(true); }}
          onDragLeave={() => setDragState(false)}
          onDrop={e => { e.preventDefault(); setDragState(false); if (e.dataTransfer.files?.[0]) handlePdfFile(e.dataTransfer.files[0], field, setFileName); }}
          onClick={() => inputRef.current?.click()}
          className={`rounded-xl border-2 border-dashed p-5 text-center cursor-pointer transition-all ${
            dragState ? 'border-amber-400 bg-amber-500/10'
            : fileName ? 'border-emerald-500/50 bg-emerald-500/5'
            : !form[field] ? 'border-rose-500/40 hover:border-slate-500 bg-slate-950'
            : 'border-slate-700 hover:border-slate-500 bg-slate-950'
          }`}
        >
          {fileName ? (
            <div className="flex items-center justify-center gap-2 text-emerald-400">
              <FileText className="w-4 h-4 flex-shrink-0" />
              <span className="text-xs font-semibold truncate max-w-xs">{fileName}</span>
              <button type="button" onClick={ev => { ev.stopPropagation(); setFileName(''); setForm(p => ({ ...p, [field]: '' })); }}
                className="p-0.5 rounded hover:bg-emerald-500/20 text-emerald-300"><X className="w-3.5 h-3.5" /></button>
            </div>
          ) : (
            <div className="space-y-1.5">
              <div className="w-9 h-9 bg-amber-500/10 rounded-xl flex items-center justify-center mx-auto border border-amber-500/20">
                <Upload className="w-4 h-4 text-amber-400" />
              </div>
              <p className="text-xs font-semibold text-white">Drag & drop PDF here</p>
              <p className="text-[11px] text-slate-400">or click to browse</p>
            </div>
          )}
          <input ref={inputRef} type="file" accept=".pdf" className="hidden"
            onChange={e => e.target.files?.[0] && handlePdfFile(e.target.files[0], field, setFileName)} />
        </div>
      ) : (
        <input type="url" value={form[field]} onChange={e => setForm(p => ({ ...p, [field]: e.target.value }))}
          placeholder="https://example.com/proceedings.pdf"
          className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono text-xs" />
      )}
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b border-slate-800 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs uppercase font-bold text-amber-500 tracking-wider">Repository</span>
          <h2 className="text-xl font-bold font-serif text-white">Conference Manager</h2>
          <p className="text-xs text-slate-400 mt-0.5">Upload and manage conference proceedings and papers.</p>
        </div>
        <div className="flex items-center gap-2">
          {saved && (
            <span className="flex items-center space-x-1 text-xs text-emerald-400 font-bold bg-emerald-500/10 px-3 py-1.5 rounded-xl border border-emerald-500/30">
              <Check className="w-4 h-4" /><span>Saved!</span>
            </span>
          )}
          <button onClick={openAdd} className="flex items-center space-x-2 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs rounded-xl shadow transition-colors">
            <Plus className="w-4 h-4" /><span>Add Conference</span>
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 text-xs">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 text-center">
          <p className="text-2xl font-bold text-white">{conferences.length}</p>
          <p className="text-slate-400 mt-0.5">Total Conferences</p>
        </div>
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 text-center">
          <p className="text-2xl font-bold text-emerald-400">{conferences.filter(c => c.is_published).length}</p>
          <p className="text-slate-400 mt-0.5">Published</p>
        </div>
      </div>

      {/* Form */}
      {showForm && (
        <form onSubmit={handleSubmit} className="bg-slate-900 border border-slate-700 rounded-2xl p-6 space-y-5 max-h-[85vh] overflow-y-auto custom-scrollbar">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="text-sm font-bold text-amber-400 font-serif">{editingId ? 'Edit Conference' : 'Add New Conference'}</h3>
            <button type="button" onClick={() => setShowForm(false)} className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors">
              <X className="w-4 h-4" />
            </button>
          </div>

          {saveError && (
            <div className="p-3 bg-rose-500/20 border border-rose-500/40 text-rose-400 text-xs rounded-xl font-semibold">
              ❌ {saveError}
            </div>
          )}

          {/* Conference Name */}
          <div className="text-xs">
            <label className="block text-slate-300 mb-1">Conference Name *</label>
            <input type="text" required value={form.conference_name}
              onChange={e => setForm({ ...form, conference_name: e.target.value })}
              placeholder="e.g. International Conference on AI & Commerce 2026"
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white" />
          </div>

          {/* Organizer + Venue */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block text-slate-300 mb-1">Organizer *</label>
              <input type="text" required value={form.organizer}
                onChange={e => setForm({ ...form, organizer: e.target.value })}
                placeholder="e.g. Gyan Akshar Sanskriti Foundation"
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white" />
            </div>
            <div>
              <label className="block text-slate-300 mb-1">Venue *</label>
              <input type="text" required value={form.venue}
                onChange={e => setForm({ ...form, venue: e.target.value })}
                placeholder="e.g. New Delhi, India"
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white" />
            </div>
          </div>

          {/* Dates */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block text-slate-300 mb-1">Start Date *</label>
              <input type="date" required value={form.conference_date}
                onChange={e => setForm({ ...form, conference_date: e.target.value })}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white" />
            </div>
            <div>
              <label className="block text-slate-300 mb-1">End Date</label>
              <input type="date" value={form.end_date}
                onChange={e => setForm({ ...form, end_date: e.target.value })}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white" />
            </div>
          </div>

          {/* Research Areas + No of Papers */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block text-slate-300 mb-1">Research Areas / Themes</label>
              <input type="text" value={form.research_areas}
                onChange={e => setForm({ ...form, research_areas: e.target.value })}
                placeholder="AI, Commerce, Engineering (comma-separated)"
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white" />
            </div>
            <div>
              <label className="block text-slate-300 mb-1">Number of Papers Presented</label>
              <input type="number" min="0" value={form.num_papers}
                onChange={e => setForm({ ...form, num_papers: e.target.value })}
                placeholder="e.g. 24"
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white" />
            </div>
          </div>

          {/* Paper Titles */}
          <div className="text-xs">
            <label className="block text-slate-300 mb-1">Paper Titles / Presented Papers (one per line)</label>
            <textarea rows={4} value={form.paper_titles}
              onChange={e => setForm({ ...form, paper_titles: e.target.value })}
              placeholder={"AI in Supply Chain Management\nRenewable Energy Systems\nDigital Humanities..."}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white resize-none" />
          </div>

          {/* Proceedings PDF — Required */}
          <div className="text-xs space-y-1.5">
            <label className="block text-slate-300 font-semibold">
              Conference Proceedings PDF <span className="text-rose-400">*</span>
            </label>
            <PdfUploader
              field="proceedings_pdf_url"
              dragState={proceedingsDrag} setDragState={setProceedingsDrag}
              fileName={proceedingsFileName} setFileName={setProceedingsFileName}
              mode={proceedingsMode} setMode={setProceedingsMode}
              inputRef={proceedingsRef}
            />
          </div>

          {/* Conference Report PDF — Optional */}
          <div className="text-xs space-y-1.5">
            <label className="block text-slate-300 font-semibold">Conference Report PDF (optional)</label>
            <PdfUploader
              field="report_pdf_url"
              dragState={reportDrag} setDragState={setReportDrag}
              fileName={reportFileName} setFileName={setReportFileName}
              mode={reportMode} setMode={setReportMode}
              inputRef={reportRef}
            />
          </div>

          {/* Website URL */}
          <div className="text-xs">
            <label className="block text-slate-300 mb-1">Conference Website URL (optional)</label>
            <input type="url" value={form.website_url}
              onChange={e => setForm({ ...form, website_url: e.target.value })}
              placeholder="https://conference.example.com"
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono" />
          </div>

          {/* Publish toggle */}
          <div className="flex items-center space-x-3 text-xs">
            <input type="checkbox" id="conf-publish" checked={form.is_published}
              onChange={e => setForm({ ...form, is_published: e.target.checked })}
              className="rounded text-amber-500" />
            <label htmlFor="conf-publish" className="text-slate-300">Publish on public Conferences page</label>
          </div>

          <div className="flex justify-end pt-2">
            <button type="submit" className="flex items-center space-x-2 px-5 py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-xl shadow transition-colors">
              <Save className="w-4 h-4" /><span>{editingId ? 'Update Conference' : 'Save Conference'}</span>
            </button>
          </div>
        </form>
      )}

      {/* Conference List */}
      <div className="space-y-4">
        {conferences.length === 0 ? (
          <div className="text-center py-16 bg-slate-900 border border-slate-800 rounded-2xl text-slate-400 text-sm">
            <FileText className="w-10 h-10 mx-auto mb-3 text-slate-600" />
            <p>No conferences yet. Click "Add Conference" to get started.</p>
          </div>
        ) : (
          conferences.map(conf => {
            const areas = Array.isArray(conf.research_areas) ? conf.research_areas : [];
            const papers = Array.isArray(conf.paper_titles) ? conf.paper_titles : [];
            return (
              <div key={conf.id} className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0 space-y-1.5">
                    <div className="flex flex-wrap items-center gap-2 text-[10px]">
                      <span className={`px-2.5 py-1 rounded-lg font-bold ${conf.is_published ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-slate-700 text-slate-400'}`}>
                        {conf.is_published ? 'Published' : 'Draft'}
                      </span>
                      {conf.conference_date && <span className="text-slate-500">{conf.conference_date}{conf.end_date && ` – ${conf.end_date}`}</span>}
                      {conf.num_papers && <span className="text-amber-400 font-semibold">{conf.num_papers} Papers</span>}
                    </div>
                    <h4 className="text-sm font-bold text-white font-serif leading-snug">{conf.conference_name}</h4>
                    <p className="text-xs text-slate-400"><span className="text-slate-500">Organizer:</span> {conf.organizer}</p>
                    <p className="text-xs text-slate-400"><span className="text-slate-500">Venue:</span> {conf.venue}</p>
                    {areas.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {areas.map((a, i) => <span key={i} className="px-2 py-0.5 bg-amber-500/10 text-amber-400 rounded text-[10px] font-medium">{a}</span>)}
                      </div>
                    )}
                    {papers.length > 0 && (
                      <p className="text-[11px] text-slate-500">{papers.length} paper{papers.length !== 1 ? 's' : ''} listed</p>
                    )}
                  </div>
                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    <button onClick={() => openEdit(conf)} className="p-2 rounded-xl bg-slate-800 hover:bg-amber-500/20 text-slate-400 hover:text-amber-400 transition-colors">
                      <Edit className="w-4 h-4" />
                    </button>
                    <button onClick={() => deleteConference(conf.id)} className="p-2 rounded-xl bg-slate-800 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                {conf.proceedings_pdf_url && (
                  <div className="flex gap-2 pt-1 border-t border-slate-800">
                    <a href={conf.proceedings_pdf_url} target="_blank" rel="noopener noreferrer"
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-500/10 text-amber-400 border border-amber-500/30 rounded-lg text-xs font-medium hover:bg-amber-500/20 transition-colors">
                      <FileText className="w-3.5 h-3.5" /> Proceedings PDF
                    </a>
                    {conf.report_pdf_url && (
                      <a href={conf.report_pdf_url} target="_blank" rel="noopener noreferrer"
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 text-slate-300 rounded-lg text-xs font-medium hover:bg-slate-700 transition-colors">
                        <FileText className="w-3.5 h-3.5" /> Report PDF
                      </a>
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

