export type InvoiceStatus =
  | "borrador"
  | "solicitada_admin"
  | "emitida"
  | "enviada_cliente"
  | "pagada"
  | "parcial"
  | "vencida";

export type RemitenteTipo = "abogado" | "administracion";

export type UserRole = "admin" | "lawyer";

export interface Lawyer {
  id: string;
  name: string;
  email: string;
  initials: string;
  /** Better Auth user linked to this letrado (optional until assigned). */
  userId?: string | null;
}

export interface FirmSettings {
  firmName: string;
  adminEmail: string;
  adminName: string;
  sharePointBase: string;
  defaultIva: number;
  defaultPaymentDays: number;
  sageNote: string;
  lexnextNote: string;
  /** Plantilla asunto email a Admin (variables {{...}}) */
  adminEmailSubjectTpl: string;
  adminEmailBodyTpl: string;
  clientEmailSubjectTpl: string;
  clientEmailBodyTpl: string;
}

export interface UserProfile {
  userId: string;
  role: UserRole;
  lawyerId: string | null;
  email: string | null;
  displayName: string | null;
}

export interface Invoice {
  id: string;
  /** Internal sequential tracking ref */
  ref: string;
  invoiceNumber: string;
  clientName: string;
  clientEmail: string;
  clientNif: string;
  expediente: string;
  concepto: string;
  baseAmount: number;
  ivaRate: number;
  suplidos: number;
  currency: "EUR";
  lawyerId: string;
  remitente: RemitenteTipo;
  status: InvoiceStatus;
  createdAt: string;
  requestedAt?: string;
  issuedAt?: string;
  sentAt?: string;
  dueDate?: string;
  paidAt?: string;
  paidAmount: number;
  notes: string;
  sharePointPath: string;
  sourceFile?: string;
  adminEmailBody?: string;
  clientEmailBody?: string;
  clientEmailSubject?: string;
  adminEmailSubject?: string;
  /** Momento real o simulado del envío a Admin */
  adminEmailSentAt?: string;
  /** Momento real o simulado del envío al cliente */
  clientEmailSentAt?: string;
  createdBy?: string | null;
}

export interface BillingConceptDraft {
  clientName: string;
  clientEmail: string;
  clientNif: string;
  expediente: string;
  concepto: string;
  baseAmount: number;
  ivaRate: number;
  suplidos: number;
  lawyerId: string;
  remitente: RemitenteTipo;
  notes: string;
  sourceFile?: string;
  dueDays?: number;
}

export interface BillingBootstrap {
  profile: UserProfile;
  settings: FirmSettings;
  lawyers: Lawyer[];
  invoices: Invoice[];
  seq: number;
}

export type InvoiceEventType =
  | "created"
  | "status_change"
  | "email_admin"
  | "email_client"
  | "payment"
  | "field_edit"
  | "deleted"
  | "note";

export interface InvoiceEvent {
  id: string;
  invoiceId: string;
  eventType: InvoiceEventType;
  summary: string;
  detail?: string | null;
  actorUserId?: string | null;
  actorName?: string | null;
  actorEmail?: string | null;
  createdAt: string;
}

export type EmailSendMode = "resend" | "simulated";

export interface EmailSendResult {
  mode: EmailSendMode;
  invoice: Invoice;
  to: string;
  subject: string;
  message: string;
}

export const STATUS_LABELS: Record<InvoiceStatus, string> = {
  borrador: "Borrador",
  solicitada_admin: "Solicitada a Admin",
  emitida: "Emitida",
  enviada_cliente: "Enviada al cliente",
  pagada: "Pagada",
  parcial: "Pago parcial",
  vencida: "Vencida",
};

export const STATUS_ORDER: InvoiceStatus[] = [
  "borrador",
  "solicitada_admin",
  "emitida",
  "enviada_cliente",
  "parcial",
  "pagada",
  "vencida",
];

export const ROLE_LABELS: Record<UserRole, string> = {
  admin: "Administración",
  lawyer: "Abogado",
};
