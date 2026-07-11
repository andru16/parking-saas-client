import api from '@/services/api';
import type { ApiResponse } from '@/api/types';

export type PrintDocumentType =
  | 'entry'
  | 'exit'
  | 'auto'
  | 'ticket_entry'
  | 'ticket_exit'
  | 'cash_open'
  | 'cash_close'
  | 'cash_audit'
  | 'membership_payment'
  | 'membership_renewal'
  | 'membership_new'
  | 'payment_receipt';

export type PrintFormat = 'html' | 'text' | 'pdf' | 'escpos';
export type PrintAdapter =
  | 'browser'
  | 'escpos'
  | 'pdf'
  | 'text'
  | 'bluetooth'
  | 'lan'
  | 'usb';

export interface PrintDocumentLine {
  label: string;
  value: string;
  emphasis?: boolean;
}

export interface PrintDocument {
  meta: {
    type: string;
    typeLabel?: string;
    ticketId?: string | null;
    ticketNumber?: string | null;
    documentNumber?: string | null;
    resourceType?: string;
    resourceId?: string | null;
    paperSize: '58mm' | '80mm' | 'A4';
    copies: number;
    currency: string;
    generatedAt: string;
    isPreview?: boolean;
  };
  header: {
    showLogo: boolean;
    logoUrl: string | null;
    parkingName: string | null;
    address: string | null;
    phone: string | null;
    taxId: string | null;
    headerText: string | null;
  };
  lines: PrintDocumentLine[];
  codes: {
    qr: { enabled: boolean; payload: string; label: string };
    barcode: { enabled: boolean; payload: string; label: string };
  };
  messages: {
    primary: string | null;
    secondary: string | null;
    lostTicketPolicy: string | null;
  };
  footer: { text: string | null };
}

export interface PrintResult {
  format: PrintFormat;
  document: PrintDocument;
  content: string | Record<string, unknown>;
  contentType: string;
  encoding?: string;
  adapter?: PrintAdapter;
  job?: { id: string } | null;
  reprint?: { reason: string; reprintedAt: string };
}

export interface PrintJobItem {
  id: string;
  documentType: string;
  resourceType: string;
  resourceId: string | null;
  format: string;
  adapter: string;
  status: string;
  isReprint: boolean;
  reprintReason: string | null;
  documentNumber: string | null;
  createdAt: string;
  user: { id: string; name: string | null; email: string | null } | null;
}

export async function getPrintPreview(payload: {
  type?: PrintDocumentType;
  format?: PrintFormat;
  draft?: Record<string, unknown>;
}): Promise<ApiResponse<PrintResult>> {
  const { data } = await api.post('/printing/preview', payload);
  return data;
}

export async function getTicketPrintDocument(
  ticketId: string,
  params?: { type?: PrintDocumentType; format?: PrintFormat; adapter?: PrintAdapter },
): Promise<ApiResponse<PrintResult>> {
  const { data } = await api.get(`/printing/tickets/${ticketId}/document`, { params });
  return data;
}

export async function reprintTicket(
  ticketId: string,
  payload: { reason: string; type?: PrintDocumentType; format?: PrintFormat },
): Promise<ApiResponse<PrintResult>> {
  const { data } = await api.post(`/printing/tickets/${ticketId}/reprint`, payload);
  return data;
}

export async function getCashPrintDocument(
  cashRegisterId: string,
  params?: { type?: PrintDocumentType; format?: PrintFormat },
): Promise<ApiResponse<PrintResult>> {
  const { data } = await api.get(`/printing/cash-registers/${cashRegisterId}/document`, {
    params,
  });
  return data;
}

export async function getMembershipPrintDocument(
  membershipId: string,
  params?: { type?: PrintDocumentType; format?: PrintFormat },
): Promise<ApiResponse<PrintResult>> {
  const { data } = await api.get(`/printing/memberships/${membershipId}/document`, { params });
  return data;
}

export async function getPaymentPrintDocument(
  paymentId: string,
  params?: { format?: PrintFormat },
): Promise<ApiResponse<PrintResult>> {
  const { data } = await api.get(`/printing/payments/${paymentId}/document`, { params });
  return data;
}

export async function reprintDocument(payload: {
  reason: string;
  ticketId?: string;
  cashRegisterId?: string;
  membershipId?: string;
  paymentId?: string;
  type?: PrintDocumentType;
  format?: PrintFormat;
}): Promise<ApiResponse<PrintResult>> {
  const { data } = await api.post('/printing/reprint', payload);
  return data;
}

export async function listPrintJobs(params?: {
  page?: number;
  limit?: number;
  resourceType?: string;
  resourceId?: string;
}): Promise<
  ApiResponse<{ items: PrintJobItem[]; pagination: { page: number; limit: number; total: number } }>
> {
  const { data } = await api.get('/printing/jobs', { params });
  return data;
}
