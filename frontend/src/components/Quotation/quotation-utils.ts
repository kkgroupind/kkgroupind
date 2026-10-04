import { QuotationData } from './types';

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

export function generateQuotationRef(trackingNumber?: string): string {
  const year = new Date().getFullYear();
  if (trackingNumber) {
    const suffix = trackingNumber.replace(/[^a-zA-Z0-9]/g, '').slice(-4).toUpperCase();
    return `KK-QT-${year}-${suffix}`;
  }
  const randomSuffix = Math.floor(1000 + Math.random() * 9000);
  return `KK-QT-${year}-${randomSuffix}`;
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

export function buildWhatsAppQuotationMessage(data: QuotationData): string {
  const locationStr = [data.city, data.district, 'Kerala'].filter(Boolean).join(', ');

  const lines: string[] = [
    `*KK GROUP PROFESSIONAL SERVICES* 🌴`,
    `_Official Quotation & Scope Estimate_`,
    `_കെ.കെ ഗ്രൂപ്പ് പ്രൊഫഷണൽ കൊട്ടേഷൻ_`,
    `━━━━━━━━━━━━━━━━━━━━━━`,
    `📋 *Quotation Ref:* \`${data.quotationNumber}\``,
    `📌 *Enquiry Code:* \`${data.trackingNumber}\``,
    `👤 *Customer:* *${data.customerName}*`,
    `📞 *Phone:* ${data.customerPhone}`,
    `🛠️ *Service:* *${data.serviceName}*`,
    locationStr ? `📍 *Location:* ${locationStr}` : '',
    `📅 *Date:* ${data.date} (Valid until ${data.validUntil})`,
    `━━━━━━━━━━━━━━━━━━━━━━`,
    `*ESTIMATED SERVICE BREAKDOWN:*`,
  ];

  data.items.forEach((item, idx) => {
    lines.push(
      `${idx + 1}. *${item.description}*`,
      `   • Qty: ${item.quantity} ${item.unit} × ₹${item.rate.toLocaleString('en-IN')} = *₹${item.amount.toLocaleString('en-IN')}*`
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

  lines.push(`✅ *GRAND TOTAL: ₹${data.grandTotal.toLocaleString('en-IN')}*`);
  lines.push(`━━━━━━━━━━━━━━━━━━━━━━`);

  if (data.timeline) {
    lines.push(`⏳ *Estimated Timeline:* ${data.timeline}`);
  }
  if (data.paymentTerms) {
    lines.push(`💳 *Payment Terms:* ${data.paymentTerms}`);
  }
  if (data.notes) {
    lines.push(`📝 *Notes:* ${data.notes}`);
  }

  lines.push(
    ``,
    `_We have generated your detailed official Quotation PDF document. Our squad is ready to schedule your site execution._`,
    `📞 *KK Group Customer Care & Dispatch:* +91 94000 00000`,
    `🌐 *Head Office:* Kasaragod, Kerala - 671121`
  );

  return lines.filter(Boolean).join('\n');
}

/**
 * Generates pure standalone HTML for the quotation document.
 * - Zero reliance on external stylesheets or Tailwind CSS (no modern CSS 'lab' parser errors).
 * - Margin: 0 on @page completely suppresses browser header date/time and footer URLs.
 * - Entire page sheet is 100% white (#ffffff) with min-height: 297mm to prevent any black gap.
 */
export function renderQuotationHTML(data: QuotationData, logoOrigin?: string): string {
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

  return `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <title>KK_Group_Quotation_${data.quotationNumber}</title>
    <style>
      @page {
        size: A4 portrait;
        margin: 0mm !important; /* Hides browser URL, date, time, and title */
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
        <!-- 1. Header: Logo, Company & Quotation Ref -->
        <div style="display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 1px solid #e2e8f0; padding-bottom: 18px; margin-top: 4px;">
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

          <!-- Right: Quotation Reference & Dates -->
          <div style="text-align: right; flex-shrink: 0;">
            <div style="font-size: 18px; font-weight: 900; letter-spacing: 0.05em; color: #0f172a; text-transform: uppercase;">
              QUOTATION
            </div>
            <div style="font-family: monospace; font-size: 12px; font-weight: 700; color: #2A835F; margin-top: 2px;">
              ${data.quotationNumber}
            </div>
            <div style="font-size: 11px; color: #64748b; margin-top: 2px;">
              Date: <span style="font-weight: 600; color: #334155;">${data.date}</span>
            </div>
            <div style="font-size: 11px; color: #64748b;">
              Valid Until: <span style="font-weight: 600; color: #b45309;">${data.validUntil}</span>
            </div>
          </div>
        </div>

        <!-- 2. Client & Work Details Panel -->
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 24px; padding: 14px 0; border-bottom: 1px solid #e2e8f0; font-size: 12px;">
          <div>
            <span style="font-size: 10px; font-weight: 700; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.05em; display: block; margin-bottom: 4px;">
              QUOTATION PREPARED FOR:
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
            <span style="font-size: 10px; font-weight: 700; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.05em; display: block; margin-bottom: 4px;">
              ENQUIRY REFERENCE:
            </span>
            <div style="font-family: monospace; font-size: 12px; font-weight: 700; color: #0f172a;">
              Ticket: ${data.trackingNumber}
            </div>
            <div style="font-size: 12px; font-weight: 700; color: #2A835F; margin-top: 2px;">
              Service: ${data.serviceName}
            </div>
            ${
              data.timeline
                ? `<div style="font-size: 11px; color: #64748b; margin-top: 2px;">
                    Est. Timeline: <span style="font-weight: 600; color: #334155;">${data.timeline}</span>
                  </div>`
                : ''
            }
          </div>
        </div>

        <!-- 3. Scope of Work Table -->
        <div style="margin: 18px 0; border-radius: 8px; border: 1px solid #e2e8f0; overflow: hidden;">
          <table style="width: 100%; border-collapse: collapse; font-size: 12px;">
            <thead>
              <tr style="background-color: #f8fafc; border-bottom: 1px solid #e2e8f0; color: #475569; text-align: left;">
                <th style="padding: 10px 12px; width: 36px; text-align: center; font-weight: 700;">#</th>
                <th style="padding: 10px 12px; font-weight: 700;">Scope of Work &amp; Deliverables</th>
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

        <!-- 4. Financial Ledger & In-Words -->
        <div style="display: grid; grid-template-columns: 1.2fr 1fr; gap: 20px; margin: 18px 0;">
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
                <span>All machinery, operator &amp; transport included.</span>
              </div>
              <div style="display: flex; align-items: center; gap: 6px; color: #334155; margin-top: 3px;">
                <span style="color: #2A835F; font-weight: bold;">✓</span>
                <span>Executed strictly under Kerala squad safety norms.</span>
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
                  GRAND TOTAL
                </span>
                <span style="font-size: 9px; color: #166534;">Total Payable Value</span>
              </div>
              <div style="font-size: 18px; font-weight: 900; font-family: monospace; color: #2A835F;">
                ${formatINR(data.grandTotal)}
              </div>
            </div>
          </div>
        </div>

        <!-- 5. Terms & Notes -->
        <div style="border-top: 1px solid #e2e8f0; padding-top: 12px; margin-top: 14px; display: grid; grid-template-columns: 1fr 1fr; gap: 20px; font-size: 11px; color: #475569;">
          <div>
            <span style="font-weight: 700; color: #0f172a; display: block; margin-bottom: 3px;">
              Payment Terms:
            </span>
            <p style="margin: 0; line-height: 1.4;">
              ${data.paymentTerms || '50% Advance on site commencement, 50% on completion via UPI / Bank Transfer / Cash.'}
            </p>
          </div>

          <div>
            <span style="font-weight: 700; color: #0f172a; display: block; margin-bottom: 3px;">
              Terms &amp; Site Accessibility:
            </span>
            <p style="margin: 0; line-height: 1.4;">
              ${data.notes || 'All safety equipment and transport included. Weather permitting for outdoor operations.'}
            </p>
          </div>
        </div>
      </div>

      <!-- 6. Footer: Support Desk & Authenticated Signatory -->
      <div style="border-top: 1px solid #e2e8f0; padding-top: 16px; margin-top: 20px; display: flex; justify-content: space-between; align-items: center;">
        <div style="font-size: 10px; color: #64748b;">
          <div style="font-weight: 700; color: #0f172a;">KK Group Operations Command Desk</div>
          <div>
            For scheduling or questions, call: <span style="font-weight: 600; color: #0f172a;">+91 94000 00000</span>
          </div>
          <div style="color: #94a3b8; margin-top: 2px;">
            Digitally authenticated quotation &bull; Kasaragod, Kerala
          </div>
        </div>

        <div style="text-align: right;">
          <div style="display: inline-flex; align-items: center; gap: 4px; padding: 3px 8px; border-radius: 6px; background-color: #EBF6F1; border: 1px solid #C3E6D5; color: #2A835F; font-size: 10px; font-weight: 700; margin-bottom: 3px;">
            <span>✓</span>
            <span>Digitally Verified</span>
          </div>
          <div style="font-size: 12px; font-weight: 700; color: #0f172a;">
            ${data.preparedBy || 'Authorized Officer'}
          </div>
          <div style="font-size: 10px; color: #64748b;">
            ${data.officerRole || 'Operations Officer'}
          </div>
        </div>
      </div>
    </div>
  </body>
</html>`;
}

/**
 * Downloads / Prints the quotation PDF:
 * - Employs a zero-bleed off-screen iframe rendered at standard A4 proportions.
 * - Suppresses all browser URLs, timestamps, and page headers/footers via @page { margin: 0 }.
 * - Guarantees full-height pure white (#ffffff) styling across the entire A4 sheet (no black gap).
 * - Avoids external html2canvas / html2pdf libraries to eliminate modern CSS "lab" color function errors.
 */
export async function downloadQuotationPDF(
  target: QuotationData | string,
  optionalFilename?: string,
): Promise<void> {
  // Remove any previously created print iframe
  const existingFrame = document.getElementById('kk-quotation-print-frame');
  if (existingFrame) {
    existingFrame.remove();
  }

  let finalHtml = '';

  if (typeof target === 'string') {
    // If element ID was passed, check DOM
    const element = document.getElementById(target);
    if (!element) {
      console.warn(`Quotation element #${target} not found in DOM`);
      return;
    }
    const origin = typeof window !== 'undefined' ? window.location.origin : '';
    let contentHtml = element.innerHTML;
    contentHtml = contentHtml.replace(/src="\/logos\//g, `src="${origin}/logos/`);

    finalHtml = `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <title>${optionalFilename || 'KK_Group_Quotation'}</title>
    <style>
      @page { size: A4 portrait; margin: 0mm !important; }
      *, *::before, *::after { box-sizing: border-box !important; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
      html, body {
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
    // QuotationData payload directly passed (recommended & most robust)
    const origin = typeof window !== 'undefined' ? window.location.origin : '';
    finalHtml = renderQuotationHTML(target, origin);
  }

  const printFrame = document.createElement('iframe');
  printFrame.id = 'kk-quotation-print-frame';
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
    console.error('Unable to access print frame document');
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
