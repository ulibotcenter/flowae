import { s as STATUS_LABELS } from "./types-FkcXPGqw.mjs";
import { i as require_jsx_runtime } from "../_libs/@radix-ui/react-label+[...].mjs";
import { t as cva } from "../_libs/class-variance-authority+clsx.mjs";
import { t as cn } from "./createSsrRpc-_1pjCroF.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/StatusBadge-DZ9msNwd.js
var import_jsx_runtime = require_jsx_runtime();
var badgeVariants = cva("inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium transition-colors", {
	variants: { variant: {
		default: "border-transparent bg-surface-2 text-fg",
		primary: "border-transparent bg-info-bg text-info",
		success: "border-transparent bg-success-bg text-success",
		warn: "border-transparent bg-warn-bg text-warn",
		danger: "border-transparent bg-danger-bg text-danger",
		outline: "border-border text-muted"
	} },
	defaultVariants: { variant: "default" }
});
function Badge({ className, variant, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: cn(badgeVariants({ variant }), className),
		...props
	});
}
var map = {
	borrador: "outline",
	solicitada_admin: "primary",
	emitida: "primary",
	enviada_cliente: "default",
	pagada: "success",
	parcial: "warn",
	vencida: "danger"
};
function StatusBadge({ status }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
		variant: map[status],
		children: STATUS_LABELS[status]
	});
}
//#endregion
export { StatusBadge as t };
