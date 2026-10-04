export interface QuotationLineItem {
  id: string;
  description: string;
  quantity: number;
  unit: string;
  rate: number;
  amount: number;
}

export interface QuotationData {
  quotationNumber: string;
  date: string; // YYYY-MM-DD
  validUntil: string; // YYYY-MM-DD
  trackingNumber: string;
  enquiryId?: string;

  // Customer Information
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  customerAddress?: string;
  district?: string;
  city?: string;

  // Service Details
  serviceName: string;
  serviceCategory?: string;
  scopeOfWork?: string;

  // Line Items
  items: QuotationLineItem[];

  // Calculation & Totals
  subtotal: number;
  discountType: 'PERCENTAGE' | 'FIXED';
  discountValue: number;
  discountAmount: number;
  taxRate: number; // e.g. 0, 5, 12, 18
  taxAmount: number;
  grandTotal: number;

  // Terms & Operational Details
  paymentTerms: string;
  timeline: string;
  notes: string;
  preparedBy: string;
  officerRole: string;
}
