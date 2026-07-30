import { o as __toESM } from "../_runtime.mjs";
import { n as require_react } from "../_libs/@radix-ui/react-compose-refs+[...].mjs";
import { g as invoiceTotal, m as formatDateEs, p as formatCurrency } from "./types-FkcXPGqw.mjs";
import { g as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { i as require_jsx_runtime } from "../_libs/@radix-ui/react-label+[...].mjs";
import { a as useBillingStore } from "./store-BGoPG33y.mjs";
import { a as CardHeader, i as CardDescription, n as Card, o as CardTitle, r as CardContent, t as Button } from "./card-3GAOvsnF.mjs";
import { E as FileText, F as Clock, M as Euro, i as TriangleAlert, n as Wallet, u as Send, z as ArrowRight } from "../_libs/lucide-react.mjs";
import { t as StatusBadge } from "./StatusBadge-DZ9msNwd.mjs";
import { a as sortByUrgency, i as isHoyItem } from "./priority-CmdkFfTm.mjs";
import { a as Bar, i as CartesianGrid, n as YAxis, o as ResponsiveContainer, r as XAxis, s as Tooltip, t as BarChart } from "../_libs/recharts+[...].mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/routes-DYnNAKLh.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function DashboardPage() {
	const invoices = useBillingStore((s) => s.invoices);
	const lawyers = useBillingStore((s) => s.lawyers);
	const stats = (0, import_react.useMemo)(() => computeStats(invoices), [invoices]);
	const actionItems = (0, import_react.useMemo)(() => {
		return invoices.filter(isHoyItem).sort(sortByUrgency).slice(0, 6);
	}, [invoices]);
	const byLawyer = (0, import_react.useMemo)(() => {
		return lawyers.map((l) => {
			const pendiente = invoices.filter((i) => i.lawyerId === l.id).filter((i) => !["pagada", "borrador"].includes(i.status)).reduce((sum, i) => sum + Math.max(0, invoiceTotal(i) - i.paidAmount), 0);
			return {
				name: l.initials,
				pendiente: Math.round(pendiente)
			};
		});
	}, [invoices, lawyers]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mx-auto flex w-full max-w-6xl flex-col gap-6",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "min-w-0",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
						className: "text-2xl font-semibold tracking-tight text-fg",
						children: "Panel de facturación"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-1 text-sm text-muted",
						children: "Visión del flujo y cobros — pensado para más de 250 facturas/año"
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex flex-wrap gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						asChild: true,
						variant: "outline",
						className: "shrink-0",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
							to: "/hoy",
							children: ["Pendientes de hoy", actionItems.length > 0 ? ` (${stats.hoyCount})` : ""]
						})
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						asChild: true,
						className: "shrink-0",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
							to: "/nueva",
							children: ["Nueva facturación", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowRight, { className: "size-4" })]
						})
					})]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid gap-3 sm:grid-cols-2 xl:grid-cols-4",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatCard, {
						icon: Euro,
						label: "Pendiente de cobro",
						value: formatCurrency(stats.pending),
						hint: `${stats.pendingCount} facturas`
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatCard, {
						icon: TriangleAlert,
						label: "Vencidas",
						value: formatCurrency(stats.overdue),
						hint: `${stats.overdueCount} en riesgo`,
						tone: "danger"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatCard, {
						icon: Clock,
						label: "Pendientes de acción",
						value: String(stats.hoyCount),
						hint: "Vista Hoy"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatCard, {
						icon: Wallet,
						label: "Cobrado (muestra)",
						value: formatCurrency(stats.collected),
						hint: "Estado pagada",
						tone: "success"
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid min-w-0 gap-4 lg:grid-cols-5",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
					className: "min-w-0 lg:col-span-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardHeader, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, { children: "Pendiente por letrado" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardDescription, { children: "Importe pendiente de cobro agrupado por abogado responsable" })] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardContent, {
						className: "h-64 min-w-0",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ResponsiveContainer, {
							width: "100%",
							height: "100%",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(BarChart, {
								data: byLawyer,
								margin: {
									top: 8,
									right: 8,
									left: 0,
									bottom: 0
								},
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CartesianGrid, {
										strokeDasharray: "3 3",
										stroke: "var(--color-border)"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(XAxis, {
										dataKey: "name",
										tick: {
											fill: "var(--color-muted)",
											fontSize: 12
										}
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(YAxis, {
										tick: {
											fill: "var(--color-muted)",
											fontSize: 12
										},
										tickFormatter: (v) => `${Math.round(v / 1e3)}k`,
										width: 36
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Tooltip, {
										formatter: (v) => [formatCurrency(v), "Pendiente"],
										contentStyle: {
											borderRadius: 8,
											border: "1px solid var(--color-border)",
											fontSize: 12
										}
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Bar, {
										dataKey: "pendiente",
										fill: "var(--color-primary)",
										radius: [
											4,
											4,
											0,
											0
										]
									})
								]
							})
						})
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
					className: "min-w-0 lg:col-span-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardHeader, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, { children: "Acciones prioritarias" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardDescription, { children: "Lo más urgente de la vista Hoy" })] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, {
						className: "flex flex-col gap-2",
						children: [
							actionItems.length === 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-sm text-muted",
								children: "No hay acciones pendientes."
							}),
							actionItems.map((inv) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
								to: "/facturas/$id",
								params: { id: inv.id },
								className: "flex items-start gap-3 rounded-lg border border-border px-3 py-2.5 transition-colors hover:bg-surface-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ActionIcon, { status: inv.status }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "min-w-0 flex-1",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "flex flex-wrap items-center gap-2",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											className: "truncate text-sm font-medium",
											children: inv.clientName
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatusBadge, { status: inv.status })]
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
										className: "truncate text-xs text-muted",
										children: [
											inv.expediente,
											" · ",
											formatCurrency(invoiceTotal(inv))
										]
									})]
								})]
							}, inv.id)),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								asChild: true,
								variant: "outline",
								className: "mt-1",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
									to: "/hoy",
									children: "Ver todas las de hoy"
								})
							})
						]
					})]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
				className: "min-w-0",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardHeader, {
					className: "flex-row items-center justify-between gap-2 space-y-0",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, { children: "Últimas facturas" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardDescription, { children: "Actividad reciente en el panel" })] })
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardContent, {
					className: "min-w-0 overflow-x-auto",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("table", {
						className: "w-full min-w-[640px] text-left text-sm",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("thead", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
							className: "border-b border-border text-xs uppercase tracking-wide text-muted",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
									className: "pb-2 pr-3 font-medium",
									children: "Ref"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
									className: "pb-2 pr-3 font-medium",
									children: "Cliente"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
									className: "pb-2 pr-3 font-medium",
									children: "Estado"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
									className: "pb-2 pr-3 font-medium",
									children: "Total"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
									className: "pb-2 font-medium",
									children: "Creada"
								})
							]
						}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tbody", { children: invoices.slice(0, 8).map((inv) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
							className: "border-b border-border/70 last:border-0",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
									className: "py-3 pr-3",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
										to: "/facturas/$id",
										params: { id: inv.id },
										className: "font-medium text-accent hover:underline",
										children: inv.ref
									})
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("td", {
									className: "py-3 pr-3",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "font-medium",
										children: inv.clientName
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "text-xs text-muted",
										children: inv.expediente
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
									className: "py-3 pr-3",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatusBadge, { status: inv.status })
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
									className: "py-3 pr-3 tabular",
									children: formatCurrency(invoiceTotal(inv))
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
									className: "py-3 text-muted",
									children: formatDateEs(inv.createdAt)
								})
							]
						}, inv.id)) })]
					})
				})]
			})
		]
	});
}
function StatCard({ icon: Icon, label, value, hint, tone }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, {
		className: "min-w-0",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, {
			className: "flex items-start gap-3 p-5",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: tone === "danger" ? "rounded-lg bg-danger-bg p-2.5 text-danger" : tone === "success" ? "rounded-lg bg-success-bg p-2.5 text-success" : "rounded-lg bg-surface-2 p-2.5 text-primary",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, { className: "size-5" })
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "min-w-0",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-xs font-medium uppercase tracking-wide text-muted",
						children: label
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-0.5 truncate text-xl font-semibold tabular tracking-tight",
						children: value
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-xs text-subtle",
						children: hint
					})
				]
			})]
		})
	});
}
function ActionIcon({ status }) {
	if (status === "vencida") return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
		className: "mt-0.5 rounded-md bg-danger-bg p-1.5 text-danger",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TriangleAlert, { className: "size-4" })
	});
	if (status === "emitida") return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
		className: "mt-0.5 rounded-md bg-info-bg p-1.5 text-info",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Send, { className: "size-4" })
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
		className: "mt-0.5 rounded-md bg-surface-2 p-1.5 text-muted",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FileText, { className: "size-4" })
	});
}
function computeStats(invoices) {
	let pending = 0;
	let pendingCount = 0;
	let overdue = 0;
	let overdueCount = 0;
	let collected = 0;
	let hoyCount = 0;
	for (const inv of invoices) {
		const total = invoiceTotal(inv);
		const rest = Math.max(0, total - (inv.paidAmount || 0));
		if (isHoyItem(inv)) hoyCount++;
		if (inv.status === "pagada") {
			collected += inv.paidAmount || total;
			continue;
		}
		if (rest > 0 && inv.status !== "borrador") {
			pending += rest;
			pendingCount++;
		}
		if (inv.status === "vencida") {
			overdue += rest;
			overdueCount++;
		}
	}
	return {
		pending,
		pendingCount,
		overdue,
		overdueCount,
		collected,
		hoyCount
	};
}
//#endregion
export { DashboardPage as component };
