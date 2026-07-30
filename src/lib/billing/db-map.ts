import type {
  FirmSettings,
  Invoice,
  InvoiceEvent,
  InvoiceEventType,
  InvoiceStatus,
  Lawyer,
  RemitenteTipo,
  UserProfile,
  UserRole,
} from "./types";
import {
  DEFAULT_ADMIN_EMAIL_BODY,
  DEFAULT_ADMIN_EMAIL_SUBJECT,
  DEFAULT_CLIENT_EMAIL_BODY,
  DEFAULT_CLIENT_EMAIL_SUBJECT,
} from "./templates";

function num(v: unknown, fallback = 0): number {
  if (v == null || v === "") return fallback;
  const n = typeof v === "number" ? v : Number(v);
  return Number.isFinite(n) ? n : fallback;
}

function iso(v: unknown): string | undefined {
  if (v == null || v === "") return undefined;
  if (v instanceof Date) return v.toISOString();
  const s = String(v);
  const d = new Date(s);
  return Number.isNaN(d.getTime()) ? undefined : d.toISOString();
}

function isoReq(v: unknown): string {
  return iso(v) ?? new Date().toISOString();
}

export type InvoiceRow = Record<string, unknown>;
export type LawyerRow = Record<string, unknown>;
export type SettingsRow = Record<string, unknown>;
export type ProfileRow = Record<string, unknown>;

export function mapLawyer(row: LawyerRow): Lawyer {
  return {
    id: String(row.id),
    name: String(row.name ?? ""),
    email: String(row.email ?? ""),
    initials: String(row.initials ?? ""),
    userId: row.user_id == null ? null : String(row.user_id),
  };
}

export function mapSettings(row: SettingsRow): FirmSettings {
  const adminSub = String(row.admin_email_subject_tpl ?? "").trim();
  const adminBody = String(row.admin_email_body_tpl ?? "").trim();
  const clientSub = String(row.client_email_subject_tpl ?? "").trim();
  const clientBody = String(row.client_email_body_tpl ?? "").trim();
  return {
    firmName: String(row.firm_name ?? ""),
    adminEmail: String(row.admin_email ?? ""),
    adminName: String(row.admin_name ?? ""),
    sharePointBase: String(row.sharepoint_base ?? ""),
    defaultIva: num(row.default_iva, 21),
    defaultPaymentDays: num(row.default_payment_days, 30),
    sageNote: String(row.sage_note ?? ""),
    lexnextNote: String(row.lexnext_note ?? ""),
    adminEmailSubjectTpl: adminSub || DEFAULT_ADMIN_EMAIL_SUBJECT,
    adminEmailBodyTpl: adminBody || DEFAULT_ADMIN_EMAIL_BODY,
    clientEmailSubjectTpl: clientSub || DEFAULT_CLIENT_EMAIL_SUBJECT,
    clientEmailBodyTpl: clientBody || DEFAULT_CLIENT_EMAIL_BODY,
  };
}

export function mapProfile(row: ProfileRow): UserProfile {
  return {
    userId: String(row.user_id),
    role: (String(row.role) === "admin" ? "admin" : "lawyer") as UserRole,
    lawyerId: row.lawyer_id == null ? null : String(row.lawyer_id),
    email: row.email == null ? null : String(row.email),
    displayName: row.display_name == null ? null : String(row.display_name),
  };
}

export function mapInvoice(row: InvoiceRow): Invoice {
  return {
    id: String(row.id),
    ref: String(row.ref ?? ""),
    invoiceNumber: String(row.invoice_number ?? ""),
    clientName: String(row.client_name ?? ""),
    clientEmail: String(row.client_email ?? ""),
    clientNif: String(row.client_nif ?? ""),
    expediente: String(row.expediente ?? ""),
    concepto: String(row.concepto ?? ""),
    baseAmount: num(row.base_amount),
    ivaRate: num(row.iva_rate, 21),
    suplidos: num(row.suplidos),
    currency: "EUR",
    lawyerId: String(row.lawyer_id ?? ""),
    remitente: (String(row.remitente) === "administracion"
      ? "administracion"
      : "abogado") as RemitenteTipo,
    status: String(row.status) as InvoiceStatus,
    createdAt: isoReq(row.created_at),
    requestedAt: iso(row.requested_at),
    issuedAt: iso(row.issued_at),
    sentAt: iso(row.sent_at),
    dueDate: iso(row.due_date),
    paidAt: iso(row.paid_at),
    paidAmount: num(row.paid_amount),
    notes: String(row.notes ?? ""),
    sharePointPath: String(row.sharepoint_path ?? ""),
    sourceFile: row.source_file == null ? undefined : String(row.source_file),
    adminEmailSubject:
      row.admin_email_subject == null
        ? undefined
        : String(row.admin_email_subject),
    adminEmailBody:
      row.admin_email_body == null ? undefined : String(row.admin_email_body),
    clientEmailSubject:
      row.client_email_subject == null
        ? undefined
        : String(row.client_email_subject),
    clientEmailBody:
      row.client_email_body == null ? undefined : String(row.client_email_body),
    adminEmailSentAt: iso(row.admin_email_sent_at),
    clientEmailSentAt: iso(row.client_email_sent_at),
    createdBy: row.created_by == null ? null : String(row.created_by),
  };
}


export function mapInvoiceEvent(row: Record<string, unknown>): InvoiceEvent {
  return {
    id: String(row.id),
    invoiceId: String(row.invoice_id),
    eventType: String(row.event_type) as InvoiceEventType,
    summary: String(row.summary ?? ""),
    detail: row.detail == null ? null : String(row.detail),
    actorUserId: row.actor_user_id == null ? null : String(row.actor_user_id),
    actorName: row.actor_name == null ? null : String(row.actor_name),
    actorEmail: row.actor_email == null ? null : String(row.actor_email),
    createdAt:
      row.created_at instanceof Date
        ? row.created_at.toISOString()
        : String(row.created_at ?? new Date().toISOString()),
  };
}
