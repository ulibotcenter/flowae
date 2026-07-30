import { o as __toESM } from "../_runtime.mjs";
import { n as require_react } from "../_libs/@radix-ui/react-compose-refs+[...].mjs";
import { a as signOut } from "./client-C0m4pohU.mjs";
import { o as ROLE_LABELS } from "./types-FkcXPGqw.mjs";
import { _ as Navigate, c as HeadContent, d as createRouter, f as Outlet, g as Link, h as createRootRoute, l as useRouterState, m as createFileRoute, p as lazyRouteComponent, s as Scripts } from "../_libs/@tanstack/react-router+[...].mjs";
import { i as require_jsx_runtime } from "../_libs/@radix-ui/react-label+[...].mjs";
import { t as cn } from "./createSsrRpc-_1pjCroF.mjs";
import { a as useBillingStore } from "./store-DUO1lHTD.mjs";
import { t as Toaster } from "../_libs/sonner.mjs";
import { D as FilePlus2, b as LayoutDashboard, f as Scale, g as Menu, l as Settings, o as SunMedium, t as X, w as FlaskConical, y as ListChecks } from "../_libs/lucide-react.mjs";
import { t as Route$9 } from "./facturas._id-CDdM-idF.mjs";
import { i as isHoyItem } from "./priority-CmdkFfTm.mjs";
import { t as auth } from "./server-D0_39adg.mjs";
import { i as useCurrentUserState, n as isDemoModeActive, r as useCurrentUser } from "./demo-login-B1UWi1z7.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/router-y_SjsBCp.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
/**
* App-wide client provider mounted once near the root (in `src/routes/__root.tsx`):
*
*   <AuthProvider><Outlet /></AuthProvider>
*
* Better Auth's React client (`@/lib/auth/client`) needs NO context provider —
* its `useSession()` works standalone — so this is a passthrough today. It's
* kept as the single, stable mount point for any future client-side providers
* (e.g. a toast or theme provider) without churning the root shell.
*/
function AuthProvider({ children }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_jsx_runtime.Fragment, { children });
}
/**
* Auth state components — plain wrappers around `useCurrentUserState()`.
*
* Auth is ON by default (including the sandbox live preview, which does real
* sign-in). Visitors are signed out until they authenticate. The shared dev
* user only appears when auth is explicitly disabled (`VITE_AUTH_ENABLED=false`).
* While the session is still resolving, gates that care about signed-out state
* render nothing so there's no signed-out flash on hard reload.
*/
/** Where `RedirectToSignIn` sends signed-out visitors. Create this route. */
var SIGN_IN_PATH = "/login";
/**
* Client-side redirect to the sign-in route (TanStack `<Navigate>` — NOT a full
* `window.location` reload). A hard navigation re-bootstraps the SPA and re-runs
* session loading, which feels like a second "Loading…" on /login.
*
* Guard routes by waiting out `isPending` first (see `use-current-user`), then
* render this.
*/
function RedirectToSignIn({ to = SIGN_IN_PATH }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Navigate, { to });
}
/**
* Minimal signed-in identity chip + sign-out. Restyle freely (see the
* `design-ui` skill). Sign-out is only shown when auth is enabled (the
* disabled-auth dev user has nothing to sign out of).
*/
function UserButton() {
	const user = useCurrentUser();
	if (!user) return null;
	const label = user.displayName ?? user.primaryEmail ?? "Account";
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex items-center gap-2",
		children: [
			user.profileImageUrl ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
				src: user.profileImageUrl,
				alt: "",
				className: "h-8 w-8 rounded-full object-cover"
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "grid h-8 w-8 place-items-center rounded-full bg-black/10 text-sm font-medium dark:bg-white/20",
				children: label.charAt(0).toUpperCase()
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "text-sm font-medium",
				children: label
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				type: "button",
				onClick: () => void signOut(),
				className: "cursor-pointer text-sm underline-offset-4 opacity-70 hover:underline",
				children: "Sign out"
			})
		]
	});
}
var nav = [
	{
		to: "/",
		label: "Panel",
		icon: LayoutDashboard,
		exact: true
	},
	{
		to: "/hoy",
		label: "Hoy",
		icon: SunMedium,
		exact: true
	},
	{
		to: "/nueva",
		label: "Nueva facturación",
		icon: FilePlus2,
		exact: true
	},
	{
		to: "/facturas",
		label: "Seguimiento",
		icon: ListChecks,
		exact: false
	},
	{
		to: "/configuracion",
		label: "Configuración",
		icon: Settings,
		exact: true
	}
];
function AppShell({ children }) {
	const pathname = useRouterState({ select: (s) => s.location.pathname });
	const firmName = useBillingStore((s) => s.settings.firmName);
	const invoices = useBillingStore((s) => s.invoices);
	const profile = useBillingStore((s) => s.profile);
	const { user, isPending } = useCurrentUserState();
	const hoyCount = (0, import_react.useMemo)(() => invoices.filter(isHoyItem).length, [invoices]);
	const [demoMode, setDemoMode] = (0, import_react.useState)(false);
	const [open, setOpen] = (0, import_react.useState)(false);
	(0, import_react.useEffect)(() => {
		setDemoMode(isDemoModeActive(user?.primaryEmail));
	}, [user?.primaryEmail]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex min-h-dvh max-w-[100vw] overflow-x-hidden bg-bg",
		children: [
			open && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				type: "button",
				className: "fixed inset-0 z-40 bg-fg/40 lg:hidden",
				"aria-label": "Cerrar menú",
				onClick: () => setOpen(false)
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("aside", {
				className: cn("fixed inset-y-0 left-0 z-50 flex w-64 flex-col bg-sidebar text-sidebar-fg transition-transform duration-200 lg:static lg:translate-x-0", open ? "translate-x-0" : "-translate-x-full"),
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center gap-3 border-b border-white/10 px-5 py-5",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "flex h-10 w-10 items-center justify-center rounded-lg bg-white/10",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Scale, { className: "size-5 text-sidebar-fg" })
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "min-w-0",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "truncate text-sm font-semibold tracking-tight",
									children: "FacturaFlow"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "truncate text-xs text-sidebar-muted",
									children: firmName
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								type: "button",
								className: "ml-auto rounded-md p-2 text-sidebar-muted hover:bg-sidebar-hover lg:hidden",
								onClick: () => setOpen(false),
								"aria-label": "Cerrar",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "size-4" })
							})
						]
					}),
					false,
					demoMode && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mx-3 mt-3 flex items-center gap-2 rounded-lg bg-warn/25 px-3 py-2 text-xs font-semibold text-sidebar-fg",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FlaskConical, { className: "size-3.5 shrink-0" }), "Modo demostración"]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("nav", {
						className: "flex flex-1 flex-col gap-1 p-3",
						children: nav.map((item) => {
							const active = item.exact ? pathname === item.to : pathname === item.to || pathname.startsWith(`${item.to}/`);
							const Icon = item.icon;
							return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
								to: item.to,
								onClick: () => setOpen(false),
								className: cn("flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors", active ? "bg-sidebar-active text-sidebar-fg" : "text-sidebar-muted hover:bg-sidebar-hover hover:text-sidebar-fg"),
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, { className: "size-4 shrink-0" }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "flex-1",
										children: item.label
									}),
									item.to === "/hoy" && hoyCount > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "rounded-full bg-white/15 px-2 py-0.5 text-[11px] font-semibold tabular text-sidebar-fg",
										children: hoyCount
									})
								]
							}, item.to);
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "space-y-2 border-t border-white/10 p-4",
						children: [profile && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "text-xs text-sidebar-muted",
							children: [
								"Rol:",
								" ",
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "font-medium text-sidebar-fg",
									children: ROLE_LABELS[profile.role]
								})
							]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-xs text-sidebar-muted",
							children: "Datos en servidor · multiusuario"
						})]
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex min-w-0 flex-1 flex-col overflow-x-hidden",
				children: [
					false,
					demoMode && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center justify-center gap-2 bg-warn px-3 py-1.5 text-center text-xs font-semibold text-white",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FlaskConical, { className: "size-3.5 shrink-0" }), "Estás en modo demostración — los datos son de ejemplo"]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
						className: "sticky top-0 z-30 flex h-14 items-center gap-3 border-b border-border bg-surface/90 px-4 backdrop-blur lg:px-8",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								type: "button",
								className: "rounded-md p-2 text-muted hover:bg-surface-2 lg:hidden",
								onClick: () => setOpen(true),
								"aria-label": "Abrir menú",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Menu, { className: "size-5" })
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "min-w-0 flex-1",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "truncate text-sm font-medium text-fg lg:hidden",
									children: "FacturaFlow"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "hidden text-sm text-muted lg:block",
									children: "Optimización de facturación y cobros del despacho"
								})]
							}),
							false,
							demoMode && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: "hidden items-center gap-1 rounded-full bg-warn-bg px-2.5 py-1 text-[11px] font-semibold text-warn sm:inline-flex",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FlaskConical, { className: "size-3" }), "Demo"]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "shrink-0",
								children: isPending ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "h-8 w-8 animate-pulse rounded-full bg-surface-2" }) : user ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(UserButton, {}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
									to: "/login",
									className: "text-sm font-medium text-accent hover:underline",
									children: "Entrar"
								})
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("main", {
						className: "min-w-0 flex-1 overflow-x-hidden px-4 py-6 lg:px-8 lg:py-8",
						children
					})
				]
			})
		]
	});
}
/**
* Ensures the signed-in user has loaded billing data from the server DB
* before rendering children. Replaces the old localStorage hydrate path.
*/
function BillingBootstrap({ children }) {
	const { user, isPending } = useCurrentUserState();
	const bootstrap = useBillingStore((s) => s.bootstrap);
	const hydrated = useBillingStore((s) => s.hydrated);
	const loading = useBillingStore((s) => s.loading);
	const error = useBillingStore((s) => s.error);
	const profile = useBillingStore((s) => s.profile);
	(0, import_react.useEffect)(() => {
		if (!user || isPending) return;
		let cancelled = false;
		(async () => {
			try {
				await bootstrap();
			} catch {
				if (cancelled) return;
			}
		})();
		return () => {
			cancelled = true;
		};
	}, [
		user?.id,
		isPending,
		bootstrap
	]);
	if (isPending) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoadingScreen, { label: "Comprobando sesión…" });
	if (!user) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RedirectToSignIn, {});
	if (!hydrated || loading) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoadingScreen, { label: "Cargando facturación del despacho…" });
	if (error) return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mx-auto flex max-w-md flex-col gap-3 py-20 text-center",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "text-lg font-semibold",
				children: "No se pudieron cargar los datos"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-sm text-muted",
				children: error
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				type: "button",
				className: "rounded-md bg-primary px-4 py-2 text-sm text-primary-fg",
				onClick: () => void bootstrap(),
				children: "Reintentar"
			})
		]
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [profile && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "sr-only",
		"aria-live": "polite",
		children: ["Rol: ", ROLE_LABELS[profile.role]]
	}), children] });
}
function LoadingScreen({ label }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex min-h-[50vh] flex-col items-center justify-center gap-3",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "h-8 w-8 animate-pulse rounded-full bg-surface-2" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "text-sm text-muted",
			children: label
		})]
	});
}
var styles_default = "/assets/styles-BlgRrZa1.css";
var Route$8 = createRootRoute({
	head: () => ({
		meta: [
			{ charSet: "utf-8" },
			{
				name: "viewport",
				content: "width=device-width, initial-scale=1"
			},
			{ title: "FacturaFlow — Facturación del despacho" },
			{
				name: "description",
				content: "Flujo optimizado de facturación para bufetes: concepto, Admin, SharePoint, cliente y cobros."
			}
		],
		links: [{
			rel: "stylesheet",
			href: styles_default
		}]
	}),
	component: RootComponent
});
function RootComponent() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("html", {
		lang: "es",
		suppressHydrationWarning: true,
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("head", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(HeadContent, {}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("body", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AuthProvider, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(RootLayout, {}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Toaster, {
			richColors: true,
			position: "top-right",
			closeButton: true
		})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Scripts, {})] })]
	});
}
function RootLayout() {
	if (useRouterState({ select: (s) => s.location.pathname }) === "/login") return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Outlet, {});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AppShell, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(BillingBootstrap, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Outlet, {}) }) });
}
var $$splitComponentImporter$6 = () => import("./routes-DEXIFQFa.mjs");
var Route$7 = createFileRoute("/")({ component: lazyRouteComponent($$splitComponentImporter$6, "component") });
var $$splitComponentImporter$5 = () => import("./configuracion-xwAtoPK6.mjs");
var Route$6 = createFileRoute("/configuracion")({ component: lazyRouteComponent($$splitComponentImporter$5, "component") });
var $$splitComponentImporter$4 = () => import("./facturas-CVVuyniV.mjs");
var Route$5 = createFileRoute("/facturas")({ component: lazyRouteComponent($$splitComponentImporter$4, "component") });
var $$splitComponentImporter$3 = () => import("./hoy-836_gIko.mjs");
var Route$4 = createFileRoute("/hoy")({ component: lazyRouteComponent($$splitComponentImporter$3, "component") });
var $$splitComponentImporter$2 = () => import("./login-DtroDp-E.mjs");
var Route$3 = createFileRoute("/login")({ component: lazyRouteComponent($$splitComponentImporter$2, "component") });
var $$splitComponentImporter$1 = () => import("./nueva-D5xJaUEQ.mjs");
var Route$2 = createFileRoute("/nueva")({ component: lazyRouteComponent($$splitComponentImporter$1, "component") });
var $$splitComponentImporter = () => import("./facturas.index-CwvbuIjh.mjs");
var Route$1 = createFileRoute("/facturas/")({ component: lazyRouteComponent($$splitComponentImporter, "component") });
var Route = createFileRoute("/api/auth/$")({ server: { handlers: {
	GET: ({ request }) => auth.handler(request),
	POST: ({ request }) => auth.handler(request)
} } });
var IndexRoute = Route$7.update({
	id: "/",
	path: "/",
	getParentRoute: () => Route$8
});
var ConfiguracionRoute = Route$6.update({
	id: "/configuracion",
	path: "/configuracion",
	getParentRoute: () => Route$8
});
var FacturasRoute = Route$5.update({
	id: "/facturas",
	path: "/facturas",
	getParentRoute: () => Route$8
});
var HoyRoute = Route$4.update({
	id: "/hoy",
	path: "/hoy",
	getParentRoute: () => Route$8
});
var LoginRoute = Route$3.update({
	id: "/login",
	path: "/login",
	getParentRoute: () => Route$8
});
var NuevaRoute = Route$2.update({
	id: "/nueva",
	path: "/nueva",
	getParentRoute: () => Route$8
});
var FacturasIndexRoute = Route$1.update({
	id: "/",
	path: "/",
	getParentRoute: () => FacturasRoute
});
var FacturasIdRoute = Route$9.update({
	id: "/$id",
	path: "/$id",
	getParentRoute: () => FacturasRoute
});
var ApiAuthSplatRoute = Route.update({
	id: "/api/auth/$",
	path: "/api/auth/$",
	getParentRoute: () => Route$8
});
var FacturasRouteChildren = {
	FacturasIdRoute,
	FacturasIndexRoute
};
var rootRouteChildren = {
	IndexRoute,
	ConfiguracionRoute,
	FacturasRoute: FacturasRoute._addFileChildren(FacturasRouteChildren),
	HoyRoute,
	LoginRoute,
	NuevaRoute,
	ApiAuthSplatRoute
};
var routeTree = Route$8._addFileChildren(rootRouteChildren)._addFileTypes();
function getRouter() {
	return createRouter({
		routeTree,
		defaultPreload: "intent",
		scrollRestoration: true
	});
}
//#endregion
export { getRouter };
