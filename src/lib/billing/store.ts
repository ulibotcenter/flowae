import { create } from "zustand";
import { persist } from "zustand/middleware";
import type {
  BillingConceptDraft,
  FirmSettings,
  Invoice,
  InvoiceStatus,
  Lawyer,
} from "./types";
import {
  buildAdminEmail,
  buildClientEmail,
  buildSharePointPath,
  invoiceTotal,
} from "./templates";
import { addDaysIso, todayIso } from "./format";
import { createSeedInvoices, DEFAULT_LAWYERS, DEFAULT_SETTINGS } from "./seed";

interface BillingState {
  settings: FirmSettings;
  lawyers: Lawyer[];
  invoices: Invoice[];
  seq: number;
  hydrated: boolean;
  setHydrated: (v: boolean) => void;
  updateSettings: (patch: Partial<FirmSettings>) => void;
  upsertLawyer: (lawyer: Lawyer) => void;
  removeLawyer: (id: string) => void;
  createFromDraft: (draft: BillingConceptDraft) => Invoice;
  updateInvoice: (id: string, patch: Partial<Invoice>) => void;
  deleteInvoice: (id: string) => void;
  advanceStatus: (id: string, status: InvoiceStatus, extra?: Partial<Invoice>) => void;
  requestAdmin: (id: string) => void;
  markIssued: (id: string, invoiceNumber: string) => void;
  markSentToClient: (id: string) => void;
  registerPayment: (id: string, amount: number, full?: boolean) => void;
  refreshEmails: (id: string) => void;
  refreshOverdue: () => void;
  resetDemo: () => void;
  getLawyer: (id: string) => Lawyer | undefined;
}

function nextRef(seq: number): string {
  const year = new Date().getFullYear();
  return `FAC-${year}-${String(seq).padStart(4, "0")}`;
}

function recomputeDueStatus(inv: Invoice): Invoice {
  if (
    inv.status === "pagada" ||
    inv.status === "borrador" ||
    inv.status === "solicitada_admin" ||
    inv.status === "vencida"
  ) {
    return inv;
  }
  if (
    inv.dueDate &&
    new Date(inv.dueDate) < new Date() &&
    inv.paidAmount < invoiceTotal(inv) &&
    (inv.status === "enviada_cliente" ||
      inv.status === "emitida" ||
      inv.status === "parcial")
  ) {
    if (inv.paidAmount === 0) {
      return { ...inv, status: "vencida" };
    }
  }
  return inv;
}

export const useBillingStore = create<BillingState>()(
  persist(
    (set, get) => ({
      settings: DEFAULT_SETTINGS,
      lawyers: DEFAULT_LAWYERS,
      invoices: createSeedInvoices(DEFAULT_SETTINGS),
      seq: 42,
      hydrated: false,

      setHydrated: (v) => set({ hydrated: v }),

      updateSettings: (patch) =>
        set((s) => ({
          settings: { ...s.settings, ...patch },
        })),

      upsertLawyer: (lawyer) =>
        set((s) => {
          const exists = s.lawyers.some((l) => l.id === lawyer.id);
          return {
            lawyers: exists
              ? s.lawyers.map((l) => (l.id === lawyer.id ? lawyer : l))
              : [...s.lawyers, lawyer],
          };
        }),

      removeLawyer: (id) =>
        set((s) => ({ lawyers: s.lawyers.filter((l) => l.id !== id) })),

      createFromDraft: (draft) => {
        const state = get();
        const seq = state.seq + 1;
        const id = `inv-${crypto.randomUUID().slice(0, 8)}`;
        const createdAt = todayIso();
        const path = buildSharePointPath(
          state.settings,
          draft.clientName,
          draft.expediente,
        );
        const invoice: Invoice = {
          id,
          ref: nextRef(seq),
          invoiceNumber: "",
          clientName: draft.clientName.trim(),
          clientEmail: draft.clientEmail.trim(),
          clientNif: draft.clientNif.trim(),
          expediente: draft.expediente.trim(),
          concepto: draft.concepto.trim(),
          baseAmount: draft.baseAmount || 0,
          ivaRate: draft.ivaRate ?? state.settings.defaultIva,
          suplidos: draft.suplidos || 0,
          currency: "EUR",
          lawyerId: draft.lawyerId || state.lawyers[0]?.id || "",
          remitente: draft.remitente || "abogado",
          status: "borrador",
          createdAt,
          paidAmount: 0,
          notes: draft.notes || "",
          sharePointPath: path,
          sourceFile: draft.sourceFile,
          dueDate: addDaysIso(
            createdAt,
            draft.dueDays ?? state.settings.defaultPaymentDays,
          ),
        };
        const lawyer = state.lawyers.find((l) => l.id === invoice.lawyerId);
        const admin = buildAdminEmail(invoice, lawyer, state.settings);
        const client = buildClientEmail(invoice, lawyer, state.settings);
        invoice.adminEmailSubject = admin.subject;
        invoice.adminEmailBody = admin.body;
        invoice.clientEmailSubject = client.subject;
        invoice.clientEmailBody = client.body;

        set({ invoices: [invoice, ...state.invoices], seq });
        return invoice;
      },

      updateInvoice: (id, patch) =>
        set((s) => ({
          invoices: s.invoices.map((inv) => {
            if (inv.id !== id) return inv;
            const next = { ...inv, ...patch };
            if (patch.clientName || patch.expediente) {
              next.sharePointPath = buildSharePointPath(
                s.settings,
                next.clientName,
                next.expediente,
              );
            }
            return next;
          }),
        })),

      deleteInvoice: (id) =>
        set((s) => ({ invoices: s.invoices.filter((i) => i.id !== id) })),

      advanceStatus: (id, status, extra) =>
        set((s) => ({
          invoices: s.invoices.map((inv) =>
            inv.id === id ? { ...inv, status, ...extra } : inv,
          ),
        })),

      requestAdmin: (id) => {
        const state = get();
        const inv = state.invoices.find((i) => i.id === id);
        if (!inv) return;
        const lawyer = state.lawyers.find((l) => l.id === inv.lawyerId);
        const admin = buildAdminEmail(inv, lawyer, state.settings);
        set((s) => ({
          invoices: s.invoices.map((i) =>
            i.id === id
              ? {
                  ...i,
                  status: "solicitada_admin" as const,
                  requestedAt: todayIso(),
                  adminEmailSubject: admin.subject,
                  adminEmailBody: admin.body,
                }
              : i,
          ),
        }));
      },

      markIssued: (id, invoiceNumber) => {
        const state = get();
        const inv = state.invoices.find((i) => i.id === id);
        if (!inv) return;
        const issuedAt = todayIso();
        const dueDate =
          inv.dueDate ||
          addDaysIso(issuedAt, state.settings.defaultPaymentDays);
        const updated = {
          ...inv,
          invoiceNumber: invoiceNumber.trim(),
          status: "emitida" as const,
          issuedAt,
          dueDate,
        };
        const lawyer = state.lawyers.find((l) => l.id === updated.lawyerId);
        const client = buildClientEmail(updated, lawyer, state.settings);
        set((s) => ({
          invoices: s.invoices.map((i) =>
            i.id === id
              ? {
                  ...updated,
                  clientEmailSubject: client.subject,
                  clientEmailBody: client.body,
                }
              : i,
          ),
        }));
      },

      markSentToClient: (id) => {
        const state = get();
        const inv = state.invoices.find((i) => i.id === id);
        if (!inv) return;
        const lawyer = state.lawyers.find((l) => l.id === inv.lawyerId);
        const client = buildClientEmail(inv, lawyer, state.settings);
        set((s) => ({
          invoices: s.invoices.map((i) =>
            i.id === id
              ? {
                  ...i,
                  status: "enviada_cliente" as const,
                  sentAt: todayIso(),
                  clientEmailSubject: client.subject,
                  clientEmailBody: client.body,
                }
              : i,
          ),
        }));
      },

      registerPayment: (id, amount, full) =>
        set((s) => ({
          invoices: s.invoices.map((inv) => {
            if (inv.id !== id) return inv;
            const total = invoiceTotal(inv);
            const paid = full
              ? total
              : Math.min(total, (inv.paidAmount || 0) + amount);
            const status: InvoiceStatus =
              paid >= total - 0.001
                ? "pagada"
                : paid > 0
                  ? "parcial"
                  : inv.status;
            return {
              ...inv,
              paidAmount: paid,
              status,
              paidAt: paid >= total - 0.001 ? todayIso() : inv.paidAt,
            };
          }),
        })),

      refreshEmails: (id) => {
        const state = get();
        const inv = state.invoices.find((i) => i.id === id);
        if (!inv) return;
        const lawyer = state.lawyers.find((l) => l.id === inv.lawyerId);
        const admin = buildAdminEmail(inv, lawyer, state.settings);
        const client = buildClientEmail(inv, lawyer, state.settings);
        set((s) => ({
          invoices: s.invoices.map((i) =>
            i.id === id
              ? {
                  ...i,
                  adminEmailSubject: admin.subject,
                  adminEmailBody: admin.body,
                  clientEmailSubject: client.subject,
                  clientEmailBody: client.body,
                  sharePointPath: buildSharePointPath(
                    s.settings,
                    i.clientName,
                    i.expediente,
                  ),
                }
              : i,
          ),
        }));
      },

      refreshOverdue: () =>
        set((s) => ({
          invoices: s.invoices.map(recomputeDueStatus),
        })),

      resetDemo: () =>
        set({
          settings: DEFAULT_SETTINGS,
          lawyers: DEFAULT_LAWYERS,
          invoices: createSeedInvoices(DEFAULT_SETTINGS),
          seq: 42,
        }),

      getLawyer: (id) => get().lawyers.find((l) => l.id === id),
    }),
    {
      name: "bufete-facturacion-v1",
      onRehydrateStorage: () => (state) => {
        state?.setHydrated(true);
        state?.refreshOverdue();
      },
    },
  ),
);
