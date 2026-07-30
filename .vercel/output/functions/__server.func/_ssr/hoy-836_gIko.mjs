import { o as __toESM } from "../_runtime.mjs";
import { n as require_react } from "../_libs/@radix-ui/react-compose-refs+[...].mjs";
import { g as invoiceTotal, m as formatDateEs, p as formatCurrency, s as STATUS_LABELS } from "./types-FkcXPGqw.mjs";
import { g as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { i as require_jsx_runtime } from "../_libs/@radix-ui/react-label+[...].mjs";
import { t as cn } from "./createSsrRpc-_1pjCroF.mjs";
import { a as useBillingStore } from "./store-DUO1lHTD.mjs";
import { a as CardHeader, i as CardDescription, n as Card, o as CardTitle, r as CardContent, t as Button } from "./card-3GAOvsnF.mjs";
import { F as Clock, O as FilePen, _ as Mail, i as TriangleAlert, u as Send, z as ArrowRight } from "../_libs/lucide-react.mjs";
import { t as StatusBadge } from "./StatusBadge-DZ9msNwd.mjs";
import { a as sortByUrgency, i as isHoyItem, t as hoyReason } from "./priority-CmdkFfTm.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/hoy-836_gIko.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function HoyPage() {
	const invoices = useBillingStore((s) => s.invoices);
	const lawyers = useBillingStore((s) => s.lawyers);
	const hoy = (0, import_react.useMemo)(() => invoices.filter(isHoyItem).sort(sortByUrgency), [invoices]);
	const counts = (0, import_react.useMemo)(() => {
		const c = {
			vencida: 0,
			enviada_cliente: 0,
			solicitada_admin: 0,
			borrador: 0
		};
		for (const inv of hoy) if (inv.status === "vencida") c.vencida++;
		else if (inv.status === "enviada_cliente") c.enviada_cliente++;
		else if (inv.status === "solicitada_admin") c.solicitada_admin++;
		else if (inv.status === "borrador") c.borrador++;
		return c;
	}, [hoy]);
	const pendingAmount = (0, import_react.useMemo)(() => hoy.reduce((sum, inv) => sum + Math.max(0, invoiceTotal(inv) - (inv.paidAmount || 0)), 0), [hoy]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mx-auto flex w-full max-w-5xl flex-col gap-6",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "min-w-0",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
						className: "text-2xl font-semibold tracking-tight",
						children: "Hoy — pendientes de acción"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-1 text-sm text-muted",
						children: "Borradores, cola de Admin, vencidas y enviadas sin cobro, ordenadas por urgencia"
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					asChild: true,
					variant: "secondary",
					className: "shrink-0",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
						to: "/facturas",
						children: "Ir al seguimiento completo"
					})
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid gap-3 sm:grid-cols-2 lg:grid-cols-5",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SummaryChip, {
						label: "Total hoy",
						value: String(hoy.length),
						tone: "default"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SummaryChip, {
						label: "Vencidas",
						value: String(counts.vencida),
						tone: "danger"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SummaryChip, {
						label: "Sin pago",
						value: String(counts.enviada_cliente),
						tone: "warn"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SummaryChip, {
						label: "Cola Admin",
						value: String(counts.solicitada_admin),
						tone: "info"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SummaryChip, {
						label: "Borradores",
						value: String(counts.borrador),
						tone: "default"
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardHeader, {
				className: "pb-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, {
					className: "text-base",
					children: "Importe en juego"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardDescription, { children: "Suma pendiente de las facturas de esta lista" })]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardContent, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-2xl font-semibold tabular tracking-tight",
				children: formatCurrency(pendingAmount)
			}) })] }),
			hoy.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, {
				className: "py-12 text-center",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-base font-medium",
						children: "No hay pendientes de acción"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-1 text-sm text-muted",
						children: "Cuando haya borradores, solicitudes a Admin, vencidas o enviadas sin cobro, aparecerán aquí."
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						asChild: true,
						className: "mt-6",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
							to: "/nueva",
							children: "Nueva facturación"
						})
					})
				]
			}) }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
				className: "flex flex-col gap-3",
				children: hoy.map((inv, index) => {
					return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(HoyCard, {
						invoice: inv,
						lawyerName: lawyers.find((l) => l.id === inv.lawyerId)?.name,
						rank: index + 1
					}, inv.id);
				})
			})
		]
	});
}
function HoyCard({ invoice, lawyerName, rank }) {
	const total = invoiceTotal(invoice);
	const pending = Math.max(0, total - (invoice.paidAmount || 0));
	const reason = hoyReason(invoice);
	const Icon = iconFor(invoice.status);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
		to: "/facturas/$id",
		params: { id: invoice.id },
		className: cn("flex flex-col gap-3 rounded-xl border border-border bg-surface p-4 shadow-sm transition-colors hover:bg-surface-2 sm:flex-row sm:items-center sm:justify-between", invoice.status === "vencida" && "border-danger/30"),
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex min-w-0 items-start gap-3",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: cn("mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg", invoice.status === "vencida" ? "bg-danger-bg text-danger" : invoice.status === "enviada_cliente" ? "bg-warn-bg text-warn" : "bg-surface-2 text-primary"),
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, { className: "size-4" })
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "min-w-0",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex flex-wrap items-center gap-2",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: "text-xs font-medium tabular text-subtle",
								children: ["#", rank]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "truncate font-semibold text-fg",
								children: invoice.clientName
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatusBadge, { status: invoice.status })
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "mt-0.5 text-sm text-muted",
						children: [
							invoice.ref,
							" · ",
							invoice.expediente,
							lawyerName ? ` · ${lawyerName}` : ""
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-1 text-xs font-medium text-fg/80",
						children: reason
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "mt-0.5 text-xs text-subtle",
						children: [
							"Vence ",
							formatDateEs(invoice.dueDate),
							" ·",
							" ",
							STATUS_LABELS[invoice.status]
						]
					})
				]
			})]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex items-center justify-between gap-4 sm:flex-col sm:items-end",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "text-right",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-xs uppercase tracking-wide text-muted",
					children: "Pendiente"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-lg font-semibold tabular",
					children: formatCurrency(pending)
				})]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
				className: "inline-flex items-center gap-1 text-xs font-medium text-accent",
				children: ["Abrir flujo", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowRight, { className: "size-3.5" })]
			})]
		})]
	}) });
}
function iconFor(status) {
	switch (status) {
		case "vencida": return TriangleAlert;
		case "enviada_cliente": return Send;
		case "solicitada_admin": return Mail;
		case "borrador": return FilePen;
		default: return Clock;
	}
}
function SummaryChip({ label, value, tone }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, {
		className: "min-w-0",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, {
			className: "p-4",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-xs font-medium uppercase tracking-wide text-muted",
				children: label
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: cn("mt-1 text-xl font-semibold tabular", tone === "danger" && "text-danger", tone === "warn" && "text-warn", tone === "info" && "text-info"),
				children: value
			})]
		})
	});
}
//#endregion
export { HoyPage as component };
