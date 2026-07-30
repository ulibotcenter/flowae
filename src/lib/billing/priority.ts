import type { Invoice, InvoiceStatus } from "./types";
import { invoiceTotal } from "./templates";

/** Statuses that require a human action in the workflow today */
export const ACTION_PENDING_STATUSES: InvoiceStatus[] = [
  "borrador",
  "solicitada_admin",
  "emitida",
  "enviada_cliente",
  "parcial",
  "vencida",
];

export function isActionPending(inv: Invoice): boolean {
  if (inv.status === "pagada") return false;
  if (inv.status === "borrador") return true;
  if (inv.status === "solicitada_admin") return true;
  if (inv.status === "emitida") return true;
  if (inv.status === "vencida") return true;
  if (inv.status === "enviada_cliente" || inv.status === "parcial") {
    return inv.paidAmount < invoiceTotal(inv);
  }
  return false;
}

/** Matches the “Hoy” definition from product requirements */
export function isHoyItem(inv: Invoice): boolean {
  if (inv.status === "borrador") return true;
  if (inv.status === "solicitada_admin") return true;
  if (inv.status === "vencida") return true;
  if (inv.status === "enviada_cliente" && inv.paidAmount < invoiceTotal(inv)) {
    return true;
  }
  return false;
}

/**
 * Lower = more urgent.
 * Vencidas first, then partials near due, sent unpaid, admin queue, drafts.
 */
export function urgencyScore(inv: Invoice): number {
  const total = invoiceTotal(inv);
  const unpaid = inv.paidAmount < total - 0.001;
  const dueMs = inv.dueDate ? new Date(inv.dueDate).getTime() : Number.POSITIVE_INFINITY;
  const now = Date.now();
  const daysPastDue =
    Number.isFinite(dueMs) && dueMs < now
      ? Math.floor((now - dueMs) / (24 * 60 * 60 * 1000))
      : 0;

  if (inv.status === "vencida") return 0 - daysPastDue;
  if (inv.status === "parcial" && unpaid) return 100 - Math.min(daysPastDue, 50);
  if (inv.status === "enviada_cliente" && unpaid) {
    return 200 - Math.min(daysPastDue, 50);
  }
  if (inv.status === "emitida") return 300;
  if (inv.status === "solicitada_admin") return 400;
  if (inv.status === "borrador") return 500;
  return 900;
}

export function sortByUrgency(a: Invoice, b: Invoice): number {
  const diff = urgencyScore(a) - urgencyScore(b);
  if (diff !== 0) return diff;
  return (b.createdAt || "").localeCompare(a.createdAt || "");
}

export function hoyReason(inv: Invoice): string {
  if (inv.status === "vencida") return "Vencida — reclamar cobro";
  if (inv.status === "enviada_cliente") return "Enviada sin pago";
  if (inv.status === "solicitada_admin") return "Pendiente de emisión (Admin)";
  if (inv.status === "borrador") return "Borrador — solicitar a Admin";
  if (inv.status === "emitida") return "Emitida — enviar al cliente";
  if (inv.status === "parcial") return "Pago parcial pendiente";
  return "Requiere atención";
}

export type DateField = "createdAt" | "dueDate";

export function inDateRange(
  iso: string | undefined,
  from: string,
  to: string,
): boolean {
  if (!from && !to) return true;
  if (!iso) return false;
  const day = iso.slice(0, 10);
  if (from && day < from) return false;
  if (to && day > to) return false;
  return true;
}
