import { useMutation, useQuery } from '@tanstack/react-query';
import {
  getCashPrintDocument,
  getMembershipPrintDocument,
  getPaymentPrintDocument,
  getPrintConfig,
  getPrintPreview,
  getTicketPrintDocument,
  listPrintJobs,
  reprintDocument,
  reprintTicket,
  type PrintDocumentType,
  type PrintFormat,
} from '@/api/printing';
import { printHtmlContent } from '@/modules/printing/printBrowser';

export const printingKeys = {
  all: ['printing'] as const,
  config: () => [...printingKeys.all, 'config'] as const,
  preview: (type: string, draftKey: string) =>
    [...printingKeys.all, 'preview', type, draftKey] as const,
  jobs: (page: number) => [...printingKeys.all, 'jobs', page] as const,
};

function maybePrintHtml(data: {
  format: string;
  content: string | Record<string, unknown>;
  document: { meta: { copies: number } };
}) {
  if (data.format === 'html' && typeof data.content === 'string') {
    printHtmlContent(data.content, data.document.meta.copies);
  }
}

/** Config de impresión de la organización (flags de tickets, etc.). */
export function usePrintConfig() {
  return useQuery({
    queryKey: printingKeys.config(),
    queryFn: async () => {
      const res = await getPrintConfig();
      return res.data.config;
    },
    staleTime: 30_000,
  });
}

/** Lee flags de autoimpresión desde la config en caché (o el valor pasado). */
export function shouldAutoPrintEntry(
  config: { print?: { generateEntryTicket?: boolean } } | null | undefined,
): boolean {
  return config?.print?.generateEntryTicket !== false;
}

export function shouldAutoPrintExit(
  config: { print?: { generateExitTicket?: boolean } } | null | undefined,
): boolean {
  return config?.print?.generateExitTicket !== false;
}

export function usePrintPreview(
  type: PrintDocumentType,
  draft: Record<string, unknown>,
  enabled = true,
) {
  const draftKey = JSON.stringify(draft);

  return useQuery({
    queryKey: printingKeys.preview(type, draftKey),
    queryFn: async () => {
      const res = await getPrintPreview({ type, format: 'html', draft });
      return res.data;
    },
    enabled,
    staleTime: 5_000,
  });
}

export function usePrintTicket() {
  return useMutation({
    mutationFn: async ({
      ticketId,
      type = 'auto',
      format = 'html',
    }: {
      ticketId: string;
      type?: PrintDocumentType;
      format?: PrintFormat;
    }) => {
      const res = await getTicketPrintDocument(ticketId, { type, format });
      return res.data;
    },
    onSuccess: maybePrintHtml,
  });
}

export function useReprintTicket() {
  return useMutation({
    mutationFn: async ({
      ticketId,
      reason,
      type = 'auto',
      format = 'html',
    }: {
      ticketId: string;
      reason: string;
      type?: PrintDocumentType;
      format?: PrintFormat;
    }) => {
      const res = await reprintTicket(ticketId, { reason, type, format });
      return res.data;
    },
    onSuccess: maybePrintHtml,
  });
}

export function usePrintCash() {
  return useMutation({
    mutationFn: async ({
      cashRegisterId,
      type = 'cash_close',
      format = 'html',
    }: {
      cashRegisterId: string;
      type?: PrintDocumentType;
      format?: PrintFormat;
    }) => {
      const res = await getCashPrintDocument(cashRegisterId, { type, format });
      return res.data;
    },
    onSuccess: maybePrintHtml,
  });
}

export function usePrintMembership() {
  return useMutation({
    mutationFn: async ({
      membershipId,
      type = 'membership_payment',
      format = 'html',
    }: {
      membershipId: string;
      type?: PrintDocumentType;
      format?: PrintFormat;
    }) => {
      const res = await getMembershipPrintDocument(membershipId, { type, format });
      return res.data;
    },
    onSuccess: maybePrintHtml,
  });
}

export function usePrintPayment() {
  return useMutation({
    mutationFn: async ({
      paymentId,
      format = 'html',
    }: {
      paymentId: string;
      format?: PrintFormat;
    }) => {
      const res = await getPaymentPrintDocument(paymentId, { format });
      return res.data;
    },
    onSuccess: maybePrintHtml,
  });
}

export function useReprintDocument() {
  return useMutation({
    mutationFn: async (payload: {
      reason: string;
      ticketId?: string;
      cashRegisterId?: string;
      membershipId?: string;
      paymentId?: string;
      type?: PrintDocumentType;
      format?: PrintFormat;
    }) => {
      const res = await reprintDocument(payload);
      return res.data;
    },
    onSuccess: maybePrintHtml,
  });
}

export function usePrintJobs(page = 1) {
  return useQuery({
    queryKey: printingKeys.jobs(page),
    queryFn: async () => {
      const res = await listPrintJobs({ page, limit: 30 });
      return res.data;
    },
  });
}
