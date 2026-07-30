import type { FirmSettings, Invoice, Lawyer } from "./types";
import { formatCurrency, formatDateEs } from "./format";

/** Variables soportadas en plantillas de correo del despacho. */
export const EMAIL_TEMPLATE_VARS = [
  "cliente",
  "expediente",
  "concepto",
  "total",
  "letrado",
  "ref",
  "fecha_vencimiento",
  "despacho",
  "nif",
  "base",
  "suplidos",
  "iva",
  "numero_factura",
  "sharepoint",
  "notas",
  "admin",
  "letrado_email",
] as const;

export type EmailTemplateVar = (typeof EMAIL_TEMPLATE_VARS)[number];

export const DEFAULT_ADMIN_EMAIL_SUBJECT =
  "[Facturación] {{cliente}} · {{expediente}} · {{ref}}";

export const DEFAULT_ADMIN_EMAIL_BODY = `Estimado/a {{admin}},

Solicito la emisión de factura con los siguientes datos para registrar en SAGE y LEXNEXT:

— Cliente: {{cliente}}
— NIF/CIF: {{nif}}
— Expediente: {{expediente}}
— Concepto: {{concepto}}
— Base imponible: {{base}}
— Suplidos: {{suplidos}}
— IVA: {{iva}}
— Total: {{total}}
— Letrado responsable: {{letrado}}
— Referencia interna: {{ref}}
— Observaciones: {{notas}}

Una vez emitida la factura, por favor:
1) Guardar el PDF en SharePoint:
   {{sharepoint}}
2) Actualizar el estado a «Emitida» en el panel de facturación (o responder a este correo con el nº de factura SAGE).

Gracias,
{{letrado}}
{{letrado_email}}`;

export const DEFAULT_CLIENT_EMAIL_SUBJECT =
  "Factura {{numero_factura}} — {{despacho}} · {{expediente}}";

export const DEFAULT_CLIENT_EMAIL_BODY = `Estimado/a {{cliente}},

Adjunto remito la factura {{numero_factura}} correspondiente a los servicios profesionales prestados en el expediente {{expediente}}.

Concepto: {{concepto}}
Importe total: {{total}}
Fecha de vencimiento: {{fecha_vencimiento}}.

Quedo a su disposición para cualquier aclaración.

Atentamente,
{{letrado}}
{{despacho}}
{{letrado_email}}`;

export function buildSharePointPath(
  settings: FirmSettings,
  clientName: string,
  expediente: string,
  year = new Date().getFullYear(),
): string {
  const safeClient = sanitizePathSegment(clientName || "Sin-cliente");
  const safeExp = sanitizePathSegment(expediente || "Sin-expediente");
  const base = settings.sharePointBase.replace(/\/+$/, "");
  return `${base}/${safeClient}/${safeExp}/Facturas/${year}`;
}

function sanitizePathSegment(value: string): string {
  return value
    .trim()
    .replace(/[\\/:*?"<>|]/g, "-")
    .replace(/\s+/g, " ")
    .slice(0, 80);
}

export function applyEmailTemplate(
  template: string,
  vars: Record<string, string>,
): string {
  return template.replace(/\{\{\s*([a-zA-Z0-9_]+)\s*\}\}/g, (_, key: string) => {
    if (Object.prototype.hasOwnProperty.call(vars, key)) {
      return vars[key] ?? "";
    }
    return `{{${key}}}`;
  });
}

export function buildEmailVars(
  invoice: Invoice,
  lawyer: Lawyer | undefined,
  settings: FirmSettings,
): Record<string, string> {
  const total = invoiceTotal(invoice);
  const remitenteIsAdmin = invoice.remitente === "administracion";
  const letradoName = remitenteIsAdmin
    ? settings.adminName
    : (lawyer?.name ?? settings.firmName);
  const letradoEmail = remitenteIsAdmin
    ? settings.adminEmail
    : (lawyer?.email ?? settings.adminEmail);

  return {
    cliente: invoice.clientName || "",
    expediente: invoice.expediente || "",
    concepto: invoice.concepto || "",
    total: formatCurrency(total),
    letrado: letradoName,
    ref: invoice.ref || "",
    fecha_vencimiento: invoice.dueDate
      ? formatDateEs(invoice.dueDate)
      : "—",
    despacho: settings.firmName || "",
    nif: invoice.clientNif || "—",
    base: formatCurrency(invoice.baseAmount),
    suplidos: formatCurrency(invoice.suplidos),
    iva: `${invoice.ivaRate}%`,
    numero_factura: invoice.invoiceNumber || "[nº factura]",
    sharepoint: invoice.sharePointPath || "",
    notas: invoice.notes || "—",
    admin: settings.adminName || "Administración",
    letrado_email: letradoEmail,
  };
}

export function buildAdminEmail(
  invoice: Invoice,
  lawyer: Lawyer | undefined,
  settings: FirmSettings,
): { subject: string; body: string } {
  const vars = buildEmailVars(invoice, lawyer, settings);
  const subjectTpl =
    settings.adminEmailSubjectTpl?.trim() || DEFAULT_ADMIN_EMAIL_SUBJECT;
  const bodyTpl =
    settings.adminEmailBodyTpl?.trim() || DEFAULT_ADMIN_EMAIL_BODY;
  return {
    subject: applyEmailTemplate(subjectTpl, vars),
    body: applyEmailTemplate(bodyTpl, vars),
  };
}

export function buildClientEmail(
  invoice: Invoice,
  lawyer: Lawyer | undefined,
  settings: FirmSettings,
): { subject: string; body: string } {
  const vars = buildEmailVars(invoice, lawyer, settings);
  const subjectTpl =
    settings.clientEmailSubjectTpl?.trim() || DEFAULT_CLIENT_EMAIL_SUBJECT;
  const bodyTpl =
    settings.clientEmailBodyTpl?.trim() || DEFAULT_CLIENT_EMAIL_BODY;
  return {
    subject: applyEmailTemplate(subjectTpl, vars),
    body: applyEmailTemplate(bodyTpl, vars),
  };
}

export function invoiceTotal(
  invoice: Pick<Invoice, "baseAmount" | "ivaRate" | "suplidos">,
): number {
  const iva = invoice.baseAmount * (invoice.ivaRate / 100);
  return round2(invoice.baseAmount + iva + invoice.suplidos);
}

export function invoiceIva(
  invoice: Pick<Invoice, "baseAmount" | "ivaRate">,
): number {
  return round2(invoice.baseAmount * (invoice.ivaRate / 100));
}

export function round2(n: number): number {
  return Math.round((n + Number.EPSILON) * 100) / 100;
}

export function mailtoHref(to: string, subject: string, body: string): string {
  const params = new URLSearchParams({ subject, body });
  return `mailto:${encodeURIComponent(to)}?${params.toString().replace(/\+/g, "%20")}`;
}
