import { i as __toESM } from "../_runtime.mjs";
import { n as require_react } from "../_libs/@radix-ui/react-compose-refs+[...].mjs";
import { l as useBillingStore } from "./store-BPhrqMPB.mjs";
import { i as require_jsx_runtime } from "../_libs/@radix-ui/react-label+[...].mjs";
import { a as CardHeader, i as CardDescription, n as Card, o as CardTitle, r as CardContent, t as Button } from "./card-BzzuZRXz.mjs";
import { t as Input } from "./input-Bmbc6647.mjs";
import { n as Textarea, t as Label } from "./label-DBGO6uug.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { a as Trash2, d as RotateCcw, f as Plus } from "../_libs/lucide-react.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/configuracion-Bd85Qamr.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function ConfigPage() {
	const settings = useBillingStore((s) => s.settings);
	const lawyers = useBillingStore((s) => s.lawyers);
	const updateSettings = useBillingStore((s) => s.updateSettings);
	const upsertLawyer = useBillingStore((s) => s.upsertLawyer);
	const removeLawyer = useBillingStore((s) => s.removeLawyer);
	const resetDemo = useBillingStore((s) => s.resetDemo);
	const [form, setForm] = (0, import_react.useState)(settings);
	const [newLawyer, setNewLawyer] = (0, import_react.useState)({
		name: "",
		email: "",
		initials: ""
	});
	function saveSettings(e) {
		e.preventDefault();
		updateSettings(form);
		toast.success("Configuración guardada");
	}
	function addLawyer(e) {
		e.preventDefault();
		if (!newLawyer.name.trim() || !newLawyer.email.trim()) {
			toast.error("Nombre y email del letrado son obligatorios");
			return;
		}
		const lawyer = {
			id: `law-${crypto.randomUUID().slice(0, 6)}`,
			name: newLawyer.name.trim(),
			email: newLawyer.email.trim(),
			initials: newLawyer.initials.trim() || newLawyer.name.split(/\s+/).map((p) => p[0]).join("").slice(0, 2).toUpperCase()
		};
		upsertLawyer(lawyer);
		setNewLawyer({
			name: "",
			email: "",
			initials: ""
		});
		toast.success("Letrado añadido");
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mx-auto flex max-w-3xl flex-col gap-6",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "text-2xl font-semibold tracking-tight",
				children: "Configuración"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-1 text-sm text-muted",
				children: "Datos del despacho, Admin, SharePoint y letrados"
			})] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardHeader, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, { children: "Despacho y Administración" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardDescription, { children: "Se usan en las plantillas de email y en la ruta de SharePoint" })] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardContent, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
				className: "grid gap-4",
				onSubmit: saveSettings,
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
						label: "Nombre del despacho",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							value: form.firmName,
							onChange: (e) => setForm({
								...form,
								firmName: e.target.value
							})
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "grid gap-3 sm:grid-cols-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
							label: "Nombre Admin",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								value: form.adminName,
								onChange: (e) => setForm({
									...form,
									adminName: e.target.value
								})
							})
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
							label: "Email Admin",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								type: "email",
								value: form.adminEmail,
								onChange: (e) => setForm({
									...form,
									adminEmail: e.target.value
								})
							})
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
						label: "Base SharePoint (carpetas por cliente/caso)",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							value: form.sharePointBase,
							onChange: (e) => setForm({
								...form,
								sharePointBase: e.target.value
							}),
							placeholder: "SharePoint/Clientes"
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "grid gap-3 sm:grid-cols-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
							label: "IVA por defecto %",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								type: "number",
								value: form.defaultIva,
								onChange: (e) => setForm({
									...form,
									defaultIva: Number(e.target.value) || 0
								})
							})
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
							label: "Días de vencimiento",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								type: "number",
								value: form.defaultPaymentDays,
								onChange: (e) => setForm({
									...form,
									defaultPaymentDays: Number(e.target.value) || 0
								})
							})
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
						label: "Nota para SAGE (en email a Admin)",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, {
							value: form.sageNote,
							onChange: (e) => setForm({
								...form,
								sageNote: e.target.value
							})
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
						label: "Nota para LEXNEXT (en email a Admin)",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, {
							value: form.lexnextNote,
							onChange: (e) => setForm({
								...form,
								lexnextNote: e.target.value
							})
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						type: "submit",
						children: "Guardar configuración"
					})
				]
			}) })] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardHeader, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, { children: "Letrados" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardDescription, { children: "Varios abogados — cada uno con su email para remisión al cliente" })] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, {
				className: "space-y-4",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
					className: "divide-y divide-border rounded-xl border border-border",
					children: lawyers.map((l) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
						className: "flex items-center gap-3 px-4 py-3 text-sm",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "flex h-9 w-9 items-center justify-center rounded-full bg-surface-2 text-xs font-semibold",
								children: l.initials
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "min-w-0 flex-1",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "font-medium",
									children: l.name
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "truncate text-xs text-muted",
									children: l.email
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								type: "button",
								variant: "ghost",
								size: "icon",
								"aria-label": "Eliminar letrado",
								onClick: () => {
									removeLawyer(l.id);
									toast.success("Letrado eliminado");
								},
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, { className: "size-4 text-muted" })
							})
						]
					}, l.id))
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
					className: "grid gap-3 rounded-xl border border-dashed border-border-strong p-4 sm:grid-cols-4",
					onSubmit: addLawyer,
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							className: "sm:col-span-1",
							placeholder: "Iniciales",
							value: newLawyer.initials,
							onChange: (e) => setNewLawyer({
								...newLawyer,
								initials: e.target.value
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							className: "sm:col-span-1",
							placeholder: "Nombre",
							value: newLawyer.name,
							onChange: (e) => setNewLawyer({
								...newLawyer,
								name: e.target.value
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							className: "sm:col-span-1",
							placeholder: "Email",
							type: "email",
							value: newLawyer.email,
							onChange: (e) => setNewLawyer({
								...newLawyer,
								email: e.target.value
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
							type: "submit",
							variant: "secondary",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "size-4" }), "Añadir"]
						})
					]
				})]
			})] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardHeader, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, { children: "Datos de demostración" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardDescription, { children: "Restaura el panel con facturas de ejemplo del despacho" })] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardContent, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
				type: "button",
				variant: "outline",
				onClick: () => {
					resetDemo();
					setForm(useBillingStore.getState().settings);
					toast.success("Datos de demo restaurados");
				},
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(RotateCcw, { className: "size-4" }), "Restaurar demo"]
			}) })] })
		]
	});
}
function Field({ label, children }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-1.5",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: label }), children]
	});
}
//#endregion
export { ConfigPage as component };
