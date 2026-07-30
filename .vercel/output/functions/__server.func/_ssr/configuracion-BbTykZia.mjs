import { o as __toESM } from "../_runtime.mjs";
import { n as require_react } from "../_libs/@radix-ui/react-compose-refs+[...].mjs";
import { a as EMAIL_TEMPLATE_VARS, o as ROLE_LABELS } from "./types-FkcXPGqw.mjs";
import { i as require_jsx_runtime } from "../_libs/@radix-ui/react-label+[...].mjs";
import { a as useBillingStore, i as setUserRoleFn, r as listProfilesFn, t as getMailStatusFn } from "./store-BGoPG33y.mjs";
import { a as saveHarveyApiKeyFn, i as getHarveyStatusFn, o as testHarveyConnectionFn, s as updateHarveyBaseUrlFn, t as deleteHarveyApiKeyFn } from "./server-fn-yVyek7Ff.mjs";
import { a as CardHeader, i as CardDescription, n as Card, o as CardTitle, r as CardContent, t as Button } from "./card-3GAOvsnF.mjs";
import { n as Label, t as Input } from "./label-BBpU3UnU.mjs";
import { t as Textarea } from "./textarea-DYcVqY0u.mjs";
import { t as Select } from "./select-BwF8MM6y.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { A as EyeOff, R as Bot, _ as Mail, a as Trash2, c as ShieldCheck, h as Plus, k as Eye, p as RotateCcw, v as LoaderCircle } from "../_libs/lucide-react.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/configuracion-BbTykZia.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function ConfigPage() {
	const settings = useBillingStore((s) => s.settings);
	const lawyers = useBillingStore((s) => s.lawyers);
	const profile = useBillingStore((s) => s.profile);
	const updateSettings = useBillingStore((s) => s.updateSettings);
	const upsertLawyer = useBillingStore((s) => s.upsertLawyer);
	const removeLawyer = useBillingStore((s) => s.removeLawyer);
	const resetDemo = useBillingStore((s) => s.resetDemo);
	const bootstrap = useBillingStore((s) => s.bootstrap);
	const [form, setForm] = (0, import_react.useState)(settings);
	const [newLawyer, setNewLawyer] = (0, import_react.useState)({
		name: "",
		email: "",
		initials: ""
	});
	const [profiles, setProfiles] = (0, import_react.useState)([]);
	const [mailStatus, setMailStatus] = (0, import_react.useState)(null);
	const [harvey, setHarvey] = (0, import_react.useState)(null);
	const [harveyKeyInput, setHarveyKeyInput] = (0, import_react.useState)("");
	const [harveyBaseUrl, setHarveyBaseUrl] = (0, import_react.useState)("https://eu.api.harvey.ai");
	const [showHarveyKey, setShowHarveyKey] = (0, import_react.useState)(false);
	const [harveyBusy, setHarveyBusy] = (0, import_react.useState)(false);
	const isAdmin = profile?.role === "admin";
	(0, import_react.useEffect)(() => {
		setForm(settings);
	}, [settings]);
	(0, import_react.useEffect)(() => {
		if (!isAdmin) return;
		listProfilesFn().then(setProfiles).catch(() => setProfiles([]));
		getMailStatusFn().then(setMailStatus).catch(() => setMailStatus(null));
		getHarveyStatusFn().then((st) => {
			setHarvey(st);
			if (st.baseUrl) setHarveyBaseUrl(st.baseUrl);
		}).catch(() => setHarvey(null));
	}, [isAdmin, profile?.userId]);
	async function saveHarveyKey() {
		if (!harveyKeyInput.trim()) {
			toast.error("Introduce la API key de Harvey");
			return;
		}
		setHarveyBusy(true);
		try {
			const st = await saveHarveyApiKeyFn({ data: {
				apiKey: harveyKeyInput.trim(),
				baseUrl: harveyBaseUrl
			} });
			setHarvey(st);
			setHarveyKeyInput("");
			setShowHarveyKey(false);
			toast.success("API key de Harvey guardada de forma segura");
		} catch (err) {
			toast.error(err instanceof Error ? err.message : "Error al guardar");
		} finally {
			setHarveyBusy(false);
		}
	}
	async function removeHarveyKey() {
		setHarveyBusy(true);
		try {
			const st = await deleteHarveyApiKeyFn();
			setHarvey(st);
			setHarveyKeyInput("");
			toast.success("API key de Harvey eliminada");
		} catch (err) {
			toast.error(err instanceof Error ? err.message : "Error al eliminar");
		} finally {
			setHarveyBusy(false);
		}
	}
	async function testHarvey() {
		setHarveyBusy(true);
		try {
			const res = await testHarveyConnectionFn({ data: {
				apiKey: harveyKeyInput.trim() || void 0,
				baseUrl: harveyBaseUrl
			} });
			if (res.ok) toast.success(res.message);
			else toast.error(res.message);
		} catch (err) {
			toast.error(err instanceof Error ? err.message : "Error al probar");
		} finally {
			setHarveyBusy(false);
		}
	}
	async function saveHarveyUrl() {
		setHarveyBusy(true);
		try {
			const st = await updateHarveyBaseUrlFn({ data: { baseUrl: harveyBaseUrl } });
			setHarvey(st);
			toast.success("URL de Harvey actualizada");
		} catch (err) {
			toast.error(err instanceof Error ? err.message : "Error");
		} finally {
			setHarveyBusy(false);
		}
	}
	async function saveSettings(e) {
		e.preventDefault();
		try {
			await updateSettings(form);
			toast.success("Configuración guardada en el servidor");
		} catch (err) {
			toast.error(err instanceof Error ? err.message : "Error al guardar");
		}
	}
	async function addLawyer(e) {
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
		try {
			await upsertLawyer(lawyer);
			setNewLawyer({
				name: "",
				email: "",
				initials: ""
			});
			toast.success("Letrado añadido");
		} catch (err) {
			toast.error(err instanceof Error ? err.message : "Error");
		}
	}
	async function onRoleChange(userId, role, lawyerId) {
		try {
			await setUserRoleFn({ data: {
				userId,
				role,
				lawyerId: role === "lawyer" ? lawyerId : null
			} });
			const next = await listProfilesFn();
			setProfiles(next);
			await bootstrap();
			toast.success("Rol actualizado");
		} catch (err) {
			toast.error(err instanceof Error ? err.message : "Error de permisos");
		}
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mx-auto flex max-w-3xl flex-col gap-6",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "text-2xl font-semibold tracking-tight",
				children: "Configuración"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-1 text-sm text-muted",
				children: "Despacho, letrados y roles multiusuario (servidor)"
			})] }),
			profile && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, {
				className: "flex flex-wrap items-center gap-3 p-4 text-sm",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "text-muted",
						children: "Tu rol actual:"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "font-semibold",
						children: ROLE_LABELS[profile.role]
					}),
					profile.lawyerId && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						className: "text-muted",
						children: [
							"· Letrado vinculado:",
							" ",
							lawyers.find((l) => l.id === profile.lawyerId)?.name ?? profile.lawyerId
						]
					})
				]
			}) }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardHeader, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, { children: "Despacho y Administración" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardDescription, { children: isAdmin ? "Se usan en plantillas de email y rutas SharePoint" : "Solo lectura — Admin puede editar" })] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardContent, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
				className: "grid gap-4",
				onSubmit: (e) => void saveSettings(e),
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
						label: "Nombre del despacho",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							value: form.firmName,
							disabled: !isAdmin,
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
								disabled: !isAdmin,
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
								disabled: !isAdmin,
								onChange: (e) => setForm({
									...form,
									adminEmail: e.target.value
								})
							})
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
						label: "Base SharePoint",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							value: form.sharePointBase,
							disabled: !isAdmin,
							onChange: (e) => setForm({
								...form,
								sharePointBase: e.target.value
							})
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "grid gap-3 sm:grid-cols-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
							label: "IVA por defecto %",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								type: "number",
								value: form.defaultIva,
								disabled: !isAdmin,
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
								disabled: !isAdmin,
								onChange: (e) => setForm({
									...form,
									defaultPaymentDays: Number(e.target.value) || 0
								})
							})
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
						label: "Nota SAGE",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, {
							value: form.sageNote,
							disabled: !isAdmin,
							onChange: (e) => setForm({
								...form,
								sageNote: e.target.value
							})
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
						label: "Nota LEXNEXT",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, {
							value: form.lexnextNote,
							disabled: !isAdmin,
							onChange: (e) => setForm({
								...form,
								lexnextNote: e.target.value
							})
						})
					}),
					isAdmin && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						type: "submit",
						children: "Guardar configuración"
					})
				]
			}) })] }),
			isAdmin && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardHeader, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardTitle, {
				className: "flex items-center gap-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Bot, { className: "size-4" }), "Inteligencia Artificial – Harvey"]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardDescription, { children: "Configura la API key del despacho. Se cifra en el servidor y nunca se muestra completa en la interfaz ni se envía de nuevo al navegador." })] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, {
				className: "space-y-4",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: harvey?.configured ? "flex items-center gap-2 rounded-lg border border-border bg-success-bg px-3 py-2 text-sm text-success" : "flex items-center gap-2 rounded-lg border border-border bg-surface-2 px-3 py-2 text-sm text-muted",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ShieldCheck, { className: "size-4 shrink-0" }), harvey?.configured ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: "Harvey conectado" }),
							harvey.maskedKey ? ` · clave ${harvey.maskedKey}` : "",
							harvey.updatedAt ? ` · actualizada ${new Date(harvey.updatedAt).toLocaleString("es-ES")}` : ""
						] }) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: ["Sin API de Harvey – usando extracción local", mailStatus ? "" : ""] })]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Field, {
						label: "URL del endpoint (UE recomendada)",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex flex-col gap-2 sm:flex-row",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								value: harveyBaseUrl,
								onChange: (e) => setHarveyBaseUrl(e.target.value),
								placeholder: "https://eu.api.harvey.ai",
								className: "font-mono text-xs"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								type: "button",
								variant: "outline",
								disabled: harveyBusy,
								onClick: () => void saveHarveyUrl(),
								children: "Guardar URL"
							})]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "mt-1 text-[11px] text-muted",
							children: [
								"Despachos en España/UE:",
								" ",
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("code", {
									className: "text-[10px]",
									children: "https://eu.api.harvey.ai"
								})
							]
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Field, {
						label: "API Key de Harvey",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex gap-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								type: showHarveyKey ? "text" : "password",
								autoComplete: "off",
								value: harveyKeyInput,
								onChange: (e) => setHarveyKeyInput(e.target.value),
								placeholder: harvey?.configured ? "Nueva clave (deja vacío para no cambiar)" : "Pega aquí la API key del despacho",
								className: "font-mono text-xs"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								type: "button",
								variant: "outline",
								size: "icon",
								"aria-label": showHarveyKey ? "Ocultar" : "Mostrar",
								onClick: () => setShowHarveyKey((v) => !v),
								children: showHarveyKey ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EyeOff, { className: "size-4" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Eye, { className: "size-4" })
							})]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-1 text-[11px] text-muted",
							children: "Solo Administración. La clave se cifra (AES-256-GCM) y solo el servidor la usa para llamar a Harvey."
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex flex-wrap gap-2",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
								type: "button",
								disabled: harveyBusy || !harveyKeyInput.trim(),
								onClick: () => void saveHarveyKey(),
								children: [harveyBusy ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "size-4 animate-spin" }) : null, "Guardar clave"]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								type: "button",
								variant: "secondary",
								disabled: harveyBusy || !harveyKeyInput.trim() && !harvey?.configured,
								onClick: () => void testHarvey(),
								children: "Probar conexión"
							}),
							harvey?.configured && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								type: "button",
								variant: "outline",
								className: "text-danger",
								disabled: harveyBusy,
								onClick: () => void removeHarveyKey(),
								children: "Eliminar clave"
							})
						]
					})
				]
			})] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardHeader, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardTitle, {
				className: "flex items-center gap-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Mail, { className: "size-4" }), "Plantillas de correo"]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardDescription, { children: [
				"Variables disponibles:",
				" ",
				EMAIL_TEMPLATE_VARS.map((v) => `{{${v}}}`).join(", "),
				". Se sustituyen automáticamente en cada factura."
			] })] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, {
				className: "space-y-6",
				children: [
					mailStatus && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: mailStatus.configured ? "rounded-lg border border-border bg-success-bg px-3 py-2 text-xs text-success" : "rounded-lg border border-border bg-warn-bg px-3 py-2 text-xs text-warn",
						children: mailStatus.configured ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
							"Envío real activo (Resend). Remitente:",
							" ",
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: mailStatus.from })
						] }) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
							"Modo prueba: no hay ",
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("code", { children: "RESEND_API_KEY" }),
							". Los envíos copiarán el correo y actualizarán el estado sin enviar de verdad. Remitente previsto: ",
							mailStatus.from
						] })
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "space-y-3",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-sm font-medium",
								children: "Email a Administración"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
								label: "Asunto",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
									value: form.adminEmailSubjectTpl,
									disabled: !isAdmin,
									onChange: (e) => setForm({
										...form,
										adminEmailSubjectTpl: e.target.value
									})
								})
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
								label: "Cuerpo",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, {
									className: "min-h-[180px] font-mono text-xs",
									value: form.adminEmailBodyTpl,
									disabled: !isAdmin,
									onChange: (e) => setForm({
										...form,
										adminEmailBodyTpl: e.target.value
									})
								})
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "space-y-3 border-t border-border pt-4",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-sm font-medium",
								children: "Email al Cliente"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
								label: "Asunto",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
									value: form.clientEmailSubjectTpl,
									disabled: !isAdmin,
									onChange: (e) => setForm({
										...form,
										clientEmailSubjectTpl: e.target.value
									})
								})
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
								label: "Cuerpo",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, {
									className: "min-h-[180px] font-mono text-xs",
									value: form.clientEmailBodyTpl,
									disabled: !isAdmin,
									onChange: (e) => setForm({
										...form,
										clientEmailBodyTpl: e.target.value
									})
								})
							})
						]
					}),
					isAdmin && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						type: "button",
						onClick: () => {
							updateSettings(form).then(() => toast.success("Plantillas guardadas")).catch((err) => toast.error(err instanceof Error ? err.message : "Error al guardar"));
						},
						children: "Guardar plantillas"
					})
				]
			})] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardHeader, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, { children: "Letrados" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardDescription, { children: "Si un usuario se registra con el mismo email, se vincula como Abogado" })] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, {
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
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "font-medium",
										children: l.name
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "truncate text-xs text-muted",
										children: l.email
									}),
									l.userId && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "text-[11px] text-success",
										children: "Usuario vinculado"
									})
								]
							}),
							isAdmin && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								type: "button",
								variant: "ghost",
								size: "icon",
								"aria-label": "Eliminar letrado",
								onClick: () => {
									removeLawyer(l.id).then(() => toast.success("Letrado eliminado")).catch((err) => toast.error(err instanceof Error ? err.message : "Error"));
								},
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, { className: "size-4 text-muted" })
							})
						]
					}, l.id))
				}), isAdmin && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
					className: "grid gap-3 rounded-xl border border-dashed border-border-strong p-4 sm:grid-cols-4",
					onSubmit: (e) => void addLawyer(e),
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							placeholder: "Iniciales",
							value: newLawyer.initials,
							onChange: (e) => setNewLawyer({
								...newLawyer,
								initials: e.target.value
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							placeholder: "Nombre",
							value: newLawyer.name,
							onChange: (e) => setNewLawyer({
								...newLawyer,
								name: e.target.value
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
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
			isAdmin && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardHeader, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, { children: "Usuarios y roles" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardDescription, { children: "Administración ve y edita todas las facturas. Abogado solo las del letrado al que está vinculado. Los cambios se aplican de inmediato en el servidor." })] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, {
				className: "space-y-4",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "rounded-lg border border-border bg-bg px-3 py-2 text-xs text-muted",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("ul", {
							className: "list-inside list-disc space-y-0.5",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", {
								className: "text-fg",
								children: "Administración"
							}), ": panel completo, configuración, plantillas y roles."] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", {
								className: "text-fg",
								children: "Abogado"
							}), ": solo facturas de su letrado; no puede cambiar configuración ni roles."] })]
						})
					}),
					profiles.length === 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-sm text-muted",
						children: "Aún no hay usuarios. Cuando alguien se registre o entre en demo, aparecerá aquí."
					}),
					profiles.map((p) => {
						const linked = lawyers.find((l) => l.id === p.lawyerId);
						return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex flex-col gap-3 rounded-xl border border-border p-4",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex flex-wrap items-start justify-between gap-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "min-w-0",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											className: "text-sm font-semibold",
											children: p.displayName || p.email || p.userId.slice(0, 8)
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											className: "truncate text-xs text-muted",
											children: p.email || "Sin email"
										}),
										p.role === "lawyer" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
											className: "mt-1 text-[11px] text-muted",
											children: [
												"Letrado vinculado:",
												" ",
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
													className: "font-medium text-fg",
													children: linked?.name ?? "Pendiente de asignar"
												})
											]
										})
									]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: p.role === "admin" ? "rounded-full bg-primary/10 px-2.5 py-0.5 text-[11px] font-semibold text-primary" : "rounded-full bg-surface-2 px-2.5 py-0.5 text-[11px] font-semibold text-fg",
									children: ROLE_LABELS[p.role]
								})]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex flex-col gap-2 sm:flex-row sm:items-center",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "space-y-1 sm:w-44",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
										className: "text-xs",
										children: "Rol"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
										value: p.role,
										onChange: (e) => void onRoleChange(p.userId, e.target.value, e.target.value === "lawyer" ? p.lawyerId || lawyers[0]?.id || null : null),
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
											value: "admin",
											children: "Administración"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
											value: "lawyer",
											children: "Abogado"
										})]
									})]
								}), p.role === "lawyer" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "min-w-0 flex-1 space-y-1",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
										className: "text-xs",
										children: "Letrado del despacho"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
										value: p.lawyerId ?? "",
										onChange: (e) => void onRoleChange(p.userId, "lawyer", e.target.value || null),
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
											value: "",
											children: "Seleccionar letrado…"
										}), lawyers.map((l) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("option", {
											value: l.id,
											children: [
												l.name,
												" (",
												l.email,
												")"
											]
										}, l.id))]
									})]
								})]
							})]
						}, p.userId);
					})
				]
			})] }),
			!isAdmin && profile && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardHeader, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, { children: "Tu acceso" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardDescription, { children: "Solo Administración puede gestionar usuarios y roles" })] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, {
				className: "text-sm text-muted",
				children: [
					"Rol actual:",
					" ",
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", {
						className: "text-fg",
						children: ROLE_LABELS[profile.role]
					}),
					profile.lawyerId && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
						" ",
						"· Letrado:",
						" ",
						lawyers.find((l) => l.id === profile.lawyerId)?.name ?? profile.lawyerId
					] }),
					". Ves y editas únicamente las facturas de tu letrado."
				]
			})] }),
			isAdmin && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardHeader, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, { children: "Datos de demostración" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardDescription, { children: "Restaura facturas y letrados de ejemplo en la base de datos" })] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardContent, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
				type: "button",
				variant: "outline",
				onClick: () => {
					resetDemo().then(() => {
						setForm(useBillingStore.getState().settings);
						toast.success("Demo restaurada en el servidor");
					}).catch((err) => toast.error(err instanceof Error ? err.message : "Error"));
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
