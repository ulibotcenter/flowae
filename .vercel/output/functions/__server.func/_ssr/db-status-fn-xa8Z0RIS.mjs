import { r as createServerFn } from "./ssr.mjs";
import { a as getDatabaseConfigError, n as dbSource } from "./db-m21Nw3rD.mjs";
import { t as createServerRpc } from "./createServerRpc-CcvdN_gc.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/db-status-fn-xa8Z0RIS.js
/** Public: whether the server can open a database (for login/demo messaging). */
var getDbStatusFn_createServerFn_handler = createServerRpc({
	id: "a44e40067f99ce36a4338e159c9342d22cb5a5badcbd17470a2fae381cd07fb3",
	name: "getDbStatusFn",
	filename: "src/lib/db-status-fn.ts"
}, (opts) => getDbStatusFn.__executeServer(opts));
var getDbStatusFn = createServerFn({ method: "GET" }).handler(getDbStatusFn_createServerFn_handler, async () => {
	const message = getDatabaseConfigError();
	return {
		ready: message == null,
		source: dbSource,
		message
	};
});
//#endregion
export { getDbStatusFn_createServerFn_handler };
