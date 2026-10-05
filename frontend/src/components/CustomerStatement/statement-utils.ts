import {
  CustomerStatementData,
  PeriodFilter,
  StatementCustomerInfo,
  StatementEnquiryItem,
  StatementStats,
  StatementTransactionItem,
} from './types';

export function formatINR(val: number): string {
  if (isNaN(val) || val === null || val === undefined) return '₹0';
  return '₹' + Math.round(val).toLocaleString('en-IN');
}

export function cleanPhoneNumber(phone: string): string {
  if (!phone) return '';
  const digits = phone.replace(/[^0-9]/g, '');
  if (digits.length === 10) return '91' + digits;
  if (digits.length === 12 && digits.startsWith('91')) return digits;
  if (digits.length > 10 && !digits.startsWith('91')) return digits;
  return digits;
}

export function generateStatementRef(username?: string): string {
  const year = new Date().getFullYear();
  const suffix = username
    ? username.replace(/[^a-zA-Z0-9]/g, '').slice(0, 4).toUpperCase()
    : Math.floor(1000 + Math.random() * 9000).toString();
  const random = Math.floor(100 + Math.random() * 900);
  return `KK-STMT-${year}-${suffix}${random}`;
}

export function getDateRange(
  filter: PeriodFilter,
  customStart?: string,
  customEnd?: string,
): { startDate: Date; endDate: Date; label: string } {
  const now = new Date();
  // end of current day
  const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);

  if (filter === '1_MONTH') {
    const start = new Date(now);
    start.setDate(start.getDate() - 30);
    start.setHours(0, 0, 0, 0);
    return {
      startDate: start,
      endDate: endOfDay,
      label: `Last 1 Month (${formatShortDate(start)} - ${formatShortDate(endOfDay)})`,
    };
  }

  if (filter === '3_MONTHS') {
    const start = new Date(now);
    start.setDate(start.getDate() - 90);
    start.setHours(0, 0, 0, 0);
    return {
      startDate: start,
      endDate: endOfDay,
      label: `Last 3 Months (${formatShortDate(start)} - ${formatShortDate(endOfDay)})`,
    };
  }

  if (filter === '1_YEAR') {
    const start = new Date(now);
    start.setDate(start.getDate() - 365);
    start.setHours(0, 0, 0, 0);
    return {
      startDate: start,
      endDate: endOfDay,
      label: `Last 1 Year (${formatShortDate(start)} - ${formatShortDate(endOfDay)})`,
    };
  }

  if (filter === 'CUSTOM') {
    const start = customStart ? new Date(customStart) : new Date(now.getFullYear(), now.getMonth(), 1);
    start.setHours(0, 0, 0, 0);
    const end = customEnd ? new Date(customEnd) : new Date(endOfDay);
    end.setHours(23, 59, 59, 999);
    return {
      startDate: start,
      endDate: end,
      label: `Custom Period (${formatShortDate(start)} - ${formatShortDate(end)})`,
    };
  }

  // ALL Time
  const start = new Date('2020-01-01T00:00:00.000Z');
  return {
    startDate: start,
    endDate: endOfDay,
    label: `All Time (Lifetime History)`,
  };
}

function formatShortDate(d: Date): string {
  return d.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

export function filterAndCompileStatement(
  customer: any,
  filter: PeriodFilter,
  customStart?: string,
  customEnd?: string,
  onlyCompleted: boolean = false,
  showTransactions: boolean = true,
  generatedBy: string = 'Super Admin',
): CustomerStatementData {
  const { startDate, endDate, label: periodLabel } = getDateRange(filter, customStart, customEnd);

  const customerInfo: StatementCustomerInfo = {
    id: customer?.id || 'N/A',
    name: customer?.name || customer?.username || 'Valued Customer',
    username: customer?.username || 'customer',
    phone: customer?.phone || 'N/A',
    email: customer?.email || '',
    address: customer?.address || 'Kerala Residence (Default Service Location)',
    createdAt: customer?.createdAt
      ? formatShortDate(new Date(customer.createdAt))
      : undefined,
  };

  const rawEnquiries: any[] = customer?.customerEnquiries || [];

  // Filter enquiries by date range
  const filteredRawEnquiries = rawEnquiries.filter((enq) => {
    const enqDate = new Date(enq.createdAt || enq.preferredDate || Date.now());
    const isWithinDate = enqDate >= startDate && enqDate <= endDate;
    if (!isWithinDate) return false;
    if (onlyCompleted && enq.status !== 'COMPLETED') return false;
    return true;
  });

  // Sort chronologically newest first
  filteredRawEnquiries.sort((a, b) => {
    const da = new Date(a.createdAt || a.preferredDate || 0).getTime();
    const db = new Date(b.createdAt || b.preferredDate || 0).getTime();
    return db - da;
  });

  // Map into StatementEnquiryItem
  const enquiries: StatementEnquiryItem[] = filteredRawEnquiries.map((enq) => {
    const enqDate = new Date(enq.createdAt || enq.preferredDate || Date.now());
    const amount = Number(enq.totalCalculatedCost || 0);

    // Completed units
    let completedUnits = '';
    if (enq.completedUnits || enq.estimatedUnits) {
      completedUnits = `${enq.completedUnits || enq.estimatedUnits} ${enq.unitLabel || 'Units'}`;
    }

    // Work duration
    let workDuration = '';
    if (enq.workDurationMinutes) {
      const hrs = Math.floor(enq.workDurationMinutes / 60);
      const mins = enq.workDurationMinutes % 60;
      workDuration = hrs > 0 ? `${hrs}h ${mins}m` : `${mins} mins`;
    } else if (enq.totalWorkingHours) {
      workDuration = `${enq.totalWorkingHours} hrs`;
    }

    // Payment status & method
    let paymentStatus: 'PAID' | 'PARTIALLY_PAID' | 'PENDING' = 'PENDING';
    let paymentMethod = '';
    const txs = enq.financialTransactions || [];
    const totalPaid = txs.reduce((acc: number, t: any) => acc + (Number(t.amount) || 0), 0);
    if (amount > 0 && totalPaid >= amount) {
      paymentStatus = 'PAID';
    } else if (totalPaid > 0) {
      paymentStatus = 'PARTIALLY_PAID';
    } else if (enq.status === 'COMPLETED') {
      paymentStatus = 'PAID'; // If completed in KK operations default to settled unless outstanding
    }

    if (txs.length > 0 && txs[0].paymentMethod) {
      paymentMethod = txs[0].paymentMethod;
    }

    return {
      id: enq.id,
      trackingNumber: enq.trackingNumber || `KK-TRK-${enq.id.slice(-4).toUpperCase()}`,
      serviceName: enq.serviceName || 'On-Demand Kerala Field Service',
      serviceCategory: enq.serviceCategory || 'Operations',
      date: formatShortDate(enqDate),
      rawDate: enqDate,
      status: enq.status || 'COMPLETED',
      location: enq.location || '',
      workerName: enq.worker?.name || enq.worker?.username || enq.workerName || undefined,
      workerPhone: enq.worker?.phone || undefined,
      completedUnits: completedUnits || undefined,
      workDuration: workDuration || undefined,
      amount: amount,
      paymentStatus: paymentStatus,
      paymentMethod: paymentMethod || undefined,
      message: enq.message || undefined,
    };
  });

  // Extract all transactions inside date range
  const transactions: StatementTransactionItem[] = [];
  rawEnquiries.forEach((enq) => {
    const txs: any[] = enq.financialTransactions || [];
    txs.forEach((tx) => {
      const txDate = new Date(tx.createdAt || Date.now());
      if (txDate >= startDate && txDate <= endDate) {
        transactions.push({
          id: tx.id || `TX-${Math.random().toString(36).substring(2, 8)}`,
          date: formatShortDate(txDate),
          amount: Number(tx.amount || 0),
          paymentMethod: tx.paymentMethod || 'UPI',
          transactionRef: tx.transactionRef || tx.refNumber || undefined,
          status: tx.status || 'COMPLETED',
          notes: tx.description || `${enq.serviceName} (${enq.trackingNumber || ''})`,
        });
      }
    });
  });

  // Sort transactions newest first
  transactions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  // Aggregate Stats
  let totalBilledAmount = 0;
  let completedWorks = 0;
  let inProgressWorks = 0;
  let pendingWorks = 0;
  let cancelledWorks = 0;
  let totalWorkDurationMinutes = 0;

  enquiries.forEach((item) => {
    totalBilledAmount += item.amount;
    if (item.status === 'COMPLETED') completedWorks++;
    else if (item.status === 'IN_PROGRESS') inProgressWorks++;
    else if (item.status === 'PENDING') pendingWorks++;
    else if (item.status === 'CANCELLED') cancelledWorks++;
  });

  filteredRawEnquiries.forEach((enq) => {
    if (enq.workDurationMinutes) {
      totalWorkDurationMinutes += Number(enq.workDurationMinutes) || 0;
    }
  });

  // Total paid calculation
  let totalPaidAmount = transactions.reduce((acc, t) => acc + t.amount, 0);
  if (totalPaidAmount === 0 && completedWorks > 0) {
    // If no transaction rows recorded in DB but works are completed, match billed for completed
    totalPaidAmount = enquiries
      .filter((e) => e.status === 'COMPLETED' && e.paymentStatus === 'PAID')
      .reduce((acc, e) => acc + e.amount, 0);
  }

  const outstandingBalance = Math.max(0, totalBilledAmount - totalPaidAmount);

  const stats: StatementStats = {
    totalEnquiries: enquiries.length,
    completedWorks,
    inProgressWorks,
    pendingWorks,
    cancelledWorks,
    totalBilledAmount,
    totalPaidAmount,
    outstandingBalance,
    totalWorkDurationMinutes,
  };

  const statementRef = generateStatementRef(customerInfo.username);

  return {
    statementRef,
    periodLabel,
    startDate: formatShortDate(startDate),
    endDate: formatShortDate(endDate),
    generatedAt: new Date().toLocaleString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }),
    generatedBy,
    customer: customerInfo,
    stats,
    enquiries,
    transactions,
    filterType: filter,
    onlyCompleted,
    showTransactions,
  };
}

export function buildWhatsAppStatementMessage(data: CustomerStatementData): string {
  const header = `🏛️ *KK GROUP KERALA OPERATIONS*\n*OFFICIAL CUSTOMER ACCOUNT STATEMENT*\n----------------------------------`;
  const customerLine = `👤 *Customer:* ${data.customer.name} (@${data.customer.username})\n📞 *Phone:* ${data.customer.phone || 'N/A'}\n📍 *Location:* ${data.customer.address || 'Kerala'}`;
  const meta = `📄 *Statement Ref:* ${data.statementRef}\n📅 *Period:* ${data.periodLabel}\n⏱️ *Generated On:* ${data.generatedAt}`;

  const summary = `📊 *EXECUTIVE SUMMARY*\n- *Total Enquiries / Orders:* ${data.stats.totalEnquiries}\n- *Completed Works:* ${data.stats.completedWorks}\n- *In Progress / Pending:* ${data.stats.inProgressWorks + data.stats.pendingWorks}\n- *Total Value of Works:* ${formatINR(data.stats.totalBilledAmount)}\n- *Total Amount Settled:* ${formatINR(data.stats.totalPaidAmount)}\n- *Outstanding Balance:* ${formatINR(data.stats.outstandingBalance)}`;

  let recentWorksText = '';
  if (data.enquiries.length > 0) {
    const topThree = data.enquiries.slice(0, 4);
    recentWorksText = `\n\n🛠️ *RECENT WORK BREAKDOWN*\n` +
      topThree
        .map(
          (w, i) =>
            `${i + 1}. *${w.serviceName}* (${w.status})\n   • Date: ${w.date} | Ref: ${w.trackingNumber}\n   • Amount: ${formatINR(w.amount)}${w.workerName ? ` | Squad: ${w.workerName}` : ''}`,
        )
        .join('\n');
    if (data.enquiries.length > 4) {
      recentWorksText += `\n   ... and ${data.enquiries.length - 4} other work records listed in full PDF statement.`;
    }
  }

  const footer = `\n----------------------------------\n🙏 *Thank you for partnering with KK Group Kerala!*\n📞 Central Desk: +91 94470 12345 | 🌐 www.kkgroup.ind.in`;

  return `${header}\n\n${customerLine}\n\n${meta}\n\n${summary}${recentWorksText}${footer}`;
}

export function renderStatementHTML(data: CustomerStatementData): string {
  const { customer, stats, enquiries, transactions, statementRef, periodLabel, generatedAt, generatedBy } = data;

  const enquiriesRows = enquiries
    .map((item, idx) => {
      const isCompleted = item.status === 'COMPLETED';
      const statusBg = isCompleted
        ? '#dcfce7'
        : item.status === 'IN_PROGRESS'
        ? '#fef3c7'
        : '#e0f2fe';
      const statusColor = isCompleted
        ? '#15803d'
        : item.status === 'IN_PROGRESS'
        ? '#b45309'
        : '#0369a1';

      return `
      <tr style="border-bottom: 1px solid #e5e7eb; background: ${idx % 2 === 0 ? '#ffffff' : '#fcfcfc'};">
        <td style="padding: 9px 10px; font-size: 11px; color: #4b5563; text-align: center; vertical-align: top;">
          ${idx + 1}
        </td>
        <td style="padding: 9px 10px; font-size: 11px; color: #111827; font-weight: 500; vertical-align: top; white-space: nowrap;">
          ${item.date}
        </td>
        <td style="padding: 9px 10px; vertical-align: top;">
          <div style="font-size: 11.5px; font-weight: 700; color: #111827; margin-bottom: 2px;">
            ${item.serviceName}
          </div>
          <div style="font-size: 10px; font-family: monospace; color: #6b7280;">
            Ref: <span style="font-weight: 600; color: #4b5563;">${item.trackingNumber}</span>
          </div>
          ${item.location ? `<div style="font-size: 10px; color: #6b7280; margin-top: 2px;">📍 ${item.location}</div>` : ''}
        </td>
        <td style="padding: 9px 10px; vertical-align: top; font-size: 10.5px;">
          ${item.workerName ? `
            <div style="font-weight: 600; color: #1e293b;">${item.workerName}</div>
            ${item.workerPhone ? `<div style="font-size: 9.5px; color: #64748b;">${item.workerPhone}</div>` : ''}
          ` : `
            <span style="color: #94a3b8; font-style: italic;">Squad Assigned</span>
          `}
        </td>
        <td style="padding: 9px 10px; vertical-align: top; font-size: 10.5px; color: #374151;">
          ${item.completedUnits ? `<div style="font-weight: 600; color: #047857;">${item.completedUnits}</div>` : ''}
          ${item.workDuration ? `<div style="font-size: 10px; color: #6b7280;">⏱ ${item.workDuration}</div>` : ''}
          ${!item.completedUnits && !item.workDuration ? `<span style="color: #9ca3af;">Standard Service</span>` : ''}
        </td>
        <td style="padding: 9px 10px; text-align: center; vertical-align: top;">
          <span style="display: inline-block; padding: 2px 7px; border-radius: 9999px; font-size: 9.5px; font-weight: 700; text-transform: uppercase; background: ${statusBg}; color: ${statusColor};">
            ${item.status}
          </span>
        </td>
        <td style="padding: 9px 10px; text-align: right; vertical-align: top; font-size: 11.5px; font-weight: 700; color: #111827; font-family: monospace;">
          ${formatINR(item.amount)}
        </td>
      </tr>
      `;
    })
    .join('');

  // Transactions rows (if any)
  let transactionsSection = '';
  if (data.showTransactions && transactions.length > 0) {
    const txRows = transactions
      .map(
        (tx, i) => `
      <tr style="border-bottom: 1px solid #e5e7eb; background: ${i % 2 === 0 ? '#ffffff' : '#fcfcfc'};">
        <td style="padding: 8px 10px; font-size: 10.5px; color: #4b5563;">${tx.date}</td>
        <td style="padding: 8px 10px; font-size: 10.5px; font-family: monospace; color: #1e293b; font-weight: 600;">
          ${tx.transactionRef || tx.id}
        </td>
        <td style="padding: 8px 10px; font-size: 10.5px; color: #374151;">${tx.notes || 'Service Payment Settlement'}</td>
        <td style="padding: 8px 10px; font-size: 10.5px; text-align: center;">
          <span style="display: inline-block; padding: 2px 6px; border-radius: 4px; font-size: 9.5px; font-weight: 700; background: #e0e7ff; color: #3730a3;">
            ${tx.paymentMethod}
          </span>
        </td>
        <td style="padding: 8px 10px; font-size: 11px; text-align: right; font-weight: 700; color: #047857; font-family: monospace;">
          ${formatINR(tx.amount)}
        </td>
      </tr>
      `,
      )
      .join('');

    transactionsSection = `
      <div style="margin-top: 24px;">
        <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 8px; border-bottom: 1.5px solid #2A835F; padding-bottom: 4px;">
          <h3 style="margin: 0; font-size: 12px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.5px; color: #2A835F;">
            Payment & Settlement Ledger
          </h3>
          <span style="font-size: 10px; color: #6b7280;">Direct verified transactions</span>
        </div>
        <table style="width: 100%; border-collapse: collapse; text-align: left;">
          <thead>
            <tr style="background: #f3f4f6; border-bottom: 1.5px solid #d1d5db; font-size: 10px; text-transform: uppercase; color: #4b5563;">
              <th style="padding: 6px 10px;">Date</th>
              <th style="padding: 6px 10px;">Transaction Ref</th>
              <th style="padding: 6px 10px;">Service / Description</th>
              <th style="padding: 6px 10px; text-align: center;">Mode</th>
              <th style="padding: 6px 10px; text-align: right;">Amount Paid</th>
            </tr>
          </thead>
          <tbody>
            ${txRows}
          </tbody>
        </table>
      </div>
    `;
  }

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <title>Customer Statement - ${customer.name} - ${statementRef}</title>
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:ital,wght@0,400;0,500;0,600;0,700;0,800;0,900;1,400;1,600&family=JetBrains+Mono:wght@400;500;600;700&display=swap" rel="stylesheet" />
  <style>
    @page {
      margin: 0;
      size: A4 portrait;
    }
    * {
      box-sizing: border-box;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }
    body {
      margin: 0;
      padding: 0;
      background-color: #ffffff;
      font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      color: #111827;
      line-height: 1.4;
      font-size: 11px;
      -webkit-font-smoothing: antialiased;
      -moz-osx-font-smoothing: grayscale;
      text-rendering: optimizeLegibility;
    }
    .sheet {
      width: 210mm;
      min-height: 297mm;
      margin: 0 auto;
      padding: 16mm 18mm 16mm 18mm;
      background: #ffffff;
      position: relative;
      box-sizing: border-box;
    }
    table {
      page-break-inside: auto;
    }
    tr {
      page-break-inside: avoid;
      page-break-after: auto;
    }
    .font-mono {
      font-family: 'JetBrains Mono', ui-monospace, SFMono-Regular, monospace !important;
      font-feature-settings: 'tnum' on, 'lnum' on !important;
    }
  </style>
</head>
<body>
  <div class="sheet">
    
    <!-- Top Header & Branding Bar -->
    <div style="display: flex; justify-content: space-between; align-items: flex-start; padding-bottom: 14px; border-bottom: 2px solid #2A835F;">
      <div style="display: flex; align-items: center; gap: 14px;">
        <img
          src="/logos/logo-bg.png"
          alt="KK Group Logo"
          style="width: 58px; height: 58px; object-fit: contain; border-radius: 8px; background: #ffffff;"
        />
        <div>
          <div style="font-size: 20px; font-weight: 800; letter-spacing: -0.03em; color: #111827; line-height: 1.1;">
            KK GROUP <span style="color: #2A835F;">KERALA</span>
          </div>
          <div style="font-size: 10px; font-weight: 700; color: #2A835F; text-transform: uppercase; letter-spacing: 0.06em; margin-top: 2px;">
            Agricultural, Heavy Machinery &amp; Estate Operations
          </div>
          <div style="font-size: 9.5px; color: #4b5563; margin-top: 1px;">
            Govt. Reg. Kerala Field Operations • GSTIN: 32AABCK9876Q1Z9 • Calicut / Ernakulam / Palakkad
          </div>
        </div>
      </div>

      <div style="text-align: right;">
        <div style="display: inline-block; padding: 4px 10px; background: #2A835F; color: #ffffff; font-weight: 800; font-size: 11px; letter-spacing: 0.05em; border-radius: 4px; text-transform: uppercase;">
          Account Statement
        </div>
        <div style="font-size: 10px; color: #4b5563; font-weight: 600; margin-top: 4px; letter-spacing: -0.01em;">
          Official Customer Ledger Report
        </div>
        <div style="font-size: 11px; font-family: 'JetBrains Mono', monospace; font-weight: 700; color: #111827; margin-top: 3px; font-feature-settings: 'tnum' on, 'lnum' on;">
          ${statementRef}
        </div>
      </div>
    </div>

    <!-- Statement Metadata Bar -->
    <div style="display: flex; justify-content: space-between; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; padding: 8px 12px; margin-top: 12px; font-size: 10.5px;">
      <div>
        <span style="color: #64748b; font-weight: 500;">Statement Period:</span>
        <strong style="color: #0f172a; margin-left: 4px;">${periodLabel}</strong>
      </div>
      <div>
        <span style="color: #64748b; font-weight: 500;">Generated On:</span>
        <strong style="color: #0f172a; margin-left: 4px; font-family: 'JetBrains Mono', monospace;">${generatedAt}</strong>
      </div>
      <div>
        <span style="color: #64748b; font-weight: 500;">Issued By:</span>
        <strong style="color: #2A835F; margin-left: 4px;">${generatedBy}</strong>
      </div>
    </div>

    <!-- Customer Profile Card -->
    <div style="margin-top: 12px; display: grid; grid-template-columns: 1.4fr 1fr; gap: 12px; background: #ffffff; border: 1px solid #e5e7eb; border-radius: 6px; padding: 12px 14px;">
      <div>
        <div style="font-size: 9.5px; font-weight: 800; color: #6b7280; text-transform: uppercase; letter-spacing: 0.06em; margin-bottom: 3px;">
          Customer &amp; Account Profile
        </div>
        <div style="font-size: 14px; font-weight: 800; color: #111827; letter-spacing: -0.02em;">
          ${customer.name}
          <span style="font-size: 11px; font-family: 'JetBrains Mono', monospace; font-weight: 600; color: #7B4DFF; margin-left: 6px;">@${customer.username}</span>
        </div>
        <div style="font-size: 10.5px; color: #374151; margin-top: 4px;">
          📞 <strong>Phone:</strong> <span style="font-family: 'JetBrains Mono', monospace;">${customer.phone || 'N/A'}</span> ${customer.email ? `&nbsp;|&nbsp; ✉️ <strong>Email:</strong> ${customer.email}` : ''}
        </div>
        <div style="font-size: 10.5px; color: #4b5563; margin-top: 2px;">
          📍 <strong>Service Location:</strong> ${customer.address || 'Kerala Residence'}
        </div>
      </div>

      <div style="border-left: 1px solid #f1f5f9; padding-left: 12px; display: flex; flex-direction: column; justify-content: center;">
        <div style="display: flex; justify-content: space-between; font-size: 10.5px; margin-bottom: 3px;">
          <span style="color: #64748b;">Customer ID:</span>
          <span style="font-family: monospace; font-weight: 600; color: #1e293b;">${customer.id.slice(0, 14)}...</span>
        </div>
        ${customer.createdAt ? `
        <div style="display: flex; justify-content: space-between; font-size: 10.5px; margin-bottom: 3px;">
          <span style="color: #64748b;">Member Since:</span>
          <span style="font-weight: 600; color: #1e293b;">${customer.createdAt}</span>
        </div>` : ''}
        <div style="display: flex; justify-content: space-between; font-size: 10.5px;">
          <span style="color: #64748b;">Account Status:</span>
          <span style="font-weight: 700; color: #059669; background: #d1fae5; padding: 1px 6px; border-radius: 4px; font-size: 9.5px;">ACTIVE</span>
        </div>
      </div>
    </div>

    <!-- Executive Summary / KPI Bento -->
    <div style="margin-top: 14px; display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px;">
      <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; padding: 10px; text-align: center;">
        <div style="font-size: 9px; font-weight: 700; color: #64748b; text-transform: uppercase;">Total Bookings</div>
        <div style="font-size: 18px; font-weight: 800; color: #0f172a; margin-top: 2px;">${stats.totalEnquiries}</div>
        <div style="font-size: 9.5px; color: #059669; font-weight: 600; margin-top: 1px;">${stats.completedWorks} Completed</div>
      </div>

      <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; padding: 10px; text-align: center;">
        <div style="font-size: 9px; font-weight: 700; color: #64748b; text-transform: uppercase;">Active / Pending</div>
        <div style="font-size: 18px; font-weight: 800; color: #b45309; margin-top: 2px;">${stats.inProgressWorks + stats.pendingWorks}</div>
        <div style="font-size: 9.5px; color: #6b7280; margin-top: 1px;">In Pipeline</div>
      </div>

      <div style="background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 6px; padding: 10px; text-align: center;">
        <div style="font-size: 9px; font-weight: 700; color: #166534; text-transform: uppercase;">Total Billed</div>
        <div style="font-size: 17px; font-weight: 800; color: #15803d; margin-top: 2px; font-family: monospace;">${formatINR(stats.totalBilledAmount)}</div>
        <div style="font-size: 9.5px; color: #166534; font-weight: 600; margin-top: 1px;">Value of Works</div>
      </div>

      <div style="background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 6px; padding: 10px; text-align: center;">
        <div style="font-size: 9px; font-weight: 700; color: #1e40af; text-transform: uppercase;">Settled Amount</div>
        <div style="font-size: 17px; font-weight: 800; color: #1d4ed8; margin-top: 2px; font-family: monospace;">${formatINR(stats.totalPaidAmount)}</div>
        <div style="font-size: 9.5px; color: #1e40af; font-weight: 600; margin-top: 1px;">
          ${stats.outstandingBalance > 0 ? `Pending: ${formatINR(stats.outstandingBalance)}` : 'Fully Settled (0 Bal)'}
        </div>
      </div>
    </div>

    <!-- Works & Enquiries Breakdown Table -->
    <div style="margin-top: 18px;">
      <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 8px; border-bottom: 1.5px solid #2A835F; padding-bottom: 4px;">
        <h3 style="margin: 0; font-size: 12px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.5px; color: #2A835F;">
          Work Orders & Service History (${enquiries.length})
        </h3>
        <span style="font-size: 10px; color: #4b5563; font-weight: 600;">
          Showing ${data.onlyCompleted ? 'Completed Works Only' : 'All Bookings & Inquiries'}
        </span>
      </div>

      <table style="width: 100%; border-collapse: collapse; text-align: left;">
        <thead>
          <tr style="background: #f8fafc; border-bottom: 1.5px solid #cbd5e1; font-size: 10px; text-transform: uppercase; color: #475569; letter-spacing: 0.3px;">
            <th style="padding: 7px 10px; text-align: center; width: 30px;">#</th>
            <th style="padding: 7px 10px; width: 85px;">Date</th>
            <th style="padding: 7px 10px;">Service & Reference</th>
            <th style="padding: 7px 10px; width: 130px;">Specialist Squad</th>
            <th style="padding: 7px 10px; width: 100px;">Units / Hours</th>
            <th style="padding: 7px 10px; text-align: center; width: 75px;">Status</th>
            <th style="padding: 7px 10px; text-align: right; width: 85px;">Amount</th>
          </tr>
        </thead>
        <tbody>
          ${enquiries.length > 0 ? enquiriesRows : `
            <tr>
              <td colspan="7" style="padding: 30px; text-align: center; color: #94a3b8; font-style: italic;">
                No service work records found for this selected period (${periodLabel}).
              </td>
            </tr>
          `}
        </tbody>
      </table>
    </div>

    <!-- Optional Transactions Section -->
    ${transactionsSection}

    <!-- Financial Total Summary Banner -->
    <div style="margin-top: 18px; background: #fdfdfd; border: 1.5px solid #e2e8f0; border-radius: 6px; padding: 12px 16px; display: flex; justify-content: space-between; align-items: center;">
      <div>
        <div style="font-size: 10px; font-weight: 700; text-transform: uppercase; color: #64748b;">
          Statement Financial Status
        </div>
        <div style="font-size: 12px; color: #1e293b; margin-top: 2px;">
          ${stats.outstandingBalance === 0 ? '✅ All works for this period are fully settled.' : `⚠️ Outstanding balance to be cleared: <strong>${formatINR(stats.outstandingBalance)}</strong>`}
        </div>
      </div>
      <div style="text-align: right;">
        <span style="font-size: 11px; color: #64748b; margin-right: 12px;">Total Value: <strong style="color: #0f172a;">${formatINR(stats.totalBilledAmount)}</strong></span>
        <span style="font-size: 13px; font-weight: 800; color: #047857; background: #ecfdf5; padding: 4px 10px; border-radius: 6px; border: 1px solid #a7f3d0;">
          Settled: ${formatINR(stats.totalPaidAmount)}
        </span>
      </div>
    </div>

    <!-- Official Stamp & Verification Footer -->
    <div style="margin-top: 26px; padding-top: 14px; border-top: 1px dashed #cbd5e1; display: grid; grid-template-columns: 1.5fr 1fr; gap: 20px; align-items: flex-end;">
      <div>
        <div style="font-size: 10px; font-weight: 800; color: #1e293b; text-transform: uppercase; margin-bottom: 2px; letter-spacing: 0.05em;">
          Official Operations Verification &amp; Audit Seal
        </div>
        <div style="font-size: 9.5px; color: #64748b; line-height: 1.4;">
          This document is an authenticated statement of services rendered and accounts maintained by KK Group Kerala Operations. For any discrepancies or additional receipts, please connect with our central billing desk.
        </div>
        <div style="margin-top: 6px; font-size: 9px; color: #94a3b8; font-family: 'JetBrains Mono', monospace;">
          Ref ID: ${statementRef} • Issued at Calicut Command Center
        </div>
      </div>

      <div style="text-align: right;">
        <div style="display: inline-block; text-align: center;">
          <div style="width: 140px; border-bottom: 1.5px solid #0f172a; margin: 0 auto 4px auto; height: 32px;"></div>
          <div style="font-size: 10.5px; font-weight: 800; color: #0f172a;">Authorized Signatory</div>
          <div style="font-size: 9px; color: #2A835F; font-weight: 700; letter-spacing: 0.05em;">KK GROUP KERALA HQ</div>
        </div>
      </div>
    </div>

  </div>
</body>
</html>`;
}

export function downloadStatementPDF(data: CustomerStatementData): Promise<void> {
  const finalHtml = renderStatementHTML(data);

  const printFrame = document.createElement('iframe');
  printFrame.style.position = 'fixed';
  printFrame.style.top = '-10000px';
  printFrame.style.left = '-10000px';
  printFrame.style.width = '210mm';
  printFrame.style.height = '297mm';
  printFrame.style.border = 'none';
  printFrame.style.opacity = '0.01';
  printFrame.style.pointerEvents = 'none';
  printFrame.style.zIndex = '-9999';
  document.body.appendChild(printFrame);

  const doc = printFrame.contentWindow?.document;
  if (!doc) {
    console.error('Unable to access statement print frame document');
    return Promise.resolve();
  }

  doc.open();
  doc.write(finalHtml);
  doc.close();

  return new Promise<void>((resolve) => {
    const executePrint = () => {
      try {
        printFrame.contentWindow?.focus();
        printFrame.contentWindow?.print();
      } catch (err) {
        console.error('Error invoking print dialog for statement:', err);
      } finally {
        setTimeout(() => {
          printFrame.remove();
          resolve();
        }, 1500);
      }
    };

    const checkReadyAndPrint = () => {
      if (doc.fonts && doc.fonts.ready) {
        doc.fonts.ready.then(() => executePrint()).catch(() => executePrint());
      } else {
        executePrint();
      }
    };

    const logo = doc.querySelector('img');
    if (logo && !logo.complete) {
      logo.onload = () => setTimeout(checkReadyAndPrint, 80);
      logo.onerror = () => setTimeout(checkReadyAndPrint, 80);
      setTimeout(checkReadyAndPrint, 600);
    } else {
      setTimeout(checkReadyAndPrint, 100);
    }
  });
}
