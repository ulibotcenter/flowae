import { i as __toESM } from "../_runtime.mjs";
import { n as require_react } from "../_libs/@radix-ui/react-compose-refs+[...].mjs";
import { i as formatCurrency, l as useBillingStore, s as invoiceTotal } from "./store-BPhrqMPB.mjs";
import { i as require_jsx_runtime } from "../_libs/@radix-ui/react-label+[...].mjs";
import { a as CardHeader, i as CardDescription, n as Card, o as CardTitle, r as CardContent, t as Button } from "./card-BzzuZRXz.mjs";
import { t as Input } from "./input-Bmbc6647.mjs";
import { n as Textarea, t as Label } from "./label-DBGO6uug.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { o as Sparkles, r as Upload, v as FileUp } from "../_libs/lucide-react.mjs";
import { _ as useNavigate } from "../_libs/@tanstack/react-router+[...].mjs";
import { t as Select } from "./select-B7L2Cihh.mjs";
import { r as parseConceptCsv } from "./export-BHKKzZXy.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/nueva-ByUg9Mxc.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var emptyDraft = (lawyerId, iva) => ({
	clientName: "",
	clientEmail: "",
	clientNif: "",
	expediente: "",
	concepto: "",
	baseAmount: 0,
	ivaRate: iva,
	suplidos: 0,
	lawyerId,
	remitente: "abogado",
	notes: ""
});
function NuevaPage() {
	const navigate = useNavigate();
	const lawyers = useBillingStore((s) => s.lawyers);
	const settings = useBillingStore((s) => s.settings);
	const createFromDraft = useBillingStore((s) => s.createFromDraft);
	const [draft, setDraft] = (0, import_react.useState)(() => emptyDraft(lawyers[0]?.id ?? "", settings.defaultIva));
	const [paste, setPaste] = (0, import_react.useState)("");
	const [sourceHint, setSourceHint] = (0, import_react.useState)("");
	const total = (0, import_react.useMemo)(() => invoiceTotal({
		baseAmount: draft.baseAmount || 0,
		ivaRate: draft.ivaRate || 0,
		suplidos: draft.suplidos || 0
	}), [
		draft.baseAmount,
		draft.ivaRate,
		draft.suplidos
	]);
	function patch(key, value) {
		setDraft((d) => ({
			...d,
			[key]: value
		}));
	}
	function applyParsed(rows, fileName) {
		const row = rows[0];
		if (!row) {
			toast.error("No se detectó ningún concepto en el archivo o texto");
			return;
		}
		setDraft((d) => ({
			...d,
			clientName: String(row.clientName ?? d.clientName),
			clientEmail: String(row.clientEmail ?? d.clientEmail),
			clientNif: String(row.clientNif ?? d.clientNif),
			expediente: String(row.expediente ?? d.expediente),
			concepto: String(row.concepto ?? d.concepto),
			baseAmount: typeof row.baseAmount === "number" ? row.baseAmount : d.baseAmount,
			ivaRate: typeof row.ivaRate === "number" ? row.ivaRate : d.ivaRate || settings.defaultIva,
			suplidos: typeof row.suplidos === "number" ? row.suplidos : d.suplidos,
			notes: String(row.notes ?? d.notes),
			sourceFile: fileName || d.sourceFile || "importación SharePoint"
		}));
		setSourceHint(fileName || "Texto pegado / exportación SharePoint");
		toast.success(rows.length > 1 ? `Se importó el primer concepto de ${rows.length} filas detectadas` : "Concepto importado correctamente");
	}
	async function onFile(file) {
		if (!file) return;
		applyParsed(parseConceptCsv(await file.text()), file.name);
	}
	function onImportPaste() {
		applyParsed(parseConceptCsv(paste));
	}
	function onSubmit(e) {
		e.preventDefault();
		if (!draft.clientName.trim() || !draft.expediente.trim() || !draft.concepto.trim()) {
			toast.error("Cliente, expediente y concepto son obligatorios");
			return;
		}
		if (!draft.baseAmount || draft.baseAmount <= 0) {
			toast.error("Indica una base imponible válida");
			return;
		}
		const inv = createFromDraft(draft);
		toast.success(`Borrador ${inv.ref} creado`);
		navigate({
			to: "/facturas/$id",
			params: { id: inv.id }
		});
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mx-auto flex max-w-4xl flex-col gap-6",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
			className: "text-2xl font-semibold tracking-tight",
			children: "Nueva facturación"
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "mt-1 text-sm text-muted",
			children: "Extrae el concepto desde Excel/Word de SharePoint o introdúcelo manualmente"
		})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "grid gap-4 lg:grid-cols-5",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
				className: "lg:col-span-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardHeader, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardTitle, {
					className: "flex items-center gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FileUp, { className: "size-4" }), "Desde SharePoint"]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardDescription, { children: "Sube un CSV/Excel exportado o pega el contenido del Word/Excel del expediente" })] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, {
					className: "flex flex-col gap-4",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
							className: "flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-border-strong bg-bg px-4 py-8 text-center transition-colors hover:bg-surface-2",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Upload, { className: "size-6 text-muted" }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "text-sm font-medium",
									children: "Subir CSV / texto"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "text-xs text-muted",
									children: "Columnas: Cliente; Expediente; Concepto; Base; Email…"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
									type: "file",
									accept: ".csv,.txt,.tsv,text/csv,text/plain",
									className: "sr-only",
									onChange: (e) => onFile(e.target.files?.[0] ?? null)
								})
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "space-y-2",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Pegar desde Word / Excel" }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, {
									placeholder: `Cliente: Acme S.L.\nExpediente: CIV-2026-0100\nConcepto: Honorarios fase demanda\nBase: 2500\nEmail: facturas@acme.es\nNIF: B12345678`,
									value: paste,
									onChange: (e) => setPaste(e.target.value),
									className: "min-h-[140px] font-mono text-xs"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
									type: "button",
									variant: "secondary",
									className: "w-full",
									onClick: onImportPaste,
									disabled: !paste.trim(),
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Sparkles, { className: "size-4" }), "Extraer concepto"]
								})
							]
						}),
						sourceHint && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "rounded-md bg-info-bg px-3 py-2 text-xs text-info",
							children: ["Origen: ", sourceHint]
						})
					]
				})]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
				className: "lg:col-span-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardHeader, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, { children: "Datos del concepto" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardDescription, { children: "Revisa y completa antes de generar el flujo de facturación" })] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardContent, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
					className: "grid gap-4",
					onSubmit,
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "grid gap-3 sm:grid-cols-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
								label: "Cliente / razón social",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
									value: draft.clientName,
									onChange: (e) => patch("clientName", e.target.value),
									placeholder: "Ej. Inmobiliaria Norte S.L.",
									required: true
								})
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
								label: "NIF / CIF",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
									value: draft.clientNif,
									onChange: (e) => patch("clientNif", e.target.value),
									placeholder: "B12345678"
								})
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "grid gap-3 sm:grid-cols-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
								label: "Email del cliente",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
									type: "email",
									value: draft.clientEmail,
									onChange: (e) => patch("clientEmail", e.target.value),
									placeholder: "facturacion@cliente.es"
								})
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
								label: "Expediente",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
									value: draft.expediente,
									onChange: (e) => patch("expediente", e.target.value),
									placeholder: "CIV-2026-0412",
									required: true
								})
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
							label: "Concepto de facturación",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, {
								value: draft.concepto,
								onChange: (e) => patch("concepto", e.target.value),
								placeholder: "Descripción de honorarios y fase del procedimiento",
								required: true
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "grid gap-3 sm:grid-cols-3",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
									label: "Base imponible (€)",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
										type: "number",
										min: 0,
										step: "0.01",
										value: draft.baseAmount || "",
										onChange: (e) => patch("baseAmount", Number(e.target.value) || 0),
										required: true
									})
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
									label: "IVA %",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
										type: "number",
										min: 0,
										step: "1",
										value: draft.ivaRate,
										onChange: (e) => patch("ivaRate", Number(e.target.value) || 0)
									})
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
									label: "Suplidos (€)",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
										type: "number",
										min: 0,
										step: "0.01",
										value: draft.suplidos || "",
										onChange: (e) => patch("suplidos", Number(e.target.value) || 0)
									})
								})
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "grid gap-3 sm:grid-cols-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
								label: "Letrado responsable",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Select, {
									value: draft.lawyerId,
									onChange: (e) => patch("lawyerId", e.target.value),
									children: lawyers.map((l) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
										value: l.id,
										children: l.name
									}, l.id))
								})
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
								label: "Quién remite al cliente",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
									value: draft.remitente,
									onChange: (e) => patch("remitente", e.target.value),
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
										value: "abogado",
										children: "Abogado"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
										value: "administracion",
										children: "Administración"
									})]
								})
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
							label: "Observaciones internas",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, {
								value: draft.notes,
								onChange: (e) => patch("notes", e.target.value),
								placeholder: "Notas para Admin o para el email al cliente"
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex flex-col gap-3 rounded-xl border border-border bg-bg p-4 sm:flex-row sm:items-center sm:justify-between",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-xs font-medium uppercase tracking-wide text-muted",
								children: "Total estimado"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-2xl font-semibold tabular",
								children: formatCurrency(total)
							})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								type: "submit",
								size: "lg",
								children: "Crear y abrir flujo"
							})]
						})
					]
				}) })]
			})]
		})]
	});
}
function Field({ label, children }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-1.5",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: label }), children]
	});
}
//#endregion
export { NuevaPage as component };
