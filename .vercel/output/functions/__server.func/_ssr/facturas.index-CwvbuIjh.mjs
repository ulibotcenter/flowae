import { o as __toESM } from "../_runtime.mjs";
import { n as require_react } from "../_libs/@radix-ui/react-compose-refs+[...].mjs";
import { c as STATUS_ORDER, g as invoiceTotal, m as formatDateEs, p as formatCurrency, s as STATUS_LABELS } from "./types-FkcXPGqw.mjs";
import { g as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { i as require_jsx_runtime } from "../_libs/@radix-ui/react-label+[...].mjs";
import { t as cn } from "./createSsrRpc-_1pjCroF.mjs";
import { a as useBillingStore } from "./store-DUO1lHTD.mjs";
import { a as CardHeader, i as CardDescription, n as Card, o as CardTitle, r as CardContent, t as Button } from "./card-3GAOvsnF.mjs";
import { n as Label, t as Input } from "./label-BBpU3UnU.mjs";
import { t as Select } from "./select-BwF8MM6y.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { N as Download, S as FunnelX, _ as Mail, d as Search, m as RefreshCw, t as X, u as Send } from "../_libs/lucide-react.mjs";
import { t as StatusBadge } from "./StatusBadge-DZ9msNwd.mjs";
import { n as invoicesToCsv, t as downloadCsv } from "./export-Dmhiqqsz.mjs";
import { n as inDateRange, r as isActionPending } from "./priority-CmdkFfTm.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/facturas.index-CwvbuIjh.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var Checkbox = import_react.forwardRef(({ className, label, id, ...props }, ref) => {
	const inputId = id || props.name;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
		htmlFor: inputId,
		className: cn("inline-flex cursor-pointer items-center gap-2 text-sm text-fg select-none", props.disabled && "cursor-not-allowed opacity-50", className),
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
			ref,
			id: inputId,
			type: "checkbox",
			className: "size-4 shrink-0 rounded border border-border-strong accent-[var(--color-primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent",
			...props
		}), label ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: label }) : null]
	});
});
Checkbox.displayName = "Checkbox";
function FacturasPage() {
	const invoices = useBillingStore((s) => s.invoices);
	const lawyers = useBillingStore((s) => s.lawyers);
	const batchRequestAdmin = useBillingStore((s) => s.batchRequestAdmin);
	const batchMarkSentToClient = useBillingStore((s) => s.batchMarkSentToClient);
	const batchRefreshOverdue = useBillingStore((s) => s.batchRefreshOverdue);
	const [q, setQ] = (0, import_react.useState)("");
	const [status, setStatus] = (0, import_react.useState)("all");
	const [lawyerId, setLawyerId] = (0, import_react.useState)("all");
	const [dateField, setDateField] = (0, import_react.useState)("createdAt");
	const [dateFrom, setDateFrom] = (0, import_react.useState)("");
	const [dateTo, setDateTo] = (0, import_react.useState)("");
	const [onlyOverdue, setOnlyOverdue] = (0, import_react.useState)(false);
	const [onlyAction, setOnlyAction] = (0, import_react.useState)(false);
	const [selected, setSelected] = (0, import_react.useState)(/* @__PURE__ */ new Set());
	const [busy, setBusy] = (0, import_react.useState)(false);
	const filtered = (0, import_react.useMemo)(() => {
		const query = q.trim().toLowerCase();
		return invoices.filter((inv) => {
			if (status !== "all" && inv.status !== status) return false;
			if (lawyerId !== "all" && inv.lawyerId !== lawyerId) return false;
			if (onlyOverdue && inv.status !== "vencida") return false;
			if (onlyAction && !isActionPending(inv)) return false;
			if (!inDateRange(dateField === "dueDate" ? inv.dueDate : inv.createdAt, dateFrom, dateTo)) return false;
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
		lawyerId,
		onlyOverdue,
		onlyAction,
		dateField,
		dateFrom,
		dateTo
	]);
	(0, import_react.useEffect)(() => {
		const visible = new Set(filtered.map((i) => i.id));
		setSelected((prev) => {
			let changed = false;
			const next = /* @__PURE__ */ new Set();
			prev.forEach((id) => {
				if (visible.has(id)) next.add(id);
				else changed = true;
			});
			return changed ? next : prev;
		});
	}, [filtered]);
	const totals = (0, import_react.useMemo)(() => {
		let total = 0;
		let pending = 0;
		for (const inv of filtered) {
			const t = invoiceTotal(inv);
			total += t;
			if (inv.status !== "pagada" && inv.status !== "borrador") pending += Math.max(0, t - (inv.paidAmount || 0));
		}
		return {
			total,
			pending,
			count: filtered.length
		};
	}, [filtered]);
	const activeFilterCount = (0, import_react.useMemo)(() => {
		let n = 0;
		if (q.trim()) n++;
		if (status !== "all") n++;
		if (lawyerId !== "all") n++;
		if (dateFrom || dateTo) n++;
		if (onlyOverdue) n++;
		if (onlyAction) n++;
		return n;
	}, [
		q,
		status,
		lawyerId,
		dateFrom,
		dateTo,
		onlyOverdue,
		onlyAction
	]);
	const allVisibleSelected = filtered.length > 0 && filtered.every((i) => selected.has(i.id));
	const someSelected = selected.size > 0;
	function clearFilters() {
		setQ("");
		setStatus("all");
		setLawyerId("all");
		setDateField("createdAt");
		setDateFrom("");
		setDateTo("");
		setOnlyOverdue(false);
		setOnlyAction(false);
	}
	function toggleOne(id) {
		setSelected((prev) => {
			const next = new Set(prev);
			if (next.has(id)) next.delete(id);
			else next.add(id);
			return next;
		});
	}
	function toggleAllVisible() {
		if (allVisibleSelected) {
			setSelected(/* @__PURE__ */ new Set());
			return;
		}
		setSelected(new Set(filtered.map((i) => i.id)));
	}
	function selectedInvoices() {
		return invoices.filter((i) => selected.has(i.id));
	}
	function exportAllFiltered() {
		const csv = invoicesToCsv(filtered, lawyers);
		downloadCsv(`seguimiento-facturas-${(/* @__PURE__ */ new Date()).toISOString().slice(0, 10)}.csv`, csv);
		toast.success(`Exportadas ${filtered.length} facturas a Excel (CSV)`);
	}
	function exportSelected() {
		const rows = selectedInvoices();
		if (rows.length === 0) {
			toast.error("Selecciona al menos una factura");
			return;
		}
		const csv = invoicesToCsv(rows, lawyers);
		downloadCsv(`facturas-seleccionadas-${(/* @__PURE__ */ new Date()).toISOString().slice(0, 10)}.csv`, csv);
		toast.success(`Exportadas ${rows.length} seleccionadas`);
	}
	async function onBatchRequestAdmin() {
		setBusy(true);
		try {
			const n = await batchRequestAdmin([...selected]);
			if (n === 0) toast.message("Ninguna seleccionada está en borrador");
			else toast.success(`${n} factura(s) solicitadas a Administración`);
			setSelected(/* @__PURE__ */ new Set());
		} catch (e) {
			toast.error(e instanceof Error ? e.message : "Error en lote");
		} finally {
			setBusy(false);
		}
	}
	async function onBatchSendClient() {
		setBusy(true);
		try {
			const n = await batchMarkSentToClient([...selected]);
			if (n === 0) toast.message("Ninguna seleccionada está en estado Emitida");
			else toast.success(`${n} factura(s) marcadas como enviadas al cliente`);
			setSelected(/* @__PURE__ */ new Set());
		} catch (e) {
			toast.error(e instanceof Error ? e.message : "Error en lote");
		} finally {
			setBusy(false);
		}
	}
	async function onBatchOverdue() {
		setBusy(true);
		try {
			const n = await batchRefreshOverdue([...selected]);
			if (n === 0) toast.message("No había facturas nuevas que marcar como vencidas");
			else toast.success(`${n} factura(s) actualizadas a vencida`);
			setSelected(/* @__PURE__ */ new Set());
		} catch (e) {
			toast.error(e instanceof Error ? e.message : "Error en lote");
		} finally {
			setBusy(false);
		}
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
						children: "Datos del servidor · filtros y acciones en lote por rol"
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex flex-wrap gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						asChild: true,
						variant: "outline",
						className: "shrink-0",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
							to: "/hoy",
							children: "Ver pendientes de hoy"
						})
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
						type: "button",
						variant: "secondary",
						className: "shrink-0",
						onClick: exportAllFiltered,
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Download, { className: "size-4" }), "Exportar filtradas"]
					})]
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
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardHeader, {
					className: "pb-3",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex flex-wrap items-center justify-between gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, {
							className: "text-base",
							children: "Filtros avanzados"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardDescription, { children: "Cliente, expediente, referencia, estado, letrado y fechas" })] }), activeFilterCount > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
							type: "button",
							variant: "ghost",
							size: "sm",
							onClick: clearFilters,
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FunnelX, { className: "size-3.5" }),
								"Limpiar (",
								activeFilterCount,
								")"
							]
						})]
					})
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, {
					className: "space-y-4",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "relative min-w-0",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Search, { className: "pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-subtle" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								className: "pl-9",
								placeholder: "Buscar por cliente, expediente o referencia…",
								value: q,
								onChange: (e) => setQ(e.target.value),
								"aria-label": "Buscar facturas"
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "grid gap-3 sm:grid-cols-2 lg:grid-cols-4",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "space-y-1.5",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Estado" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
										value: status,
										onChange: (e) => setStatus(e.target.value),
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
											value: "all",
											children: "Todos los estados"
										}), STATUS_ORDER.map((s) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
											value: s,
											children: STATUS_LABELS[s]
										}, s))]
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "space-y-1.5",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Letrado responsable" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
										value: lawyerId,
										onChange: (e) => setLawyerId(e.target.value),
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
											value: "all",
											children: "Todos los letrados"
										}), lawyers.map((l) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
											value: l.id,
											children: l.name
										}, l.id))]
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "space-y-1.5",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Campo de fecha" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
										value: dateField,
										onChange: (e) => setDateField(e.target.value),
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
											value: "createdAt",
											children: "Fecha de creación"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
											value: "dueDate",
											children: "Fecha de vencimiento"
										})]
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "grid grid-cols-2 gap-2",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "space-y-1.5",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Desde" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
											type: "date",
											value: dateFrom,
											onChange: (e) => setDateFrom(e.target.value)
										})]
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "space-y-1.5",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Hasta" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
											type: "date",
											value: dateTo,
											onChange: (e) => setDateTo(e.target.value)
										})]
									})]
								})
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex flex-wrap gap-4 rounded-lg border border-border bg-bg px-3 py-3",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Checkbox, {
								id: "only-overdue",
								checked: onlyOverdue,
								onChange: (e) => setOnlyOverdue(e.target.checked),
								label: "Solo vencidas"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Checkbox, {
								id: "only-action",
								checked: onlyAction,
								onChange: (e) => setOnlyAction(e.target.checked),
								label: "Solo pendientes de acción"
							})]
						})
					]
				})]
			}),
			someSelected && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "sticky top-14 z-20 flex flex-col gap-3 rounded-xl border border-border bg-surface p-3 shadow-md sm:flex-row sm:items-center sm:justify-between",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center gap-2 text-sm",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "inline-flex h-7 min-w-7 items-center justify-center rounded-full bg-primary px-2 text-xs font-semibold text-primary-fg tabular",
							children: selected.size
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "font-medium",
							children: ["seleccionada", selected.size === 1 ? "" : "s"]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
							type: "button",
							variant: "ghost",
							size: "sm",
							onClick: () => setSelected(/* @__PURE__ */ new Set()),
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "size-3.5" }), "Deseleccionar"]
						})
					]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex flex-wrap gap-2",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
							type: "button",
							size: "sm",
							variant: "secondary",
							disabled: busy,
							onClick: () => void onBatchRequestAdmin(),
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Mail, { className: "size-3.5" }), "Solicitar a Admin"]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
							type: "button",
							size: "sm",
							variant: "secondary",
							disabled: busy,
							onClick: () => void onBatchSendClient(),
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Send, { className: "size-3.5" }), "Marcar enviada"]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
							type: "button",
							size: "sm",
							variant: "secondary",
							disabled: busy,
							onClick: () => void onBatchOverdue(),
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(RefreshCw, { className: "size-3.5" }), "Actualizar vencidas"]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
							type: "button",
							size: "sm",
							onClick: exportSelected,
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Download, { className: "size-3.5" }), "Exportar selección"]
						})
					]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, {
				className: "min-w-0",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardContent, {
					className: "min-w-0 overflow-x-auto p-0",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("table", {
						className: "w-full min-w-[960px] text-left text-sm",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("thead", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
							className: "border-b border-border bg-bg text-xs uppercase tracking-wide text-muted",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
									className: "w-12 px-4 py-3",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Checkbox, {
										id: "select-all",
										checked: allVisibleSelected,
										onChange: toggleAllVisible,
										"aria-label": "Seleccionar todas las visibles"
									})
								}),
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
							colSpan: 8,
							className: "px-4 py-10 text-center text-muted",
							children: "No hay facturas con estos filtros"
						}) }), filtered.map((inv) => {
							const lawyer = lawyers.find((l) => l.id === inv.lawyerId);
							const total = invoiceTotal(inv);
							const isSel = selected.has(inv.id);
							return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
								className: cn("border-b border-border/70 last:border-0 hover:bg-surface-2/60", isSel && "bg-info-bg/40"),
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
										className: "px-4 py-3",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Checkbox, {
											id: `sel-${inv.id}`,
											checked: isSel,
											onChange: () => toggleOne(inv.id),
											"aria-label": `Seleccionar ${inv.ref}`
										})
									}),
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
