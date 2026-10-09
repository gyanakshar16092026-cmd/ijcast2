import React from 'react';
import { useJournal } from '../context/JournalContext';
import { RefreshCw, XCircle, AlertCircle } from 'lucide-react';

export const Refunds = () => {
  const { settings } = useJournal();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-8 py-12 space-y-10">
      
      {/* Header */}
      <div className="bg-slate-900 text-white p-8 sm:p-12 rounded-3xl border border-slate-800 shadow-xl space-y-4">
        <div className="inline-flex items-center space-x-2 px-3 py-1 bg-purple-500/10 border border-purple-500/20 text-purple-400 rounded-full text-xs font-semibold uppercase tracking-wider">
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Payment Policy</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold font-serif">Refunds & Cancellations Policy</h1>
        <p className="text-sm text-slate-300 max-w-3xl leading-relaxed">
          Comprehensive policy regarding Article Processing Charge (APC) refunds, payment cancellations, and withdrawal procedures.
        </p>
      </div>

      {/* Important Notice */}
      <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 flex items-start gap-4">
        <AlertCircle className="w-6 h-6 text-amber-600 flex-shrink-0 mt-0.5" />
        <div className="space-y-2">
          <h3 className="font-bold text-slate-900 text-sm">Important Notice</h3>
          <p className="text-sm text-slate-700 leading-relaxed">
            <strong>No fee is charged</strong> for manuscript submission, editorial screening, or peer review. 
            Article Processing Charge (APC) is payable <strong>only after</strong> the manuscript has been 
            <strong> officially accepted</strong> for publication. Please read this policy carefully before making payment.
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8 space-y-8">
        
        {/* 1. General Policy */}
        <section className="space-y-3">
          <h2 className="text-xl font-bold font-serif text-slate-900 border-b border-slate-100 pb-2">
            1. General Refund Policy
          </h2>
          <p className="text-sm text-slate-700 leading-relaxed">
            IJRT follows a fair and transparent refund policy. All refund requests are evaluated on a case-by-case 
            basis considering the stage of manuscript processing and the reason for withdrawal.
          </p>
        </section>

        {/* 2. Eligibility for Refund */}
        <section className="space-y-3">
          <h2 className="text-xl font-bold font-serif text-slate-900 border-b border-slate-100 pb-2">
            2. Eligibility for Refund
          </h2>
          
          <div className="space-y-4">
            {/* Full Refund */}
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl">
              <h3 className="font-bold text-emerald-900 text-sm mb-2 flex items-center gap-2">
                <span className="bg-emerald-600 text-white px-2 py-0.5 rounded text-xs">100% Refund</span>
                Full Refund Scenarios
              </h3>
              <ul className="list-disc pl-5 space-y-1.5 text-sm text-slate-700">
                <li>Payment made by mistake or duplicate payment</li>
                <li>Technical error during payment processing resulting in double charge</li>
                <li>Withdrawal request submitted within 24 hours of payment</li>
                <li>Journal unable to proceed with publication due to technical reasons</li>
                <li>Payment gateway error where amount was deducted but order was not created</li>
              </ul>
            </div>

            {/* Partial Refund */}
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl">
              <h3 className="font-bold text-blue-900 text-sm mb-2 flex items-center gap-2">
                <span className="bg-blue-600 text-white px-2 py-0.5 rounded text-xs">50% Refund</span>
                Partial Refund Scenarios
              </h3>
              <ul className="list-disc pl-5 space-y-1.5 text-sm text-slate-700">
                <li>Withdrawal request submitted 24-48 hours after payment</li>
                <li>Author withdraws manuscript before DOI assignment and final formatting</li>
                <li>Manuscript processing has started but not yet published online</li>
              </ul>
            </div>

            {/* No Refund */}
            <div className="p-4 bg-red-50 border border-red-200 rounded-xl">
              <h3 className="font-bold text-red-900 text-sm mb-2 flex items-center gap-2">
                <span className="bg-red-600 text-white px-2 py-0.5 rounded text-xs">No Refund</span>
                Non-Refundable Scenarios
              </h3>
              <ul className="list-disc pl-5 space-y-1.5 text-sm text-slate-700">
                <li>Withdrawal request submitted after 48 hours of payment</li>
                <li>Article already published online with DOI assigned</li>
                <li>Article already indexed in databases and repositories</li>
                <li>Author requests removal after publication (retraction follows separate process)</li>
                <li>Change of mind after manuscript has been formatted and processed</li>
                <li>Failure to respond to editorial queries within specified timeframe</li>
              </ul>
            </div>
          </div>
        </section>

        {/* 3. Cancellation Policy */}
        <section className="space-y-3">
          <h2 className="text-xl font-bold font-serif text-slate-900 border-b border-slate-100 pb-2">
            3. Payment Cancellation
          </h2>
          <p className="text-sm text-slate-700 leading-relaxed mb-3">
            Authors can cancel payment transactions under the following conditions:
          </p>
          <ul className="list-disc pl-5 space-y-1.5 text-sm text-slate-700">
            <li>
              <strong>Before Payment Completion:</strong> Transactions can be cancelled during the payment gateway session 
              before final confirmation. No charges will be applied.
            </li>
            <li>
              <strong>Pending Transactions:</strong> If a transaction shows as pending for more than 48 hours, 
              contact support for cancellation and refund processing.
            </li>
            <li>
              <strong>Failed Transactions:</strong> Failed payments are automatically cancelled. If amount was deducted, 
              it will be refunded within 5-7 business days.
            </li>
          </ul>
        </section>

        {/* 4. Refund Process */}
        <section className="space-y-3">
          <h2 className="text-xl font-bold font-serif text-slate-900 border-b border-slate-100 pb-2">
            4. Refund Request Process
          </h2>
          <p className="text-sm text-slate-700 leading-relaxed mb-3">
            To request a refund, follow these steps:
          </p>
          <ol className="list-decimal pl-5 space-y-2 text-sm text-slate-700">
            <li>
              <strong>Submit Written Request:</strong> Send an email to{' '}
              <a href={`mailto:${settings.contact_email}`} className="text-blue-600 hover:underline font-medium">
                {settings.contact_email}
              </a>{' '}
              with subject line: "Refund Request - [Order ID]"
            </li>
            <li>
              <strong>Include Required Information:</strong>
              <ul className="list-circle pl-5 mt-1 space-y-1">
                <li>Order ID / Transaction ID</li>
                <li>Manuscript ID</li>
                <li>Author name and email</li>
                <li>Payment date and amount</li>
                <li>Reason for refund request</li>
                <li>Bank account details for refund (if different from payment source)</li>
              </ul>
            </li>
            <li>
              <strong>Await Confirmation:</strong> Editorial office will review your request within 3-5 business days
            </li>
            <li>
              <strong>Refund Processing:</strong> Approved refunds will be processed within 7-10 business days
            </li>
          </ol>
        </section>

        {/* 5. Refund Timeline */}
        <section className="space-y-3">
          <h2 className="text-xl font-bold font-serif text-slate-900 border-b border-slate-100 pb-2">
            5. Refund Processing Timeline
          </h2>
          <div className="space-y-2">
            <div className="flex items-start gap-3 p-3 bg-slate-50 border border-slate-200 rounded-lg">
              <div className="bg-blue-600 text-white px-2 py-1 rounded text-xs font-bold min-w-[120px] text-center">
                3-5 Days
              </div>
              <div className="text-sm text-slate-700">
                <strong>Review Period:</strong> Editorial office evaluates refund request eligibility
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 bg-slate-50 border border-slate-200 rounded-lg">
              <div className="bg-blue-600 text-white px-2 py-1 rounded text-xs font-bold min-w-[120px] text-center">
                7-10 Days
              </div>
              <div className="text-sm text-slate-700">
                <strong>Processing Time:</strong> Approved refunds are initiated with payment gateway
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 bg-slate-50 border border-slate-200 rounded-lg">
              <div className="bg-blue-600 text-white px-2 py-1 rounded text-xs font-bold min-w-[120px] text-center">
                5-7 Days
              </div>
              <div className="text-sm text-slate-700">
                <strong>Bank Processing:</strong> Banks may take additional time to credit the refund
              </div>
            </div>
          </div>
          <p className="text-xs text-slate-600 mt-3 p-3 bg-slate-50 border border-slate-200 rounded-lg">
            <strong>Total Timeline:</strong> Refunds typically complete within 15-20 business days from request submission. 
            International refunds may take 20-30 business days.
          </p>
        </section>

        {/* 6. Refund Method */}
        <section className="space-y-3">
          <h2 className="text-xl font-bold font-serif text-slate-900 border-b border-slate-100 pb-2">
            6. Refund Method
          </h2>
          <ul className="list-disc pl-5 space-y-1.5 text-sm text-slate-700">
            <li>
              <strong>Original Payment Method:</strong> Refunds are processed to the same payment source used for original transaction 
              (credit card, debit card, UPI, net banking)
            </li>
            <li>
              <strong>Bank Transfer:</strong> If original payment method is unavailable, refund will be processed via bank transfer 
              to provided account details
            </li>
            <li>
              <strong>International Payments:</strong> USD payments will be refunded in USD; currency conversion charges (if any) 
              are borne by the payment gateway
            </li>
          </ul>
        </section>

        {/* 7. Non-Refundable Items */}
        <section className="space-y-3">
          <h2 className="text-xl font-bold font-serif text-slate-900 border-b border-slate-100 pb-2">
            7. Non-Refundable Items
          </h2>
          <p className="text-sm text-slate-700 leading-relaxed mb-2">
            The following items are non-refundable under any circumstances:
          </p>
          <ul className="list-disc pl-5 space-y-1.5 text-sm text-slate-700">
            <li>Payment gateway processing fees and transaction charges</li>
            <li>Bank charges for international transactions</li>
            <li>Currency conversion fees</li>
            <li>Administrative processing fees (if article has undergone significant processing)</li>
          </ul>
        </section>

        {/* 8. Dispute Resolution */}
        <section className="space-y-3">
          <h2 className="text-xl font-bold font-serif text-slate-900 border-b border-slate-100 pb-2">
            8. Payment Disputes
          </h2>
          <p className="text-sm text-slate-700 leading-relaxed">
            In case of payment disputes:
          </p>
          <ul className="list-disc pl-5 space-y-1.5 text-sm text-slate-700">
            <li>Contact editorial office immediately at{' '}
              <a href={`mailto:${settings.contact_email}`} className="text-blue-600 hover:underline font-medium">
                {settings.contact_email}
              </a>
            </li>
            <li>Provide complete transaction details and supporting documents</li>
            <li>Disputes will be resolved within 15 business days</li>
            <li>For payment gateway disputes, contact Cashfree support: support@cashfree.com</li>
          </ul>
        </section>

        {/* 9. Failed Transaction Refunds */}
        <section className="space-y-3">
          <h2 className="text-xl font-bold font-serif text-slate-900 border-b border-slate-100 pb-2">
            9. Failed Transaction Refunds
          </h2>
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl">
            <p className="text-sm text-slate-700 leading-relaxed">
              If your payment failed but amount was deducted from your account:
            </p>
            <ul className="list-disc pl-5 space-y-1.5 text-sm text-slate-700 mt-2">
              <li>The amount will be automatically refunded by the payment gateway within 5-7 business days</li>
              <li>No action required from your side in most cases</li>
              <li>If refund is not received within 7 days, contact support with transaction details</li>
              <li>Keep transaction receipt / SMS / email confirmation for reference</li>
            </ul>
          </div>
        </section>

        {/* 10. Contact for Refund Queries */}
        <section className="space-y-3">
          <h2 className="text-xl font-bold font-serif text-slate-900 border-b border-slate-100 pb-2">
            10. Contact for Refund Assistance
          </h2>
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
            <div>
              <p className="text-xs text-slate-600 font-semibold mb-1">Editorial Office:</p>
              <p className="text-sm text-slate-900 font-medium">
                Email:{' '}
                <a href={`mailto:${settings.contact_email}`} className="text-blue-600 hover:underline">
                  {settings.contact_email}
                </a>
              </p>
              <p className="text-xs text-slate-600 mt-1">
                For all refund requests, cancellations, and payment disputes
              </p>
            </div>
            <div>
              <p className="text-xs text-slate-600 font-semibold mb-1">Payment Gateway Support:</p>
              <p className="text-sm text-slate-900 font-medium">
                Cashfree Payments: support@cashfree.com
              </p>
              <p className="text-xs text-slate-600 mt-1">
                For technical payment gateway issues
              </p>
            </div>
          </div>
        </section>

        {/* Important Reminders */}
        <section className="p-4 bg-amber-50 border-l-4 border-amber-500 rounded-r-xl">
          <h3 className="font-bold text-amber-900 text-sm mb-2">Important Reminders</h3>
          <ul className="list-disc pl-5 space-y-1 text-xs text-slate-700">
            <li>Always verify manuscript acceptance status before making payment</li>
            <li>Keep payment confirmation email and transaction ID for future reference</li>
            <li>Submit withdrawal/refund requests promptly to maximize refund eligibility</li>
            <li>Read the complete Terms & Conditions before submitting payment</li>
            <li>GASF membership discount (40%) is non-refundable if membership is invalid</li>
          </ul>
        </section>

        {/* Last Updated */}
        <div className="pt-4 border-t border-slate-200 text-center">
          <p className="text-xs text-slate-500">
            Last Updated: October 3, 2026
          </p>
          <p className="text-xs text-slate-500 mt-1">
            Published by: {settings.publisher}
          </p>
          <p className="text-xs text-slate-500 mt-2">
            This policy is subject to change. Check this page regularly for updates.
          </p>
        </div>

      </div>
    </div>
  );
};

