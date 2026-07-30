import type { Invoice, InvoiceEventType } from "./types";
import { STATUS_LABELS } from "./types";
import { formatCurrency } from "./format";

const TRACKED_FIELDS: Array<{
  key: keyof Invoice;
  label: string;
  format?: (v: unknown) => string;
}> = [
  { key: "clientName", label: "Cliente" },
  { key: "clientEmail", label: "Email cliente" },
  { key: "clientNif", label: "NIF/CIF" },
  { key: "expediente", label: "Expediente" },
  { key: "concepto", label: "Concepto" },
  {
    key: "baseAmount",
    label: "Base imponible",
    format: (v) => formatCurrency(Number(v) || 0),
  },
  {
    key: "ivaRate",
    label: "IVA %",
    format: (v) => `${v}%`,
  },
  {
    key: "suplidos",
    label: "Suplidos",
    format: (v) => formatCurrency(Number(v) || 0),
  },
  { key: "invoiceNumber", label: "Nº factura" },
  { key: "lawyerId", label: "Letrado" },
  { key: "remitente", label: "Remitente" },
  { key: "notes", label: "Notas" },
  { key: "sharePointPath", label: "Ruta SharePoint" },
  { key: "dueDate", label: "Vencimiento" },
];

export type PlannedEvent = {
  eventType: InvoiceEventType;
  summary: string;
  detail?: string;
};

/**
 * Diff current → next and produce human-readable audit events for a despacho.
 */
export function planAuditEvents(
  current: Invoice,
  next: Invoice,
): PlannedEvent[] {
  const events: PlannedEvent[] = [];

  if (current.status !== next.status) {
    events.push({
      eventType: "status_change",
      summary: `Estado: ${STATUS_LABELS[current.status]} → ${STATUS_LABELS[next.status]}`,
      detail: `${current.status} → ${next.status}`,
    });
  }

  if ((current.paidAmount || 0) !== (next.paidAmount || 0)) {
    const delta = (next.paidAmount || 0) - (current.paidAmount || 0);
    events.push({
      eventType: "payment",
      summary:
        delta > 0
          ? `Pago registrado: ${formatCurrency(delta)} (total cobrado ${formatCurrency(next.paidAmount || 0)})`
          : `Importe cobrado actualizado a ${formatCurrency(next.paidAmount || 0)}`,
      detail: `${current.paidAmount || 0} → ${next.paidAmount || 0}`,
    });
  }

  const adminSent =
    !current.adminEmailSentAt && next.adminEmailSentAt
      ? true
      : current.adminEmailSentAt !== next.adminEmailSentAt &&
        Boolean(next.adminEmailSentAt);
  if (adminSent && next.adminEmailSentAt !== current.adminEmailSentAt) {
    // Only log as email when the sent timestamp advances (not just edit of body)
    if (
      !current.adminEmailSentAt ||
      (next.adminEmailSentAt &&
        new Date(next.adminEmailSentAt) > new Date(current.adminEmailSentAt))
    ) {
      events.push({
        eventType: "email_admin",
        summary: "Correo enviado a Administración",
        detail: next.adminEmailSubject || undefined,
      });
    }
  }

  if (
    next.clientEmailSentAt &&
    next.clientEmailSentAt !== current.clientEmailSentAt &&
    (!current.clientEmailSentAt ||
      new Date(next.clientEmailSentAt) > new Date(current.clientEmailSentAt))
  ) {
    events.push({
      eventType: "email_client",
      summary: "Correo enviado al cliente",
      detail: next.clientEmailSubject || undefined,
    });
  }

  const fieldChanges: string[] = [];
  for (const f of TRACKED_FIELDS) {
    const a = current[f.key];
    const b = next[f.key];
    if (String(a ?? "") === String(b ?? "")) continue;
    // status/paidAmount handled above
    if (f.key === "lawyerId" || f.key === "remitente") {
      fieldChanges.push(
        `${f.label}: ${String(a ?? "—")} → ${String(b ?? "—")}`,
      );
      continue;
    }
    const fa = f.format ? f.format(a) : String(a ?? "—");
    const fb = f.format ? f.format(b) : String(b ?? "—");
    fieldChanges.push(`${f.label}: ${fa} → ${fb}`);
  }

  // Email body edits without send
  if (
    (current.adminEmailSubject !== next.adminEmailSubject ||
      current.adminEmailBody !== next.adminEmailBody) &&
    !events.some((e) => e.eventType === "email_admin")
  ) {
    fieldChanges.push("Plantilla / texto email a Admin editado");
  }
  if (
    (current.clientEmailSubject !== next.clientEmailSubject ||
      current.clientEmailBody !== next.clientEmailBody) &&
    !events.some((e) => e.eventType === "email_client")
  ) {
    fieldChanges.push("Plantilla / texto email a Cliente editado");
  }

  if (fieldChanges.length > 0) {
    events.push({
      eventType: "field_edit",
      summary:
        fieldChanges.length === 1
          ? fieldChanges[0]!
          : `Datos actualizados (${fieldChanges.length} cambios)`,
      detail: fieldChanges.join("\n"),
    });
  }

  return events;
}

export const EVENT_TYPE_LABELS: Record<InvoiceEventType, string> = {
  created: "Alta",
  status_change: "Estado",
  email_admin: "Email Admin",
  email_client: "Email Cliente",
  payment: "Cobro",
  field_edit: "Edición",
  deleted: "Eliminación",
  note: "Nota",
};
