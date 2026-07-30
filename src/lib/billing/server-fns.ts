import { createServerFn } from "@tanstack/react-start";
import { authMiddleware } from "@/lib/auth/middleware";
import type {
  BillingBootstrap,
  BillingConceptDraft,
  FirmSettings,
  Invoice,
  Lawyer,
  UserProfile,
  UserRole,
} from "./types";

async function actorFromContext(userId: string) {
  let email: string | null = null;
  let name: string | null = null;

  if (userId === "dev-user") {
    email = "dev@example.com";
    name = "Dev User";
  } else {
    try {
      const { getSql } = await import("@/lib/db");
      const sql = await getSql();
      const rows = await sql<{ name: string; email: string }>`
        select name, email from "user" where id = ${userId} limit 1
      `;
      if (rows[0]) {
        name = rows[0].name ?? null;
        email = rows[0].email ?? null;
      }
    } catch {
      /* ignore */
    }
  }

  const repo = await import("./server-repo");
  return repo.resolveActor(userId, email, name);
}

export const getBillingBootstrap = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }): Promise<BillingBootstrap> => {
    const repo = await import("./server-repo");
    const actor = await actorFromContext(context.userId);
    return repo.loadBootstrap(actor);
  });

export const createInvoiceFn = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((data: BillingConceptDraft) => data)
  .handler(async ({ context, data }): Promise<Invoice> => {
    const repo = await import("./server-repo");
    const actor = await actorFromContext(context.userId);
    return repo.createInvoiceFromDraft(actor, data);
  });

export const updateInvoiceFn = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((data: { id: string; patch: Partial<Invoice> }) => data)
  .handler(async ({ context, data }): Promise<Invoice> => {
    const repo = await import("./server-repo");
    const actor = await actorFromContext(context.userId);
    return repo.updateInvoiceFields(actor, data.id, data.patch);
  });

export const deleteInvoiceFn = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((data: { id: string }) => data)
  .handler(async ({ context, data }): Promise<{ ok: true }> => {
    const repo = await import("./server-repo");
    const actor = await actorFromContext(context.userId);
    await repo.deleteInvoice(actor, data.id);
    return { ok: true };
  });

export const requestAdminFn = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((data: { id: string }) => data)
  .handler(async ({ context, data }): Promise<Invoice> => {
    const repo = await import("./server-repo");
    const actor = await actorFromContext(context.userId);
    return repo.requestAdmin(actor, data.id);
  });

export const markIssuedFn = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((data: { id: string; invoiceNumber: string }) => data)
  .handler(async ({ context, data }): Promise<Invoice> => {
    const repo = await import("./server-repo");
    const actor = await actorFromContext(context.userId);
    return repo.markIssued(actor, data.id, data.invoiceNumber);
  });

export const markSentToClientFn = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((data: { id: string }) => data)
  .handler(async ({ context, data }): Promise<Invoice> => {
    const repo = await import("./server-repo");
    const actor = await actorFromContext(context.userId);
    return repo.markSentToClient(actor, data.id);
  });

export const registerPaymentFn = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((data: { id: string; amount: number; full?: boolean }) => data)
  .handler(async ({ context, data }): Promise<Invoice> => {
    const repo = await import("./server-repo");
    const actor = await actorFromContext(context.userId);
    return repo.registerPayment(actor, data.id, data.amount, data.full);
  });

export const refreshEmailsFn = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((data: { id: string }) => data)
  .handler(async ({ context, data }): Promise<Invoice> => {
    const repo = await import("./server-repo");
    const actor = await actorFromContext(context.userId);
    return repo.refreshEmails(actor, data.id);
  });

export const batchRequestAdminFn = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((data: { ids: string[] }) => data)
  .handler(async ({ context, data }): Promise<{ count: number }> => {
    const repo = await import("./server-repo");
    const actor = await actorFromContext(context.userId);
    const count = await repo.batchRequestAdmin(actor, data.ids);
    return { count };
  });

export const batchMarkSentFn = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((data: { ids: string[] }) => data)
  .handler(async ({ context, data }): Promise<{ count: number }> => {
    const repo = await import("./server-repo");
    const actor = await actorFromContext(context.userId);
    const count = await repo.batchMarkSent(actor, data.ids);
    return { count };
  });

export const batchRefreshOverdueFn = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((data: { ids: string[] }) => data)
  .handler(async ({ context, data }): Promise<{ count: number }> => {
    const repo = await import("./server-repo");
    const actor = await actorFromContext(context.userId);
    const count = await repo.batchRefreshOverdue(actor, data.ids);
    return { count };
  });

export const saveSettingsFn = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((data: FirmSettings) => data)
  .handler(async ({ context, data }): Promise<FirmSettings> => {
    const repo = await import("./server-repo");
    const actor = await actorFromContext(context.userId);
    return repo.saveSettings(actor, data);
  });

export const upsertLawyerFn = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((data: Lawyer) => data)
  .handler(async ({ context, data }): Promise<Lawyer> => {
    const repo = await import("./server-repo");
    const actor = await actorFromContext(context.userId);
    return repo.upsertLawyer(actor, data);
  });

export const removeLawyerFn = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((data: { id: string }) => data)
  .handler(async ({ context, data }): Promise<{ ok: true }> => {
    const repo = await import("./server-repo");
    const actor = await actorFromContext(context.userId);
    await repo.removeLawyer(actor, data.id);
    return { ok: true };
  });

export const resetDemoFn = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .handler(async ({ context }): Promise<BillingBootstrap> => {
    const repo = await import("./server-repo");
    const actor = await actorFromContext(context.userId);
    return repo.resetDemoData(actor);
  });

export const listProfilesFn = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }): Promise<UserProfile[]> => {
    const repo = await import("./server-repo");
    const actor = await actorFromContext(context.userId);
    return repo.listProfiles(actor);
  });

export const setUserRoleFn = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator(
    (data: {
      userId: string;
      role: UserRole;
      lawyerId: string | null;
    }) => data,
  )
  .handler(async ({ context, data }): Promise<{ ok: true }> => {
    const repo = await import("./server-repo");
    const actor = await actorFromContext(context.userId);
    await repo.setUserRole(actor, data.userId, data.role, data.lawyerId);
    return { ok: true };
  });

export const sendAdminEmailFn = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator(
    (data: { id: string; subject?: string; body?: string }) => data,
  )
  .handler(async ({ context, data }) => {
    const repo = await import("./server-repo");
    const actor = await actorFromContext(context.userId);
    return repo.sendAdminEmail(actor, data.id, {
      subject: data.subject,
      body: data.body,
    });
  });

export const sendClientEmailFn = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator(
    (data: { id: string; subject?: string; body?: string }) => data,
  )
  .handler(async ({ context, data }) => {
    const repo = await import("./server-repo");
    const actor = await actorFromContext(context.userId);
    return repo.sendClientEmail(actor, data.id, {
      subject: data.subject,
      body: data.body,
    });
  });

export const getMailStatusFn = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async () => {
    const { getMailProviderStatus } = await import("@/lib/mail/resend");
    return getMailProviderStatus();
  });

export const listInvoiceEventsFn = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .validator((data: { invoiceId: string }) => data)
  .handler(async ({ context, data }) => {
    const repo = await import("./server-repo");
    const actor = await actorFromContext(context.userId);
    return repo.listInvoiceEvents(actor, data.invoiceId);
  });
