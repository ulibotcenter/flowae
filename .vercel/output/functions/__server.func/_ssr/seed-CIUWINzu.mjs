import { f as buildSharePointPath, i as DEFAULT_CLIENT_EMAIL_SUBJECT, n as DEFAULT_ADMIN_EMAIL_SUBJECT, r as DEFAULT_CLIENT_EMAIL_BODY, t as DEFAULT_ADMIN_EMAIL_BODY } from "./types-FkcXPGqw.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/seed-CIUWINzu.js
var DEFAULT_SETTINGS = {
	firmName: "Bufete Lex & Asociados",
	adminEmail: "administracion@bufete-lex.es",
	adminName: "Administración",
	sharePointBase: "SharePoint/Clientes",
	defaultIva: 21,
	defaultPaymentDays: 30,
	sageNote: "Emitir en SAGE con la serie habitual del despacho.",
	lexnextNote: "Registrar también en LEXNEXT vinculando el expediente indicado.",
	adminEmailSubjectTpl: DEFAULT_ADMIN_EMAIL_SUBJECT,
	adminEmailBodyTpl: DEFAULT_ADMIN_EMAIL_BODY,
	clientEmailSubjectTpl: DEFAULT_CLIENT_EMAIL_SUBJECT,
	clientEmailBodyTpl: DEFAULT_CLIENT_EMAIL_BODY
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
//#endregion
export { DEFAULT_SETTINGS as n, createSeedInvoices as r, DEFAULT_LAWYERS as t };
