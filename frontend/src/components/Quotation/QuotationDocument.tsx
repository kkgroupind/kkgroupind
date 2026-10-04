'use client';

import React from 'react';
import { QuotationData } from './types';
import { formatINR, numberToIndianWords } from './quotation-utils';

interface QuotationDocumentProps {
  data: QuotationData;
  id?: string;
}

export function QuotationDocument({
  data,
  id = 'quotation-printable-document',
}: QuotationDocumentProps) {
  const wordsAmount = numberToIndianWords(data.grandTotal);

  return (
    <div
      id={id}
      className="w-full max-w-[800px] min-w-[280px] mx-auto bg-white text-slate-900 p-4 sm:p-7 md:p-9 shadow-xl rounded-2xl sm:rounded-xl border border-slate-200 relative font-sans leading-normal box-border"
      style={{
        backgroundColor: '#ffffff',
        color: '#0f172a',
        fontFamily:
          "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
      }}
    >
      {/* Top Subtle Emerald Accent Bar */}
      <div
        className="absolute top-0 left-0 right-0 h-1 sm:h-1.5 bg-[#2A835F] rounded-t-2xl sm:rounded-t-xl"
      />

      {/* 1. Header: Logo, Company Info & Quotation Header */}
      <div className="flex flex-col sm:flex-row items-start justify-between gap-4 pb-4 sm:pb-5 border-b border-slate-200 pt-1">
        {/* Left: Logo & Company Name */}
        <div className="flex items-center gap-3 sm:gap-3.5">
          <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center p-1 shrink-0">
            <img
              src="/logos/logo-bg.png"
              alt="KK Group Logo"
              className="w-full h-full object-contain"
            />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
              <span className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">
                KK GROUP
              </span>
              <span className="text-[9px] sm:text-[10px] font-bold uppercase px-2 py-0.5 rounded-md bg-[#EBF6F1] text-[#2A835F] border border-[#C3E6D5]">
                Kerala Operations
              </span>
            </div>
            <div className="text-[10px] sm:text-xs font-semibold text-slate-500 mt-0.5">
              Field Squad &amp; Engineering Services &bull; കെ.കെ ഗ്രൂപ്പ്
            </div>
            <div className="text-[9px] sm:text-[10px] text-slate-400 mt-0.5">
              HQ: Kasaragod, Kerala - 671121 &bull; Helpline: +91 94000 00000
            </div>
          </div>
        </div>

        {/* Right: Quotation Reference & Dates */}
        <div className="text-left sm:text-right shrink-0 w-full sm:w-auto pt-1 sm:pt-0 border-t sm:border-t-0 border-slate-100 sm:border-transparent flex flex-row sm:flex-col justify-between sm:justify-start items-baseline sm:items-end">
          <div>
            <div className="text-base sm:text-lg font-black tracking-wider text-slate-900 uppercase">
              QUOTATION
            </div>
            <div className="font-mono text-xs sm:text-sm font-bold text-[#2A835F] mt-0.5">
              {data.quotationNumber}
            </div>
          </div>
          <div className="text-right sm:text-right text-[10px] sm:text-xs text-slate-500 mt-1">
            <div>
              Date: <span className="font-semibold text-slate-700">{data.date}</span>
            </div>
            <div>
              Valid: <span className="font-semibold text-amber-700">{data.validUntil}</span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Client & Work Details Panel */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-6 py-3 sm:py-4 border-b border-slate-200 text-xs">
        {/* Bill To */}
        <div>
          <span className="text-[9px] sm:text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
            Quotation Prepared For:
          </span>
          <div className="text-sm font-bold text-slate-900">
            {data.customerName || 'Customer'}
          </div>
          <div className="text-slate-600 mt-0.5">
            Mobile:{' '}
            <span className="font-mono font-semibold text-slate-900">
              {data.customerPhone}
            </span>
          </div>
          {data.customerEmail && (
            <div className="text-slate-500 text-[11px] truncate">{data.customerEmail}</div>
          )}
          <div className="text-slate-500 text-[11px] mt-0.5">
            {[data.customerAddress, data.city, data.district, 'Kerala']
              .filter(Boolean)
              .join(', ')}
          </div>
        </div>

        {/* Work / Enquiry Details */}
        <div className="text-left sm:text-right pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100 sm:border-transparent">
          <span className="text-[9px] sm:text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
            Enquiry Reference:
          </span>
          <div className="font-mono text-xs font-bold text-slate-900">
            Ticket: {data.trackingNumber}
          </div>
          <div className="text-xs font-bold text-[#2A835F] mt-0.5">
            Service: {data.serviceName}
          </div>
          {data.timeline && (
            <div className="text-[11px] text-slate-500 mt-0.5">
              Est. Timeline: <span className="font-semibold text-slate-700">{data.timeline}</span>
            </div>
          )}
        </div>
      </div>

      {/* 3. Simplified Line Items Table with Horizontal Scroll on Mobile */}
      <div className="my-3 sm:my-4 rounded-lg border border-slate-200 overflow-x-auto w-full">
        <table className="w-full min-w-[480px] sm:min-w-full border-collapse text-xs">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 text-left">
              <th className="py-2.5 px-3 w-8 text-center font-bold">#</th>
              <th className="py-2.5 px-3 font-bold">Scope of Work &amp; Deliverables</th>
              <th className="py-2.5 px-3 text-center font-bold w-14">Qty</th>
              <th className="py-2.5 px-3 text-left font-bold w-16">Unit</th>
              <th className="py-2.5 px-3 text-right font-bold w-20">Rate (₹)</th>
              <th className="py-2.5 px-3 text-right font-bold w-24">Amount (₹)</th>
            </tr>
          </thead>
          <tbody>
            {data.items.map((item, index) => (
              <tr
                key={item.id}
                className={`border-b border-slate-100 ${
                  index % 2 === 1 ? 'bg-slate-50/50' : 'bg-white'
                }`}
              >
                <td className="py-2.5 px-3 text-center font-mono text-[11px] text-slate-400">
                  {index + 1}
                </td>
                <td className="py-2.5 px-3 font-medium text-slate-900">
                  {item.description}
                </td>
                <td className="py-2.5 px-3 text-center font-mono text-slate-700">
                  {item.quantity}
                </td>
                <td className="py-2.5 px-3 text-slate-500 text-[11px]">
                  {item.unit}
                </td>
                <td className="py-2.5 px-3 text-right font-mono text-slate-700">
                  {formatINR(item.rate)}
                </td>
                <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-900">
                  {formatINR(item.amount)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* 4. Financial Totals & In-Words Section */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 my-3 sm:my-4">
        {/* Left: Amount in Words */}
        <div className="flex flex-col justify-between">
          <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 text-[11px]">
            <span className="text-[9px] sm:text-[10px] font-bold uppercase text-slate-400 block mb-1">
              Amount in Words:
            </span>
            <div className="font-bold text-slate-900 italic">
              {wordsAmount}
            </div>
          </div>

          <div className="text-[11px] text-slate-500 mt-3 space-y-1">
            <div className="flex items-center gap-1.5 text-slate-700">
              <span className="text-[#2A835F] font-bold">✓</span>
              <span>All machinery, operator &amp; transport included.</span>
            </div>
            <div className="flex items-center gap-1.5 text-slate-700">
              <span className="text-[#2A835F] font-bold">✓</span>
              <span>Executed strictly under Kerala squad safety norms.</span>
            </div>
          </div>
        </div>

        {/* Right: Summary Ledger */}
        <div className="text-xs space-y-1">
          <div className="flex justify-between text-slate-500 px-1 py-0.5">
            <span>Subtotal:</span>
            <span className="font-mono font-semibold text-slate-900">
              {formatINR(data.subtotal)}
            </span>
          </div>

          {data.discountAmount > 0 && (
            <div className="flex justify-between text-emerald-700 px-1 py-0.5">
              <span>Discount {data.discountType === 'PERCENTAGE' ? `(${data.discountValue}%)` : ''}:</span>
              <span className="font-mono font-semibold">
                -{formatINR(data.discountAmount)}
              </span>
            </div>
          )}

          {data.taxAmount > 0 && (
            <div className="flex justify-between text-slate-500 px-1 py-0.5">
              <span>GST / Taxes ({data.taxRate}%):</span>
              <span className="font-mono font-semibold text-slate-900">
                +{formatINR(data.taxAmount)}
              </span>
            </div>
          )}

          {/* Grand Total Box */}
          <div className="p-3 rounded-xl bg-[#EBF6F1] border border-[#C3E6D5] flex justify-between items-center mt-2">
            <div>
              <span className="text-[10px] font-extrabold uppercase text-[#2A835F] block">
                Grand Total
              </span>
              <span className="text-[9px] text-emerald-800">Total Payable Value</span>
            </div>
            <div className="text-base sm:text-lg font-black font-mono text-[#2A835F]">
              {formatINR(data.grandTotal)}
            </div>
          </div>
        </div>
      </div>

      {/* 5. Terms & Execution Details */}
      <div className="border-t border-slate-200 pt-3 mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 text-[11px] text-slate-600">
        <div>
          <span className="font-bold text-slate-900 block mb-0.5">
            Payment Terms:
          </span>
          <p className="m-0 leading-relaxed">
            {data.paymentTerms ||
              '50% Advance on site commencement, 50% on completion via UPI / Bank Transfer / Cash.'}
          </p>
        </div>

        <div>
          <span className="font-bold text-slate-900 block mb-0.5">
            Terms &amp; Site Accessibility:
          </span>
          <p className="m-0 leading-relaxed">
            {data.notes || 'Weather permitting; subject to site accessibility and power connection.'}
          </p>
        </div>
      </div>

      {/* 6. Simplified Footer: Support & Signatory */}
      <div className="border-t border-slate-200 pt-3.5 mt-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="text-[10px] text-slate-500">
          <div className="font-bold text-slate-900">KK Group Operations Command Desk</div>
          <div>
            For scheduling or questions, call:{' '}
            <span className="font-semibold text-slate-900">+91 94000 00000</span>
          </div>
          <div className="text-slate-400 mt-0.5">
            Digitally authenticated quotation &bull; Kasaragod, Kerala
          </div>
        </div>

        <div className="text-left sm:text-right w-full sm:w-auto flex flex-row sm:flex-col justify-between sm:justify-start items-center sm:items-end">
          <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-[#EBF6F1] border border-[#C3E6D5] text-[#2A835F] text-[9px] font-bold sm:mb-1">
            <span>✓</span>
            <span>Digitally Verified</span>
          </div>
          <div>
            <div className="text-xs font-bold text-slate-900">
              {data.preparedBy || 'Authorized Officer'}
            </div>
            <div className="text-[10px] text-slate-500">
              {data.officerRole || 'Operations Controller'}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
