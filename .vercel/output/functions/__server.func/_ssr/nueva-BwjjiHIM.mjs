import { o as __toESM } from "../_runtime.mjs";
import { n as require_react } from "../_libs/@radix-ui/react-compose-refs+[...].mjs";
import { g as invoiceTotal, p as formatCurrency } from "./types-FkcXPGqw.mjs";
import { v as useNavigate } from "../_libs/@tanstack/react-router+[...].mjs";
import { i as require_jsx_runtime } from "../_libs/@radix-ui/react-label+[...].mjs";
import { a as useBillingStore } from "./store-BGoPG33y.mjs";
import { n as extractConceptFn, r as getExtractStatusFn } from "./server-fn-yVyek7Ff.mjs";
import { a as CardHeader, i as CardDescription, n as Card, o as CardTitle, r as CardContent, t as Button } from "./card-3GAOvsnF.mjs";
import { n as Label, t as Input } from "./label-BBpU3UnU.mjs";
import { t as Textarea } from "./textarea-DYcVqY0u.mjs";
import { t as Select } from "./select-BwF8MM6y.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { R as Bot, T as FileUp, r as Upload, s as Sparkles, v as LoaderCircle } from "../_libs/lucide-react.mjs";
import { r as parseConceptCsv } from "./export-Dmhiqqsz.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/nueva-BwjjiHIM.js
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
	const profile = useBillingStore((s) => s.profile);
	const createFromDraft = useBillingStore((s) => s.createFromDraft);
	const defaultLawyerId = profile?.role === "lawyer" && profile.lawyerId ? profile.lawyerId : lawyers[0]?.id ?? "";
	const [draft, setDraft] = (0, import_react.useState)(() => emptyDraft(defaultLawyerId, settings.defaultIva));
	const [paste, setPaste] = (0, import_react.useState)("");
	const [sourceHint, setSourceHint] = (0, import_react.useState)("");
	const [busy, setBusy] = (0, import_react.useState)(false);
	const [extracting, setExtracting] = (0, import_react.useState)(false);
	const [file, setFile] = (0, import_react.useState)(null);
	const [extractMeta, setExtractMeta] = (0, import_react.useState)(null);
	const [aiStatus, setAiStatus] = (0, import_react.useState)(null);
	(0, import_react.useEffect)(() => {
		getExtractStatusFn().then(setAiStatus).catch(() => setAiStatus(null));
	}, []);
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
	function applyExtracted(data, source) {
		setDraft((d) => ({
			...d,
			clientName: data.clientName?.trim() || d.clientName,
			clientEmail: data.clientEmail?.trim() || d.clientEmail,
			clientNif: data.clientNif?.trim() || d.clientNif,
			expediente: data.expediente?.trim() || d.expediente,
			concepto: data.concepto?.trim() || d.concepto,
			baseAmount: typeof data.baseAmount === "number" && data.baseAmount > 0 ? data.baseAmount : d.baseAmount,
			ivaRate: typeof data.ivaRate === "number" && data.ivaRate > 0 ? data.ivaRate : d.ivaRate || settings.defaultIva,
			suplidos: typeof data.suplidos === "number" ? data.suplidos : d.suplidos,
			notes: data.notes?.trim() || d.notes,
			sourceFile: source || d.sourceFile
		}));
		setSourceHint(source);
	}
	function applyParsed(rows, fileName) {
		const row = rows[0];
		if (!row) {
			toast.error("No se detectó ningún concepto en el archivo o texto");
			return;
		}
		applyExtracted(row, fileName || "Texto pegado / exportación SharePoint");
		toast.success(rows.length > 1 ? `Se importó el primer concepto de ${rows.length} filas detectadas` : "Concepto importado correctamente");
	}
	async function fileToBase64(f) {
		const buf = await f.arrayBuffer();
		const bytes = new Uint8Array(buf);
		let binary = "";
		const chunk = 32768;
		for (let i = 0; i < bytes.length; i += chunk) binary += String.fromCharCode(...bytes.subarray(i, i + chunk));
		return btoa(binary);
	}
	async function onExtractAi() {
		if (!file && !paste.trim()) {
			toast.error("Sube un PDF/Word o pega el texto del expediente");
			return;
		}
		setExtracting(true);
		setExtractMeta(null);
		try {
			const payload = {};
			if (file) {
				payload.fileBase64 = await fileToBase64(file);
				payload.fileName = file.name;
				payload.mimeType = file.type;
			}
			if (paste.trim()) payload.text = paste.trim();
			if (file && paste.trim()) {}
			const result = await extractConceptFn({ data: payload });
			setExtractMeta(result);
			applyExtracted(result, file?.name || "Texto pegado (extracción IA/heurística)");
			const confPct = Math.round((result.confidence || 0) * 100);
			if (result.warnings.length) toast.message(`Extracción ${result.method} · confianza ~${confPct}%`, { description: result.warnings.slice(0, 3).join(" · ") });
			else toast.success(`Datos extraídos (${result.method}, confianza ~${confPct}%). Revisa y confirma.`);
		} catch (err) {
			toast.error(err instanceof Error ? err.message : "No se pudo extraer el documento");
		} finally {
			setExtracting(false);
		}
	}
	async function onFile(selected) {
		if (!selected) return;
		setFile(selected);
		const name = selected.name.toLowerCase();
		if (name.endsWith(".csv") || name.endsWith(".txt") || name.endsWith(".tsv") || selected.type.startsWith("text/")) try {
			const text = await selected.text();
			setPaste(text.slice(0, 2e4));
			applyParsed(parseConceptCsv(text), selected.name);
		} catch {
			toast.message("Archivo cargado", { description: "Pulsa «Extraer datos con IA» para analizarlo" });
		}
		else toast.message(`Archivo listo: ${selected.name}`, { description: "Pulsa «Extraer datos con IA» para rellenar el formulario" });
	}
	function onImportPaste() {
		applyParsed(parseConceptCsv(paste));
	}
	async function onSubmit(e) {
		e.preventDefault();
		if (!draft.clientName.trim() || !draft.expediente.trim() || !draft.concepto.trim()) {
			toast.error("Cliente, expediente y concepto son obligatorios");
			return;
		}
		if (!draft.baseAmount || draft.baseAmount <= 0) {
			toast.error("Indica una base imponible válida");
			return;
		}
		setBusy(true);
		try {
			const inv = await createFromDraft({
				...draft,
				lawyerId: profile?.role === "lawyer" && profile.lawyerId ? profile.lawyerId : draft.lawyerId
			});
			toast.success(`Borrador ${inv.ref} creado`);
			navigate({
				to: "/facturas/$id",
				params: { id: inv.id }
			});
		} catch (err) {
			toast.error(err instanceof Error ? err.message : "Error al crear");
		} finally {
			setBusy(false);
		}
	}
	const lawyerOptions = profile?.role === "lawyer" && profile.lawyerId ? lawyers.filter((l) => l.id === profile.lawyerId) : lawyers;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mx-auto flex max-w-4xl flex-col gap-6",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
			className: "text-2xl font-semibold tracking-tight",
			children: "Nueva facturación"
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "mt-1 text-sm text-muted",
			children: "Extrae el concepto con IA desde PDF/Word o introdúcelo manualmente"
		})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "grid gap-4 lg:grid-cols-5",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
				className: "lg:col-span-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardHeader, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardTitle, {
					className: "flex items-center gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FileUp, { className: "size-4" }), "Documento del expediente"]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardDescription, { children: "PDF, Word (.docx), CSV/texto o pega el contenido. Luego extrae los datos al formulario." })] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, {
					className: "flex flex-col gap-4",
					children: [
						aiStatus && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: aiStatus.activeProvider === "harvey" ? "rounded-lg border border-border bg-success-bg px-3 py-2 text-xs text-success" : aiStatus.activeProvider !== "none" ? "rounded-lg border border-border bg-success-bg px-3 py-2 text-xs text-success" : "rounded-lg border border-border bg-info-bg px-3 py-2 text-xs text-info",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Bot, { className: "mr-1 inline size-3.5" }), aiStatus.activeProvider === "harvey" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
								"Extracción con ",
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: "Harvey" }),
								aiStatus.harveyMasked ? ` (${aiStatus.harveyMasked})` : "",
								". Si falla, se usa extracción local."
							] }) : aiStatus.activeProvider !== "none" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
								"IA activa (",
								aiStatus.fallbackProvider,
								aiStatus.model ? ` · ${aiStatus.model}` : "",
								"). Configura Harvey en Configuración para el despacho."
							] }) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
								"Extracción local (heurísticas). Configura Harvey en",
								" ",
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: "Configuración" }),
								" o variables de entorno de respaldo."
							] })]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
							className: "flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-border-strong bg-bg px-4 py-8 text-center transition-colors hover:bg-surface-2",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Upload, { className: "size-6 text-muted" }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "text-sm font-medium",
									children: file ? file.name : "Subir PDF, Word o CSV"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "text-xs text-muted",
									children: ".pdf · .docx · .csv · .txt (máx. 8 MB)"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
									type: "file",
									accept: ".pdf,.docx,.doc,.csv,.txt,.tsv,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/csv,text/plain",
									className: "sr-only",
									onChange: (e) => void onFile(e.target.files?.[0] ?? null)
								})
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "space-y-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Pegar texto del Word / expediente" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, {
								placeholder: `Cliente: Acme Legal S.L.\nNIF: B12345678\nExpediente: CIV-2026-0100\nConcepto: Honorarios fase demanda\nBase imponible: 2.500,00 €\nSuplidos: 120\nEmail: facturas@acme.es`,
								value: paste,
								onChange: (e) => setPaste(e.target.value),
								className: "min-h-[140px] font-mono text-xs"
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
							type: "button",
							className: "w-full",
							disabled: extracting || !file && !paste.trim(),
							onClick: () => void onExtractAi(),
							children: [extracting ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "size-4 animate-spin" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Sparkles, { className: "size-4" }), extracting ? "Extrayendo…" : "Extraer datos con IA"]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							type: "button",
							variant: "secondary",
							className: "w-full",
							onClick: onImportPaste,
							disabled: !paste.trim() || extracting,
							children: "Importar solo como CSV / clave:valor"
						}),
						sourceHint && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "rounded-md bg-info-bg px-3 py-2 text-xs text-info",
							children: ["Origen: ", sourceHint]
						}),
						extractMeta && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "rounded-md border border-border bg-bg px-3 py-2 text-xs text-muted",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", { children: [
								"Método: ",
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", {
									className: "text-fg",
									children: extractMeta.method
								}),
								" · ",
								"Confianza:",
								" ",
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("strong", {
									className: "text-fg",
									children: [Math.round(extractMeta.confidence * 100), "%"]
								})
							] }), extractMeta.warnings.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
								className: "mt-1 list-inside list-disc",
								children: extractMeta.warnings.map((w) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: w }, w))
							})]
						})
					]
				})]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
				className: "lg:col-span-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardHeader, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, { children: "Datos del concepto" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardDescription, { children: "Revisa y corrige lo extraído antes de generar el flujo de facturación" })] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardContent, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
					className: "grid gap-4",
					onSubmit: (e) => void onSubmit(e),
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
									disabled: profile?.role === "lawyer",
									children: lawyerOptions.map((l) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
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
								disabled: busy || extracting,
								children: busy ? "Creando…" : "Crear y abrir flujo"
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
