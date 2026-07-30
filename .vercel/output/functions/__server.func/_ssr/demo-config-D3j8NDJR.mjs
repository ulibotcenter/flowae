//#region node_modules/.nitro/vite/services/ssr/assets/demo-config-D3j8NDJR.js
/**
* One-click demo login for client demos of the despacho tool.
*
* Disable either flag to hide the button and reject demo server entry:
*   - VITE_DEMO_LOGIN=false   (client + build-time, recommended)
*   - DEMO_LOGIN_ENABLED=false (server-only kill switch)
*
* Default: enabled.
*/
var DEMO_USER_EMAIL = "demo@facturaflow.app";
var DEMO_USER_NAME = "Demo Administración";
/** Public demo password — intentional; demo mode is open by design. */
var DEMO_USER_PASSWORD = "DemoFacturaFlow-2026!";
var DEMO_MODE_STORAGE_KEY = "facturaflow.demo-mode";
function envIsFalse(value) {
	if (!value) return false;
	const v = value.trim().toLowerCase();
	return v === "false" || v === "0" || v === "off" || v === "no";
}
/**
* Whether the "Entrar en modo demostración" entry point is available.
* Safe to call from client and server modules bundled by Vite.
*/
function isDemoLoginEnabled() {
	if (typeof process !== "undefined" && envIsFalse(process.env.DEMO_LOGIN_ENABLED)) return false;
	if (typeof process !== "undefined" && envIsFalse(process.env.VITE_DEMO_LOGIN)) return false;
	try {
		if (envIsFalse(void 0)) return false;
	} catch {}
	return true;
}
function isDemoUserEmail(email) {
	if (!email) return false;
	return email.trim().toLowerCase() === DEMO_USER_EMAIL.toLowerCase();
}
//#endregion
export { isDemoLoginEnabled as a, DEMO_USER_PASSWORD as i, DEMO_USER_EMAIL as n, isDemoUserEmail as o, DEMO_USER_NAME as r, DEMO_MODE_STORAGE_KEY as t };
