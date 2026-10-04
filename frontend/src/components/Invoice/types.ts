export interface InvoiceLineItem {
  id: string;
  description: string;
  quantity: number;
  unit: string;
  rate: number;
  amount: number;
}

export type InvoicePaymentStatus = 'PAID' | 'PARTIALLY_PAID' | 'PENDING';

export interface InvoiceData {
  invoiceNumber: string;
  quotationNumber?: string;
  date: string;
  completionDate: string;
  dueDate?: string;
  trackingNumber: string;
  enquiryId?: string;

  // Customer Details
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  customerAddress?: string;
  district?: string;
  city?: string;

  // Service Details
  serviceName: string;
  serviceCategory?: string;

  // Worker & Field Execution Details
  workerName?: string;
  workerPhone?: string;
  workerRole?: string;
  workingHours?: string;
  completedUnits?: number | string;
  finishedSetups?: string;

  // Financial Items & Adjustments
  items: InvoiceLineItem[];
  subtotal: number;
  discountType: 'PERCENTAGE' | 'FIXED';
  discountValue: number;
  discountAmount: number;
  taxRate: number;
  taxAmount: number;
  grandTotal: number;

  // Payment Settlement
  paymentStatus: InvoicePaymentStatus;
  paymentMethod: string;
  paidAmount?: number;
  balanceDue?: number;
  transactionRef?: string;
  paymentTerms?: string;
  notes?: string;

  // Authentication & Signatory
  preparedBy: string;
  officerRole: string;
}
