import { InvoiceData } from './types';

export function formatINR(val: number): string {
  if (isNaN(val) || val === null || val === undefined) return '₹0';
  return '₹' + Math.round(val).toLocaleString('en-IN');
}

export function cleanPhoneNumber(phone: string): string {
  if (!phone) return '';
  const digits = phone.replace(/[^0-9]/g, '');
  if (digits.length === 10) {
    return '91' + digits;
  }
  if (digits.length === 12 && digits.startsWith('91')) {
    return digits;
  }
  if (digits.length > 10 && !digits.startsWith('91')) {
    return digits;
  }
  return digits;
}

export function generateInvoiceRef(trackingNumber?: string): string {
  const year = new Date().getFullYear();
  if (trackingNumber) {
    const suffix = trackingNumber.replace(/[^a-zA-Z0-9]/g, '').slice(-4).toUpperCase();
    return `KK-INV-${year}-${suffix}`;
  }
  const randomSuffix = Math.floor(1000 + Math.random() * 9000);
  return `KK-INV-${year}-${randomSuffix}`;
}

export function numberToIndianWords(num: number): string {
  if (!num || isNaN(num) || num <= 0) return 'Rupees Zero Only';

  const a = [
    '',
    'One',
    'Two',
    'Three',
    'Four',
    'Five',
    'Six',
    'Seven',
    'Eight',
    'Nine',
    'Ten',
    'Eleven',
    'Twelve',
    'Thirteen',
    'Fourteen',
    'Fifteen',
    'Sixteen',
    'Seventeen',
    'Eighteen',
    'Nineteen',
  ];
  const b = [
    '',
    '',
    'Twenty',
    'Thirty',
    'Forty',
    'Fifty',
    'Sixty',
    'Seventy',
    'Eighty',
    'Ninety',
  ];

  function convertHundreds(n: number): string {
    let str = '';
    if (n >= 100) {
      str += a[Math.floor(n / 100)] + ' Hundred ';
      n %= 100;
    }
    if (n >= 20) {
      str += b[Math.floor(n / 10)] + (n % 10 !== 0 ? ' ' + a[n % 10] : '');
    } else if (n > 0) {
      str += a[n];
    }
    return str.trim();
  }

  let integerPart = Math.floor(num);
  let words = '';

  const crore = Math.floor(integerPart / 10000000);
  integerPart %= 10000000;

  const lakh = Math.floor(integerPart / 100000);
  integerPart %= 100000;

  const thousand = Math.floor(integerPart / 1000);
  integerPart %= 1000;

  const hundreds = integerPart;

  if (crore > 0) {
    words += convertHundreds(crore) + ' Crore ';
  }
  if (lakh > 0) {
    words += convertHundreds(lakh) + ' Lakh ';
  }
  if (thousand > 0) {
    words += convertHundreds(thousand) + ' Thousand ';
  }
  if (hundreds > 0) {
    words += convertHundreds(hundreds) + ' ';
  }

  return `Rupees ${words.trim()} Only`;
}

export function buildWhatsAppInvoiceMessage(data: InvoiceData): string {
  const locationStr = [data.city, data.district, 'Kerala'].filter(Boolean).join(', ');

  const lines: string[] = [
    `*KK GROUP TAX INVOICE & WORK RECEIPT* 🧾🌴`,
    `_Official Completed Work Billing & Settlement_`,
    `_കെ.കെ ഗ്രൂപ്പ് ഔദ്യോഗിക ടാക്സ് ഇൻവോയ്സ്_`,
    `━━━━━━━━━━━━━━━━━━━━━━`,
    `🧾 *Invoice No:* \`${data.invoiceNumber}\``,
    `📌 *Job / Enquiry Ref:* \`${data.trackingNumber}\``,
    `👤 *Customer:* *${data.customerName}*`,
    `📞 *Phone:* ${data.customerPhone}`,
    `🛠️ *Service:* *${data.serviceName}*`,
    `📅 *Work Completed:* ${data.completionDate || data.date}`,
    locationStr ? `📍 *Site:* ${locationStr}` : '',
    `━━━━━━━━━━━━━━━━━━━━━━`,
    `👷 *EXECUTING SQUAD & WORK DETAILS:*`,
    data.workerName
      ? `• *Field Lead / Specialist:* *${data.workerName}* ${data.workerPhone ? `(${data.workerPhone})` : ''}`
      : `• *Field Squad:* KK Group Specialized Operations Squad`,
    data.workingHours ? `• *Working Hours Logged:* ${data.workingHours}` : '',
    data.completedUnits ? `• *Units / Volume Delivered:* ${data.completedUnits}` : '',
    data.finishedSetups ? `• *Finished Setups:* ${data.finishedSetups}` : '',
    `━━━━━━━━━━━━━━━━━━━━━━`,
    `*DELIVERABLES & BILLING BREAKDOWN:*`,
  ];

  data.items.forEach((item, idx) => {
    lines.push(
      `${idx + 1}. *${item.description}*`,
      `   • Qty: ${item.quantity} ${item.unit} × ₹${item.rate.toLocaleString('en-IN')} = *₹${item.amount.toLocaleString('en-IN')}*`,
    );
  });

  lines.push(`━━━━━━━━━━━━━━━━━━━━━━`);
  lines.push(`💰 *Subtotal:* ₹${data.subtotal.toLocaleString('en-IN')}`);

  if (data.discountAmount > 0) {
    lines.push(`🏷️ *Discount Applied:* -₹${data.discountAmount.toLocaleString('en-IN')}`);
  }

  if (data.taxAmount > 0) {
    lines.push(`🏛️ *GST/Tax (${data.taxRate}%):* ₹${data.taxAmount.toLocaleString('en-IN')}`);
  }

  lines.push(`✅ *TOTAL INVOICE AMOUNT: ₹${data.grandTotal.toLocaleString('en-IN')}*`);

  const statusEmoji =
    data.paymentStatus === 'PAID'
      ? '🟢'
      : data.paymentStatus === 'PARTIALLY_PAID'
      ? '🟡'
      : '🔴';
  lines.push(
    `${statusEmoji} *Payment Status:* *${data.paymentStatus.replace('_', ' ')}* via ${data.paymentMethod}`,
  );
  if (data.transactionRef) {
    lines.push(`🔖 *Transaction / UPI Ref:* \`${data.transactionRef}\``);
  }
  lines.push(`━━━━━━━━━━━━━━━━━━━━━━`);

  if (data.notes) {
    lines.push(`📝 *Notes:* ${data.notes}`);
  }

  lines.push(
    ``,
    `_Your official signed Tax Invoice has been generated. Thank you for partnering with KK Group!_`,
    `📞 *KK Group Customer Care & Accounts:* +91 94000 00000`,
    `🌐 *Head Office:* Kasaragod, Kerala - 671121`,
  );

  return lines.filter(Boolean).join('\n');
}

/**
 * Pure standalone HTML invoice renderer.
 * - Zero reliance on external CSS (prevents "lab" parser crashes).
 * - Margin: 0 on @page suppresses browser header timestamps and footer URLs.
 * - Entire page sheet is 100% white (#ffffff) with min-height: 297mm to prevent any black gap.
 */
export function renderInvoiceHTML(data: InvoiceData, logoOrigin?: string): string {
  const origin = logoOrigin || (typeof window !== 'undefined' ? window.location.origin : '');
  const logoUrl = `${origin}/logos/logo-bg.png`;
  const wordsAmount = numberToIndianWords(data.grandTotal);
  const locationStr = [data.customerAddress, data.city, data.district, 'Kerala']
    .filter(Boolean)
    .join(', ');

  const itemsHtml = data.items
    .map(
      (item, idx) => `
      <tr style="background-color: ${idx % 2 === 1 ? '#f8fafc' : '#ffffff'}; border-bottom: 1px solid #e2e8f0;">
        <td style="padding: 10px 12px; text-align: center; font-family: monospace; font-size: 11px; color: #64748b;">
          ${idx + 1}
        </td>
        <td style="padding: 10px 12px; font-weight: 600; color: #0f172a;">
          ${item.description}
        </td>
        <td style="padding: 10px 12px; text-align: center; font-family: monospace; color: #334155;">
          ${item.quantity}
        </td>
        <td style="padding: 10px 12px; color: #64748b; font-size: 11px;">
          ${item.unit}
        </td>
        <td style="padding: 10px 12px; text-align: right; font-family: monospace; color: #334155;">
          ${formatINR(item.rate)}
        </td>
        <td style="padding: 10px 12px; text-align: right; font-family: monospace; font-weight: 700; color: #0f172a;">
          ${formatINR(item.amount)}
        </td>
      </tr>
    `,
    )
    .join('');

  const paymentStatusBg =
    data.paymentStatus === 'PAID'
      ? '#EBF6F1'
      : data.paymentStatus === 'PARTIALLY_PAID'
      ? '#FEF3C7'
      : '#FEE2E2';

  const paymentStatusColor =
    data.paymentStatus === 'PAID'
      ? '#2A835F'
      : data.paymentStatus === 'PARTIALLY_PAID'
      ? '#B45309'
      : '#B91C1C';

  const paymentStatusBorder =
    data.paymentStatus === 'PAID'
      ? '#C3E6D5'
      : data.paymentStatus === 'PARTIALLY_PAID'
      ? '#FDE68A'
      : '#FECACA';

  return `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <title>KK_Group_Invoice_${data.invoiceNumber}</title>
    <style>
      @page {
        size: A4 portrait;
        margin: 0mm !important;
      }
      *, *::before, *::after {
        box-sizing: border-box !important;
        -webkit-print-color-adjust: exact !important;
        print-color-adjust: exact !important;
      }
      html {
        margin: 0 !important;
        padding: 0 !important;
        background-color: #ffffff !important;
        background: #ffffff !important;
        width: 100% !important;
        height: 100% !important;
      }
      body {
        margin: 0 !important;
        padding: 0 !important;
        background-color: #ffffff !important;
        background: #ffffff !important;
        color: #0f172a !important;
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
        font-size: 12px;
        line-height: 1.45;
        width: 100% !important;
        min-height: 297mm !important;
        display: block !important;
      }
      .page-sheet {
        width: 210mm !important;
        min-height: 297mm !important;
        background-color: #ffffff !important;
        background: #ffffff !important;
        padding: 14mm 16mm 14mm 16mm !important;
        margin: 0 auto !important;
        box-sizing: border-box !important;
        position: relative !important;
        display: flex !important;
        flex-direction: column !important;
        justify-content: space-between !important;
      }
      .top-green-bar {
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        height: 6px;
        background-color: #2A835F;
      }
      table {
        border-collapse: collapse !important;
        width: 100% !important;
      }
      tr {
        page-break-inside: avoid !important;
      }
      @media print {
        html, body {
          width: 210mm !important;
          min-height: 297mm !important;
          background-color: #ffffff !important;
          background: #ffffff !important;
        }
        .page-sheet {
          width: 100% !important;
          min-height: 297mm !important;
          background-color: #ffffff !important;
          background: #ffffff !important;
          padding: 12mm 15mm !important;
          box-shadow: none !important;
          border: none !important;
          border-radius: 0 !important;
        }
      }
    </style>
  </head>
  <body style="background-color: #ffffff !important; background: #ffffff !important; margin: 0; padding: 0;">
    <div class="page-sheet">
      <div class="top-green-bar"></div>

      <!-- Top Section Container -->
      <div>
        <!-- 1. Header: Logo, Company & Invoice Ref -->
        <div style="display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 1px solid #e2e8f0; padding-bottom: 16px; margin-top: 4px;">
          <!-- Left: Logo & Company Name -->
          <div style="display: flex; align-items: center; gap: 14px;">
            <div style="width: 56px; height: 56px; border-radius: 10px; background-color: #f8fafc; border: 1px solid #e2e8f0; display: flex; align-items: center; justify-content: center; padding: 4px; flex-shrink: 0;">
              <img src="${logoUrl}" alt="KK Group" style="width: 100%; height: 100%; object-fit: contain;" />
            </div>
            <div>
              <div style="display: flex; align-items: center; gap: 8px;">
                <span style="font-size: 20px; font-weight: 900; color: #0f172a; letter-spacing: -0.02em;">KK GROUP</span>
                <span style="font-size: 10px; font-weight: 700; text-transform: uppercase; padding: 2px 8px; border-radius: 6px; background-color: #EBF6F1; color: #2A835F; border: 1px solid #C3E6D5;">
                  Kerala Operations
                </span>
              </div>
              <div style="font-size: 11px; font-weight: 600; color: #64748b; margin-top: 2px;">
                Field Squad &amp; Engineering Services &bull; കെ.കെ ഗ്രൂപ്പ്
              </div>
              <div style="font-size: 10px; color: #94a3b8; margin-top: 2px;">
                HQ: Kasaragod, Kerala - 671121 &bull; Helpline: +91 94000 00000
              </div>
            </div>
          </div>

          <!-- Right: Tax Invoice Reference & Status Badges -->
          <div style="text-align: right; flex-shrink: 0;">
            <div style="display: flex; align-items: center; justify-content: flex-end; gap: 6px; margin-bottom: 2px;">
              <span style="font-size: 10px; font-weight: 800; text-transform: uppercase; padding: 2px 8px; border-radius: 6px; background-color: ${paymentStatusBg}; color: ${paymentStatusColor}; border: 1px solid ${paymentStatusBorder};">
                ${data.paymentStatus.replace('_', ' ')}
              </span>
              <span style="font-size: 10px; font-weight: 800; text-transform: uppercase; padding: 2px 8px; border-radius: 6px; background-color: #EBF6F1; color: #2A835F; border: 1px solid #C3E6D5;">
                COMPLETED
              </span>
            </div>
            <div style="font-size: 18px; font-weight: 900; letter-spacing: 0.05em; color: #0f172a; text-transform: uppercase;">
              TAX INVOICE
            </div>
            <div style="font-family: monospace; font-size: 12px; font-weight: 700; color: #2A835F; margin-top: 1px;">
              ${data.invoiceNumber}
            </div>
            <div style="font-size: 11px; color: #64748b; margin-top: 2px;">
              Invoice Date: <span style="font-weight: 600; color: #334155;">${data.date}</span>
            </div>
            <div style="font-size: 11px; color: #64748b;">
              Completed On: <span style="font-weight: 600; color: #166534;">${data.completionDate || data.date}</span>
            </div>
          </div>
        </div>

        <!-- 2. Client & Enquiry Reference -->
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 24px; padding: 12px 0; border-bottom: 1px solid #e2e8f0; font-size: 12px;">
          <div>
            <span style="font-size: 10px; font-weight: 700; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.05em; display: block; margin-bottom: 3px;">
              INVOICED TO (CUSTOMER):
            </span>
            <div style="font-size: 14px; font-weight: 700; color: #0f172a;">
              ${data.customerName || 'Customer'}
            </div>
            <div style="color: #475569; margin-top: 2px;">
              Mobile: <span style="font-family: monospace; font-weight: 600; color: #0f172a;">${data.customerPhone}</span>
            </div>
            ${data.customerEmail ? `<div style="color: #64748b; font-size: 11px;">${data.customerEmail}</div>` : ''}
            <div style="color: #64748b; font-size: 11px; margin-top: 2px;">
              ${locationStr}
            </div>
          </div>

          <div style="text-align: right;">
            <span style="font-size: 10px; font-weight: 700; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.05em; display: block; margin-bottom: 3px;">
              JOB &amp; SETTLEMENT DETAILS:
            </span>
            <div style="font-family: monospace; font-size: 12px; font-weight: 700; color: #0f172a;">
              Work Order Ref: ${data.trackingNumber}
            </div>
            <div style="font-size: 12px; font-weight: 700; color: #2A835F; margin-top: 2px;">
              Service: ${data.serviceName}
            </div>
            <div style="font-size: 11px; color: #64748b; margin-top: 2px;">
              Payment Mode: <span style="font-weight: 600; color: #334155;">${data.paymentMethod}</span>
              ${data.transactionRef ? ` &bull; Ref: <span style="font-family: monospace; color: #0f172a;">${data.transactionRef}</span>` : ''}
            </div>
          </div>
        </div>

        <!-- 3. Worker, Working Hours & Finished Setups Card -->
        <div style="margin: 14px 0; padding: 12px 14px; border-radius: 8px; background-color: #f8fafc; border: 1px solid #e2e8f0; font-size: 11px;">
          <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #e2e8f0; padding-bottom: 8px; margin-bottom: 8px;">
            <span style="font-size: 10px; font-weight: 800; text-transform: uppercase; color: #2A835F; letter-spacing: 0.05em;">
              👷 EXECUTION LOG, SQUAD &amp; FINISHED SETUPS
            </span>
            <span style="font-size: 10px; font-weight: 700; color: #166534; background-color: #EBF6F1; padding: 2px 6px; border-radius: 4px; border: 1px solid #C3E6D5;">
              ✓ Site Inspected &amp; Handed Over
            </span>
          </div>

          <div style="display: grid; grid-template-columns: 1.2fr 1fr; gap: 16px;">
            <div>
              <div style="color: #334155; margin-bottom: 4px;">
                <strong style="color: #0f172a;">Assigned Field Specialist:</strong>{' '}
                <span style="font-weight: 600; color: #0f172a;">${data.workerName || 'KK Group Operations Crew'}</span>
                ${data.workerPhone ? ` &bull; <span style="font-family: monospace; color: #475569;">+${data.workerPhone}</span>` : ''}
              </div>
              <div style="color: #334155;">
                <strong style="color: #0f172a;">Working Hours Logged:</strong>{' '}
                <span style="font-weight: 600; color: #0f172a;">${data.workingHours || 'Standard Field Shift (Completed)'}</span>
                ${data.completedUnits ? ` &bull; <strong style="color: #0f172a;">Completed:</strong> ${data.completedUnits}` : ''}
              </div>
            </div>

            <div>
              <strong style="color: #0f172a; display: block; margin-bottom: 2px;">Finished Setups &amp; Notes:</strong>
              <p style="margin: 0; color: #475569; line-height: 1.4;">
                ${data.finishedSetups || 'All scope deliverables successfully executed. Safety sign-off and site cleanup completed.'}
              </p>
            </div>
          </div>
        </div>

        <!-- 4. Line Items Table -->
        <div style="margin: 16px 0; border-radius: 8px; border: 1px solid #e2e8f0; overflow: hidden;">
          <table style="width: 100%; border-collapse: collapse; font-size: 12px;">
            <thead>
              <tr style="background-color: #f8fafc; border-bottom: 1px solid #e2e8f0; color: #475569; text-align: left;">
                <th style="padding: 10px 12px; width: 36px; text-align: center; font-weight: 700;">#</th>
                <th style="padding: 10px 12px; font-weight: 700;">Scope of Work &amp; Deliverables Completed</th>
                <th style="padding: 10px 12px; text-align: center; font-weight: 700; width: 60px;">Qty</th>
                <th style="padding: 10px 12px; text-align: left; font-weight: 700; width: 70px;">Unit</th>
                <th style="padding: 10px 12px; text-align: right; font-weight: 700; width: 90px;">Rate (₹)</th>
                <th style="padding: 10px 12px; text-align: right; font-weight: 700; width: 110px;">Amount (₹)</th>
              </tr>
            </thead>
            <tbody>
              ${itemsHtml}
            </tbody>
          </table>
        </div>

        <!-- 5. Financial Ledger & In-Words -->
        <div style="display: grid; grid-template-columns: 1.2fr 1fr; gap: 20px; margin: 16px 0;">
          <!-- Left: Amount in Words -->
          <div style="display: flex; flex-direction: column; justify-content: space-between;">
            <div style="padding: 12px 14px; border-radius: 8px; background-color: #f8fafc; border: 1px solid #e2e8f0; font-size: 11px;">
              <span style="font-size: 10px; font-weight: 700; text-transform: uppercase; color: #94a3b8; display: block; margin-bottom: 2px;">
                AMOUNT IN WORDS:
              </span>
              <div style="font-weight: 700; color: #0f172a; font-style: italic;">
                ${wordsAmount}
              </div>
            </div>

            <div style="font-size: 11px; color: #64748b; margin-top: 10px;">
              <div style="display: flex; align-items: center; gap: 6px; color: #334155;">
                <span style="color: #2A835F; font-weight: bold;">✓</span>
                <span>Work signed off by customer. Machinery &amp; crew de-mobilized.</span>
              </div>
              <div style="display: flex; align-items: center; gap: 6px; color: #334155; margin-top: 3px;">
                <span style="color: #2A835F; font-weight: bold;">✓</span>
                <span>Executed strictly in accordance with Kerala Squad Quality Guidelines.</span>
              </div>
            </div>
          </div>

          <!-- Right: Ledger -->
          <div style="font-size: 12px;">
            <div style="display: flex; justify-content: space-between; color: #64748b; padding: 2px 4px;">
              <span>Subtotal:</span>
              <span style="font-family: monospace; font-weight: 600; color: #0f172a;">${formatINR(data.subtotal)}</span>
            </div>

            ${
              data.discountAmount > 0
                ? `<div style="display: flex; justify-content: space-between; color: #15803d; padding: 2px 4px;">
                    <span>Discount ${data.discountType === 'PERCENTAGE' ? `(${data.discountValue}%)` : ''}:</span>
                    <span style="font-family: monospace; font-weight: 600;">-${formatINR(data.discountAmount)}</span>
                  </div>`
                : ''
            }

            ${
              data.taxAmount > 0
                ? `<div style="display: flex; justify-content: space-between; color: #64748b; padding: 2px 4px;">
                    <span>GST / Taxes (${data.taxRate}%):</span>
                    <span style="font-family: monospace; font-weight: 600; color: #0f172a;">+${formatINR(data.taxAmount)}</span>
                  </div>`
                : ''
            }

            <!-- Grand Total Highlight Box -->
            <div style="padding: 12px 14px; border-radius: 10px; background-color: #EBF6F1; border: 1px solid #C3E6D5; display: flex; justify-content: space-between; align-items: center; margin-top: 8px;">
              <div>
                <span style="font-size: 10px; font-weight: 800; text-transform: uppercase; color: #2A835F; display: block;">
                  TOTAL INVOICE VALUE
                </span>
                <span style="font-size: 9px; color: #166534;">Final Settled Amount</span>
              </div>
              <div style="font-size: 18px; font-weight: 900; font-family: monospace; color: #2A835F;">
                ${formatINR(data.grandTotal)}
              </div>
            </div>
          </div>
        </div>

        <!-- 6. Payment Terms & Settlement Details -->
        <div style="border-top: 1px solid #e2e8f0; padding-top: 12px; margin-top: 12px; display: grid; grid-template-columns: 1fr 1fr; gap: 20px; font-size: 11px; color: #475569;">
          <div>
            <span style="font-weight: 700; color: #0f172a; display: block; margin-bottom: 2px;">
              Settlement Status:
            </span>
            <p style="margin: 0; line-height: 1.4;">
              Payment received via <strong>${data.paymentMethod}</strong> (${data.paymentStatus.replace('_', ' ')}).
              ${data.transactionRef ? ` Transaction Ref: ${data.transactionRef}.` : ''}
            </p>
          </div>

          <div>
            <span style="font-weight: 700; color: #0f172a; display: block; margin-bottom: 2px;">
              Post-Completion Service Guarantee:
            </span>
            <p style="margin: 0; line-height: 1.4;">
              ${data.notes || 'For follow-up questions, maintenance schedule, or squad re-booking, contact helpline.'}
            </p>
          </div>
        </div>
      </div>

      <!-- 7. Footer: Support Desk & Authenticated Signatory -->
      <div style="border-top: 1px solid #e2e8f0; padding-top: 14px; margin-top: 18px; display: flex; justify-content: space-between; align-items: center;">
        <div style="font-size: 10px; color: #64748b;">
          <div style="font-weight: 700; color: #0f172a;">KK Group Billing &amp; Operations Command Desk</div>
          <div>
            Helpline: <span style="font-weight: 600; color: #0f172a;">+91 94000 00000</span> &bull; accounts@kkgroupkerala.com
          </div>
          <div style="color: #94a3b8; margin-top: 2px;">
            Digitally certified tax invoice &bull; Kasaragod, Kerala - 671121
          </div>
        </div>

        <div style="text-align: right;">
          <div style="display: inline-flex; align-items: center; gap: 4px; padding: 3px 8px; border-radius: 6px; background-color: #EBF6F1; border: 1px solid #C3E6D5; color: #2A835F; font-size: 10px; font-weight: 700; margin-bottom: 3px;">
            <span>✓</span>
            <span>Digitally Verified &amp; Signed</span>
          </div>
          <div style="font-size: 12px; font-weight: 700; color: #0f172a;">
            ${data.preparedBy || 'Authorized Officer'}
          </div>
          <div style="font-size: 10px; color: #64748b;">
            ${data.officerRole || 'Operations Controller'}
          </div>
        </div>
      </div>
    </div>
  </body>
</html>`;
}

/**
 * Downloads / Prints the invoice PDF:
 * - Employs a zero-bleed off-screen iframe rendered at standard A4 proportions.
 * - Suppresses all browser URLs, timestamps, and page headers/footers via @page { margin: 0 }.
 * - Guarantees full-height pure white (#ffffff) styling across the entire A4 sheet (no black gap).
 * - Avoids external html2canvas / html2pdf libraries to eliminate modern CSS "lab" color function errors.
 */
export async function downloadInvoicePDF(
  target: InvoiceData | string,
  optionalFilename?: string,
): Promise<void> {
  const existingFrame = document.getElementById('kk-invoice-print-frame');
  if (existingFrame) {
    existingFrame.remove();
  }

  let finalHtml = '';

  if (typeof target === 'string') {
    const element = document.getElementById(target);
    if (!element) {
      console.warn(`Invoice element #${target} not found in DOM`);
      return;
    }
    const origin = typeof window !== 'undefined' ? window.location.origin : '';
    let contentHtml = element.innerHTML;
    contentHtml = contentHtml.replace(/src="\/logos\//g, `src="${origin}/logos/`);

    finalHtml = `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <title>${optionalFilename || 'KK_Group_Invoice'}</title>
    <style>
      @page { size: A4 portrait; margin: 0mm !important; }
      *, *::before, *::after { box-sizing: border-box !important; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
      html, body {
        margin: 0 !important;
        padding: 0 !important;
        background-color: #ffffff !important;
        background: #ffffff !important;
        color: #0f172a !important;
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
        font-size: 12px;
        line-height: 1.45;
        width: 100% !important;
        min-height: 297mm !important;
      }
      .page-sheet {
        width: 210mm !important;
        min-height: 297mm !important;
        background-color: #ffffff !important;
        background: #ffffff !important;
        padding: 14mm 16mm !important;
        margin: 0 auto !important;
        box-sizing: border-box !important;
        position: relative !important;
        display: flex !important;
        flex-direction: column !important;
        justify-content: space-between !important;
      }
      table { border-collapse: collapse !important; width: 100% !important; }
      tr { page-break-inside: avoid !important; }
      @media print {
        html, body { width: 210mm !important; min-height: 297mm !important; background: #ffffff !important; }
        .page-sheet { width: 100% !important; min-height: 297mm !important; background: #ffffff !important; padding: 12mm 15mm !important; }
      }
    </style>
  </head>
  <body style="background-color: #ffffff !important; background: #ffffff !important; margin: 0; padding: 0;">
    <div class="page-sheet">
      ${contentHtml}
    </div>
  </body>
</html>`;
  } else {
    const origin = typeof window !== 'undefined' ? window.location.origin : '';
    finalHtml = renderInvoiceHTML(target, origin);
  }

  const printFrame = document.createElement('iframe');
  printFrame.id = 'kk-invoice-print-frame';
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
    console.error('Unable to access invoice print frame document');
    return;
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
        console.error('Error invoking print dialog:', err);
      } finally {
        setTimeout(() => {
          printFrame.remove();
          resolve();
        }, 1500);
      }
    };

    const logo = doc.querySelector('img');
    if (logo && !logo.complete) {
      logo.onload = () => setTimeout(executePrint, 100);
      logo.onerror = () => setTimeout(executePrint, 100);
      setTimeout(executePrint, 600);
    } else {
      setTimeout(executePrint, 150);
    }
  });
}
