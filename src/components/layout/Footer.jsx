import React from 'react';
import { Link } from 'react-router-dom';
import { useJournal } from '../../context/JournalContext';
import { BookOpen, ShieldCheck, Lock } from 'lucide-react';

export const Footer = () => {
  const { settings, setIsSubmitOpen } = useJournal();

  return (
    <footer className="bg-slate-950 text-slate-400 text-xs border-t border-slate-800">
      {/* Top Footer Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-8 py-12 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
        {/* Col 1: About Journal */}
        <div className="space-y-3 md:col-span-1">
          <div className="flex items-center space-x-2 text-white">
            <BookOpen className="w-5 h-5 text-amber-500" />
            <span className="font-serif font-bold text-sm">{settings.short_name || 'IJRT'}</span>
          </div>
          <p className="text-slate-400 leading-relaxed text-[11px]">
            {settings.journal_name} is an international multidisciplinary peer-reviewed open access journal dedicated to publishing pioneering research across Commerce, Arts, Science, and Technology.
          </p>
          <div className="pt-2 text-[11px] text-slate-500 space-y-1">
            <p><strong className="text-slate-300">Publisher:</strong> {settings.publisher}</p>
            <p><strong className="text-slate-300">Frequency:</strong> {settings.publication_frequency}</p>
          </div>
        </div>

        {/* Col 2: Navigation Links */}
        <div className="space-y-3">
          <h4 className="font-serif font-bold text-slate-200 text-sm">Quick Links</h4>
          <ul className="space-y-2 text-[11px]">
            <li><Link to="/about" className="hover:text-amber-400 transition-colors">About IJRT</Link></li>
            <li><Link to="/editorial-board" className="hover:text-amber-400 transition-colors">Editorial Board</Link></li>
            <li><Link to="/for-authors" className="hover:text-amber-400 transition-colors">Author Guidelines</Link></li>
            <li><button onClick={() => setIsSubmitOpen(true)} className="hover:text-amber-400 transition-colors text-left">Submit Manuscript</button></li>
            <li><Link to="/current-issue" className="hover:text-amber-400 transition-colors">Current Issue</Link></li>
            <li><Link to="/archives" className="hover:text-amber-400 transition-colors">Journal Archives</Link></li>
          </ul>
        </div>

        {/* Col 3: Policies & Ethics */}
        <div className="space-y-3">
          <h4 className="font-serif font-bold text-slate-200 text-sm">Policies & Ethics</h4>
          <ul className="space-y-2 text-[11px]">
            <li><Link to="/publication-ethics" className="hover:text-amber-400 transition-colors">Publication Ethics & Peer Review</Link></li>
            <li><Link to="/apc" className="hover:text-amber-400 transition-colors">Article Processing Charges (APC)</Link></li>
            <li><Link to="/indexing" className="hover:text-amber-400 transition-colors">Indexing & Abstracting</Link></li>
            <li><Link to="/copyright" className="hover:text-amber-400 transition-colors">Copyright & Licensing</Link></li>
            <li><Link to="/privacy" className="hover:text-amber-400 transition-colors">Privacy Policy</Link></li>
            <li><Link to="/terms" className="hover:text-amber-400 transition-colors">Terms & Conditions</Link></li>
            <li><Link to="/refunds" className="hover:text-amber-400 transition-colors">Refunds & Cancellations</Link></li>
            <li><Link to="/contact" className="hover:text-amber-400 transition-colors">Contact Editorial Office</Link></li>
          </ul>
        </div>

        {/* Col 4: Metadata & Specs */}
        <div className="space-y-3">
          <h4 className="font-serif font-bold text-slate-200 text-sm">Journal Credentials</h4>
          <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl space-y-2 text-[11px]">
            {settings.eissn && (
              <p className="flex items-center space-x-2 text-slate-300 font-medium">
                <ShieldCheck className="w-4 h-4 text-emerald-500" />
                <span>{settings.eissn}</span>
              </p>
            )}
            {settings.doi_prefix && (
              <p className="text-slate-400">
                DOI Prefix: <span className="font-mono text-amber-400">{settings.doi_prefix}</span>
              </p>
            )}
          </div>
          <p className="text-[10px] text-slate-500">
            {settings.copyright_statement}
          </p>
        </div>
      </div>

      {/* Bottom Bar & Admin Link */}
      <div className="bg-slate-900/80 border-t border-slate-800/80 py-4 px-4 sm:px-8">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-slate-500">
          <p>© {new Date().getFullYear()} {settings.short_name || 'IJRT'}. All rights reserved.</p>
          <div className="flex items-center space-x-4">
            <Link to="/terms" className="hover:text-slate-300">Terms & Conditions</Link>
            <Link to="/privacy" className="hover:text-slate-300">Privacy Policy</Link>
            <Link to="/refunds" className="hover:text-slate-300">Refunds & Cancellations</Link>
            <Link to="/contact" className="hover:text-slate-300">Contact Us</Link>
            <Link
              to="/admin/login"
              className="flex items-center space-x-1 px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded border border-slate-700 transition-colors"
            >
              <Lock className="w-3 h-3 text-amber-500" />
              <span>Administrator Portal</span>
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};


