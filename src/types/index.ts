export interface Patient {
  id: string;
  reg: string;
  name: string;
  phone: string;
  address: string;
  createdAt: string;
  updatedAt: string;
}

export interface NewPatientInput {
  name: string;
  phone: string;
  address: string;
  reg?: string;
}

export interface InvoiceItem {
  name: string;
  unitPrice: number;
  qty: number;
  unit: string;
}

export interface Payment {
  amount: number;
  method: string;
}

export interface Invoice {
  id: string;
  invoiceNo: string;
  invoiceDate: string;
  dueDate: string;
  therapist: string;
  patientReg: string;
  patientName: string;
  billingType: string;
  items: InvoiceItem[];
  total: number;
  discount: number;
  payable: number;
  payments: Payment[];
  totalPaid: number;
  extraPaid: number;
  balanceDue: number;
  status: string;
  note: string;
  pdfPath?: string;
  createdAt: string;
  updatedAt: string;
}

export interface InvoiceSummary {
  id: string;
  name: string;
  reg: string;
  invoice: string;
  type: string;
  amount: string;
  status: string;
  date: string;
}

export interface PatientListItem {
  id: string;
  reg: string;
  name: string;
  invoices: number;
  date: string;
}

export interface DashboardStats {
  totalPatients: number;
  totalInvoices: number;
  paidInvoices: number;
  unpaidInvoices: number;
  partialInvoices: number;
  totalRevenue: number;
  pendingAmount: number;
}

export interface ClinicSettings {
  clinicName: string;
  tagline: string;
  phone: string;
  email: string;
  website: string;
  physiotherapist: string;
  patientIdFormat: string;
  gst: string;
  logoUri: string;
  insuranceClause: string;
}
