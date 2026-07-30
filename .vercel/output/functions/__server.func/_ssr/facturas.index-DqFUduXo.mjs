import { i as __toESM } from "../_runtime.mjs";
import { n as require_react } from "../_libs/@radix-ui/react-compose-refs+[...].mjs";
import { a as formatDateEs, i as formatCurrency, l as useBillingStore, s as invoiceTotal } from "./store-BPhrqMPB.mjs";
import { i as require_jsx_runtime } from "../_libs/@radix-ui/react-label+[...].mjs";
import { a as CardHeader, i as CardDescription, n as Card, o as CardTitle, r as CardContent, t as Button } from "./card-BzzuZRXz.mjs";
import { t as Input } from "./input-Bmbc6647.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { C as Download, l as Search } from "../_libs/lucide-react.mjs";
import { g as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { n as STATUS_ORDER, t as STATUS_LABELS } from "./types-CuqEvxhD.mjs";
import { t as StatusBadge } from "./StatusBadge-DL_RwRvC.mjs";
import { t as Select } from "./select-B7L2Cihh.mjs";
import { n as invoicesToCsv, t as downloadCsv } from "./export-BHKKzZXy.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/facturas.index-DqFUduXo.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function FacturasPage() {
	const invoices = useBillingStore((s) => s.invoices);
	const lawyers = useBillingStore((s) => s.lawyers);
	const [q, setQ] = (0, import_react.useState)("");
	const [status, setStatus] = (0, import_react.useState)("all");
	const [lawyerId, setLawyerId] = (0, import_react.useState)("all");
	const filtered = (0, import_react.useMemo)(() => {
		const query = q.trim().toLowerCase();
		return invoices.filter((inv) => {
			if (status !== "all" && inv.status !== status) return false;
			if (lawyerId !== "all" && inv.lawyerId !== lawyerId) return false;
			if (!query) return true;
			return [
				inv.ref,
				inv.invoiceNumber,
				inv.clientName,
				inv.expediente,
				inv.concepto,
				inv.clientEmail
			].join(" ").toLowerCase().includes(query);
		});
	}, [
		invoices,
		q,
		status,
		lawyerId
	]);
	const totals = (0, import_react.useMemo)(() => {
		let total = 0;
		let paid = 0;
		let pending = 0;
		for (const inv of filtered) {
			const t = invoiceTotal(inv);
			total += t;
			paid += inv.paidAmount || 0;
			if (inv.status !== "pagada" && inv.status !== "borrador") pending += Math.max(0, t - (inv.paidAmount || 0));
		}
		return {
			total,
			paid,
			pending,
			count: filtered.length
		};
	}, [filtered]);
	function exportExcel() {
		const csv = invoicesToCsv(filtered, lawyers);
		downloadCsv(`seguimiento-facturas-${(/* @__PURE__ */ new Date()).toISOString().slice(0, 10)}.csv`, csv);
		toast.success("Exportado para Excel (CSV ;)");
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mx-auto flex w-full max-w-6xl flex-col gap-6",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "min-w-0",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
						className: "text-2xl font-semibold tracking-tight",
						children: "Seguimiento de facturas"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-1 text-sm text-muted",
						children: "Emitidas, enviadas, pagadas y pendientes — exportable a Excel"
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
					type: "button",
					variant: "secondary",
					className: "shrink-0",
					onClick: exportExcel,
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Download, { className: "size-4" }), "Exportar Excel"]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid gap-3 sm:grid-cols-3",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MiniStat, {
						label: "Facturas filtradas",
						value: String(totals.count)
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MiniStat, {
						label: "Importe total",
						value: formatCurrency(totals.total)
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MiniStat, {
						label: "Pendiente de cobro",
						value: formatCurrency(totals.pending)
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
				className: "min-w-0",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardHeader, {
					className: "pb-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, {
						className: "text-base",
						children: "Filtros"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardDescription, { children: "Busca por cliente, expediente, nº de factura o concepto" })]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, {
					className: "flex flex-col gap-3 sm:flex-row",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "relative min-w-0 flex-1",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Search, { className: "pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-subtle" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								className: "pl-9",
								placeholder: "Buscar…",
								value: q,
								onChange: (e) => setQ(e.target.value)
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
							className: "sm:w-48",
							value: status,
							onChange: (e) => setStatus(e.target.value),
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
								value: "all",
								children: "Todos los estados"
							}), STATUS_ORDER.map((s) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
								value: s,
								children: STATUS_LABELS[s]
							}, s))]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
							className: "sm:w-52",
							value: lawyerId,
							onChange: (e) => setLawyerId(e.target.value),
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
								value: "all",
								children: "Todos los letrados"
							}), lawyers.map((l) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
								value: l.id,
								children: l.name
							}, l.id))]
						})
					]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, {
				className: "min-w-0",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardContent, {
					className: "min-w-0 overflow-x-auto p-0",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("table", {
						className: "w-full min-w-[900px] text-left text-sm",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("thead", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
							className: "border-b border-border bg-bg text-xs uppercase tracking-wide text-muted",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
									className: "px-4 py-3 font-medium",
									children: "Ref / Nº"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
									className: "px-4 py-3 font-medium",
									children: "Cliente"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
									className: "px-4 py-3 font-medium",
									children: "Letrado"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
									className: "px-4 py-3 font-medium",
									children: "Estado"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
									className: "px-4 py-3 font-medium",
									children: "Total"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
									className: "px-4 py-3 font-medium",
									children: "Pagado"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
									className: "px-4 py-3 font-medium",
									children: "Vence"
								})
							]
						}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tbody", { children: [filtered.length === 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tr", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
							colSpan: 7,
							className: "px-4 py-10 text-center text-muted",
							children: "No hay facturas con estos filtros"
						}) }), filtered.map((inv) => {
							const lawyer = lawyers.find((l) => l.id === inv.lawyerId);
							const total = invoiceTotal(inv);
							return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
								className: "border-b border-border/70 last:border-0 hover:bg-surface-2/60",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("td", {
										className: "px-4 py-3",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
											to: "/facturas/$id",
											params: { id: inv.id },
											className: "font-medium text-accent hover:underline",
											children: inv.ref
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
											className: "text-xs text-muted",
											children: inv.invoiceNumber || "Sin nº SAGE"
										})]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("td", {
										className: "px-4 py-3",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
											className: "font-medium",
											children: inv.clientName
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
											className: "text-xs text-muted",
											children: inv.expediente
										})]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
										className: "px-4 py-3 text-muted",
										children: lawyer?.initials ?? "—"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
										className: "px-4 py-3",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatusBadge, { status: inv.status })
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
										className: "px-4 py-3 tabular",
										children: formatCurrency(total)
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
										className: "px-4 py-3 tabular text-muted",
										children: formatCurrency(inv.paidAmount || 0)
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
										className: "px-4 py-3 text-muted",
										children: formatDateEs(inv.dueDate)
									})
								]
							}, inv.id);
						})] })]
					})
				})
			})
		]
	});
}
function MiniStat({ label, value }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, {
		className: "min-w-0",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, {
			className: "p-4",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-xs font-medium uppercase tracking-wide text-muted",
				children: label
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-1 text-lg font-semibold tabular",
				children: value
			})]
		})
	});
}
//#endregion
export { FacturasPage as component };
