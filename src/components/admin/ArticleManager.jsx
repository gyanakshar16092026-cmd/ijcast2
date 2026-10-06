import React, { useState } from 'react';
import { useJournal } from '../../context/JournalContext';
import { Plus, Edit, Trash2, ArrowUp, ArrowDown, Eye, EyeOff, MoveRight, FileText, Upload, GripVertical, CheckCircle2, Link as LinkIcon, FileCheck } from 'lucide-react';

export const ArticleManager = () => {
  const { volumes, issues, articles, saveArticle, deleteArticle, toggleArticlePublish, moveArticle, reorderArticles, researchAreas, addMediaItem } = useJournal();

  const [editingArticle, setEditingArticle] = useState(null);
  const [movingArticleId, setMovingArticleId] = useState(null);
  const [targetMoveVolumeId, setTargetMoveVolumeId] = useState('');
  const [targetMoveIssueId, setTargetMoveIssueId] = useState('');

  const [selectedIssueFilter, setSelectedIssueFilter] = useState('');
  const [pdfInputMode, setPdfInputMode] = useState('upload'); // 'upload' | 'url'
  const [dragActive, setDragActive] = useState(false);
  const [uploadFileName, setUploadFileName] = useState('');

  const initialFormState = {
    title: '',
    issue_id: issues[0]?.id || '',
    authors: [
      { name: '', affiliation: '', email: '', orcid: '', is_corresponding: true }
    ],
    corresponding_author: '',
    corresponding_author_email: '',
    abstract: '',
    keywords: '',
    research_area: researchAreas[0]?.category || 'Commerce & Management',
    article_type: 'Research Paper',
    received_date: new Date().toISOString().split('T')[0],
    revised_date: '',
    accepted_date: '',
    published_date: new Date().toISOString().split('T')[0],
    doi: '',
    page_numbers: '1–10',
    article_references: '',
    pdf_url: '',
    html_content: '',
    is_published: true
  };

  const [formData, setFormData] = useState(initialFormState);

  const filteredArticles = articles
    .filter(a => !selectedIssueFilter || a.issue_id === selectedIssueFilter)
    .sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0));

  const handleOpenNew = () => {
    setEditingArticle('new');
    setUploadFileName('');
    setFormData({
      ...initialFormState,
      issue_id: selectedIssueFilter || issues[0]?.id || ''
    });
  };

  const handleEdit = (art) => {
    setEditingArticle(art.id);
    setUploadFileName(art.pdf_url ? art.pdf_url.split('/').pop() : '');
    setFormData({
      title: art.title,
      issue_id: art.issue_id,
      authors: art.authors && art.authors.length > 0 ? art.authors : [{ name: '', affiliation: '', email: '', orcid: '', is_corresponding: true }],
      corresponding_author: art.corresponding_author || '',
      corresponding_author_email: art.corresponding_author_email || '',
      abstract: art.abstract || '',
      keywords: Array.isArray(art.keywords) ? art.keywords.join(', ') : art.keywords || '',
      research_area: art.research_area || 'Commerce & Management',
      article_type: art.article_type || 'Research Paper',
      received_date: art.received_date || '',
      revised_date: art.revised_date || '',
      accepted_date: art.accepted_date || '',
      published_date: art.published_date || '',
      doi: art.doi || '',
      page_numbers: art.page_numbers || '',
      article_references: art.article_references || '',
      pdf_url: art.pdf_url || '',
      html_content: art.html_content || '',
      is_published: art.is_published ?? true
    });
  };

  const handleAuthorChange = (idx, field, val) => {
    const updated = [...formData.authors];
    updated[idx][field] = val;
    if (field === 'is_corresponding' && val) {
      updated.forEach((a, i) => { if (i !== idx) a.is_corresponding = false; });
      setFormData({
        ...formData,
        authors: updated,
        corresponding_author: updated[idx].name,
        corresponding_author_email: updated[idx].email
      });
    } else {
      setFormData({ ...formData, authors: updated });
    }
  };

  const addAuthorField = () => {
    setFormData({
      ...formData,
      authors: [...formData.authors, { name: '', affiliation: '', email: '', orcid: '', is_corresponding: false }]
    });
  };

  const removeAuthorField = (idx) => {
    if (formData.authors.length === 1) return;
    setFormData({
      ...formData,
      authors: formData.authors.filter((_, i) => i !== idx)
    });
  };

  // PDF File Dropzone & Browse Handlers
  const handlePdfFileSelect = async (file) => {
    if (!file) return;
    if (file.type !== 'application/pdf' && !file.name.endsWith('.pdf')) {
      alert('Please select a valid PDF manuscript file (.pdf).');
      return;
    }

    setUploadFileName(file.name);

    // Upload to Supabase Storage instead of using Data URLs
    try {
      const { supabase, isSupabaseConfigured } = await import('../../lib/supabase');
      
      if (isSupabaseConfigured && supabase) {
        // Generate unique filename
        const timestamp = Date.now();
        const sanitizedName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
        const fileName = `${timestamp}-${sanitizedName}`;
        
        // Upload to published-papers bucket
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('published-papers')
          .upload(fileName, file, {
            contentType: 'application/pdf',
            upsert: true
          });

        if (uploadError) {
          throw uploadError;
        }

        // Get public URL
        const { data: { publicUrl } } = supabase.storage
          .from('published-papers')
          .getPublicUrl(fileName);

        setFormData(prev => ({ ...prev, pdf_url: publicUrl }));

        // Register file in Media Manager
        addMediaItem({
          filename: file.name,
          file_type: 'pdf',
          file_size: file.size,
          url: publicUrl,
          bucket_name: 'published-papers'
        });

        alert('PDF uploaded successfully to Supabase Storage!');
      } else {
        // Fallback to Data URL for offline mode
        const reader = new FileReader();
        reader.onload = (e) => {
          const fileUrl = e.target.result;
          setFormData(prev => ({ ...prev, pdf_url: fileUrl }));

          // Register file in Media Manager
          addMediaItem({
            filename: file.name,
            file_type: 'pdf',
            file_size: file.size,
            url: fileUrl,
            bucket_name: 'journal-pdfs'
          });
        };
        reader.readAsDataURL(file);
      }
    } catch (error) {
      console.error('PDF upload failed:', error);
      alert(`Upload failed: ${error.message}. Using fallback mode.`);
      
      // Fallback to Data URL
      const reader = new FileReader();
      reader.onload = (e) => {
        const fileUrl = e.target.result;
        setFormData(prev => ({ ...prev, pdf_url: fileUrl }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handlePdfFileSelect(e.dataTransfer.files[0]);
    }
  };

  const [saveError, setSaveError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaveError('');

    if (!formData.pdf_url) {
      setSaveError('PDF is required — please upload a PDF file or paste a PDF URL.');
      return;
    }

    const kwArray = typeof formData.keywords === 'string'
      ? formData.keywords.split(',').map(k => k.trim()).filter(Boolean)
      : formData.keywords;

    const mainCorr = formData.authors.find(a => a.is_corresponding) || formData.authors[0];

    try {
      await saveArticle({
        ...(editingArticle !== 'new' ? { id: editingArticle } : {}),
        ...formData,
        corresponding_author: mainCorr?.name || formData.corresponding_author,
        corresponding_author_email: mainCorr?.email || formData.corresponding_author_email,
        orcids: formData.authors.map(a => a.orcid).filter(Boolean),
        keywords: kwArray
      });
      setEditingArticle(null);
    } catch (err) {
      setSaveError(err.message || 'Save failed');
    }
  };

  const handleMoveOpen = (art) => {
    setMovingArticleId(art.id);
    const currIssue = issues.find(i => i.id === art.issue_id);
    setTargetMoveVolumeId(currIssue?.volume_id || volumes[0]?.id || '');
    setTargetMoveIssueId(art.issue_id);
  };

  const handleMoveSubmit = async (articleId) => {
    if (!targetMoveIssueId) return;
    await moveArticle(articleId, targetMoveIssueId);
    setMovingArticleId(null);
  };

  const moveUp = (index) => {
    if (index === 0) return;
    const reordered = [...filteredArticles];
    const temp = reordered[index];
    reordered[index] = reordered[index - 1];
    reordered[index - 1] = temp;
    reorderArticles(reordered.map((item, idx) => ({ ...item, sort_order: idx + 1 })));
  };

  const moveDown = (index) => {
    if (index === filteredArticles.length - 1) return;
    const reordered = [...filteredArticles];
    const temp = reordered[index];
    reordered[index] = reordered[index + 1];
    reordered[index + 1] = temp;
    reorderArticles(reordered.map((item, idx) => ({ ...item, sort_order: idx + 1 })));
  };

  const availableMoveIssues = issues.filter(i => !targetMoveVolumeId || i.volume_id === targetMoveVolumeId);

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <h2 className="text-xl font-bold font-serif text-white">Article Management</h2>
          <p className="text-xs text-slate-400">Add, Edit, Delete, Publish/Unpublish, Move Paper, Upload PDF (Drag & Drop / Browse / URL), and Reorder Paper Position inside every Issue.</p>
        </div>

        <div className="flex items-center space-x-3">
          <select
            value={selectedIssueFilter}
            onChange={e => setSelectedIssueFilter(e.target.value)}
            className="bg-slate-900 border border-slate-800 text-xs text-white rounded-xl px-3 py-2"
          >
            <option value="">Filter by Issue / Number</option>
            {issues.map(i => {
              const v = volumes.find(vol => vol.id === i.volume_id);
              return (
                <option key={i.id} value={i.id}>
                  Volume {v?.volume_number || 1}, Issue {i.issue_number} ({i.year})
                </option>
              );
            })}
          </select>

          <button
            onClick={handleOpenNew}
            className="flex items-center space-x-1.5 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs rounded-xl shadow transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Article</span>
          </button>
        </div>
      </div>

      {/* Move Article Drawer / Modal */}
      {movingArticleId && (
        <div className="bg-slate-900 border border-amber-500/60 p-5 rounded-2xl space-y-4 shadow-xl">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center space-x-2">
              <MoveRight className="w-4 h-4" />
              <span>Move Article → Change Volume & Issue</span>
            </h4>
            <button onClick={() => setMovingArticleId(null)} className="text-xs text-slate-400 hover:text-white">Cancel</button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block text-slate-300 mb-1 font-medium">1. Target Volume</label>
              <select
                value={targetMoveVolumeId}
                onChange={e => {
                  setTargetMoveVolumeId(e.target.value);
                  const firstIss = issues.find(i => i.volume_id === e.target.value);
                  setTargetMoveIssueId(firstIss?.id || '');
                }}
                className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl px-3 py-2"
              >
                {volumes.map(v => (
                  <option key={v.id} value={v.id}>Volume {v.volume_number} ({v.year})</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-slate-300 mb-1 font-medium">2. Target Issue / Number</label>
              <select
                value={targetMoveIssueId}
                onChange={e => setTargetMoveIssueId(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl px-3 py-2"
              >
                <option value="">Select Issue</option>
                {availableMoveIssues.map(i => (
                  <option key={i.id} value={i.id}>
                    Issue Number {i.issue_number} ({i.month_range})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex justify-end space-x-2 pt-2">
            <button
              onClick={() => handleMoveSubmit(movingArticleId)}
              className="px-5 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs rounded-xl shadow"
            >
              Confirm Article Reassignment
            </button>
          </div>
        </div>
      )}

      {/* Editor Form Modal */}
      {editingArticle && (
        <form onSubmit={handleSubmit} className="bg-slate-900 border border-slate-800 p-6 rounded-2xl space-y-6 max-h-[85vh] overflow-y-auto custom-scrollbar">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="text-base font-bold text-amber-400 font-serif">
              {editingArticle === 'new' ? 'Add New Research Article' : 'Edit Article Details & Metadata'}
            </h3>
            <button
              type="button"
              onClick={() => setEditingArticle(null)}
              className="text-xs text-slate-400 hover:text-white"
            >
              Close Form
            </button>
          </div>

          {saveError && (
            <div className="p-3 bg-rose-500/20 border border-rose-500/40 text-rose-400 text-xs rounded-xl font-semibold">
              ❌ Save Error: {saveError}
            </div>
          )}

          {/* Section 1: Title & Issue */}
          <div className="space-y-4">
            <div>
              <label className="block text-xs text-slate-300 font-medium mb-1">Article Title</label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={e => setFormData({ ...formData, title: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div>
                <label className="block text-slate-300 mb-1">Assigned Issue</label>
                <select
                  value={formData.issue_id}
                  onChange={e => setFormData({ ...formData, issue_id: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                >
                  {issues.map(i => {
                    const v = volumes.find(vol => vol.id === i.volume_id);
                    return (
                      <option key={i.id} value={i.id}>
                        Volume {v?.volume_number || 1}, Number {i.issue_number} ({i.year})
                      </option>
                    );
                  })}
                </select>
              </div>

              <div>
                <label className="block text-slate-300 mb-1">Research Area Domain</label>
                <select
                  value={formData.research_area}
                  onChange={e => setFormData({ ...formData, research_area: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                >
                  {researchAreas.map(ra => (
                    <option key={ra.id} value={ra.category}>{ra.category}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-300 mb-1">Article Type</label>
                <select
                  value={formData.article_type}
                  onChange={e => setFormData({ ...formData, article_type: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                >
                  <option value="Research Paper">Research Paper</option>
                  <option value="Review Article">Review Article</option>
                  <option value="Case Study">Case Study</option>
                  <option value="Short Communication">Short Communication</option>
                </select>
              </div>
            </div>
          </div>

          {/* Section 2: Authors, Affiliations, Corresponding & ORCID */}
          <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-xs uppercase font-bold text-amber-400">Authors & Corresponding Details</h4>
              <button
                type="button"
                onClick={addAuthorField}
                className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs rounded-lg font-medium"
              >
                + Add Author
              </button>
            </div>

            {formData.authors.map((auth, idx) => (
              <div key={idx} className="p-3 bg-slate-900 border border-slate-800 rounded-xl space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div>
                    <label className="block text-[11px] text-slate-400 mb-0.5">Author Name</label>
                    <input
                      type="text"
                      required
                      placeholder="Dr. Rajesh V. Sharma"
                      value={auth.name}
                      onChange={e => handleAuthorChange(idx, 'name', e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-slate-400 mb-0.5">Author Affiliation</label>
                    <input
                      type="text"
                      placeholder="Department of Commerce, University of Delhi"
                      value={auth.affiliation}
                      onChange={e => handleAuthorChange(idx, 'affiliation', e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  <div>
                    <label className="block text-[11px] text-slate-400 mb-0.5">Author Email</label>
                    <input
                      type="email"
                      placeholder="r.sharma@du.ac.in"
                      value={auth.email}
                      onChange={e => handleAuthorChange(idx, 'email', e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-slate-400 mb-0.5">ORCID iD</label>
                    <input
                      type="text"
                      placeholder="0000-0002-1823-9941"
                      value={auth.orcid}
                      onChange={e => handleAuthorChange(idx, 'orcid', e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-white font-mono"
                    />
                  </div>
                  <div className="flex items-center justify-between pt-4">
                    <label className="flex items-center space-x-2 text-slate-300">
                      <input
                        type="checkbox"
                        checked={auth.is_corresponding}
                        onChange={e => handleAuthorChange(idx, 'is_corresponding', e.target.checked)}
                        className="rounded text-amber-500"
                      />
                      <span className="font-semibold text-amber-400">Corresponding Author</span>
                    </label>

                    {formData.authors.length > 1 && (
                      <button type="button" onClick={() => removeAuthorField(idx)} className="text-rose-400 hover:underline">
                        Remove
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Section 3: Abstract, Keywords, DOI */}
          <div className="space-y-4">
            <div>
              <label className="block text-xs text-slate-300 font-medium mb-1">Abstract</label>
              <textarea
                rows={4}
                required
                value={formData.abstract}
                onChange={e => setFormData({ ...formData, abstract: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block text-slate-300 mb-1">Keywords (Comma Separated)</label>
                <input
                  type="text"
                  value={formData.keywords}
                  onChange={e => setFormData({ ...formData, keywords: e.target.value })}
                  placeholder="Financial Analytics, Artificial Intelligence, Supply Chain"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                />
              </div>

              <div>
                <label className="block text-slate-300 mb-1">Article DOI (e.g. 10.5281/ijcast.2026.101)</label>
                <input
                  type="text"
                  value={formData.doi}
                  onChange={e => setFormData({ ...formData, doi: e.target.value })}
                  placeholder="10.5281/ijcast.2026.101"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono"
                />
              </div>
            </div>
          </div>

          {/* Section 4: Timeline Dates */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
            <div>
              <label className="block text-slate-300 mb-1">Received Date</label>
              <input
                type="date"
                value={formData.received_date}
                onChange={e => setFormData({ ...formData, received_date: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
              />
            </div>
            <div>
              <label className="block text-slate-300 mb-1">Revised Date</label>
              <input
                type="date"
                value={formData.revised_date}
                onChange={e => setFormData({ ...formData, revised_date: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
              />
            </div>
            <div>
              <label className="block text-slate-300 mb-1">Accepted Date</label>
              <input
                type="date"
                value={formData.accepted_date}
                onChange={e => setFormData({ ...formData, accepted_date: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
              />
            </div>
            <div>
              <label className="block text-slate-300 mb-1">Published Date</label>
              <input
                type="date"
                value={formData.published_date}
                onChange={e => setFormData({ ...formData, published_date: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
              />
            </div>
          </div>

          {/* Section 5: Page Numbers & PDF Upload / Replace (Drag & Drop / Browse / URL) */}
          <div className={`p-4 bg-slate-950 border rounded-xl space-y-4 ${!formData.pdf_url ? 'border-rose-500/50' : 'border-slate-800'}`}>
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center space-x-2">
                <FileText className="w-4 h-4" />
                <span>Manuscript PDF Upload / Replace</span>
                <span className="text-rose-400 font-bold">*</span>
              </h4>

              {/* Mode Selector */}
              <div className="flex items-center space-x-1 text-xs">
                <button
                  type="button"
                  onClick={() => setPdfInputMode('upload')}
                  className={`px-3 py-1 rounded-lg text-[11px] font-semibold transition-colors ${
                    pdfInputMode === 'upload' ? 'bg-amber-500 text-slate-950 shadow' : 'bg-slate-900 text-slate-400 hover:text-white'
                  }`}
                >
                  Drag & Drop / Browse File
                </button>
                <button
                  type="button"
                  onClick={() => setPdfInputMode('url')}
                  className={`px-3 py-1 rounded-lg text-[11px] font-semibold transition-colors ${
                    pdfInputMode === 'url' ? 'bg-amber-500 text-slate-950 shadow' : 'bg-slate-900 text-slate-400 hover:text-white'
                  }`}
                >
                  Paste PDF URL
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block text-slate-300 mb-1 font-medium">Page Number / Article Range</label>
                <input
                  type="text"
                  value={formData.page_numbers}
                  onChange={e => setFormData({ ...formData, page_numbers: e.target.value })}
                  placeholder="1–16"
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white"
                />
              </div>

              {/* PDF Input Component */}
              <div>
                {pdfInputMode === 'upload' ? (
                  <div>
                    <label className="block text-slate-300 mb-1 font-medium">Upload or Drop PDF Manuscript</label>
                    <div
                      onDragEnter={handleDrag}
                      onDragLeave={handleDrag}
                      onDragOver={handleDrag}
                      onDrop={handleDrop}
                      className={`relative border-2 border-dashed rounded-xl p-4 text-center transition-all ${
                        dragActive ? 'border-amber-500 bg-amber-500/10' : 'border-slate-800 bg-slate-900 hover:border-slate-700'
                      }`}
                    >
                      <input
                        type="file"
                        accept=".pdf"
                        onChange={(e) => e.target.files && handlePdfFileSelect(e.target.files[0])}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      />
                      <div className="space-y-1">
                        <Upload className="w-5 h-5 text-amber-400 mx-auto" />
                        <p className="text-xs text-white font-medium">
                          {uploadFileName ? `Selected: ${uploadFileName}` : 'Drag & Drop PDF file here or Click to Browse'}
                        </p>
                        <p className="text-[10px] text-slate-500">Supports PDF format up to 50MB</p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div>
                    <label className="block text-slate-300 mb-1 font-medium">Manuscript PDF URL</label>
                    <input
                      type="text"
                      value={formData.pdf_url}
                      onChange={e => setFormData({ ...formData, pdf_url: e.target.value })}
                      placeholder="/sample-paper.pdf or https://..."
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono text-[11px]"
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Current Active PDF Badge */}
            {formData.pdf_url && (
              <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl flex items-center justify-between text-xs">
                <div className="flex items-center space-x-2 truncate mr-2">
                  <FileCheck className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                  <span className="text-slate-300 font-mono text-[11px] truncate">Active PDF: {formData.pdf_url}</span>
                </div>
                <a
                  href={formData.pdf_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-amber-400 text-[11px] rounded-lg font-medium flex-shrink-0"
                >
                  Preview PDF
                </a>
              </div>
            )}
          </div>

          <div>
            <label className="block text-xs text-slate-300 mb-1">References List</label>
            <textarea
              rows={3}
              value={formData.article_references}
              onChange={e => setFormData({ ...formData, article_references: e.target.value })}
              placeholder="1. Goodfellow, I. (2016)..."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white font-mono"
            />
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-slate-800">
            <label className="flex items-center space-x-2 text-xs text-slate-300">
              <input
                type="checkbox"
                checked={formData.is_published}
                onChange={e => setFormData({ ...formData, is_published: e.target.checked })}
                className="rounded text-emerald-500"
              />
              <span className="font-semibold text-emerald-400">Publish Article Immediately on Public Site</span>
            </label>

            <div className="flex items-center space-x-2">
              <button
                type="button"
                onClick={() => setEditingArticle(null)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-xl"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs rounded-xl shadow"
              >
                Save Article
              </button>
            </div>
          </div>
        </form>
      )}

      {/* Articles Table with Drag & Drop Position Order */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-x-auto shadow-xl">
        <table className="w-full text-left text-xs text-slate-300 min-w-[700px]">
          <thead className="bg-slate-950 text-slate-400 uppercase font-mono text-[10px] border-b border-slate-800">
            <tr>
              <th className="p-4">Article Order</th>
              <th className="p-4">Article Title</th>
              <th className="p-4">Corresponding Author</th>
              <th className="p-4">Research Area</th>
              <th className="p-4">Status</th>
              <th className="p-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {filteredArticles.map((art, idx) => (
              <tr key={art.id} className="hover:bg-slate-800/40 transition-colors">
                <td className="p-4">
                  <div className="flex items-center space-x-2">
                    <span className="w-6 h-6 bg-slate-800 text-amber-400 font-bold font-mono text-xs rounded-lg flex items-center justify-center">
                      #{idx + 1}
                    </span>
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
                        disabled={idx === filteredArticles.length - 1}
                        title="Move Down in Issue Order"
                        className="p-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded disabled:opacity-30"
                      >
                        <ArrowDown className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </td>

                <td className="p-4">
                  <p className="font-bold text-white font-serif line-clamp-1">{art.title}</p>
                  <p className="text-[11px] text-slate-400">{art.doi ? `DOI: ${art.doi}` : 'No DOI'}</p>
                </td>

                <td className="p-4">
                  <p className="text-slate-200">{art.corresponding_author || art.authors?.[0]?.name}</p>
                  <p className="text-[10px] text-slate-500">{art.corresponding_author_email}</p>
                </td>

                <td className="p-4 font-semibold text-amber-400">{art.research_area}</td>

                <td className="p-4">
                  <button
                    onClick={() => toggleArticlePublish(art.id)}
                    className={`flex items-center space-x-1 px-2.5 py-1 rounded-lg text-[10px] font-bold ${
                      art.is_published ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                    }`}
                  >
                    {art.is_published ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                    <span>{art.is_published ? 'Published' : 'Draft'}</span>
                  </button>
                </td>

                <td className="p-4 text-right space-x-2">
                  <button
                    onClick={() => handleMoveOpen(art)}
                    title="Move Article -> Change Volume & Issue"
                    className="p-1.5 bg-slate-800 hover:bg-amber-500/20 hover:text-amber-400 text-slate-300 rounded-lg transition-colors"
                  >
                    <MoveRight className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleEdit(art)}
                    title="Edit Article"
                    className="p-1.5 bg-slate-800 hover:bg-slate-700 text-amber-400 rounded-lg transition-colors"
                  >
                    <Edit className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => deleteArticle(art.id)}
                    title="Delete Article"
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
