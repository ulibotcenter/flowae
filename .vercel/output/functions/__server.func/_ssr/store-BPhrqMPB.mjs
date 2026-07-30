import { n as clsx } from "../_libs/class-variance-authority+clsx.mjs";
import { t as twMerge } from "../_libs/tailwind-merge.mjs";
import { n as create, t as persist } from "../_libs/zustand.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/store-BPhrqMPB.js
function cn(...inputs) {
	return twMerge(clsx(inputs));
}
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
function buildSharePointPath(settings, clientName, expediente, year = (/* @__PURE__ */ new Date()).getFullYear()) {
	const safeClient = sanitizePathSegment(clientName || "Sin-cliente");
	const safeExp = sanitizePathSegment(expediente || "Sin-expediente");
	return `${settings.sharePointBase.replace(/\/+$/, "")}/${safeClient}/${safeExp}/Facturas/${year}`;
}
function sanitizePathSegment(value) {
	return value.trim().replace(/[\\/:*?"<>|]/g, "-").replace(/\s+/g, " ").slice(0, 80);
}
function buildAdminEmail(invoice, lawyer, settings) {
	const total = invoiceTotal(invoice);
	return {
		subject: `[Facturación] ${invoice.clientName} · ${invoice.expediente} · ${invoice.ref}`,
		body: `Estimado/a ${settings.adminName},

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
`.trim()
	};
}
function buildClientEmail(invoice, lawyer, settings) {
	const total = invoiceTotal(invoice);
	const fromName = invoice.remitente === "administracion" ? settings.adminName : lawyer?.name ?? settings.firmName;
	const fromEmail = invoice.remitente === "administracion" ? settings.adminEmail : lawyer?.email ?? settings.adminEmail;
	const invNum = invoice.invoiceNumber || "[nº factura]";
	const subject = `Factura ${invNum} — ${settings.firmName} · ${invoice.expediente}`;
	const due = invoice.dueDate ? `Fecha de vencimiento: ${formatDateEs(invoice.dueDate)}.` : "";
	return {
		subject,
		body: `Estimado/a ${invoice.clientName},

Adjunto remito la factura ${invNum} correspondiente a los servicios profesionales prestados en el expediente ${invoice.expediente}.

Concepto: ${invoice.concepto}
Importe total: ${formatCurrency(total)}
${due}

Quedo a su disposición para cualquier aclaración.

Atentamente,
${fromName}
${settings.firmName}
${fromEmail}
`.trim()
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
var DEFAULT_SETTINGS = {
	firmName: "Bufete Lex & Asociados",
	adminEmail: "administracion@bufete-lex.es",
	adminName: "Administración",
	sharePointBase: "SharePoint/Clientes",
	defaultIva: 21,
	defaultPaymentDays: 30,
	sageNote: "Emitir en SAGE con la serie habitual del despacho.",
	lexnextNote: "Registrar también en LEXNEXT vinculando el expediente indicado."
};
var DEFAULT_LAWYERS = [
	{
		id: "law-1",
		name: "María González Ruiz",
		email: "m.gonzalez@bufete-lex.es",
		initials: "MG"
	},
	{
		id: "law-2",
		name: "Carlos Jiménez Soto",
		email: "c.jimenez@bufete-lex.es",
		initials: "CJ"
	},
	{
		id: "law-3",
		name: "Laura Fernández Vega",
		email: "l.fernandez@bufete-lex.es",
		initials: "LF"
	},
	{
		id: "law-4",
		name: "Pablo Ortega Díaz",
		email: "p.ortega@bufete-lex.es",
		initials: "PO"
	}
];
function daysAgo(n) {
	const d = /* @__PURE__ */ new Date();
	d.setDate(d.getDate() - n);
	return d.toISOString();
}
function daysFrom(iso, n) {
	const d = new Date(iso);
	d.setDate(d.getDate() + n);
	return d.toISOString();
}
function createSeedInvoices(settings = DEFAULT_SETTINGS) {
	return [
		{
			id: "inv-1",
			ref: "FAC-2026-0012",
			invoiceNumber: "2026/0087",
			clientName: "Inmobiliaria Norte S.L.",
			clientEmail: "facturacion@norte-inmo.es",
			clientNif: "B12345678",
			expediente: "CIV-2025-0412",
			concepto: "Honorarios por demanda de desahucio y seguimiento procesal (fase alegaciones)",
			baseAmount: 2800,
			ivaRate: 21,
			suplidos: 120,
			currency: "EUR",
			lawyerId: "law-1",
			remitente: "abogado",
			status: "enviada_cliente",
			createdAt: daysAgo(45),
			requestedAt: daysAgo(44),
			issuedAt: daysAgo(42),
			sentAt: daysAgo(41),
			dueDate: daysFrom(daysAgo(42), 30),
			paidAmount: 0,
			notes: "Cliente pide factura a nombre de la sociedad matriz si es posible.",
			sourceFile: "concepto_norte.xlsx"
		},
		{
			id: "inv-2",
			ref: "FAC-2026-0018",
			invoiceNumber: "2026/0094",
			clientName: "Banco Mediterráneo S.A.",
			clientEmail: "juridico@bancomed.es",
			clientNif: "A87654321",
			expediente: "MER-2026-0088",
			concepto: "Asesoramiento mercantil y revisión de contratos de financiación sindicada",
			baseAmount: 6500,
			ivaRate: 21,
			suplidos: 0,
			currency: "EUR",
			lawyerId: "law-2",
			remitente: "administracion",
			status: "pagada",
			createdAt: daysAgo(60),
			requestedAt: daysAgo(59),
			issuedAt: daysAgo(58),
			sentAt: daysAgo(57),
			dueDate: daysFrom(daysAgo(58), 30),
			paidAt: daysAgo(20),
			paidAmount: 7865,
			notes: "",
			sourceFile: "honorarios_banco.docx"
		},
		{
			id: "inv-3",
			ref: "FAC-2026-0025",
			invoiceNumber: "2026/0102",
			clientName: "Construcciones del Sur S.A.",
			clientEmail: "admin@consur.es",
			clientNif: "A11223344",
			expediente: "LAB-2026-0015",
			concepto: "Defensa en procedimiento laboral — preparación de juicio y escritos",
			baseAmount: 1900,
			ivaRate: 21,
			suplidos: 85.5,
			currency: "EUR",
			lawyerId: "law-3",
			remitente: "abogado",
			status: "vencida",
			createdAt: daysAgo(90),
			requestedAt: daysAgo(89),
			issuedAt: daysAgo(87),
			sentAt: daysAgo(86),
			dueDate: daysAgo(50),
			paidAmount: 0,
			notes: "Segundo recordatorio pendiente."
		},
		{
			id: "inv-4",
			ref: "FAC-2026-0031",
			invoiceNumber: "2026/0110",
			clientName: "TechNova Solutions S.L.",
			clientEmail: "legal@technova.io",
			clientNif: "B99887766",
			expediente: "IP-2026-0007",
			concepto: "Registro de marca y oposición — honorarios fase administrativa",
			baseAmount: 1200,
			ivaRate: 21,
			suplidos: 240,
			currency: "EUR",
			lawyerId: "law-4",
			remitente: "abogado",
			status: "parcial",
			createdAt: daysAgo(35),
			requestedAt: daysAgo(34),
			issuedAt: daysAgo(32),
			sentAt: daysAgo(31),
			dueDate: daysFrom(daysAgo(32), 30),
			paidAmount: 850,
			notes: "Pago parcial recibido el 15/07."
		},
		{
			id: "inv-5",
			ref: "FAC-2026-0038",
			invoiceNumber: "",
			clientName: "Familia Herrera López",
			clientEmail: "ana.herrera@email.com",
			clientNif: "12345678Z",
			expediente: "FAM-2026-0022",
			concepto: "Honorarios por procedimiento de divorcio de mutuo acuerdo (fase convenio)",
			baseAmount: 2200,
			ivaRate: 21,
			suplidos: 0,
			currency: "EUR",
			lawyerId: "law-1",
			remitente: "abogado",
			status: "solicitada_admin",
			createdAt: daysAgo(3),
			requestedAt: daysAgo(2),
			paidAmount: 0,
			notes: "Cliente particular — preferencia de envío por email.",
			sourceFile: "concepto_herrera.docx"
		},
		{
			id: "inv-6",
			ref: "FAC-2026-0041",
			invoiceNumber: "",
			clientName: "Grupo Alimentario Rías S.A.",
			clientEmail: "compras@rias-grupo.es",
			clientNif: "A55443322",
			expediente: "ADM-2026-0033",
			concepto: "Recurso contencioso-administrativo — preparación de demanda",
			baseAmount: 4100,
			ivaRate: 21,
			suplidos: 150,
			currency: "EUR",
			lawyerId: "law-2",
			remitente: "abogado",
			status: "borrador",
			createdAt: daysAgo(1),
			paidAmount: 0,
			notes: "Pendiente de validar concepto con socio director.",
			sourceFile: "SharePoint/conceptos/rias_jul2026.xlsx"
		},
		{
			id: "inv-7",
			ref: "FAC-2026-0029",
			invoiceNumber: "2026/0108",
			clientName: "Transportes Atlántico S.L.",
			clientEmail: "dir@transatlantico.es",
			clientNif: "B66778899",
			expediente: "CIV-2026-0091",
			concepto: "Reclamación de cantidad y ejecución provisional",
			baseAmount: 3200,
			ivaRate: 21,
			suplidos: 95,
			currency: "EUR",
			lawyerId: "law-3",
			remitente: "administracion",
			status: "emitida",
			createdAt: daysAgo(12),
			requestedAt: daysAgo(11),
			issuedAt: daysAgo(5),
			dueDate: daysFrom(daysAgo(5), 30),
			paidAmount: 0,
			notes: "PDF ya en SharePoint; falta remisión al cliente."
		}
	].map((s) => ({
		...s,
		sharePointPath: buildSharePointPath(settings, s.clientName, s.expediente)
	}));
}
function nextRef(seq) {
	return `FAC-${(/* @__PURE__ */ new Date()).getFullYear()}-${String(seq).padStart(4, "0")}`;
}
function recomputeDueStatus(inv) {
	if (inv.status === "pagada" || inv.status === "borrador" || inv.status === "solicitada_admin" || inv.status === "vencida") return inv;
	if (inv.dueDate && new Date(inv.dueDate) < /* @__PURE__ */ new Date() && inv.paidAmount < invoiceTotal(inv) && (inv.status === "enviada_cliente" || inv.status === "emitida" || inv.status === "parcial")) {
		if (inv.paidAmount === 0) return {
			...inv,
			status: "vencida"
		};
	}
	return inv;
}
var useBillingStore = create()(persist((set, get) => ({
	settings: DEFAULT_SETTINGS,
	lawyers: DEFAULT_LAWYERS,
	invoices: createSeedInvoices(DEFAULT_SETTINGS),
	seq: 42,
	hydrated: false,
	setHydrated: (v) => set({ hydrated: v }),
	updateSettings: (patch) => set((s) => ({ settings: {
		...s.settings,
		...patch
	} })),
	upsertLawyer: (lawyer) => set((s) => {
		return { lawyers: s.lawyers.some((l) => l.id === lawyer.id) ? s.lawyers.map((l) => l.id === lawyer.id ? lawyer : l) : [...s.lawyers, lawyer] };
	}),
	removeLawyer: (id) => set((s) => ({ lawyers: s.lawyers.filter((l) => l.id !== id) })),
	createFromDraft: (draft) => {
		const state = get();
		const seq = state.seq + 1;
		const id = `inv-${crypto.randomUUID().slice(0, 8)}`;
		const createdAt = todayIso();
		const path = buildSharePointPath(state.settings, draft.clientName, draft.expediente);
		const invoice = {
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
			dueDate: addDaysIso(createdAt, draft.dueDays ?? state.settings.defaultPaymentDays)
		};
		const lawyer = state.lawyers.find((l) => l.id === invoice.lawyerId);
		const admin = buildAdminEmail(invoice, lawyer, state.settings);
		const client = buildClientEmail(invoice, lawyer, state.settings);
		invoice.adminEmailSubject = admin.subject;
		invoice.adminEmailBody = admin.body;
		invoice.clientEmailSubject = client.subject;
		invoice.clientEmailBody = client.body;
		set({
			invoices: [invoice, ...state.invoices],
			seq
		});
		return invoice;
	},
	updateInvoice: (id, patch) => set((s) => ({ invoices: s.invoices.map((inv) => {
		if (inv.id !== id) return inv;
		const next = {
			...inv,
			...patch
		};
		if (patch.clientName || patch.expediente) next.sharePointPath = buildSharePointPath(s.settings, next.clientName, next.expediente);
		return next;
	}) })),
	deleteInvoice: (id) => set((s) => ({ invoices: s.invoices.filter((i) => i.id !== id) })),
	advanceStatus: (id, status, extra) => set((s) => ({ invoices: s.invoices.map((inv) => inv.id === id ? {
		...inv,
		status,
		...extra
	} : inv) })),
	requestAdmin: (id) => {
		const state = get();
		const inv = state.invoices.find((i) => i.id === id);
		if (!inv) return;
		const admin = buildAdminEmail(inv, state.lawyers.find((l) => l.id === inv.lawyerId), state.settings);
		set((s) => ({ invoices: s.invoices.map((i) => i.id === id ? {
			...i,
			status: "solicitada_admin",
			requestedAt: todayIso(),
			adminEmailSubject: admin.subject,
			adminEmailBody: admin.body
		} : i) }));
	},
	markIssued: (id, invoiceNumber) => {
		const state = get();
		const inv = state.invoices.find((i) => i.id === id);
		if (!inv) return;
		const issuedAt = todayIso();
		const dueDate = inv.dueDate || addDaysIso(issuedAt, state.settings.defaultPaymentDays);
		const updated = {
			...inv,
			invoiceNumber: invoiceNumber.trim(),
			status: "emitida",
			issuedAt,
			dueDate
		};
		const client = buildClientEmail(updated, state.lawyers.find((l) => l.id === updated.lawyerId), state.settings);
		set((s) => ({ invoices: s.invoices.map((i) => i.id === id ? {
			...updated,
			clientEmailSubject: client.subject,
			clientEmailBody: client.body
		} : i) }));
	},
	markSentToClient: (id) => {
		const state = get();
		const inv = state.invoices.find((i) => i.id === id);
		if (!inv) return;
		const client = buildClientEmail(inv, state.lawyers.find((l) => l.id === inv.lawyerId), state.settings);
		set((s) => ({ invoices: s.invoices.map((i) => i.id === id ? {
			...i,
			status: "enviada_cliente",
			sentAt: todayIso(),
			clientEmailSubject: client.subject,
			clientEmailBody: client.body
		} : i) }));
	},
	registerPayment: (id, amount, full) => set((s) => ({ invoices: s.invoices.map((inv) => {
		if (inv.id !== id) return inv;
		const total = invoiceTotal(inv);
		const paid = full ? total : Math.min(total, (inv.paidAmount || 0) + amount);
		const status = paid >= total - .001 ? "pagada" : paid > 0 ? "parcial" : inv.status;
		return {
			...inv,
			paidAmount: paid,
			status,
			paidAt: paid >= total - .001 ? todayIso() : inv.paidAt
		};
	}) })),
	refreshEmails: (id) => {
		const state = get();
		const inv = state.invoices.find((i) => i.id === id);
		if (!inv) return;
		const lawyer = state.lawyers.find((l) => l.id === inv.lawyerId);
		const admin = buildAdminEmail(inv, lawyer, state.settings);
		const client = buildClientEmail(inv, lawyer, state.settings);
		set((s) => ({ invoices: s.invoices.map((i) => i.id === id ? {
			...i,
			adminEmailSubject: admin.subject,
			adminEmailBody: admin.body,
			clientEmailSubject: client.subject,
			clientEmailBody: client.body,
			sharePointPath: buildSharePointPath(s.settings, i.clientName, i.expediente)
		} : i) }));
	},
	refreshOverdue: () => set((s) => ({ invoices: s.invoices.map(recomputeDueStatus) })),
	resetDemo: () => set({
		settings: DEFAULT_SETTINGS,
		lawyers: DEFAULT_LAWYERS,
		invoices: createSeedInvoices(DEFAULT_SETTINGS),
		seq: 42
	}),
	getLawyer: (id) => get().lawyers.find((l) => l.id === id)
}), {
	name: "bufete-facturacion-v1",
	onRehydrateStorage: () => (state) => {
		state?.setHydrated(true);
		state?.refreshOverdue();
	}
}));
//#endregion
export { formatDateEs as a, mailtoHref as c, formatCurrency as i, useBillingStore as l, buildClientEmail as n, invoiceIva as o, cn as r, invoiceTotal as s, buildAdminEmail as t };
