import { a as formatDateEs, o as invoiceIva, s as invoiceTotal } from "./store-BPhrqMPB.mjs";
import { t as STATUS_LABELS } from "./types-CuqEvxhD.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/export-BHKKzZXy.js
/** Excel-friendly CSV with BOM + semicolon (locale es-ES). */
function invoicesToCsv(invoices, lawyers) {
	const lawyerMap = new Map(lawyers.map((l) => [l.id, l.name]));
	const headers = [
		"Ref",
		"Nº factura",
		"Cliente",
		"Email cliente",
		"NIF/CIF",
		"Expediente",
		"Concepto",
		"Base",
		"IVA %",
		"Cuota IVA",
		"Suplidos",
		"Total",
		"Pagado",
		"Pendiente",
		"Estado",
		"Letrado",
		"Remitente",
		"Creada",
		"Solicitada",
		"Emitida",
		"Enviada",
		"Vencimiento",
		"Pagada el",
		"Ruta SharePoint",
		"Notas"
	];
	const rows = invoices.map((inv) => {
		const total = invoiceTotal(inv);
		const pending = Math.max(0, total - (inv.paidAmount || 0));
		return [
			inv.ref,
			inv.invoiceNumber,
			inv.clientName,
			inv.clientEmail,
			inv.clientNif,
			inv.expediente,
			inv.concepto,
			inv.baseAmount.toFixed(2),
			inv.ivaRate.toString(),
			invoiceIva(inv).toFixed(2),
			inv.suplidos.toFixed(2),
			total.toFixed(2),
			(inv.paidAmount || 0).toFixed(2),
			pending.toFixed(2),
			STATUS_LABELS[inv.status],
			lawyerMap.get(inv.lawyerId) ?? "",
			inv.remitente === "administracion" ? "Administración" : "Abogado",
			formatDateEs(inv.createdAt),
			formatDateEs(inv.requestedAt),
			formatDateEs(inv.issuedAt),
			formatDateEs(inv.sentAt),
			formatDateEs(inv.dueDate),
			formatDateEs(inv.paidAt),
			inv.sharePointPath,
			inv.notes
		];
	});
	const escape = (cell) => {
		const s = String(cell ?? "");
		if (/[;"\n\r]/.test(s)) return `"${s.replace(/"/g, "\"\"")}"`;
		return s;
	};
	return "﻿" + [headers, ...rows].map((row) => row.map(escape).join(";")).join("\r\n");
}
function downloadCsv(filename, content) {
	const blob = new Blob([content], { type: "text/csv;charset=utf-8" });
	const url = URL.createObjectURL(blob);
	const a = document.createElement("a");
	a.href = url;
	a.download = filename;
	a.click();
	URL.revokeObjectURL(url);
}
function parseConceptCsv(text) {
	const cleaned = text.replace(/^\uFEFF/, "").trim();
	if (!cleaned) return [];
	const lines = cleaned.split(/\r?\n/).filter((l) => l.trim());
	if (lines.length === 0) return [];
	const sep = detectSeparator(lines[0]);
	const cells = (line) => splitCsvLine(line, sep);
	const headerCells = cells(lines[0]).map((h) => normalizeHeader(h));
	const hasHeader = headerCells.some((h) => [
		"cliente",
		"client",
		"expediente",
		"concepto",
		"base",
		"importe",
		"email"
	].includes(h));
	const mapHeader = (h) => {
		if ([
			"cliente",
			"client",
			"clientname",
			"razon social",
			"razonsocial"
		].includes(h)) return "clientName";
		if ([
			"email",
			"emailcliente",
			"correo",
			"mail"
		].includes(h)) return "clientEmail";
		if ([
			"nif",
			"cif",
			"nifc",
			"nife",
			"vat"
		].includes(h)) return "clientNif";
		if ([
			"expediente",
			"exp",
			"caso",
			"matter",
			"ref expediente"
		].includes(h)) return "expediente";
		if ([
			"concepto",
			"descripcion",
			"description",
			"servicios"
		].includes(h)) return "concepto";
		if ([
			"base",
			"baseimponible",
			"importe",
			"honorarios",
			"amount",
			"neto"
		].includes(h)) return "baseAmount";
		if ([
			"iva",
			"ivarate",
			"%iva",
			"tipoiva"
		].includes(h)) return "ivaRate";
		if ([
			"suplidos",
			"gastos",
			"disbursements"
		].includes(h)) return "suplidos";
		if ([
			"notas",
			"observaciones",
			"notes"
		].includes(h)) return "notes";
		return null;
	};
	if (hasHeader) {
		const keys = headerCells.map(mapHeader);
		return lines.slice(1).map((line) => {
			const cols = cells(line);
			const row = {};
			keys.forEach((key, i) => {
				if (!key) return;
				const raw = cols[i] ?? "";
				if ([
					"baseAmount",
					"ivaRate",
					"suplidos"
				].includes(key)) row[key] = parseNumberEs(raw);
				else row[key] = raw.trim();
			});
			return row;
		});
	}
	if (lines.length === 1 || lines.every((l) => l.includes(":"))) {
		const fromKv = parseKeyValueBlock(cleaned);
		if (Object.keys(fromKv).length) return [fromKv];
	}
	return lines.map((line) => {
		const cols = cells(line);
		return {
			clientName: cols[0] ?? "",
			expediente: cols[1] ?? "",
			concepto: cols[2] ?? "",
			baseAmount: parseNumberEs(cols[3] ?? "0"),
			clientEmail: cols[4] ?? "",
			clientNif: cols[5] ?? "",
			ivaRate: cols[6] ? parseNumberEs(cols[6]) : void 0,
			suplidos: cols[7] ? parseNumberEs(cols[7]) : void 0
		};
	});
}
function detectSeparator(line) {
	const semis = (line.match(/;/g) || []).length;
	const commas = (line.match(/,/g) || []).length;
	const tabs = (line.match(/\t/g) || []).length;
	if (tabs >= semis && tabs >= commas && tabs > 0) return "	";
	if (semis >= commas) return ";";
	return ",";
}
function splitCsvLine(line, sep) {
	const out = [];
	let cur = "";
	let inQuotes = false;
	for (let i = 0; i < line.length; i++) {
		const ch = line[i];
		if (ch === "\"") if (inQuotes && line[i + 1] === "\"") {
			cur += "\"";
			i++;
		} else inQuotes = !inQuotes;
		else if (ch === sep && !inQuotes) {
			out.push(cur);
			cur = "";
		} else cur += ch;
	}
	out.push(cur);
	return out;
}
function normalizeHeader(h) {
	return h.trim().toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9% ]/g, "").replace(/\s+/g, "");
}
function parseNumberEs(raw) {
	const s = raw.trim().replace(/\s/g, "").replace(/€/g, "");
	if (!s) return 0;
	if (s.includes(",") && s.includes(".")) return Number(s.replace(/\./g, "").replace(",", ".")) || 0;
	if (s.includes(",")) return Number(s.replace(",", ".")) || 0;
	return Number(s) || 0;
}
function parseKeyValueBlock(text) {
	const row = {};
	for (const line of text.split(/\r?\n/)) {
		const m = line.match(/^([^:]+):\s*(.+)$/);
		if (!m) continue;
		const key = normalizeHeader(m[1]);
		const val = m[2].trim();
		if ([
			"cliente",
			"client",
			"clientname",
			"razonsocial"
		].includes(key)) row.clientName = val;
		else if ([
			"email",
			"correo",
			"mail"
		].includes(key)) row.clientEmail = val;
		else if (["nif", "cif"].includes(key)) row.clientNif = val;
		else if ([
			"expediente",
			"exp",
			"caso"
		].includes(key)) row.expediente = val;
		else if (["concepto", "descripcion"].includes(key)) row.concepto = val;
		else if ([
			"base",
			"baseimponible",
			"importe",
			"honorarios"
		].includes(key)) row.baseAmount = parseNumberEs(val);
		else if (["iva", "tipoiva"].includes(key)) row.ivaRate = parseNumberEs(val);
		else if (["suplidos", "gastos"].includes(key)) row.suplidos = parseNumberEs(val);
		else if (["notas", "observaciones"].includes(key)) row.notes = val;
	}
	return row;
}
//#endregion
export { invoicesToCsv as n, parseConceptCsv as r, downloadCsv as t };
