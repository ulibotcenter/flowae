import { r as createServerFn } from "./ssr.mjs";
import { t as authMiddleware } from "./middleware-DQfimyJH.mjs";
import { n as DEFAULT_SETTINGS, t as DEFAULT_LAWYERS } from "./seed-CIUWINzu.mjs";
import { n as createSsrRpc } from "./createSsrRpc-_1pjCroF.mjs";
import { t as create } from "../_libs/zustand.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/store-Cs4R4P7Z.js
var getBillingBootstrap = createServerFn({ method: "GET" }).middleware([authMiddleware]).handler(createSsrRpc("1901044f46103e7c9c66ed45f6efef1a8343efd22a8dec8c4ecf2f29df37628d"));
var createInvoiceFn = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((data) => data).handler(createSsrRpc("43c1cc3091633ce4e561e2523d92dbf06f3e8416392527d03b1b3afb3b565fb9"));
var updateInvoiceFn = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((data) => data).handler(createSsrRpc("c8ac20e3e297af7541e54e989055e573988e8b7ed3ffa71b9d9785ea1cb8b353"));
var deleteInvoiceFn = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((data) => data).handler(createSsrRpc("6918c9235add1bfc2501b1779e5d55d0ca8d84c40740c91788be9817466891b2"));
var requestAdminFn = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((data) => data).handler(createSsrRpc("5975558be30efc7ad28339731a0032e6957c5e0d8e451788acea035656db3534"));
var markIssuedFn = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((data) => data).handler(createSsrRpc("7a5d571236a03ad2041445377eee2c7de7d7501018a4fa4a9ec71637deef7e2e"));
var markSentToClientFn = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((data) => data).handler(createSsrRpc("045f821e5b99c550175d68fe51c7a9363aea8294a0758e91386c0702f302fa26"));
var registerPaymentFn = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((data) => data).handler(createSsrRpc("c2fbfade57d44a4c9849c6ab76b1433f36e3b77840bb7d462c30e6e727fe87aa"));
var refreshEmailsFn = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((data) => data).handler(createSsrRpc("479c42948f57cb2ce1ac723ca91458345466fdd5219fdfc09fda0fe14c1c2b0e"));
var batchRequestAdminFn = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((data) => data).handler(createSsrRpc("2f0a2b37fd14bc3df2a56736c3f5e0e40d28a53c1156f9013d64a4a3cf18de30"));
var batchMarkSentFn = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((data) => data).handler(createSsrRpc("2bb98d0ad991ee3075001c853c59c9fae60cfbf3c593cd38bf4112dc506f7e27"));
var batchRefreshOverdueFn = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((data) => data).handler(createSsrRpc("7b14fb701cb11863714aa3e3f75353cc1bdc341529aea63d4d10f7d877f4c69b"));
var saveSettingsFn = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((data) => data).handler(createSsrRpc("eb4e204be12d2eeafe54f6ade6459dd9c7b03e5bb51c181599b85aa4982e9728"));
var upsertLawyerFn = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((data) => data).handler(createSsrRpc("a24ffb7cd0bb28ccc09b004b21ae4484121af9921a847f031c569ae14d36d4ba"));
var removeLawyerFn = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((data) => data).handler(createSsrRpc("3e1cf16108e3dffe204e0cf9716bff62e5749e4dc5a71431510497255798cf5f"));
var resetDemoFn = createServerFn({ method: "POST" }).middleware([authMiddleware]).handler(createSsrRpc("757887c467808cff0d07f34da25ed1971dd9b5614bea2633b0544c87dd3b9de5"));
var listProfilesFn = createServerFn({ method: "GET" }).middleware([authMiddleware]).handler(createSsrRpc("4bc80a57a7ad656a62df07d610687b26406118b05928106591377c1b8515b757"));
var setUserRoleFn = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((data) => data).handler(createSsrRpc("cc9668f5a7d7ef75678ee71652375e48684a57a69dce9db85a8d33d614657c3d"));
var sendAdminEmailFn = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((data) => data).handler(createSsrRpc("6c766d6858f694877752a98bb94bf92583021cccaec280feb70be19f5ebd5d38"));
var sendClientEmailFn = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((data) => data).handler(createSsrRpc("2203c1e7fc584049b307518911ef2075a0fbade5e6835a0f0be69fb86a2db1ab"));
var getMailStatusFn = createServerFn({ method: "GET" }).middleware([authMiddleware]).handler(createSsrRpc("bd2a52cdf49b6c672a4e0d852e88a7a5d7c5bdd9fe06e1ea4d0511fc14dff362"));
var listInvoiceEventsFn = createServerFn({ method: "GET" }).middleware([authMiddleware]).validator((data) => data).handler(createSsrRpc("366a9ac964eea89f9d3e784268679178077d477e8b4fd60ccfb1964a4530c2e0"));
function replaceInvoice(list, inv) {
	return list.map((i) => i.id === inv.id ? inv : i);
}
var useBillingStore = create((set, get) => ({
	settings: DEFAULT_SETTINGS,
	lawyers: DEFAULT_LAWYERS,
	invoices: [],
	profile: null,
	seq: 0,
	hydrated: false,
	loading: false,
	error: null,
	setHydrated: (v) => set({ hydrated: v }),
	applyBootstrap: (data) => set({
		settings: data.settings,
		lawyers: data.lawyers,
		invoices: data.invoices,
		profile: data.profile,
		seq: data.seq,
		hydrated: true,
		loading: false,
		error: null
	}),
	bootstrap: async () => {
		set({
			loading: true,
			error: null
		});
		try {
			const data = await getBillingBootstrap();
			get().applyBootstrap(data);
		} catch (err) {
			set({
				loading: false,
				error: err instanceof Error ? err.message : "Error al cargar datos",
				hydrated: false
			});
			throw err;
		}
	},
	updateSettings: async (patch) => {
		set({ settings: await saveSettingsFn({ data: {
			...get().settings,
			...patch
		} }) });
	},
	upsertLawyer: async (lawyer) => {
		const saved = await upsertLawyerFn({ data: lawyer });
		set((s) => {
			return { lawyers: s.lawyers.some((l) => l.id === saved.id) ? s.lawyers.map((l) => l.id === saved.id ? saved : l) : [...s.lawyers, saved] };
		});
	},
	removeLawyer: async (id) => {
		await removeLawyerFn({ data: { id } });
		set((s) => ({ lawyers: s.lawyers.filter((l) => l.id !== id) }));
	},
	createFromDraft: async (draft) => {
		const inv = await createInvoiceFn({ data: draft });
		set((s) => ({ invoices: [inv, ...s.invoices] }));
		return inv;
	},
	updateInvoice: async (id, patch) => {
		const inv = await updateInvoiceFn({ data: {
			id,
			patch
		} });
		set((s) => ({ invoices: replaceInvoice(s.invoices, inv) }));
	},
	deleteInvoice: async (id) => {
		await deleteInvoiceFn({ data: { id } });
		set((s) => ({ invoices: s.invoices.filter((i) => i.id !== id) }));
	},
	advanceStatus: async (id, status, extra) => {
		await get().updateInvoice(id, {
			status,
			...extra
		});
	},
	requestAdmin: async (id) => {
		const inv = await requestAdminFn({ data: { id } });
		set((s) => ({ invoices: replaceInvoice(s.invoices, inv) }));
	},
	markIssued: async (id, invoiceNumber) => {
		const inv = await markIssuedFn({ data: {
			id,
			invoiceNumber
		} });
		set((s) => ({ invoices: replaceInvoice(s.invoices, inv) }));
	},
	markSentToClient: async (id) => {
		const inv = await markSentToClientFn({ data: { id } });
		set((s) => ({ invoices: replaceInvoice(s.invoices, inv) }));
	},
	registerPayment: async (id, amount, full) => {
		const inv = await registerPaymentFn({ data: {
			id,
			amount,
			full
		} });
		set((s) => ({ invoices: replaceInvoice(s.invoices, inv) }));
	},
	refreshEmails: async (id) => {
		const inv = await refreshEmailsFn({ data: { id } });
		set((s) => ({ invoices: replaceInvoice(s.invoices, inv) }));
	},
	refreshOverdue: async () => {
		await get().batchRefreshOverdue([]);
	},
	batchRequestAdmin: async (ids) => {
		const { count } = await batchRequestAdminFn({ data: { ids } });
		await get().bootstrap();
		return count;
	},
	batchMarkSentToClient: async (ids) => {
		const { count } = await batchMarkSentFn({ data: { ids } });
		await get().bootstrap();
		return count;
	},
	batchRefreshOverdue: async (ids = []) => {
		const { count } = await batchRefreshOverdueFn({ data: { ids } });
		await get().bootstrap();
		return count;
	},
	resetDemo: async () => {
		const data = await resetDemoFn();
		get().applyBootstrap(data);
	},
	sendAdminEmail: async (id, overrides) => {
		const result = await sendAdminEmailFn({ data: {
			id,
			subject: overrides?.subject,
			body: overrides?.body
		} });
		set((s) => ({ invoices: replaceInvoice(s.invoices, result.invoice) }));
		return result;
	},
	sendClientEmail: async (id, overrides) => {
		const result = await sendClientEmailFn({ data: {
			id,
			subject: overrides?.subject,
			body: overrides?.body
		} });
		set((s) => ({ invoices: replaceInvoice(s.invoices, result.invoice) }));
		return result;
	},
	getLawyer: (id) => get().lawyers.find((l) => l.id === id)
}));
//#endregion
export { useBillingStore as a, setUserRoleFn as i, listInvoiceEventsFn as n, listProfilesFn as r, getMailStatusFn as t };
