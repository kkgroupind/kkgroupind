import React from 'react';
import { CustomerStatementData } from './types';
import { formatINR } from './statement-utils';

interface StatementDocumentProps {
  data: CustomerStatementData;
}

export function StatementDocument({ data }: StatementDocumentProps) {
  const { customer, stats, enquiries, transactions, statementRef, periodLabel, generatedAt, generatedBy } = data;

  return (
    <div className="w-full max-w-[850px] mx-auto bg-white text-gray-900 rounded-xl shadow-2xl p-6 sm:p-10 font-sans border border-gray-200 print:shadow-none print:border-none print:p-0">
      {/* Top Header & Branding */}
      <div className="flex flex-col sm:flex-row justify-between items-start gap-4 pb-4 border-b-2 border-[#2A835F]">
        <div className="flex items-center gap-3.5">
          <img
            src="/logos/logo-bg.png"
            alt="KK Group Logo"
            className="w-14 h-14 object-contain rounded-lg bg-white shrink-0"
          />
          <div>
            <div className="text-xl sm:text-2xl font-black text-gray-950 tracking-tight leading-tight">
              KK GROUP <span className="text-[#2A835F]">KERALA</span>
            </div>
            <div className="text-[11px] font-bold text-[#2A835F] uppercase tracking-wider mt-0.5">
              Agricultural, Heavy Machinery & Estate Operations
            </div>
            <div className="text-[10px] text-gray-500 mt-0.5">
              Govt. Reg. Kerala Field Operations • GSTIN: 32AABCK9876Q1Z9 • Calicut / Ernakulam / Palakkad
            </div>
          </div>
        </div>

        <div className="text-left sm:text-right shrink-0">
          <div className="inline-block px-2.5 py-1 bg-[#2A835F] text-white font-extrabold text-xs tracking-wider rounded-md uppercase">
            Account Statement
          </div>
          <div className="text-[10.5px] text-gray-500 font-semibold mt-1">
            ഉപഭോക്തൃ സ്റ്റേറ്റ്മെന്റ്
          </div>
          <div className="text-xs font-mono font-bold text-gray-900 mt-0.5">
            {statementRef}
          </div>
        </div>
      </div>

      {/* Statement Metadata Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 bg-slate-50 border border-slate-200 rounded-lg p-2.5 mt-3 text-xs">
        <div>
          <span className="text-slate-500 font-medium">Period:</span>{' '}
          <strong className="text-slate-900 ml-1">{periodLabel}</strong>
        </div>
        <div className="sm:text-center">
          <span className="text-slate-500 font-medium">Generated:</span>{' '}
          <strong className="text-slate-900 ml-1">{generatedAt}</strong>
        </div>
        <div className="sm:text-right">
          <span className="text-slate-500 font-medium">Issued By:</span>{' '}
          <strong className="text-[#2A835F] ml-1">{generatedBy}</strong>
        </div>
      </div>

      {/* Customer Profile Card */}
      <div className="mt-3 grid grid-cols-1 sm:grid-cols-3 gap-3 bg-white border border-gray-200 rounded-lg p-3.5">
        <div className="sm:col-span-2">
          <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">
            Client Profile / ഉപഭോക്താവ്
          </div>
          <div className="text-base font-extrabold text-gray-900 flex items-center gap-2">
            <span>{customer.name}</span>
            <span className="text-xs font-mono font-semibold text-[#7B4DFF]">@{customer.username}</span>
          </div>
          <div className="text-xs text-gray-700 mt-1">
            📞 <strong>Phone:</strong> {customer.phone || 'N/A'}{' '}
            {customer.email && (
              <>
                <span className="mx-1 text-gray-300">|</span> ✉️ <strong>Email:</strong> {customer.email}
              </>
            )}
          </div>
          <div className="text-xs text-gray-600 mt-0.5">
            📍 <strong>Location:</strong> {customer.address || 'Kerala Residence (Default Service Location)'}
          </div>
        </div>

        <div className="sm:border-l sm:border-slate-100 sm:pl-3 flex flex-col justify-center space-y-1 text-xs">
          <div className="flex justify-between">
            <span className="text-gray-500">Customer ID:</span>
            <span className="font-mono font-medium text-gray-800">{customer.id.slice(0, 10)}...</span>
          </div>
          {customer.createdAt && (
            <div className="flex justify-between">
              <span className="text-gray-500">Registered:</span>
              <span className="font-medium text-gray-800">{customer.createdAt}</span>
            </div>
          )}
          <div className="flex justify-between items-center pt-0.5">
            <span className="text-gray-500">Status:</span>
            <span className="font-bold text-[10px] text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded">
              ACTIVE
            </span>
          </div>
        </div>
      </div>

      {/* KPI Summary Bento */}
      <div className="mt-3.5 grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        <div className="bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-center">
          <div className="text-[10px] font-bold text-slate-500 uppercase">Total Bookings</div>
          <div className="text-lg font-extrabold text-slate-900 mt-0.5">{stats.totalEnquiries}</div>
          <div className="text-[10px] text-emerald-600 font-semibold">{stats.completedWorks} Completed</div>
        </div>

        <div className="bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-center">
          <div className="text-[10px] font-bold text-slate-500 uppercase">Active / Pending</div>
          <div className="text-lg font-extrabold text-amber-600 mt-0.5">
            {stats.inProgressWorks + stats.pendingWorks}
          </div>
          <div className="text-[10px] text-slate-500">In Pipeline</div>
        </div>

        <div className="bg-emerald-50/60 border border-emerald-200 rounded-lg p-2.5 text-center">
          <div className="text-[10px] font-bold text-emerald-800 uppercase">Total Billed</div>
          <div className="text-base sm:text-lg font-black text-emerald-700 font-mono mt-0.5">
            {formatINR(stats.totalBilledAmount)}
          </div>
          <div className="text-[10px] text-emerald-700 font-medium">Value of Works</div>
        </div>

        <div className="bg-blue-50/60 border border-blue-200 rounded-lg p-2.5 text-center">
          <div className="text-[10px] font-bold text-blue-800 uppercase">Settled Amount</div>
          <div className="text-base sm:text-lg font-black text-blue-700 font-mono mt-0.5">
            {formatINR(stats.totalPaidAmount)}
          </div>
          <div className="text-[10px] text-blue-700 font-medium">
            {stats.outstandingBalance > 0 ? `Pending: ${formatINR(stats.outstandingBalance)}` : '0 Balance'}
          </div>
        </div>
      </div>

      {/* Itemized Table */}
      <div className="mt-4">
        <div className="flex items-center justify-between pb-1.5 border-b-2 border-[#2A835F] mb-2">
          <h3 className="text-xs font-extrabold uppercase tracking-wider text-[#2A835F]">
            Work Orders & Service History ({enquiries.length})
          </h3>
          <span className="text-[11px] text-gray-500 font-medium">
            {data.onlyCompleted ? 'Completed Works Only' : 'All Bookings & Inquiries'}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-[10px] uppercase font-bold text-slate-600">
                <th className="p-2 text-center w-8">#</th>
                <th className="p-2 w-20">Date</th>
                <th className="p-2">Service & Work Ref</th>
                <th className="p-2">Specialist Squad</th>
                <th className="p-2">Units / Time</th>
                <th className="p-2 text-center w-20">Status</th>
                <th className="p-2 text-right w-24">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {enquiries.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-gray-400 italic">
                    No work records found for this period ({periodLabel}).
                  </td>
                </tr>
              ) : (
                enquiries.map((item, idx) => {
                  const isCompleted = item.status === 'COMPLETED';
                  const badgeClass = isCompleted
                    ? 'bg-emerald-100 text-emerald-800 border-emerald-200'
                    : item.status === 'IN_PROGRESS'
                    ? 'bg-amber-100 text-amber-800 border-amber-200'
                    : 'bg-blue-100 text-blue-800 border-blue-200';

                  return (
                    <tr key={item.id || idx} className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'}>
                      <td className="p-2 text-center text-gray-400 text-[11px] align-top">{idx + 1}</td>
                      <td className="p-2 font-medium text-gray-900 text-[11px] align-top whitespace-nowrap">
                        {item.date}
                      </td>
                      <td className="p-2 align-top">
                        <div className="font-bold text-gray-900 text-xs">{item.serviceName}</div>
                        <div className="text-[10px] font-mono text-gray-500">Ref: {item.trackingNumber}</div>
                        {item.location && (
                          <div className="text-[10px] text-gray-500 mt-0.5">📍 {item.location}</div>
                        )}
                      </td>
                      <td className="p-2 align-top text-[11px]">
                        {item.workerName ? (
                          <>
                            <div className="font-semibold text-gray-800">{item.workerName}</div>
                            {item.workerPhone && (
                              <div className="text-[10px] text-gray-500">{item.workerPhone}</div>
                            )}
                          </>
                        ) : (
                          <span className="text-gray-400 italic">Squad Assigned</span>
                        )}
                      </td>
                      <td className="p-2 align-top text-[11px] text-gray-700">
                        {item.completedUnits && (
                          <div className="font-semibold text-emerald-700">{item.completedUnits}</div>
                        )}
                        {item.workDuration && (
                          <div className="text-[10px] text-gray-500">⏱ {item.workDuration}</div>
                        )}
                        {!item.completedUnits && !item.workDuration && (
                          <span className="text-gray-400">Standard Service</span>
                        )}
                      </td>
                      <td className="p-2 text-center align-top">
                        <span
                          className={`inline-block px-2 py-0.5 rounded-full text-[9px] font-bold uppercase border ${badgeClass}`}
                        >
                          {item.status}
                        </span>
                      </td>
                      <td className="p-2 text-right font-mono font-bold text-gray-900 align-top text-xs">
                        {formatINR(item.amount)}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Transactions Table if present */}
      {data.showTransactions && transactions.length > 0 && (
        <div className="mt-5">
          <div className="flex items-center justify-between pb-1.5 border-b-2 border-[#2A835F] mb-2">
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-[#2A835F]">
              Payment & Settlement Ledger ({transactions.length})
            </h3>
            <span className="text-[10px] text-gray-500">Verified transactions</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-[10px] uppercase font-bold text-slate-600">
                  <th className="p-2">Date</th>
                  <th className="p-2">Transaction Ref</th>
                  <th className="p-2">Service / Description</th>
                  <th className="p-2 text-center">Mode</th>
                  <th className="p-2 text-right">Amount Paid</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {transactions.map((tx, idx) => (
                  <tr key={tx.id || idx} className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'}>
                    <td className="p-2 text-[11px] text-gray-600">{tx.date}</td>
                    <td className="p-2 font-mono font-semibold text-gray-900 text-[11px]">
                      {tx.transactionRef || tx.id}
                    </td>
                    <td className="p-2 text-[11px] text-gray-700">{tx.notes || 'Service Payment Settlement'}</td>
                    <td className="p-2 text-center">
                      <span className="inline-block px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 font-bold text-[9px] uppercase border border-indigo-100">
                        {tx.paymentMethod}
                      </span>
                    </td>
                    <td className="p-2 text-right font-mono font-bold text-emerald-700 text-xs">
                      {formatINR(tx.amount)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Financial Status Banner */}
      <div className="mt-4 bg-slate-50 border border-slate-200 rounded-lg p-3 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
        <div>
          <div className="text-[10px] font-bold uppercase text-slate-500">Statement Financial Summary</div>
          <div className="text-xs text-slate-900 mt-0.5">
            {stats.outstandingBalance === 0
              ? '✅ All completed works for this period are fully settled.'
              : `⚠️ Outstanding balance to be settled: ${formatINR(stats.outstandingBalance)}`}
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-slate-600">
            Total Invoiced: <strong className="text-slate-900">{formatINR(stats.totalBilledAmount)}</strong>
          </span>
          <span className="text-xs font-black text-emerald-800 bg-emerald-100 border border-emerald-300 px-2.5 py-1 rounded-md">
            Settled: {formatINR(stats.totalPaidAmount)}
          </span>
        </div>
      </div>

      {/* Official Signatory Footer */}
      <div className="mt-6 pt-4 border-t border-dashed border-gray-300 grid grid-cols-1 sm:grid-cols-3 gap-4 items-end">
        <div className="sm:col-span-2">
          <div className="text-[10px] font-extrabold uppercase text-gray-900 mb-1">
            Official Operations Verification / സാക്ഷ്യപത്രം
          </div>
          <div className="text-[10px] text-gray-500 leading-relaxed">
            This document is an authenticated statement of accounts and completed works generated from the KK Group Kerala Operations Management System.
          </div>
          <div className="text-[9px] font-mono text-gray-400 mt-1">
            Ref: {statementRef} • Issued by Central Operations Desk
          </div>
        </div>

        <div className="text-left sm:text-right">
          <div className="inline-block text-center">
            <div className="w-32 border-b-2 border-gray-900 mx-auto h-8 mb-1" />
            <div className="text-[11px] font-bold text-gray-950">Authorized Signatory</div>
            <div className="text-[9px] font-bold text-[#2A835F]">KK GROUP KERALA HQ</div>
          </div>
        </div>
      </div>
    </div>
  );
}
