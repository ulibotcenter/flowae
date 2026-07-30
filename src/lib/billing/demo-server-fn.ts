import { createServerFn } from "@tanstack/react-start";
import {
  DEMO_USER_EMAIL,
  DEMO_USER_NAME,
  DEMO_USER_PASSWORD,
  isDemoLoginEnabled,
} from "@/lib/demo-config";

/**
 * Provision the shared demo admin account and seed billing data.
 * Intentionally unauthenticated — gated by isDemoLoginEnabled().
 */
export const ensureDemoUserFn = createServerFn({ method: "POST" }).handler(
  async (): Promise<{ ok: true; email: string }> => {
    if (!isDemoLoginEnabled()) {
      throw new Error("El modo demostración está desactivado");
    }

    const { auth } = await import("@/lib/auth/server");
    const { getSql } = await import("@/lib/db");
    const repo = await import("./server-repo");

    // Create credential user if missing (Better Auth own API)
    try {
      await auth.api.signUpEmail({
        body: {
          email: DEMO_USER_EMAIL,
          password: DEMO_USER_PASSWORD,
          name: DEMO_USER_NAME,
        },
      });
    } catch {
      // Already exists — fine
    }

    const sql = await getSql();
    const users = await sql<{ id: string; email: string; name: string }>`
      select id, email, name from "user"
      where lower(email) = ${DEMO_USER_EMAIL.toLowerCase()}
      limit 1
    `;
    const user = users[0];
    if (!user) {
      throw new Error("No se pudo crear el usuario de demostración");
    }

    // Force Administración role + seed firm data
    const actor = await repo.resolveActor(
      user.id,
      user.email,
      user.name ?? DEMO_USER_NAME,
    );

    // Always ensure demo is admin (even if not first user)
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

    // Ensure seed invoices exist (idempotent via firm_settings check)
    await repo.loadBootstrap({
      ...actor,
      profile: {
        userId: user.id,
        role: "admin",
        lawyerId: null,
        email: DEMO_USER_EMAIL,
        displayName: DEMO_USER_NAME,
      },
    });

    return { ok: true, email: DEMO_USER_EMAIL };
  },
);
