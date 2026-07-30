import { i as getRequest } from "./ssr.mjs";
import { n as authConfigured, t as auth } from "./server-D0_39adg.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/verify.server-RZHPgX6A.js
/**
* Server-side session resolution (server-only).
*
* Because this app runs its OWN Better Auth at same-origin `/api/auth/*`, the
* session cookie is sent with every request to this app — server functions AND
* SSR loaders included. So we resolve the user straight from the request cookies
* via `auth.api.getSession` (no client-minted JWT needed). Never trust a
* client-supplied user id — only the result of this verification.
*
* ## Temporary open access (auth off)
* Set `VITE_AUTH_ENABLED=false` (build + runtime) to skip login and use the
* shared admin `dev-user`. Useful for Vercel demos when OAuth origin is not
* ready yet. **Re-enable auth** by removing the var or setting
* `VITE_AUTH_ENABLED=true` and redeploying.
*/
/** True when a real database is configured server-side. */
var databaseConfigured = Boolean(process.env.DATABASE_URL?.trim());
if (!authConfigured) console.warn("[auth] VITE_AUTH_ENABLED=false — acceso abierto con usuario compartido `dev-user` (admin). Reactivar: quitar la variable o poner VITE_AUTH_ENABLED=true y redesplegar." + (databaseConfigured ? " ATENCIÓN: DATABASE_URL está configurada; todos los visitantes comparten el mismo usuario admin." : ""));
/** Dev fallback user id, used only when auth is disabled (VITE_AUTH_ENABLED=false). */
var DEV_USER_ID = "dev-user";
/**
* Thrown by `requireUserId` when the caller has no valid session. Carries
* `status: 401`; the message is a stable contract — match
* `err.message === "Unauthorized"` client-side to send the visitor to sign-in.
*/
var UnauthorizedError = class extends Error {
	status = 401;
	constructor() {
		super("Unauthorized");
		this.name = "UnauthorizedError";
	}
};
/**
* Resolve the signed-in user from the current request, or `null` when auth isn't
* configured / nobody is signed in. Safe to call from server functions and SSR
* loaders.
*
* `bearerToken` is for the LIVE PREVIEW: the app runs in a partitioned iframe
* whose cookies don't reach the server, so `authMiddleware` forwards the session
* as a bearer token, which we present as `Authorization: Bearer …` (the `bearer`
* plugin resolves it). When deployed no token is passed and the cookie is used.
*/
async function getSessionUser(bearerToken) {
	if (!authConfigured) return null;
	const request = getRequest();
	if (!request) return null;
	let headers = request.headers;
	if (bearerToken) {
		headers = new Headers(request.headers);
		headers.set("Authorization", `Bearer ${bearerToken}`);
	}
	const session = await auth.api.getSession({ headers });
	if (!session?.user) return null;
	return {
		id: session.user.id,
		email: session.user.email ?? null
	};
}
/**
* Resolve the current user id for a server function, or throw when unauthorized.
* Prefer `authMiddleware` (`./middleware`), which calls this for you.
* - Auth enabled (default) -> the verified session user id; throws
*   `UnauthorizedError` when signed out.
* - Auth disabled (`VITE_AUTH_ENABLED=false`) -> shared `dev-user` (admin),
*   even when DATABASE_URL is set (temporary open-demo mode for the firm).
*   Re-enable auth for production multi-user security.
*/
async function requireUserId(bearerToken) {
	if (!authConfigured) return DEV_USER_ID;
	const user = await getSessionUser(bearerToken);
	if (!user) throw new UnauthorizedError();
	return user.id;
}
//#endregion
export { requireUserId };
