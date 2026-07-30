import { o as __toESM } from "../_runtime.mjs";
import { n as require_react } from "../_libs/@radix-ui/react-compose-refs+[...].mjs";
import { _ as mailtoHref, d as buildClientEmail, g as invoiceTotal, h as invoiceIva, m as formatDateEs, p as formatCurrency, u as buildAdminEmail } from "./types-FkcXPGqw.mjs";
import { g as Link, v as useNavigate } from "../_libs/@tanstack/react-router+[...].mjs";
import { i as require_jsx_runtime } from "../_libs/@radix-ui/react-label+[...].mjs";
import { t as cn } from "./createSsrRpc-_1pjCroF.mjs";
import { a as useBillingStore, n as listInvoiceEventsFn } from "./store-Cs4R4P7Z.mjs";
import { a as CardHeader, i as CardDescription, n as Card, o as CardTitle, r as CardContent, t as Button } from "./card-3GAOvsnF.mjs";
import { n as Label, t as Input } from "./label-BBpU3UnU.mjs";
import { t as Textarea } from "./textarea-DYcVqY0u.mjs";
import { t as Select } from "./select-BwF8MM6y.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { B as ArrowLeft, C as FolderOpen, I as CircleCheck, L as Check, P as Copy, _ as Mail, a as Trash2, j as ExternalLink, u as Send, x as History } from "../_libs/lucide-react.mjs";
import { t as EVENT_TYPE_LABELS } from "./audit-DFUmXwe9.mjs";
import { t as Route } from "./facturas._id-BqZZ0nEz.mjs";
import { t as StatusBadge } from "./StatusBadge-DZ9msNwd.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/facturas._id-CE86ezmF.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var steps = [
	{
		key: "concepto",
		label: "Concepto",
		statuses: ["borrador"]
	},
	{
		key: "admin",
		label: "Email Admin",
		statuses: ["solicitada_admin"]
	},
	{
		key: "archivo",
		label: "SharePoint",
		statuses: ["emitida"]
	},
	{
		key: "cliente",
		label: "Email cliente",
		statuses: ["enviada_cliente"]
	},
	{
		key: "cobro",
		label: "Cobro",
		statuses: [
			"parcial",
			"pagada",
			"vencida"
		]
	}
];
function stepIndex(status) {
	switch (status) {
		case "borrador": return 0;
		case "solicitada_admin": return 1;
		case "emitida": return 2;
		case "enviada_cliente": return 3;
		case "parcial":
		case "pagada":
		case "vencida": return 4;
		default: return 0;
	}
}
function WorkflowSteps({ status }) {
	const current = stepIndex(status);
	const paid = status === "pagada";
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ol", {
		className: "grid grid-cols-2 gap-2 sm:grid-cols-5",
		children: steps.map((step, i) => {
			const done = i < current || i === current && paid && i === 4;
			const active = i === current && !done;
			return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
				className: cn("flex items-center gap-2 rounded-lg border px-3 py-2.5 text-xs font-medium", done && "border-success/30 bg-success-bg text-success", active && "border-accent/40 bg-info-bg text-info", !done && !active && "border-border bg-surface text-muted"),
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: cn("flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[11px]", done && "bg-success text-white", active && "bg-accent text-primary-fg", !done && !active && "bg-surface-2 text-muted"),
					children: done ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Check, { className: "size-3.5" }) : i + 1
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "leading-tight",
					children: step.label
				})]
			}, step.key);
		})
	});
}
function CopyButton({ text, label = "Copiar" }) {
	const [done, setDone] = (0, import_react.useState)(false);
	async function onCopy() {
		try {
			await navigator.clipboard.writeText(text);
			setDone(true);
			toast.success("Copiado al portapapeles");
			setTimeout(() => setDone(false), 1500);
		} catch {
			toast.error("No se pudo copiar");
		}
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
		type: "button",
		variant: "secondary",
		size: "sm",
		onClick: onCopy,
		children: [done ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Check, { className: "size-3.5" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Copy, { className: "size-3.5" }), label]
	});
}
var TYPE_STYLES = {
	created: "bg-info-bg text-info",
	status_change: "bg-surface-2 text-fg",
	email_admin: "bg-warn-bg text-warn",
	email_client: "bg-warn-bg text-warn",
	payment: "bg-success-bg text-success",
	field_edit: "bg-surface-2 text-muted",
	deleted: "bg-danger-bg text-danger",
	note: "bg-surface-2 text-muted"
};
function InvoiceHistory({ invoiceId }) {
	const [events, setEvents] = (0, import_react.useState)([]);
	const [loading, setLoading] = (0, import_react.useState)(true);
	const [error, setError] = (0, import_react.useState)(null);
	const [tick, setTick] = (0, import_react.useState)(0);
	(0, import_react.useEffect)(() => {
		let cancelled = false;
		setLoading(true);
		setError(null);
		listInvoiceEventsFn({ data: { invoiceId } }).then((rows) => {
			if (!cancelled) setEvents(rows);
		}).catch((err) => {
			if (!cancelled) {
				setError(err instanceof Error ? err.message : "Error al cargar historial");
				setEvents([]);
			}
		}).finally(() => {
			if (!cancelled) setLoading(false);
		});
		return () => {
			cancelled = true;
		};
	}, [invoiceId, tick]);
	(0, import_react.useEffect)(() => {
		const handler = (e) => {
			const detail = e.detail;
			if (!detail?.invoiceId || detail.invoiceId === invoiceId) setTick((t) => t + 1);
		};
		window.addEventListener("facturaflow:history-refresh", handler);
		return () => window.removeEventListener("facturaflow:history-refresh", handler);
	}, [invoiceId]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardHeader, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardTitle, {
		className: "flex items-center gap-2 text-base",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(History, { className: "size-4" }), "Historial"]
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardDescription, { children: "Registro de solo lectura: estados, correos, cobros y ediciones" })] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, { children: [
		loading && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "text-sm text-muted",
			children: "Cargando historial…"
		}),
		error && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "text-sm text-danger",
			children: error
		}),
		!loading && !error && events.length === 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "text-sm text-muted",
			children: "Aún no hay eventos registrados en esta factura."
		}),
		!loading && events.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ol", {
			className: "relative space-y-0 border-l border-border pl-4",
			children: events.map((ev) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
				className: "relative pb-5 last:pb-0",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "absolute -left-[1.3rem] top-1.5 h-2.5 w-2.5 rounded-full border-2 border-surface bg-primary" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex flex-wrap items-center gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: cn("rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide", TYPE_STYLES[ev.eventType] ?? TYPE_STYLES.note),
							children: EVENT_TYPE_LABELS[ev.eventType] ?? ev.eventType
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("time", {
							className: "text-[11px] text-muted tabular",
							children: formatDateTimeEs(ev.createdAt)
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-1 text-sm font-medium text-fg",
						children: ev.summary
					}),
					ev.detail && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("pre", {
						className: "mt-1 whitespace-pre-wrap font-sans text-xs text-muted",
						children: ev.detail
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "mt-1 text-[11px] text-subtle",
						children: [ev.actorName || ev.actorEmail || "Sistema", ev.actorEmail && ev.actorName ? ` · ${ev.actorEmail}` : ""]
					})
				]
			}, ev.id))
		})
	] })] });
}
function formatDateTimeEs(iso) {
	try {
		const d = new Date(iso);
		return new Intl.DateTimeFormat("es-ES", {
			dateStyle: "short",
			timeStyle: "short"
		}).format(d);
	} catch {
		return formatDateEs(iso);
	}
}
/** Call after mutations so the history panel reloads. */
function refreshInvoiceHistory(invoiceId) {
	if (typeof window === "undefined") return;
	window.dispatchEvent(new CustomEvent("facturaflow:history-refresh", { detail: { invoiceId } }));
}
function FacturaDetailPage() {
	const { id } = Route.useParams();
	const invoice = useBillingStore((s) => s.invoices.find((i) => i.id === id));
	if (!invoice) return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mx-auto max-w-lg py-16 text-center",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "text-xl font-semibold",
				children: "Factura no encontrada"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-2 text-sm text-muted",
				children: "Puede haber sido eliminada o el enlace no es válido."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				asChild: true,
				className: "mt-6",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
					to: "/facturas",
					children: "Volver al seguimiento"
				})
			})
		]
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FacturaDetail, { invoice });
}
function FacturaDetail({ invoice }) {
	const navigate = useNavigate();
	const lawyers = useBillingStore((s) => s.lawyers);
	const settings = useBillingStore((s) => s.settings);
	const requestAdmin = useBillingStore((s) => s.requestAdmin);
	const markIssued = useBillingStore((s) => s.markIssued);
	const markSentToClient = useBillingStore((s) => s.markSentToClient);
	const registerPayment = useBillingStore((s) => s.registerPayment);
	const updateInvoice = useBillingStore((s) => s.updateInvoice);
	const deleteInvoice = useBillingStore((s) => s.deleteInvoice);
	const refreshEmails = useBillingStore((s) => s.refreshEmails);
	const sendAdminEmail = useBillingStore((s) => s.sendAdminEmail);
	const sendClientEmail = useBillingStore((s) => s.sendClientEmail);
	const [invoiceNumber, setInvoiceNumber] = (0, import_react.useState)(invoice.invoiceNumber);
	const [sendingAdmin, setSendingAdmin] = (0, import_react.useState)(false);
	const [sendingClient, setSendingClient] = (0, import_react.useState)(false);
	const [payment, setPayment] = (0, import_react.useState)("");
	const [adminSubject, setAdminSubject] = (0, import_react.useState)("");
	const [adminBody, setAdminBody] = (0, import_react.useState)("");
	const [clientSubject, setClientSubject] = (0, import_react.useState)("");
	const [clientBody, setClientBody] = (0, import_react.useState)("");
	const lawyer = lawyers.find((l) => l.id === invoice.lawyerId);
	(0, import_react.useEffect)(() => {
		const admin = invoice.adminEmailBody ? {
			subject: invoice.adminEmailSubject ?? "",
			body: invoice.adminEmailBody
		} : buildAdminEmail(invoice, lawyer, settings);
		const client = invoice.clientEmailBody ? {
			subject: invoice.clientEmailSubject ?? "",
			body: invoice.clientEmailBody
		} : buildClientEmail(invoice, lawyer, settings);
		setAdminSubject(admin.subject);
		setAdminBody(admin.body);
		setClientSubject(client.subject);
		setClientBody(client.body);
		setInvoiceNumber(invoice.invoiceNumber);
	}, [
		invoice.id,
		invoice.status,
		invoice.invoiceNumber,
		invoice.adminEmailBody,
		invoice.clientEmailBody,
		invoice.remitente,
		lawyer,
		settings
	]);
	const total = invoiceTotal(invoice);
	const iva = invoiceIva(invoice);
	const pending = Math.max(0, total - (invoice.paidAmount || 0));
	async function onRequestAdmin() {
		try {
			await updateInvoice(invoice.id, {
				adminEmailSubject: adminSubject,
				adminEmailBody: adminBody
			});
			await requestAdmin(invoice.id);
			const fresh = useBillingStore.getState().invoices.find((i) => i.id === invoice.id);
			if (fresh?.adminEmailSubject) {
				setAdminSubject(fresh.adminEmailSubject);
				setAdminBody(fresh.adminEmailBody ?? "");
			}
			toast.success("Marcada como solicitada a Administración");
			refreshInvoiceHistory(invoice.id);
		} catch (e) {
			toast.error(e instanceof Error ? e.message : "Error al solicitar");
		}
	}
	async function onMarkIssued() {
		if (!invoiceNumber.trim()) {
			toast.error("Introduce el nº de factura de SAGE");
			return;
		}
		try {
			await markIssued(invoice.id, invoiceNumber);
			const fresh = useBillingStore.getState().invoices.find((i) => i.id === invoice.id);
			if (fresh) {
				setClientSubject(fresh.clientEmailSubject ?? "");
				setClientBody(fresh.clientEmailBody ?? "");
			}
			toast.success("Factura marcada como emitida (SAGE/LEXNEXT)");
			refreshInvoiceHistory(invoice.id);
		} catch (e) {
			toast.error(e instanceof Error ? e.message : "Error al emitir");
		}
	}
	async function onSendClient() {
		try {
			await updateInvoice(invoice.id, {
				clientEmailSubject: clientSubject,
				clientEmailBody: clientBody
			});
			await markSentToClient(invoice.id);
			toast.success("Marcada como enviada al cliente");
			refreshInvoiceHistory(invoice.id);
		} catch (e) {
			toast.error(e instanceof Error ? e.message : "Error al enviar");
		}
	}
	async function onPayment(full) {
		try {
			if (full) {
				await registerPayment(invoice.id, 0, true);
				toast.success("Registrado cobro total");
				refreshInvoiceHistory(invoice.id);
				return;
			}
			const amount = Number(payment.replace(",", "."));
			if (!amount || amount <= 0) {
				toast.error("Importe de cobro no válido");
				return;
			}
			await registerPayment(invoice.id, amount);
			setPayment("");
			toast.success("Cobro registrado");
			refreshInvoiceHistory(invoice.id);
		} catch (e) {
			toast.error(e instanceof Error ? e.message : "Error al registrar cobro");
		}
	}
	async function onDelete() {
		if (!confirm("¿Eliminar esta factura del panel?")) return;
		try {
			await deleteInvoice(invoice.id);
			toast.success("Eliminada");
			navigate({ to: "/facturas" });
		} catch (e) {
			toast.error(e instanceof Error ? e.message : "Error al eliminar");
		}
	}
	async function saveEmailEdits() {
		try {
			await updateInvoice(invoice.id, {
				adminEmailSubject: adminSubject,
				adminEmailBody: adminBody,
				clientEmailSubject: clientSubject,
				clientEmailBody: clientBody
			});
			toast.success("Textos de email guardados");
			refreshInvoiceHistory(invoice.id);
		} catch (e) {
			toast.error(e instanceof Error ? e.message : "Error al guardar");
		}
	}
	async function onSendAdminEmail() {
		setSendingAdmin(true);
		try {
			const result = await sendAdminEmail(invoice.id, {
				subject: adminSubject,
				body: adminBody
			});
			setAdminSubject(result.subject);
			setAdminBody(result.invoice.adminEmailBody ?? adminBody);
			if (result.mode === "simulated") {
				try {
					await navigator.clipboard.writeText(`Para: ${result.to}\nAsunto: ${result.subject}\n\n${adminBody}`);
				} catch {}
				toast.message("Modo prueba (sin RESEND_API_KEY)", { description: result.message + " Contenido copiado al portapapeles." });
			} else toast.success(result.message);
			refreshInvoiceHistory(invoice.id);
		} catch (e) {
			toast.error(e instanceof Error ? e.message : "Error al enviar");
		} finally {
			setSendingAdmin(false);
		}
	}
	async function onSendClientEmail() {
		setSendingClient(true);
		try {
			const result = await sendClientEmail(invoice.id, {
				subject: clientSubject,
				body: clientBody
			});
			setClientSubject(result.subject);
			setClientBody(result.invoice.clientEmailBody ?? clientBody);
			if (result.mode === "simulated") {
				try {
					await navigator.clipboard.writeText(`Para: ${result.to}\nAsunto: ${result.subject}\n\n${clientBody}`);
				} catch {}
				toast.message("Modo prueba (sin RESEND_API_KEY)", { description: result.message + " Contenido copiado al portapapeles." });
			} else toast.success(result.message);
			refreshInvoiceHistory(invoice.id);
		} catch (e) {
			toast.error(e instanceof Error ? e.message : "Error al enviar");
		} finally {
			setSendingClient(false);
		}
	}
	const adminMailto = mailtoHref(settings.adminEmail, adminSubject, adminBody);
	const clientMailto = mailtoHref(invoice.clientEmail || "", clientSubject, clientBody);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mx-auto flex max-w-5xl flex-col gap-6",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex flex-col gap-4",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex flex-wrap items-center gap-2",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							asChild: true,
							variant: "ghost",
							size: "sm",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
								to: "/facturas",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowLeft, { className: "size-4" }), "Seguimiento"]
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatusBadge, { status: invoice.status }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "text-xs text-muted tabular",
							children: invoice.ref
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
						className: "text-2xl font-semibold tracking-tight",
						children: invoice.clientName
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "mt-1 text-sm text-muted",
						children: [
							invoice.expediente,
							invoice.invoiceNumber ? ` · Factura ${invoice.invoiceNumber}` : "",
							lawyer ? ` · ${lawyer.name}` : ""
						]
					})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "sm:text-right",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-xs font-medium uppercase tracking-wide text-muted",
								children: "Total"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-2xl font-semibold tabular",
								children: formatCurrency(total)
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: "text-xs text-muted",
								children: ["Pendiente: ", formatCurrency(pending)]
							})
						]
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(WorkflowSteps, { status: invoice.status })
			]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "grid gap-4 lg:grid-cols-3",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
				className: "lg:col-span-1",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardHeader, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, { children: "Resumen" }) }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, {
					className: "space-y-3 text-sm",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Row, {
							label: "Concepto",
							value: invoice.concepto
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Row, {
							label: "Base",
							value: formatCurrency(invoice.baseAmount)
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Row, {
							label: `IVA ${invoice.ivaRate}%`,
							value: formatCurrency(iva)
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Row, {
							label: "Suplidos",
							value: formatCurrency(invoice.suplidos)
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Row, {
							label: "NIF/CIF",
							value: invoice.clientNif || "—"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Row, {
							label: "Email cliente",
							value: invoice.clientEmail || "—"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Row, {
							label: "Remite",
							value: invoice.remitente === "administracion" ? "Administración" : "Abogado"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Row, {
							label: "Creada",
							value: formatDateEs(invoice.createdAt)
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Row, {
							label: "Vencimiento",
							value: formatDateEs(invoice.dueDate)
						}),
						invoice.sourceFile && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Row, {
							label: "Origen",
							value: invoice.sourceFile
						}),
						invoice.notes && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Row, {
							label: "Notas",
							value: invoice.notes
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "space-y-1.5 border-t border-border pt-3",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Quién remite al cliente" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
								value: invoice.remitente,
								onChange: (e) => {
									(async () => {
										try {
											await updateInvoice(invoice.id, { remitente: e.target.value });
											await refreshEmails(invoice.id);
										} catch (err) {
											toast.error(err instanceof Error ? err.message : "Error al actualizar");
										}
									})();
								},
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
									value: "abogado",
									children: "Abogado"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
									value: "administracion",
									children: "Administración"
								})]
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
							type: "button",
							variant: "outline",
							size: "sm",
							className: "w-full text-danger",
							onClick: () => void onDelete(),
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, { className: "size-3.5" }), "Eliminar del panel"]
						})
					]
				})]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-col gap-4 lg:col-span-2",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardHeader, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardTitle, {
						className: "flex items-center gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "flex h-6 w-6 items-center justify-center rounded-full bg-primary text-xs text-primary-fg",
							children: "2"
						}), "Email a Administración (SAGE + LEXNEXT)"]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardDescription, { children: "Genera el correo para que Admin emita la factura en SAGE y la registre en LEXNEXT" })] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, {
						className: "space-y-3",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "space-y-1.5",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Asunto" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
									value: adminSubject,
									onChange: (e) => setAdminSubject(e.target.value)
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "space-y-1.5",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Cuerpo" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, {
									className: "min-h-[200px] font-mono text-xs leading-relaxed",
									value: adminBody,
									onChange: (e) => setAdminBody(e.target.value)
								})]
							}),
							invoice.adminEmailSentAt && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: "text-xs text-muted",
								children: ["Último envío a Admin: ", formatDateEs(invoice.adminEmailSentAt)]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex flex-wrap gap-2",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
										type: "button",
										size: "sm",
										disabled: sendingAdmin,
										onClick: () => void onSendAdminEmail(),
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Send, { className: "size-3.5" }), sendingAdmin ? "Enviando…" : "Enviar a Administración"]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CopyButton, {
										text: `${adminSubject}\n\n${adminBody}`,
										label: "Copiar email"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
										asChild: true,
										variant: "secondary",
										size: "sm",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("a", {
											href: adminMailto,
											children: [
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Mail, { className: "size-3.5" }),
												"Abrir en correo",
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ExternalLink, { className: "size-3" })
											]
										})
									}),
									invoice.status === "borrador" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
										type: "button",
										variant: "outline",
										size: "sm",
										onClick: () => void onRequestAdmin(),
										children: "Solo marcar solicitada"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
										type: "button",
										variant: "ghost",
										size: "sm",
										onClick: () => void saveEmailEdits(),
										children: "Guardar cambios"
									})
								]
							})
						]
					})] }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardHeader, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardTitle, {
						className: "flex items-center gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "flex h-6 w-6 items-center justify-center rounded-full bg-primary text-xs text-primary-fg",
							children: "3"
						}), "Archivo en SharePoint"]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardDescription, { children: "Deja el PDF aquí para evitar hilos de email y búsquedas manuales" })] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, {
						className: "space-y-3",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-start gap-3 rounded-xl border border-border bg-bg p-4",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FolderOpen, { className: "mt-0.5 size-5 shrink-0 text-accent" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "min-w-0 flex-1",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "text-xs font-medium uppercase tracking-wide text-muted",
										children: "Ruta propuesta"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "mt-1 break-all font-mono text-sm text-fg",
										children: invoice.sharePointPath
									})]
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "space-y-1.5",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Ajustar ruta si el caso lo requiere" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
									value: invoice.sharePointPath,
									onChange: (e) => updateInvoice(invoice.id, { sharePointPath: e.target.value })
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "flex flex-wrap gap-2",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CopyButton, {
									text: invoice.sharePointPath,
									label: "Copiar ruta"
								})
							}),
							(invoice.status === "solicitada_admin" || invoice.status === "emitida") && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "rounded-xl border border-border bg-surface-2/50 p-4",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "text-sm font-medium",
										children: "Registrar emisión (nº SAGE / LEXNEXT)"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "mt-1 text-xs text-muted",
										children: "Cuando Admin haya emitido y archivado el PDF, indica el número de factura."
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "mt-3 flex flex-col gap-2 sm:flex-row",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
											placeholder: "Ej. 2026/0115",
											value: invoiceNumber,
											onChange: (e) => setInvoiceNumber(e.target.value)
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
											type: "button",
											onClick: () => void onMarkIssued(),
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleCheck, { className: "size-4" }), "Marcar emitida"]
										})]
									})
								]
							})
						]
					})] }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardHeader, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardTitle, {
						className: "flex items-center gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "flex h-6 w-6 items-center justify-center rounded-full bg-primary text-xs text-primary-fg",
							children: "4"
						}), "Email personalizado al cliente"]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardDescription, { children: [
						"Listo para que el",
						" ",
						invoice.remitente === "administracion" ? "equipo de Administración" : "abogado",
						" ",
						"remita la factura (adjuntar PDF desde SharePoint)"
					] })] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, {
						className: "space-y-3",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "space-y-1.5",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Para" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
									value: invoice.clientEmail,
									onChange: (e) => updateInvoice(invoice.id, { clientEmail: e.target.value }),
									placeholder: "email@cliente.es"
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "space-y-1.5",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Asunto" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
									value: clientSubject,
									onChange: (e) => setClientSubject(e.target.value)
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "space-y-1.5",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Cuerpo" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, {
									className: "min-h-[180px] font-mono text-xs leading-relaxed",
									value: clientBody,
									onChange: (e) => setClientBody(e.target.value)
								})]
							}),
							invoice.clientEmailSentAt && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: "text-xs text-muted",
								children: [
									"Último envío al cliente:",
									" ",
									formatDateEs(invoice.clientEmailSentAt)
								]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex flex-wrap gap-2",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
										type: "button",
										size: "sm",
										disabled: sendingClient || !invoice.clientEmail,
										onClick: () => void onSendClientEmail(),
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Send, { className: "size-3.5" }), sendingClient ? "Enviando…" : "Enviar al Cliente"]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CopyButton, {
										text: `${clientSubject}\n\n${clientBody}`,
										label: "Copiar email"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
										asChild: true,
										variant: "secondary",
										size: "sm",
										disabled: !invoice.clientEmail,
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("a", {
											href: invoice.clientEmail ? clientMailto : void 0,
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Mail, { className: "size-3.5" }), "Abrir en correo"]
										})
									}),
									["emitida", "enviada_cliente"].includes(invoice.status) && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
										type: "button",
										variant: "outline",
										size: "sm",
										onClick: () => void onSendClient(),
										children: "Solo marcar enviada"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
										type: "button",
										variant: "ghost",
										size: "sm",
										onClick: () => void saveEmailEdits(),
										children: "Guardar cambios"
									})
								]
							})
						]
					})] }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardHeader, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardTitle, {
						className: "flex items-center gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "flex h-6 w-6 items-center justify-center rounded-full bg-primary text-xs text-primary-fg",
							children: "5"
						}), "Seguimiento de cobro"]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardDescription, { children: "Registra pagos parciales o totales sin depender de Excel manual" })] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, {
						className: "space-y-4",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "grid gap-3 sm:grid-cols-3",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Mini, {
										label: "Total",
										value: formatCurrency(total)
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Mini, {
										label: "Cobrado",
										value: formatCurrency(invoice.paidAmount || 0)
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Mini, {
										label: "Pendiente",
										value: formatCurrency(pending)
									})
								]
							}),
							invoice.status !== "borrador" && invoice.status !== "solicitada_admin" && invoice.status !== "pagada" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex flex-col gap-2 sm:flex-row",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
										type: "number",
										min: 0,
										step: "0.01",
										placeholder: "Importe cobrado",
										value: payment,
										onChange: (e) => setPayment(e.target.value)
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
										type: "button",
										variant: "secondary",
										onClick: () => void onPayment(),
										children: "Registrar cobro"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
										type: "button",
										onClick: () => void onPayment(true),
										children: "Marcar pagada"
									})
								]
							}),
							invoice.status === "pagada" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: "rounded-lg bg-success-bg px-3 py-2 text-sm text-success",
								children: [
									"Cobro completo registrado",
									invoice.paidAt ? ` el ${formatDateEs(invoice.paidAt)}` : "",
									"."
								]
							})
						]
					})] }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(InvoiceHistory, { invoiceId: invoice.id })
				]
			})]
		})]
	});
}
function Row({ label, value }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
		className: "text-[11px] font-medium uppercase tracking-wide text-muted",
		children: label
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
		className: "mt-0.5 whitespace-pre-wrap text-fg",
		children: value
	})] });
}
function Mini({ label, value }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "rounded-lg border border-border bg-bg px-3 py-2.5",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "text-[11px] font-medium uppercase tracking-wide text-muted",
			children: label
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "mt-0.5 font-semibold tabular",
			children: value
		})]
	});
}
//#endregion
export { FacturaDetailPage as component };
