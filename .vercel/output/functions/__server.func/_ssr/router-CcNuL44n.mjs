import { i as __toESM } from "../_runtime.mjs";
import { n as require_react } from "../_libs/@radix-ui/react-compose-refs+[...].mjs";
import { l as useBillingStore, r as cn } from "./store-BPhrqMPB.mjs";
import { i as require_jsx_runtime } from "../_libs/@radix-ui/react-label+[...].mjs";
import { t as Toaster } from "../_libs/sonner.mjs";
import { b as FilePlus2, g as LayoutDashboard, h as ListChecks, p as Menu, s as Settings, t as X, u as Scale } from "../_libs/lucide-react.mjs";
import { c as HeadContent, d as createRouter, f as Outlet, g as Link, h as createRootRoute, l as useRouterState, m as createFileRoute, p as lazyRouteComponent, s as Scripts } from "../_libs/@tanstack/react-router+[...].mjs";
import { t as Route$6 } from "./facturas._id-Bcg5aTPa.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/router-CcNuL44n.js
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
var nav = [
	{
		to: "/",
		label: "Panel",
		icon: LayoutDashboard
	},
	{
		to: "/nueva",
		label: "Nueva facturación",
		icon: FilePlus2
	},
	{
		to: "/facturas",
		label: "Seguimiento",
		icon: ListChecks
	},
	{
		to: "/configuracion",
		label: "Configuración",
		icon: Settings
	}
];
function AppShell({ children }) {
	const pathname = useRouterState({ select: (s) => s.location.pathname });
	const firmName = useBillingStore((s) => s.settings.firmName);
	const [open, setOpen] = (0, import_react.useState)(false);
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
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("nav", {
						className: "flex flex-1 flex-col gap-1 p-3",
						children: nav.map((item) => {
							const active = item.to === "/" ? pathname === "/" : pathname.startsWith(item.to);
							const Icon = item.icon;
							return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
								to: item.to,
								onClick: () => setOpen(false),
								className: cn("flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors", active ? "bg-sidebar-active text-sidebar-fg" : "text-sidebar-muted hover:bg-sidebar-hover hover:text-sidebar-fg"),
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, { className: "size-4 shrink-0" }), item.label]
							}, item.to);
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "border-t border-white/10 p-4 text-xs text-sidebar-muted",
						children: "Flujo: concepto → Admin (SAGE/LEXNEXT) → SharePoint → cliente → cobro"
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex min-w-0 flex-1 flex-col overflow-x-hidden",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
					className: "sticky top-0 z-30 flex h-14 items-center gap-3 border-b border-border bg-surface/90 px-4 backdrop-blur lg:px-8",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						className: "rounded-md p-2 text-muted hover:bg-surface-2 lg:hidden",
						onClick: () => setOpen(true),
						"aria-label": "Abrir menú",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Menu, { className: "size-5" })
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "min-w-0 flex-1",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "truncate text-sm font-medium text-fg lg:hidden",
							children: "FacturaFlow"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "hidden text-sm text-muted lg:block",
							children: "Optimización de facturación y cobros del despacho"
						})]
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("main", {
					className: "min-w-0 flex-1 overflow-x-hidden px-4 py-6 lg:px-8 lg:py-8",
					children
				})]
			})
		]
	});
}
var styles_default = "/assets/styles-BMG6Q2Oc.css";
var Route$5 = createRootRoute({
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
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("head", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(HeadContent, {}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("body", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AuthProvider, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AppShell, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Outlet, {}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Toaster, {
			richColors: true,
			position: "top-right",
			closeButton: true
		})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Scripts, {})] })]
	});
}
var $$splitComponentImporter$4 = () => import("./routes-CYGMftD9.mjs");
var Route$4 = createFileRoute("/")({ component: lazyRouteComponent($$splitComponentImporter$4, "component") });
var $$splitComponentImporter$3 = () => import("./configuracion-Bd85Qamr.mjs");
var Route$3 = createFileRoute("/configuracion")({ component: lazyRouteComponent($$splitComponentImporter$3, "component") });
var $$splitComponentImporter$2 = () => import("./facturas-CVVuyniV.mjs");
var Route$2 = createFileRoute("/facturas")({ component: lazyRouteComponent($$splitComponentImporter$2, "component") });
var $$splitComponentImporter$1 = () => import("./nueva-ByUg9Mxc.mjs");
var Route$1 = createFileRoute("/nueva")({ component: lazyRouteComponent($$splitComponentImporter$1, "component") });
var $$splitComponentImporter = () => import("./facturas.index-DqFUduXo.mjs");
var Route = createFileRoute("/facturas/")({ component: lazyRouteComponent($$splitComponentImporter, "component") });
var IndexRoute = Route$4.update({
	id: "/",
	path: "/",
	getParentRoute: () => Route$5
});
var ConfiguracionRoute = Route$3.update({
	id: "/configuracion",
	path: "/configuracion",
	getParentRoute: () => Route$5
});
var FacturasRoute = Route$2.update({
	id: "/facturas",
	path: "/facturas",
	getParentRoute: () => Route$5
});
var NuevaRoute = Route$1.update({
	id: "/nueva",
	path: "/nueva",
	getParentRoute: () => Route$5
});
var FacturasIndexRoute = Route.update({
	id: "/",
	path: "/",
	getParentRoute: () => FacturasRoute
});
var FacturasRouteChildren = {
	FacturasIdRoute: Route$6.update({
		id: "/$id",
		path: "/$id",
		getParentRoute: () => FacturasRoute
	}),
	FacturasIndexRoute
};
var rootRouteChildren = {
	IndexRoute,
	ConfiguracionRoute,
	FacturasRoute: FacturasRoute._addFileChildren(FacturasRouteChildren),
	NuevaRoute
};
var routeTree = Route$5._addFileChildren(rootRouteChildren)._addFileTypes();
function getRouter() {
	return createRouter({
		routeTree,
		defaultPreload: "intent",
		scrollRestoration: true
	});
}
//#endregion
export { getRouter };
