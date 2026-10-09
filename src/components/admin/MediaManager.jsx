import React, { useState } from 'react';
import { useJournal } from '../../context/JournalContext';
import { Image as ImageIcon, FileText, Upload, Copy, Check, Trash2, Search, ExternalLink, HardDrive, Link as LinkIcon } from 'lucide-react';

export const MediaManager = () => {
  const { mediaItems, addMediaItem, deleteMediaItem } = useJournal();
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedId, setCopiedId] = useState(null);
  const [uploadMode, setUploadMode] = useState('drag'); // 'drag' | 'url'
  const [dragActive, setDragActive] = useState(false);

  const [filename, setFilename] = useState('');
  const [fileType, setFileType] = useState('pdf');
  const [url, setUrl] = useState('');
  const [bucketName, setBucketName] = useState('journal-pdfs');
  const [uploadNotice, setUploadNotice] = useState('');

  const filteredMedia = mediaItems.filter(m =>
    m.filename?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    m.bucket_name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleFileUpload = (file) => {
    if (!file) return;

    const isPdf = file.type.includes('pdf') || file.name.endsWith('.pdf');
    const isImg = file.type.includes('image') || file.name.match(/\.(jpg|jpeg|png|webp|gif)$/i);
    const typeKey = isPdf ? 'pdf' : isImg ? 'image' : 'document';
    const bucket = isPdf ? 'journal-pdfs' : 'journal-images';

    const reader = new FileReader();
    reader.onload = async (e) => {
      const fileUrl = e.target.result;
      await addMediaItem({
        filename: file.name,
        file_type: typeKey,
        file_size: file.size,
        url: fileUrl,
        bucket_name: bucket
      });
      setUploadNotice(`Successfully uploaded & registered ${file.name}!`);
      setTimeout(() => setUploadNotice(''), 3000);
    };
    reader.readAsDataURL(file);
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
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  const handleUrlSubmit = async (e) => {
    e.preventDefault();
    if (!filename || !url) return;

    await addMediaItem({
      filename,
      file_type: fileType,
      file_size: 450000,
      url,
      bucket_name: bucketName
    });

    setUploadNotice(`Successfully registered URL asset for ${filename}!`);
    setTimeout(() => setUploadNotice(''), 3000);

    setFilename('');
    setUrl('');
  };

  const handleCopyUrl = (id, linkUrl) => {
    navigator.clipboard.writeText(linkUrl);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="space-y-6">
      <div className="border-b border-slate-800 pb-4">
        <h2 className="text-xl font-bold font-serif text-white">Media & File Storage Management</h2>
        <p className="text-xs text-slate-400">Upload PDF documents, cover images, and editorial media via Drag & Drop, File Browse, or Direct URL registration.</p>
      </div>

      {/* Mode Selector Tabs */}
      <div className="flex items-center space-x-2 border-b border-slate-800 pb-2">
        <button
          onClick={() => setUploadMode('drag')}
          className={`flex items-center space-x-2 px-4 py-2 text-xs font-bold rounded-xl transition-all ${
            uploadMode === 'drag'
              ? 'bg-amber-500 text-slate-950 shadow'
              : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          <Upload className="w-4 h-4" />
          <span>Drag & Drop / Browse PDF or Image</span>
        </button>

        <button
          onClick={() => setUploadMode('url')}
          className={`flex items-center space-x-2 px-4 py-2 text-xs font-bold rounded-xl transition-all ${
            uploadMode === 'url'
              ? 'bg-amber-500 text-slate-950 shadow'
              : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          <LinkIcon className="w-4 h-4" />
          <span>Register Storage URL</span>
        </button>
      </div>

      {uploadNotice && (
        <div className="p-3 bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 text-xs font-semibold rounded-xl flex items-center justify-between">
          <span>{uploadNotice}</span>
          <Check className="w-4 h-4" />
        </div>
      )}

      {/* Drag & Drop Upload Zone */}
      {uploadMode === 'drag' && (
        <div
          onDragEnter={handleDrag}
          onDragOver={handleDrag}
          onDragLeave={handleDrag}
          onDrop={handleDrop}
          className={`bg-slate-900 border-2 border-dashed rounded-2xl p-8 text-center transition-all ${
            dragActive ? 'border-amber-400 bg-amber-500/10' : 'border-slate-800 hover:border-slate-700'
          }`}
        >
          <div className="max-w-md mx-auto space-y-3">
            <div className="w-14 h-14 bg-amber-500/10 text-amber-400 rounded-2xl flex items-center justify-center mx-auto border border-amber-500/20 shadow-inner">
              <Upload className="w-7 h-7" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white font-serif">Drag and Drop PDF or Image file here</h3>
              <p className="text-xs text-slate-400 mt-1">Supports PDF documents, JPG, PNG, WEBP, or DOCX files</p>
            </div>
            <div>
              <label className="inline-flex items-center space-x-2 px-5 py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs rounded-xl shadow cursor-pointer transition-all">
                <HardDrive className="w-4 h-4" />
                <span>Browse Local Computer</span>
                <input
                  type="file"
                  accept=".pdf,.png,.jpg,.jpeg,.webp,.doc,.docx"
                  onChange={e => e.target.files?.[0] && handleFileUpload(e.target.files[0])}
                  className="hidden"
                />
              </label>
            </div>
          </div>
        </div>
      )}

      {/* Direct URL Form */}
      {uploadMode === 'url' && (
        <form onSubmit={handleUrlSubmit} className="bg-slate-900 border border-slate-800 p-6 rounded-2xl space-y-4">
          <h3 className="text-sm font-bold text-amber-400 font-serif flex items-center space-x-2">
            <LinkIcon className="w-4 h-4" />
            <span>Register External Asset URL</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 text-xs">
            <div>
              <label className="block text-slate-300 mb-1">File Name</label>
              <input
                type="text"
                required
                value={filename}
                onChange={e => setFilename(e.target.value)}
                placeholder="paper-2026-vol1.pdf"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
              />
            </div>

            <div>
              <label className="block text-slate-300 mb-1">Asset Type</label>
              <select
                value={fileType}
                onChange={e => {
                  setFileType(e.target.value);
                  setBucketName(e.target.value === 'pdf' ? 'journal-pdfs' : 'journal-images');
                }}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
              >
                <option value="pdf">PDF Document</option>
                <option value="image">Image (JPG/PNG)</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-300 mb-1">Supabase Storage Bucket</label>
              <input
                type="text"
                readOnly
                value={bucketName}
                className="w-full bg-slate-950/60 border border-slate-800 rounded-xl px-3 py-2 text-slate-400 font-mono text-[11px]"
              />
            </div>

            <div>
              <label className="block text-slate-300 mb-1">Asset Storage URL</label>
              <input
                type="text"
                required
                value={url}
                onChange={e => setUrl(e.target.value)}
                placeholder="/sample-paper.pdf or https://..."
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono text-[11px]"
              />
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              className="px-5 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs rounded-xl shadow"
            >
              Register URL Asset
            </button>
          </div>
        </form>
      )}

      {/* Media Search Bar */}
      <div className="flex items-center space-x-3 bg-slate-900 border border-slate-800 px-4 py-2.5 rounded-xl">
        <Search className="w-4 h-4 text-slate-400" />
        <input
          type="text"
          placeholder="Search media files by name or bucket..."
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          className="w-full bg-transparent text-xs text-white focus:outline-none placeholder-slate-500 font-sans"
        />
      </div>

      {/* Media Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredMedia.map(item => (
          <div key={item.id} className="bg-slate-900 border border-slate-800 p-5 rounded-2xl space-y-3 relative group shadow-lg hover:border-slate-700 transition-all">
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-amber-500/10 text-amber-400 rounded-xl flex-shrink-0">
                {item.file_type === 'pdf' ? <FileText className="w-6 h-6" /> : <ImageIcon className="w-6 h-6" />}
              </div>
              <div className="truncate flex-1">
                <h4 className="text-xs font-bold text-white font-mono truncate">{item.filename}</h4>
                <p className="text-[10px] text-slate-400">Bucket: {item.bucket_name}</p>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-slate-800/80 text-[11px]">
              <button
                onClick={() => handleCopyUrl(item.id, item.url)}
                className="flex items-center space-x-1 text-amber-400 hover:underline font-medium"
              >
                {copiedId === item.id ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedId === item.id ? 'URL Copied' : 'Copy URL'}</span>
              </button>

              <div className="flex items-center space-x-2">
                <a href={item.url} target="_blank" rel="noopener noreferrer" className="p-1 text-slate-400 hover:text-white" title="Open Media File">
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
                <button onClick={() => deleteMediaItem(item.id)} className="p-1 text-rose-400 hover:text-rose-300" title="Delete Media Item">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

