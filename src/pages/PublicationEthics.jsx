import React from 'react';
import { useJournal } from '../context/JournalContext';
import { ShieldCheck, CheckCircle2, AlertTriangle, FileText, Bot, RefreshCw } from 'lucide-react';

export const PublicationEthics = () => {
  const { pageContents } = useJournal();

  const aiPolicyContent = pageContents.find(p => p.page_key === 'ethics' && p.section_key === 'ai_policy')?.content || `IJCAST adheres strictly to international publication standards regarding modern technology tools:
1. **Authorship Eligibility**: Generative AI tools (e.g. ChatGPT, Claude, Copilot) cannot be credited as authors or co-authors. Authorship implies legal accountability and intellectual ownership.
2. **Author Responsibility**: Authors remain 100% accountable for the originality, factual accuracy, data integrity, and citation fidelity of their manuscript.
3. **Mandatory Disclosure**: Any substantive use of AI tools for data analysis, code generation, or draft synthesis must be explicitly disclosed in the Methods or Acknowledgments section.
4. **Reviewer Confidentiality**: Peer reviewers must never upload confidential manuscripts to external generative AI platforms.
5. **Reference Verification**: All citations generated or assisted by AI must be independently verified by the author.`;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-8 py-12 space-y-10">
      {/* Header */}
      <div className="bg-slate-900 text-white p-8 sm:p-12 rounded-3xl border border-slate-800 shadow-xl space-y-4">
        <div className="inline-flex items-center space-x-2 px-3 py-1 bg-amber-500/10 border border-amber-500/20 text-amber-400 rounded-full text-xs font-semibold uppercase tracking-wider">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Integrity & Standards</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold font-serif">Publication Ethics & Editorial Policies</h1>
        <p className="text-sm text-slate-300 max-w-3xl leading-relaxed">
          Comprehensive policies concerning peer review, plagiarism screening, authorship responsibility, research misconduct, retractions, and generative AI guidelines.
        </p>
      </div>

      {/* Grid of Policies */}
      <div className="grid grid-cols-1 gap-8">
        {/* Policy 1: Publication Ethics & Peer Review */}
        <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <h2 className="text-xl font-bold font-serif text-slate-900 border-b border-slate-100 pb-3 flex items-center space-x-2">
            <CheckCircle2 className="w-5 h-5 text-amber-600" />
            <span>Peer Review Policy</span>
          </h2>
          <p className="text-sm text-slate-700 leading-relaxed">
            IJCAST enforces a rigorous <strong>double-blind peer-review process</strong>. Every submitted manuscript undergoes initial screening by the Editorial Board for scope and quality, followed by external evaluation by at least two independent expert peer reviewers. Reviewers assess original contributions, methodological soundness, ethical compliance, and clarity.
          </p>
        </div>

        {/* Policy 2: Plagiarism Policy & Workflow */}
        <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <h2 className="text-xl font-bold font-serif text-slate-900 border-b border-slate-100 pb-3 flex items-center space-x-2">
            <AlertTriangle className="w-5 h-5 text-amber-600" />
            <span>Plagiarism & Similarity Screening Policy</span>
          </h2>
          <p className="text-sm text-slate-700 leading-relaxed">
            Plagiarism, data fabrication, redundant publication (self-plagiarism), and citation manipulation are strictly prohibited. Accepted manuscripts undergo automated similarity screening using industry-standard software prior to final publication.
          </p>
          <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 space-y-1">
            <p className="font-bold">Plagiarism Check Workflow:</p>
            <p className="font-mono">Submission → Editorial Review → Acceptance → Similarity Check → APC Payment → Final Publication</p>
            <p className="text-[11px] text-slate-600 pt-1">If a manuscript fails the journal's originality requirements, publication will not proceed.</p>
          </div>
        </div>

        {/* Policy 3: AI / Generative AI Policy */}
        <div className="bg-slate-900 text-white p-8 rounded-2xl border border-slate-800 shadow-xl space-y-4">
          <h2 className="text-xl font-bold font-serif text-white border-b border-slate-800 pb-3 flex items-center space-x-2">
            <Bot className="w-5 h-5 text-amber-400" />
            <span>AI / Generative AI Policy</span>
          </h2>
          <div className="prose prose-invert text-xs text-slate-300 leading-relaxed space-y-2 whitespace-pre-wrap font-sans">
            {aiPolicyContent}
          </div>
        </div>

        {/* Policy 4: Retraction & Correction Policy */}
        <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <h2 className="text-xl font-bold font-serif text-slate-900 border-b border-slate-100 pb-3 flex items-center space-x-2">
            <RefreshCw className="w-5 h-5 text-amber-600" />
            <span>Correction, Retraction & Withdrawal Policy</span>
          </h2>
          <p className="text-sm text-slate-700 leading-relaxed">
            If errors are discovered post-publication, IJCAST publishes formal Corrigenda or Errata. Articles violating academic integrity, containing fabricated data, or infringing copyright will be formally retracted in accordance with COPE (Committee on Publication Ethics) guidelines.
          </p>
        </div>
      </div>
    </div>
  );
};

