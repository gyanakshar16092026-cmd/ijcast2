import React from 'react';
import { useJournal } from '../context/JournalContext';
import { Send, FileText, CheckCircle2, ArrowRight, ShieldCheck, DollarSign, Layers, ArrowDown, Download } from 'lucide-react';

export const ForAuthors = () => {
  const { settings, setIsSubmitOpen } = useJournal();

  const workflowSteps = [
    { step: 1, title: 'Submit Manuscript', desc: 'Author sends manuscript via official journal email attachment.' },
    { step: 2, title: 'Editorial Screening', desc: 'Editorial team checks scope, basic quality, formatting, and originality.' },
    { step: 3, title: 'Peer Review', desc: 'Manuscript undergoes double-blind peer review by qualified domain reviewers.' },
    { step: 4, title: 'Editorial Decision', desc: 'Decision issued: Accept, Minor Revision, Major Revision, or Reject.' },
    { step: 5, title: 'Plagiarism Check', desc: 'Accepted manuscript undergoes thorough similarity checking.' },
    { step: 6, title: 'APC Payment', desc: 'Author pays applicable Article Processing Charge (if accepted).' },
    { step: 7, title: 'Final Processing', desc: 'Editorial team formats typeset layout, proofing, and assigns DOI.' },
    { step: 8, title: 'Publication', desc: 'Administrator uploads and publishes final article to Volume & Issue archive.' }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-8 py-12 space-y-12">
      {/* Header */}
      <div className="bg-slate-900 text-white p-8 sm:p-12 rounded-3xl border border-slate-800 shadow-xl space-y-4">
        <div className="inline-flex items-center space-x-2 px-3 py-1 bg-amber-500/10 border border-amber-500/20 text-amber-400 rounded-full text-xs font-semibold uppercase tracking-wider">
          <FileText className="w-3.5 h-3.5" />
          <span>Author Portal & Information</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold font-serif">For Authors</h1>
        <p className="text-sm text-slate-300 max-w-3xl leading-relaxed">
          Comprehensive author guidelines, manuscript formatting requirements, submission procedures, and the 8-step editorial workflow.
        </p>

        <div className="pt-4 flex flex-wrap items-center gap-4">
          <button
            onClick={() => setIsSubmitOpen(true)}
            className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-bold rounded-xl shadow-lg transition-all text-sm"
          >
            <Send className="w-4 h-4" />
            <span>SUBMIT MANUSCRIPT VIA EMAIL</span>
          </button>
        </div>
      </div>

      {/* Author Guidelines Section */}
      <section id="guidelines" className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">        <div className="border-b border-slate-100 pb-3">
          <span className="text-xs uppercase font-bold text-amber-700 tracking-wider">Preparation Standard</span>
          <h2 className="text-2xl font-bold font-serif text-slate-900">Author Formatting Guidelines</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs text-slate-700">
          <div className="p-4 bg-slate-50 border border-slate-100 rounded-xl space-y-2">
            <h4 className="font-bold text-slate-900 text-sm">1. Manuscript Format & Typography</h4>
            <ul className="space-y-1.5 list-disc pl-4 text-slate-600">
              <li><strong>File Format:</strong> Microsoft Word (.doc / .docx)</li>
              <li><strong>Font:</strong> Times New Roman / Arial</li>
              <li><strong>Font Size:</strong> Title (16pt Bold), Headings (12pt Bold), Body Text (10pt Regular)</li>
              <li><strong>Line Spacing:</strong> 1.5 Line Spacing throughout</li>
              <li><strong>Page Format:</strong> A4 Size with standard 1-inch margins</li>
            </ul>
          </div>

          <div className="p-4 bg-slate-50 border border-slate-100 rounded-xl space-y-2">
            <h4 className="font-bold text-slate-900 text-sm">2. Abstract & Keywords</h4>
            <ul className="space-y-1.5 list-disc pl-4 text-slate-600">
              <li><strong>Abstract:</strong> Structured summary of 150 to 250 words outlining background, methodology, results, and conclusion.</li>
              <li><strong>Keywords:</strong> 4 to 6 relevant indexing keywords separated by semicolons.</li>
              <li><strong>Author Details:</strong> Complete affiliations, email addresses, and ORCID IDs.</li>
            </ul>
          </div>

          <div className="p-4 bg-slate-50 border border-slate-100 rounded-xl space-y-2">
            <h4 className="font-bold text-slate-900 text-sm">3. Tables & Figures</h4>
            <ul className="space-y-1.5 list-disc pl-4 text-slate-600">
              <li>All tables and figures must be embedded directly inside the manuscript document.</li>
              <li>Include descriptive captions above tables and below figures.</li>
              <li>Ensure high resolution (minimum 300 DPI) for graphic figures.</li>
            </ul>
          </div>

          <div className="p-4 bg-slate-50 border border-slate-100 rounded-xl space-y-2">
            <h4 className="font-bold text-slate-900 text-sm">4. References & Citation Style</h4>
            <ul className="space-y-1.5 list-disc pl-4 text-slate-600">
              <li><strong>Style:</strong> Standard APA 7th Edition or IEEE format.</li>
              <li>All cited literature must appear in the References list at the end of the manuscript.</li>
              <li>Include active DOIs for all reference items where available.</li>
            </ul>
          </div>
        </div>

        {/* Paper Template + Copyright Transfer Downloads */}
        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Paper Template */}
          <div className="p-5 bg-gradient-to-r from-amber-50 to-amber-100/60 border border-amber-200 rounded-2xl flex items-start space-x-3">
            <div className="p-2.5 bg-amber-500/20 rounded-xl text-amber-700 flex-shrink-0">
              <FileText className="w-5 h-5" />
            </div>
            <div className="flex-1 space-y-2">
              <div>
                <h4 className="text-sm font-bold text-slate-900">IJCAST Manuscript Template</h4>
                <p className="text-xs text-slate-600 mt-0.5">Official Word template for formatting your paper before submission.</p>
                <p className="text-[11px] text-amber-700 font-medium mt-1">IJRT Paper Template.docx</p>
              </div>
              <a
                href="/IJRT Paper Template.docx"
                download="IJRT Paper Template.docx"
                className="inline-flex items-center space-x-2 px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-xl shadow transition-colors"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download Template</span>
              </a>
            </div>
          </div>

          {/* Copyright Transfer Agreement */}
          <div className="p-5 bg-slate-50 border border-slate-200 rounded-2xl flex items-start space-x-3">
            <div className="p-2.5 bg-slate-200 rounded-xl text-slate-700 flex-shrink-0">
              <FileText className="w-5 h-5" />
            </div>
            <div className="flex-1 space-y-2">
              <div>
                <h4 className="text-sm font-bold text-slate-900">Copyright Transfer Agreement</h4>
                <p className="text-xs text-slate-600 mt-0.5">Fill, sign and submit this form along with your manuscript.</p>
                <p className="text-[11px] text-slate-500 font-medium mt-1">Copyright transfer agreement-IJRT.pdf</p>
              </div>
              <a
                href="/Copyright transfer agreement-IJRT.pdf"
                download="Copyright transfer agreement-IJRT.pdf"
                className="inline-flex items-center space-x-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs rounded-xl shadow transition-colors"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download Form</span>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* 8-Step Submission Workflow Visualization */}
      <section id="submission" className="space-y-6">
        <div id="workflow" className="border-b border-slate-200 pb-3">
          <span className="text-xs uppercase font-bold text-amber-700 tracking-wider">Operational Model</span>
          <h2 className="text-2xl font-bold font-serif text-slate-900">8-Step Editorial Submission Workflow</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {workflowSteps.map((ws) => (
            <div
              key={ws.step}
              className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-sm hover:shadow-md hover:border-amber-400 transition-all flex flex-col justify-between space-y-4 relative overflow-hidden group"
            >
              {/* Circular Step Badge + Step Counter */}
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <div className="flex items-center space-x-2.5">
                  <div className="w-9 h-9 rounded-xl bg-slate-900 text-amber-400 font-bold font-mono text-sm flex items-center justify-center shadow-md group-hover:bg-amber-500 group-hover:text-slate-950 transition-colors">
                    {ws.step < 10 ? `0${ws.step}` : ws.step}
                  </div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-amber-700 font-mono">Step {ws.step}</span>
                </div>
                <span className="text-[10px] font-mono font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">
                  0{ws.step} / 08
                </span>
              </div>

              {/* Title & Description Box */}
              <div className="space-y-2 flex-1 pt-1">
                <h3 className="text-sm font-bold text-slate-900 font-serif leading-snug">{ws.title}</h3>
                <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-100">{ws.desc}</p>
              </div>

              {/* Bottom Phase Indicator */}
              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500 font-medium">
                <span className="px-2 py-0.5 bg-amber-50 text-amber-900 font-bold rounded text-[10px]">
                  Phase: {ws.step <= 4 ? 'Editorial & Peer Review' : 'APC & Archival Publish'}
                </span>
                <ArrowRight className="w-3.5 h-3.5 text-amber-600 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Bottom CTA Card */}
      <div id="submit-now" className="bg-slate-900 text-white p-8 rounded-3xl border border-slate-800 shadow-xl flex flex-col sm:flex-row items-center justify-between gap-6">
        <div>
          <h3 className="text-xl font-bold font-serif">Ready to Submit Your Manuscript?</h3>
          <p className="text-xs text-slate-300 mt-1">Send your manuscript attachment directly to the official journal email address.</p>
        </div>
        <button
          onClick={() => setIsSubmitOpen(true)}
          className="px-6 py-3 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs rounded-xl shadow-lg transition-all"
        >
          SUBMIT MANUSCRIPT NOW
        </button>
      </div>
    </div>
  );
};

