import type { FirmSettings, Invoice, Lawyer } from "./types";
import { formatCurrency, formatDateEs } from "./format";

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

export function buildAdminEmail(
  invoice: Invoice,
  lawyer: Lawyer | undefined,
  settings: FirmSettings,
): { subject: string; body: string } {
  const total = invoiceTotal(invoice);
  const subject = `[Facturación] ${invoice.clientName} · ${invoice.expediente} · ${invoice.ref}`;
  const body = `Estimado/a ${settings.adminName},

Solicito la emisión de factura con los siguientes datos para registrar en SAGE y LEXNEXT:

— Cliente: ${invoice.clientName}
— NIF/CIF: ${invoice.clientNif || "—"}
— Expediente: ${invoice.expediente}
— Concepto: ${invoice.concepto}
— Base imponible: ${formatCurrency(invoice.baseAmount)}
— Suplidos: ${formatCurrency(invoice.suplidos)}
— IVA: ${invoice.ivaRate}%
— Total: ${formatCurrency(total)}
— Letrado responsable: ${lawyer?.name ?? "—"}
— Referencia interna: ${invoice.ref}
${invoice.notes ? `— Observaciones: ${invoice.notes}` : ""}

${settings.sageNote}
${settings.lexnextNote}

Una vez emitida la factura, por favor:
1) Guardar el PDF en SharePoint:
   ${invoice.sharePointPath}
2) Actualizar el estado a «Emitida» en el panel de facturación (o responder a este correo con el nº de factura SAGE).

Gracias,
${lawyer?.name ?? "Despacho"}
${lawyer?.email ?? ""}
`.trim();

  return { subject, body };
}

export function buildClientEmail(
  invoice: Invoice,
  lawyer: Lawyer | undefined,
  settings: FirmSettings,
): { subject: string; body: string } {
  const total = invoiceTotal(invoice);
  const fromName =
    invoice.remitente === "administracion"
      ? settings.adminName
      : (lawyer?.name ?? settings.firmName);
  const fromEmail =
    invoice.remitente === "administracion"
      ? settings.adminEmail
      : (lawyer?.email ?? settings.adminEmail);

  const invNum = invoice.invoiceNumber || "[nº factura]";
  const subject = `Factura ${invNum} — ${settings.firmName} · ${invoice.expediente}`;
  const due = invoice.dueDate
    ? `Fecha de vencimiento: ${formatDateEs(invoice.dueDate)}.`
    : "";

  const body = `Estimado/a ${invoice.clientName},

Adjunto remito la factura ${invNum} correspondiente a los servicios profesionales prestados en el expediente ${invoice.expediente}.

Concepto: ${invoice.concepto}
Importe total: ${formatCurrency(total)}
${due}

Quedo a su disposición para cualquier aclaración.

Atentamente,
${fromName}
${settings.firmName}
${fromEmail}
`.trim();

  return { subject, body };
}

export function invoiceTotal(invoice: Pick<Invoice, "baseAmount" | "ivaRate" | "suplidos">): number {
  const iva = invoice.baseAmount * (invoice.ivaRate / 100);
  return round2(invoice.baseAmount + iva + invoice.suplidos);
}

export function invoiceIva(invoice: Pick<Invoice, "baseAmount" | "ivaRate">): number {
  return round2(invoice.baseAmount * (invoice.ivaRate / 100));
}

export function round2(n: number): number {
  return Math.round((n + Number.EPSILON) * 100) / 100;
}

export function mailtoHref(to: string, subject: string, body: string): string {
  const params = new URLSearchParams({ subject, body });
  return `mailto:${encodeURIComponent(to)}?${params.toString().replace(/\+/g, "%20")}`;
}
