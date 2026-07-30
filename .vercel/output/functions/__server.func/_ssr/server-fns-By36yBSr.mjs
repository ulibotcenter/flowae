import { r as createServerFn } from "./ssr.mjs";
import { t as authMiddleware } from "./middleware-B9Q6ahO-.mjs";
import { t as createServerRpc } from "./createServerRpc-CcvdN_gc.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/server-fns-By36yBSr.js
async function actorFromContext(userId) {
	let email = null;
	let name = null;
	if (userId === "dev-user") {
		email = "dev@example.com";
		name = "Administración (acceso abierto)";
	} else try {
		const { getSql } = await import("./db-m21Nw3rD.mjs").then((n) => n.r).then((n) => n.n);
		const rows = await (await getSql())`
        select name, email from "user" where id = ${userId} limit 1
      `;
		if (rows[0]) {
			name = rows[0].name ?? null;
			email = rows[0].email ?? null;
		}
	} catch {}
	return (await import("./server-repo-CLJHK_dd.mjs")).resolveActor(userId, email, name);
}
var getBillingBootstrap_createServerFn_handler = createServerRpc({
	id: "1901044f46103e7c9c66ed45f6efef1a8343efd22a8dec8c4ecf2f29df37628d",
	name: "getBillingBootstrap",
	filename: "src/lib/billing/server-fns.ts"
}, (opts) => getBillingBootstrap.__executeServer(opts));
var getBillingBootstrap = createServerFn({ method: "GET" }).middleware([authMiddleware]).handler(getBillingBootstrap_createServerFn_handler, async ({ context }) => {
	const repo = await import("./server-repo-CLJHK_dd.mjs");
	const actor = await actorFromContext(context.userId);
	return repo.loadBootstrap(actor);
});
var createInvoiceFn_createServerFn_handler = createServerRpc({
	id: "43c1cc3091633ce4e561e2523d92dbf06f3e8416392527d03b1b3afb3b565fb9",
	name: "createInvoiceFn",
	filename: "src/lib/billing/server-fns.ts"
}, (opts) => createInvoiceFn.__executeServer(opts));
var createInvoiceFn = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((data) => data).handler(createInvoiceFn_createServerFn_handler, async ({ context, data }) => {
	const repo = await import("./server-repo-CLJHK_dd.mjs");
	const actor = await actorFromContext(context.userId);
	return repo.createInvoiceFromDraft(actor, data);
});
var updateInvoiceFn_createServerFn_handler = createServerRpc({
	id: "c8ac20e3e297af7541e54e989055e573988e8b7ed3ffa71b9d9785ea1cb8b353",
	name: "updateInvoiceFn",
	filename: "src/lib/billing/server-fns.ts"
}, (opts) => updateInvoiceFn.__executeServer(opts));
var updateInvoiceFn = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((data) => data).handler(updateInvoiceFn_createServerFn_handler, async ({ context, data }) => {
	const repo = await import("./server-repo-CLJHK_dd.mjs");
	const actor = await actorFromContext(context.userId);
	return repo.updateInvoiceFields(actor, data.id, data.patch);
});
var deleteInvoiceFn_createServerFn_handler = createServerRpc({
	id: "6918c9235add1bfc2501b1779e5d55d0ca8d84c40740c91788be9817466891b2",
	name: "deleteInvoiceFn",
	filename: "src/lib/billing/server-fns.ts"
}, (opts) => deleteInvoiceFn.__executeServer(opts));
var deleteInvoiceFn = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((data) => data).handler(deleteInvoiceFn_createServerFn_handler, async ({ context, data }) => {
	const repo = await import("./server-repo-CLJHK_dd.mjs");
	const actor = await actorFromContext(context.userId);
	await repo.deleteInvoice(actor, data.id);
	return { ok: true };
});
var requestAdminFn_createServerFn_handler = createServerRpc({
	id: "5975558be30efc7ad28339731a0032e6957c5e0d8e451788acea035656db3534",
	name: "requestAdminFn",
	filename: "src/lib/billing/server-fns.ts"
}, (opts) => requestAdminFn.__executeServer(opts));
var requestAdminFn = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((data) => data).handler(requestAdminFn_createServerFn_handler, async ({ context, data }) => {
	const repo = await import("./server-repo-CLJHK_dd.mjs");
	const actor = await actorFromContext(context.userId);
	return repo.requestAdmin(actor, data.id);
});
var markIssuedFn_createServerFn_handler = createServerRpc({
	id: "7a5d571236a03ad2041445377eee2c7de7d7501018a4fa4a9ec71637deef7e2e",
	name: "markIssuedFn",
	filename: "src/lib/billing/server-fns.ts"
}, (opts) => markIssuedFn.__executeServer(opts));
var markIssuedFn = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((data) => data).handler(markIssuedFn_createServerFn_handler, async ({ context, data }) => {
	const repo = await import("./server-repo-CLJHK_dd.mjs");
	const actor = await actorFromContext(context.userId);
	return repo.markIssued(actor, data.id, data.invoiceNumber);
});
var markSentToClientFn_createServerFn_handler = createServerRpc({
	id: "045f821e5b99c550175d68fe51c7a9363aea8294a0758e91386c0702f302fa26",
	name: "markSentToClientFn",
	filename: "src/lib/billing/server-fns.ts"
}, (opts) => markSentToClientFn.__executeServer(opts));
var markSentToClientFn = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((data) => data).handler(markSentToClientFn_createServerFn_handler, async ({ context, data }) => {
	const repo = await import("./server-repo-CLJHK_dd.mjs");
	const actor = await actorFromContext(context.userId);
	return repo.markSentToClient(actor, data.id);
});
var registerPaymentFn_createServerFn_handler = createServerRpc({
	id: "c2fbfade57d44a4c9849c6ab76b1433f36e3b77840bb7d462c30e6e727fe87aa",
	name: "registerPaymentFn",
	filename: "src/lib/billing/server-fns.ts"
}, (opts) => registerPaymentFn.__executeServer(opts));
var registerPaymentFn = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((data) => data).handler(registerPaymentFn_createServerFn_handler, async ({ context, data }) => {
	const repo = await import("./server-repo-CLJHK_dd.mjs");
	const actor = await actorFromContext(context.userId);
	return repo.registerPayment(actor, data.id, data.amount, data.full);
});
var refreshEmailsFn_createServerFn_handler = createServerRpc({
	id: "479c42948f57cb2ce1ac723ca91458345466fdd5219fdfc09fda0fe14c1c2b0e",
	name: "refreshEmailsFn",
	filename: "src/lib/billing/server-fns.ts"
}, (opts) => refreshEmailsFn.__executeServer(opts));
var refreshEmailsFn = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((data) => data).handler(refreshEmailsFn_createServerFn_handler, async ({ context, data }) => {
	const repo = await import("./server-repo-CLJHK_dd.mjs");
	const actor = await actorFromContext(context.userId);
	return repo.refreshEmails(actor, data.id);
});
var batchRequestAdminFn_createServerFn_handler = createServerRpc({
	id: "2f0a2b37fd14bc3df2a56736c3f5e0e40d28a53c1156f9013d64a4a3cf18de30",
	name: "batchRequestAdminFn",
	filename: "src/lib/billing/server-fns.ts"
}, (opts) => batchRequestAdminFn.__executeServer(opts));
var batchRequestAdminFn = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((data) => data).handler(batchRequestAdminFn_createServerFn_handler, async ({ context, data }) => {
	const repo = await import("./server-repo-CLJHK_dd.mjs");
	const actor = await actorFromContext(context.userId);
	return { count: await repo.batchRequestAdmin(actor, data.ids) };
});
var batchMarkSentFn_createServerFn_handler = createServerRpc({
	id: "2bb98d0ad991ee3075001c853c59c9fae60cfbf3c593cd38bf4112dc506f7e27",
	name: "batchMarkSentFn",
	filename: "src/lib/billing/server-fns.ts"
}, (opts) => batchMarkSentFn.__executeServer(opts));
var batchMarkSentFn = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((data) => data).handler(batchMarkSentFn_createServerFn_handler, async ({ context, data }) => {
	const repo = await import("./server-repo-CLJHK_dd.mjs");
	const actor = await actorFromContext(context.userId);
	return { count: await repo.batchMarkSent(actor, data.ids) };
});
var batchRefreshOverdueFn_createServerFn_handler = createServerRpc({
	id: "7b14fb701cb11863714aa3e3f75353cc1bdc341529aea63d4d10f7d877f4c69b",
	name: "batchRefreshOverdueFn",
	filename: "src/lib/billing/server-fns.ts"
}, (opts) => batchRefreshOverdueFn.__executeServer(opts));
var batchRefreshOverdueFn = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((data) => data).handler(batchRefreshOverdueFn_createServerFn_handler, async ({ context, data }) => {
	const repo = await import("./server-repo-CLJHK_dd.mjs");
	const actor = await actorFromContext(context.userId);
	return { count: await repo.batchRefreshOverdue(actor, data.ids) };
});
var saveSettingsFn_createServerFn_handler = createServerRpc({
	id: "eb4e204be12d2eeafe54f6ade6459dd9c7b03e5bb51c181599b85aa4982e9728",
	name: "saveSettingsFn",
	filename: "src/lib/billing/server-fns.ts"
}, (opts) => saveSettingsFn.__executeServer(opts));
var saveSettingsFn = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((data) => data).handler(saveSettingsFn_createServerFn_handler, async ({ context, data }) => {
	const repo = await import("./server-repo-CLJHK_dd.mjs");
	const actor = await actorFromContext(context.userId);
	return repo.saveSettings(actor, data);
});
var upsertLawyerFn_createServerFn_handler = createServerRpc({
	id: "a24ffb7cd0bb28ccc09b004b21ae4484121af9921a847f031c569ae14d36d4ba",
	name: "upsertLawyerFn",
	filename: "src/lib/billing/server-fns.ts"
}, (opts) => upsertLawyerFn.__executeServer(opts));
var upsertLawyerFn = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((data) => data).handler(upsertLawyerFn_createServerFn_handler, async ({ context, data }) => {
	const repo = await import("./server-repo-CLJHK_dd.mjs");
	const actor = await actorFromContext(context.userId);
	return repo.upsertLawyer(actor, data);
});
var removeLawyerFn_createServerFn_handler = createServerRpc({
	id: "3e1cf16108e3dffe204e0cf9716bff62e5749e4dc5a71431510497255798cf5f",
	name: "removeLawyerFn",
	filename: "src/lib/billing/server-fns.ts"
}, (opts) => removeLawyerFn.__executeServer(opts));
var removeLawyerFn = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((data) => data).handler(removeLawyerFn_createServerFn_handler, async ({ context, data }) => {
	const repo = await import("./server-repo-CLJHK_dd.mjs");
	const actor = await actorFromContext(context.userId);
	await repo.removeLawyer(actor, data.id);
	return { ok: true };
});
var resetDemoFn_createServerFn_handler = createServerRpc({
	id: "757887c467808cff0d07f34da25ed1971dd9b5614bea2633b0544c87dd3b9de5",
	name: "resetDemoFn",
	filename: "src/lib/billing/server-fns.ts"
}, (opts) => resetDemoFn.__executeServer(opts));
var resetDemoFn = createServerFn({ method: "POST" }).middleware([authMiddleware]).handler(resetDemoFn_createServerFn_handler, async ({ context }) => {
	const repo = await import("./server-repo-CLJHK_dd.mjs");
	const actor = await actorFromContext(context.userId);
	return repo.resetDemoData(actor);
});
var listProfilesFn_createServerFn_handler = createServerRpc({
	id: "4bc80a57a7ad656a62df07d610687b26406118b05928106591377c1b8515b757",
	name: "listProfilesFn",
	filename: "src/lib/billing/server-fns.ts"
}, (opts) => listProfilesFn.__executeServer(opts));
var listProfilesFn = createServerFn({ method: "GET" }).middleware([authMiddleware]).handler(listProfilesFn_createServerFn_handler, async ({ context }) => {
	const repo = await import("./server-repo-CLJHK_dd.mjs");
	const actor = await actorFromContext(context.userId);
	return repo.listProfiles(actor);
});
var setUserRoleFn_createServerFn_handler = createServerRpc({
	id: "cc9668f5a7d7ef75678ee71652375e48684a57a69dce9db85a8d33d614657c3d",
	name: "setUserRoleFn",
	filename: "src/lib/billing/server-fns.ts"
}, (opts) => setUserRoleFn.__executeServer(opts));
var setUserRoleFn = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((data) => data).handler(setUserRoleFn_createServerFn_handler, async ({ context, data }) => {
	const repo = await import("./server-repo-CLJHK_dd.mjs");
	const actor = await actorFromContext(context.userId);
	await repo.setUserRole(actor, data.userId, data.role, data.lawyerId);
	return { ok: true };
});
var sendAdminEmailFn_createServerFn_handler = createServerRpc({
	id: "6c766d6858f694877752a98bb94bf92583021cccaec280feb70be19f5ebd5d38",
	name: "sendAdminEmailFn",
	filename: "src/lib/billing/server-fns.ts"
}, (opts) => sendAdminEmailFn.__executeServer(opts));
var sendAdminEmailFn = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((data) => data).handler(sendAdminEmailFn_createServerFn_handler, async ({ context, data }) => {
	const repo = await import("./server-repo-CLJHK_dd.mjs");
	const actor = await actorFromContext(context.userId);
	return repo.sendAdminEmail(actor, data.id, {
		subject: data.subject,
		body: data.body
	});
});
var sendClientEmailFn_createServerFn_handler = createServerRpc({
	id: "2203c1e7fc584049b307518911ef2075a0fbade5e6835a0f0be69fb86a2db1ab",
	name: "sendClientEmailFn",
	filename: "src/lib/billing/server-fns.ts"
}, (opts) => sendClientEmailFn.__executeServer(opts));
var sendClientEmailFn = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((data) => data).handler(sendClientEmailFn_createServerFn_handler, async ({ context, data }) => {
	const repo = await import("./server-repo-CLJHK_dd.mjs");
	const actor = await actorFromContext(context.userId);
	return repo.sendClientEmail(actor, data.id, {
		subject: data.subject,
		body: data.body
	});
});
var getMailStatusFn_createServerFn_handler = createServerRpc({
	id: "bd2a52cdf49b6c672a4e0d852e88a7a5d7c5bdd9fe06e1ea4d0511fc14dff362",
	name: "getMailStatusFn",
	filename: "src/lib/billing/server-fns.ts"
}, (opts) => getMailStatusFn.__executeServer(opts));
var getMailStatusFn = createServerFn({ method: "GET" }).middleware([authMiddleware]).handler(getMailStatusFn_createServerFn_handler, async () => {
	const { getMailProviderStatus } = await import("./resend-BV1h-HJu.mjs");
	return getMailProviderStatus();
});
var listInvoiceEventsFn_createServerFn_handler = createServerRpc({
	id: "366a9ac964eea89f9d3e784268679178077d477e8b4fd60ccfb1964a4530c2e0",
	name: "listInvoiceEventsFn",
	filename: "src/lib/billing/server-fns.ts"
}, (opts) => listInvoiceEventsFn.__executeServer(opts));
var listInvoiceEventsFn = createServerFn({ method: "GET" }).middleware([authMiddleware]).validator((data) => data).handler(listInvoiceEventsFn_createServerFn_handler, async ({ context, data }) => {
	const repo = await import("./server-repo-CLJHK_dd.mjs");
	const actor = await actorFromContext(context.userId);
	return repo.listInvoiceEvents(actor, data.invoiceId);
});
//#endregion
export { batchMarkSentFn_createServerFn_handler, batchRefreshOverdueFn_createServerFn_handler, batchRequestAdminFn_createServerFn_handler, createInvoiceFn_createServerFn_handler, deleteInvoiceFn_createServerFn_handler, getBillingBootstrap_createServerFn_handler, getMailStatusFn_createServerFn_handler, listInvoiceEventsFn_createServerFn_handler, listProfilesFn_createServerFn_handler, markIssuedFn_createServerFn_handler, markSentToClientFn_createServerFn_handler, refreshEmailsFn_createServerFn_handler, registerPaymentFn_createServerFn_handler, removeLawyerFn_createServerFn_handler, requestAdminFn_createServerFn_handler, resetDemoFn_createServerFn_handler, saveSettingsFn_createServerFn_handler, sendAdminEmailFn_createServerFn_handler, sendClientEmailFn_createServerFn_handler, setUserRoleFn_createServerFn_handler, updateInvoiceFn_createServerFn_handler, upsertLawyerFn_createServerFn_handler };
