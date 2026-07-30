export type InvoiceStatus =
  | "borrador"
  | "solicitada_admin"
  | "emitida"
  | "enviada_cliente"
  | "pagada"
  | "parcial"
  | "vencida";

export type RemitenteTipo = "abogado" | "administracion";

export interface Lawyer {
  id: string;
  name: string;
  email: string;
  initials: string;
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
