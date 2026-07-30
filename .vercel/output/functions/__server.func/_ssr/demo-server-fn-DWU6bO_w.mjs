import { a as isDemoLoginEnabled, i as DEMO_USER_PASSWORD, n as DEMO_USER_EMAIL, r as DEMO_USER_NAME } from "./demo-config-D3j8NDJR.mjs";
import { r as createServerFn } from "./ssr.mjs";
import { a as getDatabaseConfigError } from "./db-m21Nw3rD.mjs";
import { t as createServerRpc } from "./createServerRpc-CcvdN_gc.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/demo-server-fn-DWU6bO_w.js
/**
* Provision the shared demo admin account and seed billing data.
* Intentionally unauthenticated — gated by isDemoLoginEnabled().
*/
var ensureDemoUserFn_createServerFn_handler = createServerRpc({
	id: "7a1e9d0adc8849ee47f13a51f287f2773739987a8d387eee99c64d3664d8fa13",
	name: "ensureDemoUserFn",
	filename: "src/lib/billing/demo-server-fn.ts"
}, (opts) => ensureDemoUserFn.__executeServer(opts));
var ensureDemoUserFn = createServerFn({ method: "POST" }).handler(ensureDemoUserFn_createServerFn_handler, async () => {
	if (!isDemoLoginEnabled()) throw new Error("El modo demostración está desactivado");
	const dbErr = getDatabaseConfigError();
	if (dbErr) throw new Error(dbErr);
	const { auth } = await import("./server-D0_39adg.mjs").then((n) => n.r);
	const { getSql } = await import("./db-m21Nw3rD.mjs").then((n) => n.r).then((n) => n.n);
	const repo = await import("./server-repo-CLJHK_dd.mjs");
	try {
		await auth.api.signUpEmail({ body: {
			email: DEMO_USER_EMAIL,
			password: DEMO_USER_PASSWORD,
			name: DEMO_USER_NAME
		} });
	} catch {}
	const sql = await getSql();
	const user = (await sql`
      select id, email, name from "user"
      where lower(email) = ${DEMO_USER_EMAIL.toLowerCase()}
      limit 1
    `)[0];
	if (!user) throw new Error("No se pudo crear el usuario de demostración");
	const actor = await repo.resolveActor(user.id, user.email, user.name ?? "Demo Administración");
	await sql`
      insert into user_profiles (user_id, role, lawyer_id, email, display_name, updated_at)
      values (
        ${user.id},
        'admin',
        null,
        ${DEMO_USER_EMAIL},
        ${DEMO_USER_NAME},
        now()
      )
      on conflict (user_id) do update set
        role = 'admin',
        lawyer_id = null,
        email = ${DEMO_USER_EMAIL},
        display_name = ${DEMO_USER_NAME},
        updated_at = now()
    `;
	await repo.loadBootstrap({
		...actor,
		profile: {
			userId: user.id,
			role: "admin",
			lawyerId: null,
			email: DEMO_USER_EMAIL,
			displayName: DEMO_USER_NAME
		}
	});
	return {
		ok: true,
		email: DEMO_USER_EMAIL
	};
});
//#endregion
export { ensureDemoUserFn_createServerFn_handler };
