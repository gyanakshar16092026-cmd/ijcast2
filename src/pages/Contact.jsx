import React from 'react';
import { useJournal } from '../context/JournalContext';
import { Mail, Phone, MapPin, Building, Send, Globe, Award } from 'lucide-react';

export const Contact = () => {
  const { settings, setIsSubmitOpen } = useJournal();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-8 py-12 space-y-10">
      {/* Header */}
      <div className="bg-slate-900 text-white p-8 sm:p-12 rounded-3xl border border-slate-800 shadow-xl space-y-4">
        <div className="inline-flex items-center space-x-2 px-3 py-1 bg-amber-500/10 border border-amber-500/20 text-amber-400 rounded-full text-xs font-semibold uppercase tracking-wider">
          <Mail className="w-3.5 h-3.5" />
          <span>Editorial Communication</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold font-serif">Contact Editorial Office</h1>
        <p className="text-sm text-slate-300 max-w-3xl leading-relaxed">
          Official contact details for editorial inquiries, manuscript submissions, and administrative correspondence.
        </p>
      </div>

      {/* Main Details Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Editorial Office & Address Card */}
        <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
          <div className="border-b border-slate-100 pb-3">
            <span className="text-xs uppercase font-bold text-amber-700 tracking-wider">Official Headquarters</span>
            <h2 className="text-2xl font-bold font-serif text-slate-900">Editorial Office</h2>
          </div>

          <div className="space-y-4 text-sm text-slate-700">
            <div className="flex items-start space-x-3">
              <Building className="w-5 h-5 text-amber-600 flex-shrink-0 mt-1" />
              <div>
                <p className="font-bold text-slate-900 font-serif">{settings.journal_name}</p>
                <p className="text-xs text-slate-500">{settings.publisher}</p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <MapPin className="w-5 h-5 text-amber-600 flex-shrink-0 mt-1" />
              <div>
                <p className="font-semibold text-slate-900">Postal Address:</p>
                <p className="text-xs text-slate-600 leading-relaxed">{settings.postal_address}</p>
              </div>
            </div>

            {settings.phone && (
              <div className="flex items-start space-x-3">
                <Phone className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-slate-900">Telephone / Fax:</p>
                  <p className="text-xs text-slate-600 font-mono">{settings.phone}</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Email Correspondence Card */}
        <div className="bg-slate-900 text-white p-8 rounded-3xl border border-slate-800 shadow-xl space-y-6">
          <div className="border-b border-slate-800 pb-3">
            <span className="text-xs uppercase font-bold text-amber-400 tracking-wider">Direct Email Channels</span>
            <h2 className="text-2xl font-bold font-serif text-white">Email Addresses</h2>
          </div>

          <div className="space-y-4">
            <div className="p-5 bg-slate-950 border border-slate-800 rounded-2xl space-y-1">
              <span className="text-xs uppercase font-bold text-slate-400">Editor-in-Chief & Submissions</span>
              <p className="text-xl font-bold text-amber-400 font-mono break-all">{settings.contact_email}</p>
              <p className="text-xs text-slate-400">For manuscript submissions, revision uploads, and peer review queries.</p>
            </div>

            {settings.alternate_email && (
              <div className="p-5 bg-slate-950 border border-slate-800 rounded-2xl space-y-1">
                <span className="text-xs uppercase font-bold text-slate-400">General Administrative Office</span>
                <p className="text-lg font-bold text-slate-200 font-mono break-all">{settings.alternate_email}</p>
                <p className="text-xs text-slate-400">For publisher requests, indexing confirmations, and technical queries.</p>
              </div>
            )}

            <div className="pt-2">
              <button
                onClick={() => setIsSubmitOpen(true)}
                className="w-full py-3.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-xl text-xs transition-colors flex items-center justify-center space-x-2"
              >
                <Send className="w-4 h-4" />
                <span>Open Manuscript Email Portal</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

