import React from 'react';
import { useJournal } from '../../context/JournalContext';
import { X, ExternalLink, Download, FileText } from 'lucide-react';

export const PDFViewerModal = () => {
  const { pdfModalData, setPdfModalData } = useJournal();

  if (!pdfModalData) return null;

  const { url, title } = pdfModalData;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 backdrop-blur-md p-4">
      <div className="bg-slate-900 w-full max-w-5xl h-[90vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-slate-800">
        {/* Modal Top Bar */}
        <div className="bg-slate-950 px-6 py-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-3 truncate mr-4">
            <div className="p-2 bg-amber-500/10 text-amber-400 rounded-lg">
              <FileText className="w-5 h-5" />
            </div>
            <div className="truncate">
              <h3 className="text-white font-medium text-sm truncate font-serif">{title || 'Manuscript PDF Document'}</h3>
              <p className="text-xs text-slate-400">PDF Reader Preview</p>
            </div>
          </div>

          {/* Separate Actions: Open in new window, Download, Close */}
          <div className="flex items-center space-x-2 flex-shrink-0">
            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center space-x-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium rounded-lg transition-colors border border-slate-700"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Open in New Window</span>
            </a>
            <a
              href={url}
              download
              className="flex items-center space-x-1.5 px-3.5 py-1.5 bg-amber-600 hover:bg-amber-500 text-white text-xs font-medium rounded-lg shadow-sm transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download PDF</span>
            </a>
            <button
              onClick={() => setPdfModalData(null)}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Embedded Viewer Container */}
        <div className="flex-1 bg-slate-950 relative overflow-hidden">
          <object
            data={url}
            type="application/pdf"
            className="w-full h-full border-0"
          >
            <iframe
              src={url}
              title={title || 'PDF Document'}
              className="w-full h-full border-0"
            >
              <div className="flex flex-col items-center justify-center h-full p-8 text-center space-y-4 text-white">
                <FileText className="w-16 h-16 text-amber-500" />
                <h4 className="text-lg font-bold font-serif">{title || 'Manuscript PDF Document'}</h4>
                <p className="text-xs text-slate-400 max-w-md">
                  Your browser does not support direct PDF iframe embedding or the file is stored cross-domain. You can open or download the PDF document directly below.
                </p>
                <div className="flex items-center space-x-3 pt-2">
                  <a
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2 bg-amber-500 text-slate-950 font-bold rounded-xl text-xs flex items-center space-x-2"
                  >
                    <ExternalLink className="w-4 h-4" />
                    <span>Open PDF Document</span>
                  </a>
                  <a
                    href={url}
                    download
                    className="px-4 py-2 bg-slate-800 text-slate-200 font-semibold rounded-xl text-xs flex items-center space-x-2 border border-slate-700"
                  >
                    <Download className="w-4 h-4" />
                    <span>Download PDF</span>
                  </a>
                </div>
              </div>
            </iframe>
          </object>
        </div>
      </div>
    </div>
  );
};

