//#region node_modules/.nitro/vite/services/ssr/assets/types-FkcXPGqw.js
function formatCurrency(amount, currency = "EUR") {
	return new Intl.NumberFormat("es-ES", {
		style: "currency",
		currency,
		minimumFractionDigits: 2
	}).format(amount || 0);
}
function formatDateEs(iso) {
	if (!iso) return "—";
	const d = new Date(iso);
	if (Number.isNaN(d.getTime())) return "—";
	return new Intl.DateTimeFormat("es-ES", {
		day: "2-digit",
		month: "short",
		year: "numeric"
	}).format(d);
}
function addDaysIso(fromIso, days) {
	const d = new Date(fromIso);
	d.setDate(d.getDate() + days);
	return d.toISOString();
}
function todayIso() {
	return (/* @__PURE__ */ new Date()).toISOString();
}
/** Variables soportadas en plantillas de correo del despacho. */
var EMAIL_TEMPLATE_VARS = [
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
	"letrado_email"
];
var DEFAULT_ADMIN_EMAIL_SUBJECT = "[Facturación] {{cliente}} · {{expediente}} · {{ref}}";
var DEFAULT_ADMIN_EMAIL_BODY = `Estimado/a {{admin}},

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
var DEFAULT_CLIENT_EMAIL_SUBJECT = "Factura {{numero_factura}} — {{despacho}} · {{expediente}}";
var DEFAULT_CLIENT_EMAIL_BODY = `Estimado/a {{cliente}},

Adjunto remito la factura {{numero_factura}} correspondiente a los servicios profesionales prestados en el expediente {{expediente}}.

Concepto: {{concepto}}
Importe total: {{total}}
Fecha de vencimiento: {{fecha_vencimiento}}.

Quedo a su disposición para cualquier aclaración.

Atentamente,
{{letrado}}
{{despacho}}
{{letrado_email}}`;
function buildSharePointPath(settings, clientName, expediente, year = (/* @__PURE__ */ new Date()).getFullYear()) {
	const safeClient = sanitizePathSegment(clientName || "Sin-cliente");
	const safeExp = sanitizePathSegment(expediente || "Sin-expediente");
	return `${settings.sharePointBase.replace(/\/+$/, "")}/${safeClient}/${safeExp}/Facturas/${year}`;
}
function sanitizePathSegment(value) {
	return value.trim().replace(/[\\/:*?"<>|]/g, "-").replace(/\s+/g, " ").slice(0, 80);
}
function applyEmailTemplate(template, vars) {
	return template.replace(/\{\{\s*([a-zA-Z0-9_]+)\s*\}\}/g, (_, key) => {
		if (Object.prototype.hasOwnProperty.call(vars, key)) return vars[key] ?? "";
		return `{{${key}}}`;
	});
}
function buildEmailVars(invoice, lawyer, settings) {
	const total = invoiceTotal(invoice);
	const remitenteIsAdmin = invoice.remitente === "administracion";
	const letradoName = remitenteIsAdmin ? settings.adminName : lawyer?.name ?? settings.firmName;
	const letradoEmail = remitenteIsAdmin ? settings.adminEmail : lawyer?.email ?? settings.adminEmail;
	return {
		cliente: invoice.clientName || "",
		expediente: invoice.expediente || "",
		concepto: invoice.concepto || "",
		total: formatCurrency(total),
		letrado: letradoName,
		ref: invoice.ref || "",
		fecha_vencimiento: invoice.dueDate ? formatDateEs(invoice.dueDate) : "—",
		despacho: settings.firmName || "",
		nif: invoice.clientNif || "—",
		base: formatCurrency(invoice.baseAmount),
		suplidos: formatCurrency(invoice.suplidos),
		iva: `${invoice.ivaRate}%`,
		numero_factura: invoice.invoiceNumber || "[nº factura]",
		sharepoint: invoice.sharePointPath || "",
		notas: invoice.notes || "—",
		admin: settings.adminName || "Administración",
		letrado_email: letradoEmail
	};
}
function buildAdminEmail(invoice, lawyer, settings) {
	const vars = buildEmailVars(invoice, lawyer, settings);
	const subjectTpl = settings.adminEmailSubjectTpl?.trim() || "[Facturación] {{cliente}} · {{expediente}} · {{ref}}";
	const bodyTpl = settings.adminEmailBodyTpl?.trim() || DEFAULT_ADMIN_EMAIL_BODY;
	return {
		subject: applyEmailTemplate(subjectTpl, vars),
		body: applyEmailTemplate(bodyTpl, vars)
	};
}
function buildClientEmail(invoice, lawyer, settings) {
	const vars = buildEmailVars(invoice, lawyer, settings);
	const subjectTpl = settings.clientEmailSubjectTpl?.trim() || "Factura {{numero_factura}} — {{despacho}} · {{expediente}}";
	const bodyTpl = settings.clientEmailBodyTpl?.trim() || DEFAULT_CLIENT_EMAIL_BODY;
	return {
		subject: applyEmailTemplate(subjectTpl, vars),
		body: applyEmailTemplate(bodyTpl, vars)
	};
}
function invoiceTotal(invoice) {
	const iva = invoice.baseAmount * (invoice.ivaRate / 100);
	return round2(invoice.baseAmount + iva + invoice.suplidos);
}
function invoiceIva(invoice) {
	return round2(invoice.baseAmount * (invoice.ivaRate / 100));
}
function round2(n) {
	return Math.round((n + Number.EPSILON) * 100) / 100;
}
function mailtoHref(to, subject, body) {
	const params = new URLSearchParams({
		subject,
		body
	});
	return `mailto:${encodeURIComponent(to)}?${params.toString().replace(/\+/g, "%20")}`;
}
var STATUS_LABELS = {
	borrador: "Borrador",
	solicitada_admin: "Solicitada a Admin",
	emitida: "Emitida",
	enviada_cliente: "Enviada al cliente",
	pagada: "Pagada",
	parcial: "Pago parcial",
	vencida: "Vencida"
};
var STATUS_ORDER = [
	"borrador",
	"solicitada_admin",
	"emitida",
	"enviada_cliente",
	"parcial",
	"pagada",
	"vencida"
];
var ROLE_LABELS = {
	admin: "Administración",
	lawyer: "Abogado"
};
//#endregion
export { mailtoHref as _, EMAIL_TEMPLATE_VARS as a, STATUS_ORDER as c, buildClientEmail as d, buildSharePointPath as f, invoiceTotal as g, invoiceIva as h, DEFAULT_CLIENT_EMAIL_SUBJECT as i, addDaysIso as l, formatDateEs as m, DEFAULT_ADMIN_EMAIL_SUBJECT as n, ROLE_LABELS as o, formatCurrency as p, DEFAULT_CLIENT_EMAIL_BODY as r, STATUS_LABELS as s, DEFAULT_ADMIN_EMAIL_BODY as t, buildAdminEmail as u, todayIso as v };
