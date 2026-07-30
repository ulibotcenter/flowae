import { create } from "zustand";
import { DEFAULT_LAWYERS, DEFAULT_SETTINGS } from "./seed";
import type {
  BillingBootstrap,
  BillingConceptDraft,
  FirmSettings,
  Invoice,
  InvoiceStatus,
  Lawyer,
  UserProfile,
  EmailSendResult,
} from "./types";
import {
  batchMarkSentFn,
  batchRefreshOverdueFn,
  batchRequestAdminFn,
  createInvoiceFn,
  deleteInvoiceFn,
  getBillingBootstrap,
  markIssuedFn,
  markSentToClientFn,
  registerPaymentFn,
  removeLawyerFn,
  requestAdminFn,
  resetDemoFn,
  saveSettingsFn,
  updateInvoiceFn,
  upsertLawyerFn,
  refreshEmailsFn,
  sendAdminEmailFn,
  sendClientEmailFn,
} from "./server-fns";

function replaceInvoice(list: Invoice[], inv: Invoice): Invoice[] {
  return list.map((i) => (i.id === inv.id ? inv : i));
}

interface BillingState {
  settings: FirmSettings;
  lawyers: Lawyer[];
  invoices: Invoice[];
  profile: UserProfile | null;
  seq: number;
  hydrated: boolean;
  loading: boolean;
  error: string | null;
  setHydrated: (v: boolean) => void;
  bootstrap: () => Promise<void>;
  applyBootstrap: (data: BillingBootstrap) => void;
  updateSettings: (patch: Partial<FirmSettings>) => Promise<void>;
  upsertLawyer: (lawyer: Lawyer) => Promise<void>;
  removeLawyer: (id: string) => Promise<void>;
  createFromDraft: (draft: BillingConceptDraft) => Promise<Invoice>;
  updateInvoice: (id: string, patch: Partial<Invoice>) => Promise<void>;
  deleteInvoice: (id: string) => Promise<void>;
  advanceStatus: (
    id: string,
    status: InvoiceStatus,
    extra?: Partial<Invoice>,
  ) => Promise<void>;
  requestAdmin: (id: string) => Promise<void>;
  markIssued: (id: string, invoiceNumber: string) => Promise<void>;
  markSentToClient: (id: string) => Promise<void>;
  registerPayment: (
    id: string,
    amount: number,
    full?: boolean,
  ) => Promise<void>;
  refreshEmails: (id: string) => Promise<void>;
  refreshOverdue: () => Promise<void>;
  batchRequestAdmin: (ids: string[]) => Promise<number>;
  batchMarkSentToClient: (ids: string[]) => Promise<number>;
  batchRefreshOverdue: (ids?: string[]) => Promise<number>;
  resetDemo: () => Promise<void>;
  sendAdminEmail: (
    id: string,
    overrides?: { subject?: string; body?: string },
  ) => Promise<EmailSendResult>;
  sendClientEmail: (
    id: string,
    overrides?: { subject?: string; body?: string },
  ) => Promise<EmailSendResult>;
  getLawyer: (id: string) => Lawyer | undefined;
}

export const useBillingStore = create<BillingState>((set, get) => ({
  settings: DEFAULT_SETTINGS,
  lawyers: DEFAULT_LAWYERS,
  invoices: [],
  profile: null,
  seq: 0,
  hydrated: false,
  loading: false,
  error: null,

  setHydrated: (v) => set({ hydrated: v }),

  applyBootstrap: (data) =>
    set({
      settings: data.settings,
      lawyers: data.lawyers,
      invoices: data.invoices,
      profile: data.profile,
      seq: data.seq,
      hydrated: true,
      loading: false,
      error: null,
    }),

  bootstrap: async () => {
    set({ loading: true, error: null });
    try {
      const data = await getBillingBootstrap();
      get().applyBootstrap(data);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Error al cargar datos";
      set({ loading: false, error: message, hydrated: false });
      throw err;
    }
  },

  updateSettings: async (patch) => {
    const next = { ...get().settings, ...patch };
    const saved = await saveSettingsFn({ data: next });
    set({ settings: saved });
  },

  upsertLawyer: async (lawyer) => {
    const saved = await upsertLawyerFn({ data: lawyer });
    set((s) => {
      const exists = s.lawyers.some((l) => l.id === saved.id);
      return {
        lawyers: exists
          ? s.lawyers.map((l) => (l.id === saved.id ? saved : l))
          : [...s.lawyers, saved],
      };
    });
  },

  removeLawyer: async (id) => {
    await removeLawyerFn({ data: { id } });
    set((s) => ({ lawyers: s.lawyers.filter((l) => l.id !== id) }));
  },

  createFromDraft: async (draft) => {
    const inv = await createInvoiceFn({ data: draft });
    set((s) => ({ invoices: [inv, ...s.invoices] }));
    return inv;
  },

  updateInvoice: async (id, patch) => {
    const inv = await updateInvoiceFn({ data: { id, patch } });
    set((s) => ({ invoices: replaceInvoice(s.invoices, inv) }));
  },

  deleteInvoice: async (id) => {
    await deleteInvoiceFn({ data: { id } });
    set((s) => ({ invoices: s.invoices.filter((i) => i.id !== id) }));
  },

  advanceStatus: async (id, status, extra) => {
    await get().updateInvoice(id, { status, ...extra });
  },

  requestAdmin: async (id) => {
    const inv = await requestAdminFn({ data: { id } });
    set((s) => ({ invoices: replaceInvoice(s.invoices, inv) }));
  },

  markIssued: async (id, invoiceNumber) => {
    const inv = await markIssuedFn({ data: { id, invoiceNumber } });
    set((s) => ({ invoices: replaceInvoice(s.invoices, inv) }));
  },

  markSentToClient: async (id) => {
    const inv = await markSentToClientFn({ data: { id } });
    set((s) => ({ invoices: replaceInvoice(s.invoices, inv) }));
  },

  registerPayment: async (id, amount, full) => {
    const inv = await registerPaymentFn({ data: { id, amount, full } });
    set((s) => ({ invoices: replaceInvoice(s.invoices, inv) }));
  },

  refreshEmails: async (id) => {
    const inv = await refreshEmailsFn({ data: { id } });
    set((s) => ({ invoices: replaceInvoice(s.invoices, inv) }));
  },

  refreshOverdue: async () => {
    await get().batchRefreshOverdue([]);
  },

  batchRequestAdmin: async (ids) => {
    const { count } = await batchRequestAdminFn({ data: { ids } });
    await get().bootstrap();
    return count;
  },

  batchMarkSentToClient: async (ids) => {
    const { count } = await batchMarkSentFn({ data: { ids } });
    await get().bootstrap();
    return count;
  },

  batchRefreshOverdue: async (ids = []) => {
    const { count } = await batchRefreshOverdueFn({ data: { ids } });
    await get().bootstrap();
    return count;
  },

  resetDemo: async () => {
    const data = await resetDemoFn();
    get().applyBootstrap(data);
  },

  sendAdminEmail: async (id, overrides) => {
    const result = await sendAdminEmailFn({
      data: { id, subject: overrides?.subject, body: overrides?.body },
    });
    set((s) => ({ invoices: replaceInvoice(s.invoices, result.invoice) }));
    return result;
  },

  sendClientEmail: async (id, overrides) => {
    const result = await sendClientEmailFn({
      data: { id, subject: overrides?.subject, body: overrides?.body },
    });
    set((s) => ({ invoices: replaceInvoice(s.invoices, result.invoice) }));
    return result;
  },

  getLawyer: (id) => get().lawyers.find((l) => l.id === id),
}));
