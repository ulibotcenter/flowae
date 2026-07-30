import { o as __toESM } from "../_runtime.mjs";
import { n as require_react } from "../_libs/@radix-ui/react-compose-refs+[...].mjs";
import { i as require_jsx_runtime, t as Label$1 } from "../_libs/@radix-ui/react-label+[...].mjs";
import { t as cn } from "./createSsrRpc-_1pjCroF.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/label-BBpU3UnU.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var Input = import_react.forwardRef(({ className, type, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
	type,
	className: cn("flex h-10 w-full rounded-md border border-border bg-surface px-3 py-2 text-sm text-fg shadow-sm transition-colors placeholder:text-subtle focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent disabled:cursor-not-allowed disabled:opacity-50", className),
	ref,
	...props
}));
Input.displayName = "Input";
var Label = import_react.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label$1, {
	ref,
	className: cn("text-xs font-medium uppercase tracking-wide text-muted", className),
	...props
}));
Label.displayName = "Label";
//#endregion
export { Label as n, Input as t };
