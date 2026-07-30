import { o as __toESM } from "../_runtime.mjs";
import { a as isDemoLoginEnabled } from "./demo-config-D3j8NDJR.mjs";
import { n as require_react } from "../_libs/@radix-ui/react-compose-refs+[...].mjs";
import { i as signIn, t as authClient } from "./client-C0m4pohU.mjs";
import { _ as Navigate, g as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { i as require_jsx_runtime } from "../_libs/@radix-ui/react-label+[...].mjs";
import { r as createServerFn } from "./ssr.mjs";
import { n as createSsrRpc } from "./createSsrRpc-_1pjCroF.mjs";
import { a as CardHeader, i as CardDescription, n as Card, o as CardTitle, r as CardContent, t as Button } from "./card-3GAOvsnF.mjs";
import { n as Label, t as Input } from "./label-BBpU3UnU.mjs";
import { f as Scale, w as FlaskConical } from "../_libs/lucide-react.mjs";
import { t as DATABASE_REQUIRED_MESSAGE } from "./db-m21Nw3rD.mjs";
import { i as GROK_PROVIDERS } from "./server-D0_39adg.mjs";
import { i as useCurrentUserState, t as enterDemoMode } from "./demo-login-B1UWi1z7.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/login-DtroDp-E.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
/** Public: whether the server can open a database (for login/demo messaging). */
var getDbStatusFn = createServerFn({ method: "GET" }).handler(createSsrRpc("a44e40067f99ce36a4338e159c9342d22cb5a5badcbd17470a2fae381cd07fb3"));
function LoginPage() {
	const { user, isPending } = useCurrentUserState();
	const [mode, setMode] = (0, import_react.useState)("signin");
	const [name, setName] = (0, import_react.useState)("");
	const [email, setEmail] = (0, import_react.useState)("");
	const [password, setPassword] = (0, import_react.useState)("");
	const [error, setError] = (0, import_react.useState)(null);
	const [busy, setBusy] = (0, import_react.useState)(false);
	const [demoBusy, setDemoBusy] = (0, import_react.useState)(false);
	const [dbError, setDbError] = (0, import_react.useState)(null);
	const demoEnabled = isDemoLoginEnabled();
	(0, import_react.useEffect)(() => {
		getDbStatusFn().then((st) => {
			if (!st.ready) setDbError(st.message || "Falta configurar DATABASE_URL (Postgres). Contacta al administrador del despliegue.");
		}).catch((err) => {
			const msg = err instanceof Error ? err.message : String(err);
			if (msg.includes("DATABASE_URL") || msg.includes("pglite") || msg.includes("ENOENT")) setDbError(DATABASE_REQUIRED_MESSAGE);
		});
	}, []);
	function friendlyDbError(err) {
		const msg = err instanceof Error ? err.message : String(err ?? "");
		if (msg.includes("DATABASE_URL") || msg.includes("pglite.data") || msg.includes("ENOENT") || msg.includes("PGLite")) return DATABASE_REQUIRED_MESSAGE;
		return msg || "Error de autenticación";
	}
	if (isPending) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "grid min-h-dvh place-items-center bg-bg text-sm text-muted",
		children: "Cargando…"
	});
	if (user) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Navigate, { to: "/" });
	async function onEmailSubmit(e) {
		e.preventDefault();
		setError(null);
		setBusy(true);
		try {
			if (mode === "signup") {
				const res = await authClient.signUp.email({
					email: email.trim(),
					password,
					name: name.trim() || email.split("@")[0] || "Usuario"
				});
				if (res.error) {
					setError(res.error.message ?? "No se pudo registrar");
					return;
				}
			} else {
				const res = await authClient.signIn.email({
					email: email.trim(),
					password
				});
				if (res.error) {
					setError(res.error.message ?? "Credenciales incorrectas");
					return;
				}
			}
			window.location.href = "/";
		} catch (err) {
			setError(friendlyDbError(err));
		} finally {
			setBusy(false);
		}
	}
	async function onDemoEnter() {
		setError(null);
		if (dbError) {
			setError(dbError);
			return;
		}
		setDemoBusy(true);
		try {
			await enterDemoMode();
		} catch (err) {
			setError(friendlyDbError(err));
			setDemoBusy(false);
		}
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "grid min-h-dvh place-items-center bg-bg px-4 py-10",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
			className: "w-full max-w-md",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardHeader, {
				className: "text-center",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-primary-fg",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Scale, { className: "size-6" })
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, {
						className: "text-xl",
						children: "FacturaFlow"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardDescription, { children: "Acceso seguro para abogados y Administración del despacho" })
				]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, {
				className: "space-y-5",
				children: [
					dbError && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						role: "alert",
						className: "rounded-lg border border-danger/40 bg-danger-bg px-3 py-2 text-sm text-danger",
						children: dbError
					}),
					demoEnabled && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "space-y-2 rounded-xl border-2 border-accent/40 bg-info-bg/50 p-4",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-center text-sm font-medium text-fg",
								children: "Prueba sin registrarte"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
								type: "button",
								size: "lg",
								className: "w-full text-base",
								disabled: demoBusy || busy,
								onClick: () => void onDemoEnter(),
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FlaskConical, { className: "size-5" }), demoBusy ? "Entrando en demo…" : "Entrar en modo demostración"]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-center text-xs text-muted",
								children: "Acceso completo como Administración con datos de ejemplo. Ideal para enseñar la herramienta a clientes."
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
						demoEnabled && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "relative py-1 text-center text-xs text-muted",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "bg-surface px-2",
								children: "o inicia sesión real"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "absolute inset-x-0 top-1/2 -z-10 border-t border-border" })]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "space-y-2",
							children: GROK_PROVIDERS.map((p) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
								type: "button",
								variant: "secondary",
								className: "w-full",
								disabled: demoBusy,
								onClick: () => void signIn(p.providerId, { callbackURL: "/" }),
								children: ["Continuar con ", p.label]
							}, p.providerId))
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "relative py-1 text-center text-xs text-muted",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "bg-surface px-2",
								children: "o con email del despacho"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "absolute inset-x-0 top-1/2 -z-10 border-t border-border" })]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
							className: "space-y-3",
							onSubmit: onEmailSubmit,
							children: [
								mode === "signup" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "space-y-1.5",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Nombre" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
										value: name,
										onChange: (e) => setName(e.target.value),
										placeholder: "María González",
										autoComplete: "name"
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "space-y-1.5",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Email" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
										type: "email",
										required: true,
										value: email,
										onChange: (e) => setEmail(e.target.value),
										placeholder: "tu@bufete.es",
										autoComplete: "email"
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "space-y-1.5",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Contraseña" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
										type: "password",
										required: true,
										minLength: 8,
										value: password,
										onChange: (e) => setPassword(e.target.value),
										placeholder: "Mínimo 8 caracteres",
										autoComplete: mode === "signup" ? "new-password" : "current-password"
									})]
								}),
								error && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "rounded-md bg-danger-bg px-3 py-2 text-xs text-danger",
									children: error
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
									type: "submit",
									variant: "secondary",
									className: "w-full",
									disabled: busy || demoBusy,
									children: busy ? "Espera…" : mode === "signup" ? "Crear cuenta" : "Entrar"
								})
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-center text-xs text-muted",
							children: mode === "signin" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
								"¿Primera vez?",
								" ",
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									type: "button",
									className: "font-medium text-accent underline-offset-2 hover:underline",
									onClick: () => setMode("signup"),
									children: "Crear cuenta"
								})
							] }) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
								"¿Ya tienes cuenta?",
								" ",
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									type: "button",
									className: "font-medium text-accent underline-offset-2 hover:underline",
									onClick: () => setMode("signin"),
									children: "Iniciar sesión"
								})
							] })
						})
					] }),
					error && false,
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-center text-xs text-subtle",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
							to: "/",
							className: "hover:underline",
							children: "Volver al inicio"
						})
					})
				]
			})]
		})
	});
}
//#endregion
export { LoginPage as component };
