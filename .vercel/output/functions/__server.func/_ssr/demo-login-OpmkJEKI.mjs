import { a as isDemoLoginEnabled, i as DEMO_USER_PASSWORD, n as DEMO_USER_EMAIL, o as isDemoUserEmail, r as DEMO_USER_NAME, t as DEMO_MODE_STORAGE_KEY } from "./demo-config-D3j8NDJR.mjs";
import { i as setBearerToken, n as authEnabled, t as authClient } from "./client-BPhGxWc7.mjs";
import { r as createServerFn } from "./ssr.mjs";
import { n as createSsrRpc } from "./createSsrRpc-_1pjCroF.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/demo-login-OpmkJEKI.js
/**
* Stable fallback user, used ONLY when auth is explicitly disabled
* (`VITE_AUTH_ENABLED=false`). By default auth is on — the sandbox live preview
* does real sign-in via the baked preview client. Its id is
* `"dev-user"` — the SAME id `verify.server.ts` returns server-side — so per-user
* rows written in that mode belong to one consistent owner.
*/
var DEV_USER = {
	id: "dev-user",
	displayName: "Administración (acceso abierto)",
	primaryEmail: "dev@example.com",
	profileImageUrl: null,
	isDevFallback: true
};
/**
* Current user + loading state. Same behavior in live preview and when deployed:
*   - Auth enabled (default) -> the real signed-in user; `user` is `null` while
*                            the session resolves (`isPending: true`) and when
*                            signed out (`isPending: false`). Session comes from
*                            Better Auth `useSession()` → `/api/auth/get-session`
*                            (cookie when deployed; bearer in live preview).
*   - Auth disabled (`VITE_AUTH_ENABLED=false`) -> `DEV_USER` (admin), never pending.
*     Reactivar auth: quitar la variable o `VITE_AUTH_ENABLED=true` + redesplegar.
*
* Protect a route by waiting out `isPending` before acting on `user` —
* redirecting on `user: null` alone bounces signed-in visitors to sign-in on
* every hard reload:
*
*   import { RedirectToSignIn } from "@/lib/auth/gates";
*   const { user, isPending } = useCurrentUserState();
*   if (isPending) return null;              // still resolving — don't redirect yet
*   if (!user) return <RedirectToSignIn />;  // definitely signed out
*
* `authEnabled` is a module-level constant fixed at load, so the guarded hook
* call keeps a stable hook order across every render of a given component.
*/
function useCurrentUserState() {
	if (!authEnabled) return {
		user: DEV_USER,
		isPending: false
	};
	const { data, isPending } = authClient.useSession();
	const user = data?.user;
	return {
		user: user ? {
			id: user.id,
			displayName: user.name ?? null,
			primaryEmail: user.email ?? null,
			profileImageUrl: user.image ?? null,
			isDevFallback: false
		} : null,
		isPending
	};
}
/**
* Convenience view of `useCurrentUserState().user` for display (e.g.
* `user?.displayName ?? "Guest"`). NOTE: `null` means *loading OR signed out* —
* for redirects/guards use `useCurrentUserState()` and check `isPending`.
*/
function useCurrentUser() {
	return useCurrentUserState().user;
}
/**
* Provision the shared demo admin account and seed billing data.
* Intentionally unauthenticated — gated by isDemoLoginEnabled().
*/
var ensureDemoUserFn = createServerFn({ method: "POST" }).handler(createSsrRpc("7a1e9d0adc8849ee47f13a51f287f2773739987a8d387eee99c64d3664d8fa13"));
/**
* Client-side one-click demo login.
* Ensures the demo admin user exists (server), then signs in via Better Auth
* email/password and stores the session bearer for live-preview iframes.
*
* When auth is temporarily disabled (open-access), just navigates to the panel
* without calling Better Auth (avoids Invalid origin).
*/
function markDemoMode(on) {
	if (typeof window === "undefined") return;
	try {
		if (on) window.sessionStorage.setItem(DEMO_MODE_STORAGE_KEY, "1");
		else window.sessionStorage.removeItem(DEMO_MODE_STORAGE_KEY);
	} catch {}
}
/** True when this browser tab entered via the demo button (or is the demo user). */
function isDemoModeActive(email) {
	if (typeof window !== "undefined") try {
		if (window.sessionStorage.getItem("facturaflow.demo-mode") === "1") return true;
	} catch {}
	return isDemoUserEmail(email);
}
/**
* Enter demo mode: provision demo admin + seed data, then sign in without UI credentials.
* If auth is off (open access), redirects to the panel without Better Auth.
*/
async function enterDemoMode() {
	if (!authEnabled) {
		markDemoMode(true);
		if (typeof window !== "undefined") window.location.href = "/";
		return;
	}
	if (!isDemoLoginEnabled()) throw new Error("El modo demostración está desactivado");
	await ensureDemoUserFn();
	try {
		await authClient.signOut();
	} catch {}
	setBearerToken(null);
	let token = null;
	const signInRes = await authClient.signIn.email({
		email: DEMO_USER_EMAIL,
		password: DEMO_USER_PASSWORD
	});
	if (signInRes.error) {
		const signUpRes = await authClient.signUp.email({
			email: DEMO_USER_EMAIL,
			password: DEMO_USER_PASSWORD,
			name: DEMO_USER_NAME
		});
		if (signUpRes.error && !String(signUpRes.error.message ?? "").toLowerCase().match(/exist|already|registered/)) {}
		const retry = await authClient.signIn.email({
			email: DEMO_USER_EMAIL,
			password: DEMO_USER_PASSWORD
		});
		if (retry.error) throw new Error(retry.error.message ?? "No se pudo entrar en modo demo");
		token = extractToken(retry.data);
	} else token = extractToken(signInRes.data);
	if (token) setBearerToken(token);
	markDemoMode(true);
	try {
		await authClient.getSession();
	} catch {}
	if (typeof window !== "undefined") window.location.href = "/";
}
function extractToken(data) {
	if (!data || typeof data !== "object") return null;
	const d = data;
	if (typeof d.token === "string" && d.token) return d.token;
	const session = d.session;
	if (session && typeof session.token === "string") return session.token;
	return null;
}
//#endregion
export { useCurrentUserState as i, isDemoModeActive as n, useCurrentUser as r, enterDemoMode as t };
