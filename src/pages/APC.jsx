import React, { useState } from 'react';
import { DollarSign, CheckCircle2, AlertCircle, Users, ExternalLink, CreditCard } from 'lucide-react';
import { APCPaymentForm } from '../components/common/APCPaymentForm';

export const APC = () => {
  const [showPaymentForm, setShowPaymentForm] = useState(false);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-8 py-12 space-y-10">

      {/* Header */}
      <div className="bg-slate-900 text-white p-8 sm:p-12 rounded-3xl border border-slate-800 shadow-xl space-y-4">
        <div className="inline-flex items-center space-x-2 px-3 py-1 bg-amber-500/10 border border-amber-500/20 text-amber-400 rounded-full text-xs font-semibold uppercase tracking-wider">
          <DollarSign className="w-3.5 h-3.5" />
          <span>Publication Charges</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold font-serif">Article Processing Charge (APC)</h1>
        <p className="text-sm text-slate-300 max-w-3xl leading-relaxed">
          The journal follows a transparent, no-fee submission and peer-review policy.
        </p>
      </div>

      {/* No Fee Notice Banner */}
      <div className="flex items-start gap-4 bg-emerald-50 border border-emerald-200 p-6 rounded-2xl">
        <CheckCircle2 className="w-6 h-6 text-emerald-600 flex-shrink-0 mt-0.5" />
        <div className="space-y-1">
          <p className="text-sm font-bold text-slate-900">
            <span className="text-emerald-700">No fee</span> is charged for submitting a research article or during the editorial screening and peer-review process.
          </p>
          <p className="text-sm text-slate-700">
            An Article Processing Charge (APC) is applicable <strong>only after</strong> the manuscript has been <strong>formally accepted</strong> for publication.
          </p>
        </div>
      </div>

      {/* APC Fee Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="bg-slate-900 px-6 py-4">
          <h2 className="text-lg font-bold font-serif text-white">APC Fee Structure</h2>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[500px]">
            <thead>
              <tr>
                <th className="p-4 text-left bg-slate-800 text-white font-bold">Type of Author</th>
                <th className="p-4 text-center bg-amber-600 text-white font-bold">
                  APC for Non-Member of GASF
                </th>
                <th className="p-4 text-center bg-emerald-600 text-white font-bold">
                  APC for Member of GASF<br />
                  <span className="text-xs font-normal opacity-90">(40% Discount)</span>
                </th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-slate-100">
                <td className="p-4 font-semibold text-slate-800 flex items-center gap-3">
                  <span className="text-2xl">🇮🇳</span>
                  <span>Indian Author</span>
                </td>
                <td className="p-4 text-center">
                  <p className="text-2xl font-extrabold text-amber-600">₹ 2,000/-</p>
                  <p className="text-xs text-slate-500 mt-0.5">per accepted article</p>
                </td>
                <td className="p-4 text-center">
                  <p className="text-2xl font-extrabold text-emerald-600">₹ 1,200/-</p>
                  <p className="text-xs text-slate-500 mt-0.5">per accepted article</p>
                </td>
              </tr>
              <tr>
                <td className="p-4 font-semibold text-slate-800 flex items-center gap-3">
                  <span className="text-2xl">🌍</span>
                  <span>Foreign Author</span>
                </td>
                <td className="p-4 text-center">
                  <p className="text-2xl font-extrabold text-amber-600">USD 40</p>
                  <p className="text-xs text-slate-500 mt-0.5">per accepted article</p>
                </td>
                <td className="p-4 text-center">
                  <p className="text-2xl font-extrabold text-emerald-600">USD 24</p>
                  <p className="text-xs text-slate-500 mt-0.5">per accepted article</p>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Three Info Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        {/* Membership Discount */}
        <div className="bg-sky-50 border border-sky-200 p-6 rounded-2xl space-y-3">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-sky-600 rounded-xl">
              <Users className="w-5 h-5 text-white" />
            </div>
            <h3 className="font-bold text-slate-900 text-sm">Membership Discount</h3>
          </div>
          <p className="text-xs text-slate-700 leading-relaxed">
            Individual Student Members and Professional Members of Gyan Akshar Sanskriti Foundation (GASF) are eligible for a{' '}
            <strong className="text-sky-700">40% discount</strong> on the applicable APC.
          </p>
        </div>

        {/* Important */}
        <div className="bg-rose-50 border border-rose-200 p-6 rounded-2xl space-y-3">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-rose-600 rounded-xl">
              <AlertCircle className="w-5 h-5 text-white" />
            </div>
            <h3 className="font-bold text-slate-900 text-sm">Important</h3>
          </div>
          <p className="text-xs text-slate-700 leading-relaxed">
            To avail of the membership discount, the author must mention the valid{' '}
            <strong>Membership Number</strong> while making the APC payment. The discounted APC will{' '}
            <strong>not be applicable</strong> without the membership number.
          </p>
        </div>

        {/* Become a Member */}
        <div className="bg-emerald-50 border border-emerald-200 p-6 rounded-2xl space-y-3">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-emerald-600 rounded-xl">
              <Users className="w-5 h-5 text-white" />
            </div>
            <h3 className="font-bold text-slate-900 text-sm">Become a Member</h3>
          </div>
          <p className="text-xs text-slate-700 leading-relaxed">
            Authors interested in becoming a Student Member or Professional Member of GASF may apply for membership through the link below.
          </p>
          <a
            href="https://gyanaksharfoundation.org"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition-colors"
          >
            Click Here to Apply for Membership
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>

      {/* Important Note Footer */}
      <div className="flex items-start gap-4 bg-amber-50 border border-amber-200 p-6 rounded-2xl">
        <AlertCircle className="w-6 h-6 text-amber-600 flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-bold text-slate-900 mb-1">Important Note</p>
          <p className="text-sm text-slate-700 leading-relaxed">
            There is absolutely <strong className="text-amber-700">no fee</strong> for manuscript submission, editorial screening, or peer review. APC is payable <strong>only after official acceptance</strong> of the manuscript for publication.
          </p>
        </div>
      </div>

      {/* APC Payment Section */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="bg-gradient-to-r from-emerald-600 to-emerald-700 px-6 py-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/20 rounded-xl">
              <CreditCard className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">APC Payment Portal</h2>
              <p className="text-emerald-100 text-sm">Secure payment processing for accepted manuscripts</p>
            </div>
          </div>
        </div>
        
        <div className="p-6">
          {!showPaymentForm ? (
            <div className="text-center space-y-4">
              <div className="max-w-2xl mx-auto space-y-3">
                <p className="text-slate-600">
                  If your manuscript has been <strong>officially accepted</strong> for publication, 
                  you can proceed with the APC payment using our secure payment gateway.
                </p>
                <div className="flex items-center justify-center gap-2 text-sm text-slate-500">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  <span>Secure payment processing with Cashfree</span>
                </div>
                <div className="flex items-center justify-center gap-2 text-sm text-slate-500">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  <span>Support for UPI, Cards, and Net Banking</span>
                </div>
                <div className="flex items-center justify-center gap-2 text-sm text-slate-500">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  <span>Automatic membership discount validation</span>
                </div>
              </div>
              
              <button
                onClick={() => setShowPaymentForm(true)}
                className="inline-flex items-center gap-2 px-8 py-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl transition-colors shadow-lg hover:shadow-xl"
              >
                <CreditCard className="w-5 h-5" />
                Proceed to Payment
              </button>
              
              <p className="text-xs text-slate-500 max-w-lg mx-auto">
                By proceeding, you confirm that your manuscript has been officially accepted 
                for publication and you have received an acceptance notification from the editorial team.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-slate-900">APC Payment Form</h3>
                <button
                  onClick={() => setShowPaymentForm(false)}
                  className="text-slate-500 hover:text-slate-700 text-sm"
                >
                  « Back to Information
                </button>
              </div>
              
              <APCPaymentForm />
            </div>
          )}
        </div>
      </div>

    </div>
  );
};

