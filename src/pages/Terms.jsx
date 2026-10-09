import React from 'react';
import { useJournal } from '../context/JournalContext';
import { FileText, Scale } from 'lucide-react';

export const Terms = () => {
  const { settings } = useJournal();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-8 py-12 space-y-10">
      
      {/* Header */}
      <div className="bg-slate-900 text-white p-8 sm:p-12 rounded-3xl border border-slate-800 shadow-xl space-y-4">
        <div className="inline-flex items-center space-x-2 px-3 py-1 bg-blue-500/10 border border-blue-500/20 text-blue-400 rounded-full text-xs font-semibold uppercase tracking-wider">
          <Scale className="w-3.5 h-3.5" />
          <span>Legal Terms</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold font-serif">Terms & Conditions</h1>
        <p className="text-sm text-slate-300 max-w-3xl leading-relaxed">
          Terms of service governing the use of IJRT website, manuscript submission, and publication services.
        </p>
      </div>

      {/* Content */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8 space-y-8">
        
        {/* 1. Acceptance of Terms */}
        <section className="space-y-3">
          <h2 className="text-xl font-bold font-serif text-slate-900 border-b border-slate-100 pb-2">
            1. Acceptance of Terms
          </h2>
          <p className="text-sm text-slate-700 leading-relaxed">
            By accessing and using the International Journal of Research in Technology (IJRT) website 
            and services, you accept and agree to be bound by the terms and provisions of this agreement. If you do not agree 
            to these terms, please do not use this website or submit manuscripts.
          </p>
        </section>

        {/* 2. Services Offered */}
        <section className="space-y-3">
          <h2 className="text-xl font-bold font-serif text-slate-900 border-b border-slate-100 pb-2">
            2. Services Offered
          </h2>
          <p className="text-sm text-slate-700 leading-relaxed font-semibold mb-2">
            IJRT provides the following services:
          </p>
          <ul className="list-disc pl-5 space-y-2 text-sm text-slate-700">
            <li>
              <strong>Manuscript Submission Service:</strong> Free online submission system for research articles
            </li>
            <li>
              <strong>Peer Review Service:</strong> Double-blind peer review process (no fee charged)
            </li>
            <li>
              <strong>Editorial Screening Service:</strong> Initial editorial review and assessment (no fee charged)
            </li>
            <li>
              <strong>Article Processing Service (APC):</strong> Publication processing for accepted manuscripts
              <ul className="list-circle pl-5 mt-1 space-y-1">
                <li>Indian Authors (Non-Member): INR 2,000 per article</li>
                <li>Indian Authors (GASF Member): INR 1,200 per article (40% discount)</li>
                <li>Foreign Authors (Non-Member): USD 40 per article</li>
                <li>Foreign Authors (GASF Member): USD 24 per article (40% discount)</li>
              </ul>
            </li>
            <li>
              <strong>Online Publication Service:</strong> Open access publication with DOI assignment
            </li>
            <li>
              <strong>Archival Service:</strong> Permanent archival and indexing services
            </li>
          </ul>
        </section>

        {/* 3. User Responsibilities */}
        <section className="space-y-3">
          <h2 className="text-xl font-bold font-serif text-slate-900 border-b border-slate-100 pb-2">
            3. User Responsibilities
          </h2>
          <p className="text-sm text-slate-700 leading-relaxed">
            Authors submitting to IJRT agree to:
          </p>
          <ul className="list-disc pl-5 space-y-1.5 text-sm text-slate-700">
            <li>Submit original research work that has not been published elsewhere</li>
            <li>Ensure all co-authors have approved the manuscript submission</li>
            <li>Provide accurate contact information and institutional affiliations</li>
            <li>Declare any conflicts of interest or funding sources</li>
            <li>Obtain necessary permissions for copyrighted material</li>
            <li>Comply with ethical research practices and guidelines</li>
            <li>Respond promptly to editorial and reviewer communications</li>
          </ul>
        </section>

        {/* 4. Publication Charges */}
        <section className="space-y-3">
          <h2 className="text-xl font-bold font-serif text-slate-900 border-b border-slate-100 pb-2">
            4. Article Processing Charges (APC)
          </h2>
          <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl space-y-2">
            <p className="text-sm text-slate-700 leading-relaxed">
              <strong className="text-emerald-700">Important:</strong> There is <strong>NO FEE</strong> for manuscript submission, 
              editorial screening, or peer review. APC is payable <strong>ONLY AFTER</strong> the manuscript has been 
              <strong> officially accepted</strong> for publication.
            </p>
          </div>
          <p className="text-sm text-slate-700 leading-relaxed mt-3">
            The Article Processing Charge (APC) covers:
          </p>
          <ul className="list-disc pl-5 space-y-1 text-sm text-slate-700">
            <li>Manuscript processing and formatting</li>
            <li>DOI assignment and registration</li>
            <li>Online hosting and archival</li>
            <li>Open access publication</li>
            <li>Distribution and indexing services</li>
          </ul>
        </section>

        {/* 5. Payment Terms */}
        <section className="space-y-3">
          <h2 className="text-xl font-bold font-serif text-slate-900 border-b border-slate-100 pb-2">
            5. Payment Terms
          </h2>
          <ul className="list-disc pl-5 space-y-1.5 text-sm text-slate-700">
            <li>All payments are processed through secure payment gateway (Cashfree)</li>
            <li>Payments must be made within 15 days of acceptance notification</li>
            <li>APC pricing is in INR (Indian Rupees) for Indian authors and USD for foreign authors</li>
            <li>GASF membership discount (40%) is applicable only when valid membership number is provided</li>
            <li>Payment confirmation will be sent via email</li>
            <li>Publication will proceed only after successful payment verification</li>
          </ul>
        </section>

        {/* 6. Copyright and Licensing */}
        <section className="space-y-3">
          <h2 className="text-xl font-bold font-serif text-slate-900 border-b border-slate-100 pb-2">
            6. Copyright and Licensing
          </h2>
          <p className="text-sm text-slate-700 leading-relaxed">
            Authors retain copyright of their published work. All articles are published under 
            Creative Commons Attribution 4.0 International License (CC BY 4.0), allowing readers to 
            freely share and adapt the work with proper attribution.
          </p>
          <p className="text-sm text-slate-700 leading-relaxed">
            See our <a href="/copyright" className="text-blue-600 hover:underline">Copyright Policy</a> for complete details.
          </p>
        </section>

        {/* 7. Withdrawal and Rejection */}
        <section className="space-y-3">
          <h2 className="text-xl font-bold font-serif text-slate-900 border-b border-slate-100 pb-2">
            7. Manuscript Withdrawal and Rejection
          </h2>
          <ul className="list-disc pl-5 space-y-1.5 text-sm text-slate-700">
            <li>Authors may withdraw manuscripts before peer review completion at no charge</li>
            <li>Withdrawal after acceptance requires written notification and may forfeit APC</li>
            <li>Rejected manuscripts will not incur any charges</li>
            <li>Editorial decisions are final and not subject to appeal</li>
          </ul>
        </section>

        {/* 8. Website Usage */}
        <section className="space-y-3">
          <h2 className="text-xl font-bold font-serif text-slate-900 border-b border-slate-100 pb-2">
            8. Website Usage and Restrictions
          </h2>
          <p className="text-sm text-slate-700 leading-relaxed">
            Users agree NOT to:
          </p>
          <ul className="list-disc pl-5 space-y-1.5 text-sm text-slate-700">
            <li>Use automated systems (bots, scrapers) to access the website</li>
            <li>Submit fraudulent, plagiarized, or copyrighted material</li>
            <li>Misrepresent authorship or institutional affiliations</li>
            <li>Interfere with website functionality or security</li>
            <li>Use the website for any unlawful purpose</li>
          </ul>
        </section>

        {/* 9. Privacy and Data Protection */}
        <section className="space-y-3">
          <h2 className="text-xl font-bold font-serif text-slate-900 border-b border-slate-100 pb-2">
            9. Privacy and Data Protection
          </h2>
          <p className="text-sm text-slate-700 leading-relaxed">
            IJRT respects user privacy and handles personal data in accordance with our 
            <a href="/privacy" className="text-blue-600 hover:underline ml-1">Privacy Policy</a>. 
            Author information is used solely for publication and correspondence purposes.
          </p>
        </section>

        {/* 10. Limitation of Liability */}
        <section className="space-y-3">
          <h2 className="text-xl font-bold font-serif text-slate-900 border-b border-slate-100 pb-2">
            10. Limitation of Liability
          </h2>
          <p className="text-sm text-slate-700 leading-relaxed">
            IJRT and its publisher shall not be liable for any indirect, incidental, special, 
            consequential, or punitive damages arising from the use of this website or services. 
            The maximum liability shall be limited to the amount of APC paid for the specific article.
          </p>
        </section>

        {/* 11. Modifications to Terms */}
        <section className="space-y-3">
          <h2 className="text-xl font-bold font-serif text-slate-900 border-b border-slate-100 pb-2">
            11. Modifications to Terms
          </h2>
          <p className="text-sm text-slate-700 leading-relaxed">
            IJRT reserves the right to modify these terms at any time. Changes will be effective 
            immediately upon posting to the website. Continued use of the website after changes 
            constitutes acceptance of the modified terms.
          </p>
        </section>

        {/* 12. Governing Law */}
        <section className="space-y-3">
          <h2 className="text-xl font-bold font-serif text-slate-900 border-b border-slate-100 pb-2">
            12. Governing Law and Jurisdiction
          </h2>
          <p className="text-sm text-slate-700 leading-relaxed">
            These terms shall be governed by and construed in accordance with the laws of India. 
            Any disputes shall be subject to the exclusive jurisdiction of courts in India.
          </p>
        </section>

        {/* Contact */}
        <section className="p-4 bg-slate-50 border border-slate-200 rounded-xl">
          <h3 className="font-bold text-slate-900 text-sm mb-2">Questions About These Terms?</h3>
          <p className="text-xs text-slate-600">
            For clarifications regarding these terms and conditions, please contact the editorial office at:{' '}
            <a href={`mailto:${settings.contact_email}`} className="text-blue-600 hover:underline font-medium">
              {settings.contact_email}
            </a>
          </p>
        </section>

        {/* Last Updated */}
        <div className="pt-4 border-t border-slate-200 text-center">
          <p className="text-xs text-slate-500">
            Last Updated: October 3, 2026
          </p>
          <p className="text-xs text-slate-500 mt-1">
            Published by: {settings.publisher}
          </p>
        </div>

      </div>
    </div>
  );
};


