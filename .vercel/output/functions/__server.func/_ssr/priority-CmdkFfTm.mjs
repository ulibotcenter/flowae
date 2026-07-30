import { g as invoiceTotal } from "./types-FkcXPGqw.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/priority-CmdkFfTm.js
function isActionPending(inv) {
	if (inv.status === "pagada") return false;
	if (inv.status === "borrador") return true;
	if (inv.status === "solicitada_admin") return true;
	if (inv.status === "emitida") return true;
	if (inv.status === "vencida") return true;
	if (inv.status === "enviada_cliente" || inv.status === "parcial") return inv.paidAmount < invoiceTotal(inv);
	return false;
}
/** Matches the “Hoy” definition from product requirements */
function isHoyItem(inv) {
	if (inv.status === "borrador") return true;
	if (inv.status === "solicitada_admin") return true;
	if (inv.status === "vencida") return true;
	if (inv.status === "enviada_cliente" && inv.paidAmount < invoiceTotal(inv)) return true;
	return false;
}
/**
* Lower = more urgent.
* Vencidas first, then partials near due, sent unpaid, admin queue, drafts.
*/
function urgencyScore(inv) {
	const total = invoiceTotal(inv);
	const unpaid = inv.paidAmount < total - .001;
	const dueMs = inv.dueDate ? new Date(inv.dueDate).getTime() : Number.POSITIVE_INFINITY;
	const now = Date.now();
	const daysPastDue = Number.isFinite(dueMs) && dueMs < now ? Math.floor((now - dueMs) / (1440 * 60 * 1e3)) : 0;
	if (inv.status === "vencida") return 0 - daysPastDue;
	if (inv.status === "parcial" && unpaid) return 100 - Math.min(daysPastDue, 50);
	if (inv.status === "enviada_cliente" && unpaid) return 200 - Math.min(daysPastDue, 50);
	if (inv.status === "emitida") return 300;
	if (inv.status === "solicitada_admin") return 400;
	if (inv.status === "borrador") return 500;
	return 900;
}
function sortByUrgency(a, b) {
	const diff = urgencyScore(a) - urgencyScore(b);
	if (diff !== 0) return diff;
	return (b.createdAt || "").localeCompare(a.createdAt || "");
}
function hoyReason(inv) {
	if (inv.status === "vencida") return "Vencida — reclamar cobro";
	if (inv.status === "enviada_cliente") return "Enviada sin pago";
	if (inv.status === "solicitada_admin") return "Pendiente de emisión (Admin)";
	if (inv.status === "borrador") return "Borrador — solicitar a Admin";
	if (inv.status === "emitida") return "Emitida — enviar al cliente";
	if (inv.status === "parcial") return "Pago parcial pendiente";
	return "Requiere atención";
}
function inDateRange(iso, from, to) {
	if (!from && !to) return true;
	if (!iso) return false;
	const day = iso.slice(0, 10);
	if (from && day < from) return false;
	if (to && day > to) return false;
	return true;
}
//#endregion
export { sortByUrgency as a, isHoyItem as i, inDateRange as n, isActionPending as r, hoyReason as t };
