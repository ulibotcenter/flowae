/**
 * Server-only billing repository (Postgres / PGLite via getSql).
 * Call only from createServerFn handlers.
 */
import { getSql, type Sql } from "@/lib/db";
import {
  createSeedInvoices,
  DEFAULT_LAWYERS,
  DEFAULT_SETTINGS,
} from "./seed";
import {
  buildAdminEmail,
  buildClientEmail,
  buildSharePointPath,
  invoiceTotal,
} from "./templates";
import { addDaysIso, todayIso } from "./format";
import {
  mapInvoice,
  mapInvoiceEvent,
  mapLawyer,
  mapProfile,
  mapSettings,
} from "./db-map";
import { planAuditEvents } from "./audit";
import type {
  BillingBootstrap,
  BillingConceptDraft,
  FirmSettings,
  Invoice,
  InvoiceEvent,
  InvoiceEventType,
  InvoiceStatus,
  Lawyer,
  UserProfile,
  UserRole,
} from "./types";

export type Actor = {
  userId: string;
  email: string | null;
  name: string | null;
  profile: UserProfile;
};

function requireAdmin(actor: Actor, action = "esta acción"): void {
  if (actor.profile.role !== "admin") {
    throw new Error(`Solo Administración puede realizar ${action}`);
  }
}

function actorLabel(actor: Actor): string {
  return actor.name || actor.email || actor.userId.slice(0, 8);
}

async function logInvoiceEvent(
  sql: Sql,
  actor: Actor | null,
  invoiceId: string,
  eventType: InvoiceEventType,
  summary: string,
  detail?: string | null,
): Promise<void> {
  const id = `evt-${crypto.randomUUID().slice(0, 12)}`;
  await sql`
    insert into invoice_events (
      id, invoice_id, event_type, summary, detail,
      actor_user_id, actor_name, actor_email, created_at
    ) values (
      ${id},
      ${invoiceId},
      ${eventType},
      ${summary},
      ${detail ?? null},
      ${actor?.userId ?? null},
      ${actor?.name ?? null},
      ${actor?.email ?? null},
      now()
    )
  `;
}

async function logDiff(
  sql: Sql,
  actor: Actor,
  current: Invoice,
  next: Invoice,
): Promise<void> {
  const planned = planAuditEvents(current, next);
  for (const ev of planned) {
    await logInvoiceEvent(
      sql,
      actor,
      next.id,
      ev.eventType,
      ev.summary,
      ev.detail,
    );
  }
}

function recomputeDueStatus(inv: Invoice): Invoice {
  if (
    inv.status === "pagada" ||
    inv.status === "borrador" ||
    inv.status === "solicitada_admin" ||
    inv.status === "vencida"
  ) {
    return inv;
  }
  if (
    inv.dueDate &&
    new Date(inv.dueDate) < new Date() &&
    inv.paidAmount < invoiceTotal(inv) &&
    (inv.status === "enviada_cliente" ||
      inv.status === "emitida" ||
      inv.status === "parcial") &&
    inv.paidAmount === 0
  ) {
    return { ...inv, status: "vencida" };
  }
  return inv;
}

async function ensureSeeded(sql: Sql): Promise<void> {
  const existing = await sql<{ n: number }>`
    select count(*)::int as n from firm_settings where id = 'default'
  `;
  if ((existing[0]?.n ?? 0) > 0) return;

  const s = DEFAULT_SETTINGS;
  await sql`
    insert into firm_settings (
      id, firm_name, admin_email, admin_name, sharepoint_base,
      default_iva, default_payment_days, sage_note, lexnext_note,
      admin_email_subject_tpl, admin_email_body_tpl,
      client_email_subject_tpl, client_email_body_tpl
    ) values (
      'default', ${s.firmName}, ${s.adminEmail}, ${s.adminName}, ${s.sharePointBase},
      ${s.defaultIva}, ${s.defaultPaymentDays}, ${s.sageNote}, ${s.lexnextNote},
      ${s.adminEmailSubjectTpl}, ${s.adminEmailBodyTpl},
      ${s.clientEmailSubjectTpl}, ${s.clientEmailBodyTpl}
    )
  `;

  for (const l of DEFAULT_LAWYERS) {
    await sql`
      insert into lawyers (id, name, email, initials, user_id)
      values (${l.id}, ${l.name}, ${l.email}, ${l.initials}, null)
      on conflict (id) do nothing
    `;
  }

  const year = new Date().getFullYear();
  await sql`
    insert into billing_counters (year, seq) values (${year}, 42)
    on conflict (year) do nothing
  `;

  const invoices = createSeedInvoices(s);
  for (const inv of invoices) {
    await insertInvoiceRow(sql, inv, null);
  }
}

async function insertInvoiceRow(
  sql: Sql,
  inv: Invoice,
  createdBy: string | null,
): Promise<void> {
  await sql`
    insert into invoices (
      id, ref, invoice_number, client_name, client_email, client_nif,
      expediente, concepto, base_amount, iva_rate, suplidos, currency,
      lawyer_id, remitente, status, created_at, requested_at, issued_at,
      sent_at, due_date, paid_at, paid_amount, notes, sharepoint_path,
      source_file, admin_email_subject, admin_email_body,
      client_email_subject, client_email_body,
      admin_email_sent_at, client_email_sent_at, created_by, updated_at
    ) values (
      ${inv.id}, ${inv.ref}, ${inv.invoiceNumber}, ${inv.clientName},
      ${inv.clientEmail}, ${inv.clientNif}, ${inv.expediente}, ${inv.concepto},
      ${inv.baseAmount}, ${inv.ivaRate}, ${inv.suplidos}, ${inv.currency},
      ${inv.lawyerId}, ${inv.remitente}, ${inv.status}, ${inv.createdAt},
      ${inv.requestedAt ?? null}, ${inv.issuedAt ?? null}, ${inv.sentAt ?? null},
      ${inv.dueDate ?? null}, ${inv.paidAt ?? null}, ${inv.paidAmount},
      ${inv.notes}, ${inv.sharePointPath}, ${inv.sourceFile ?? null},
      ${inv.adminEmailSubject ?? null}, ${inv.adminEmailBody ?? null},
      ${inv.clientEmailSubject ?? null}, ${inv.clientEmailBody ?? null},
      ${inv.adminEmailSentAt ?? null}, ${inv.clientEmailSentAt ?? null},
      ${createdBy}, now()
    )
    on conflict (id) do nothing
  `;
}

export async function resolveActor(
  userId: string,
  email: string | null,
  name: string | null,
): Promise<Actor> {
  const sql = await getSql();
  await ensureSeeded(sql);

  const rows = await sql`
    select user_id, role, lawyer_id, email, display_name
    from user_profiles where user_id = ${userId}
  `;

  if (rows[0]) {
    return {
      userId,
      email,
      name,
      profile: mapProfile(rows[0]),
    };
  }

  const profileCount = await sql<{ n: number }>`
    select count(*)::int as n from user_profiles
  `;
  const settingsRows = await sql`select * from firm_settings where id = 'default'`;
  const settings = settingsRows[0]
    ? mapSettings(settingsRows[0])
    : DEFAULT_SETTINGS;

  let role: UserRole = "lawyer";
  let lawyerId: string | null = null;

  const isFirst = (profileCount[0]?.n ?? 0) === 0;
  const emailLower = (email ?? "").trim().toLowerCase();
  const isAdminEmail =
    emailLower &&
    emailLower === settings.adminEmail.trim().toLowerCase();

  if (isFirst || isAdminEmail) {
    role = "admin";
  } else if (emailLower) {
    const match = await sql`
      select id from lawyers where lower(email) = ${emailLower} limit 1
    `;
    if (match[0]) {
      lawyerId = String(match[0].id);
      await sql`
        update lawyers set user_id = ${userId} where id = ${lawyerId}
      `;
    } else {
      lawyerId = `law-${userId.slice(0, 8)}`;
      const initials = (name ?? email ?? "AB")
        .split(/\s+/)
        .map((p) => p[0])
        .join("")
        .slice(0, 2)
        .toUpperCase();
      await sql`
        insert into lawyers (id, name, email, initials, user_id)
        values (
          ${lawyerId},
          ${name ?? email ?? "Abogado"},
          ${email ?? ""},
          ${initials || "AB"},
          ${userId}
        )
        on conflict (id) do update set user_id = excluded.user_id
      `;
    }
  }

  await sql`
    insert into user_profiles (user_id, role, lawyer_id, email, display_name, updated_at)
    values (
      ${userId},
      ${role},
      ${lawyerId},
      ${email},
      ${name},
      now()
    )
    on conflict (user_id) do nothing
  `;

  const created = await sql`
    select user_id, role, lawyer_id, email, display_name
    from user_profiles where user_id = ${userId}
  `;
  return {
    userId,
    email,
    name,
    profile: mapProfile(created[0]!),
  };
}

export async function loadBootstrap(actor: Actor): Promise<BillingBootstrap> {
  const sql = await getSql();
  await ensureSeeded(sql);
  await refreshOverdueRows(sql, null);

  const settingsRows = await sql`select * from firm_settings where id = 'default'`;
  const settings = settingsRows[0]
    ? mapSettings(settingsRows[0])
    : DEFAULT_SETTINGS;

  const lawyerRows = await sql`select * from lawyers order by name asc`;
  const lawyers = lawyerRows.map(mapLawyer);

  let invoiceRows: Record<string, unknown>[];
  if (actor.profile.role === "admin") {
    invoiceRows = await sql`select * from invoices order by created_at desc`;
  } else if (actor.profile.lawyerId) {
    invoiceRows = await sql`
      select * from invoices
      where lawyer_id = ${actor.profile.lawyerId}
      order by created_at desc
    `;
  } else {
    invoiceRows = [];
  }

  const year = new Date().getFullYear();
  const seqRows = await sql<{ seq: number }>`
    select seq from billing_counters where year = ${year}
  `;
  const seq = seqRows[0]?.seq ?? 0;

  return {
    profile: actor.profile,
    settings,
    lawyers,
    invoices: invoiceRows.map(mapInvoice),
    seq,
  };
}

async function assertCanAccessInvoice(
  sql: Sql,
  actor: Actor,
  invoiceId: string,
): Promise<Invoice> {
  const rows = await sql`select * from invoices where id = ${invoiceId}`;
  if (!rows[0]) throw new Error("Factura no encontrada");
  const inv = mapInvoice(rows[0]);
  if (actor.profile.role === "admin") return inv;
  if (actor.profile.lawyerId && inv.lawyerId === actor.profile.lawyerId) {
    return inv;
  }
  throw new Error("No tienes permiso sobre esta factura");
}

async function nextRef(sql: Sql): Promise<{ ref: string; seq: number }> {
  const year = new Date().getFullYear();
  await sql`
    insert into billing_counters (year, seq) values (${year}, 0)
    on conflict (year) do nothing
  `;
  const updated = await sql<{ seq: number }>`
    update billing_counters
    set seq = seq + 1
    where year = ${year}
    returning seq
  `;
  const seq = updated[0]?.seq ?? 1;
  return {
    ref: `FAC-${year}-${String(seq).padStart(4, "0")}`,
    seq,
  };
}

export async function createInvoiceFromDraft(
  actor: Actor,
  draft: BillingConceptDraft,
): Promise<Invoice> {
  const sql = await getSql();
  const settings = (await loadSettings(sql)) ?? DEFAULT_SETTINGS;

  let lawyerId = draft.lawyerId;
  if (actor.profile.role === "lawyer") {
    if (!actor.profile.lawyerId) {
      throw new Error("Tu cuenta no está vinculada a un letrado");
    }
    lawyerId = actor.profile.lawyerId;
  }

  const lawyers = await listLawyers(sql);
  const lawyer = lawyers.find((l) => l.id === lawyerId);
  const { ref } = await nextRef(sql);
  const id = `inv-${crypto.randomUUID().slice(0, 8)}`;
  const createdAt = todayIso();
  const path = buildSharePointPath(
    settings,
    draft.clientName,
    draft.expediente,
  );

  const invoice: Invoice = {
    id,
    ref,
    invoiceNumber: "",
    clientName: draft.clientName.trim(),
    clientEmail: draft.clientEmail.trim(),
    clientNif: draft.clientNif.trim(),
    expediente: draft.expediente.trim(),
    concepto: draft.concepto.trim(),
    baseAmount: draft.baseAmount || 0,
    ivaRate: draft.ivaRate ?? settings.defaultIva,
    suplidos: draft.suplidos || 0,
    currency: "EUR",
    lawyerId,
    remitente: draft.remitente || "abogado",
    status: "borrador",
    createdAt,
    paidAmount: 0,
    notes: draft.notes || "",
    sharePointPath: path,
    sourceFile: draft.sourceFile,
    dueDate: addDaysIso(
      createdAt,
      draft.dueDays ?? settings.defaultPaymentDays,
    ),
    createdBy: actor.userId,
  };

  const admin = buildAdminEmail(invoice, lawyer, settings);
  const client = buildClientEmail(invoice, lawyer, settings);
  invoice.adminEmailSubject = admin.subject;
  invoice.adminEmailBody = admin.body;
  invoice.clientEmailSubject = client.subject;
  invoice.clientEmailBody = client.body;

  await insertInvoiceRow(sql, invoice, actor.userId);
  await logInvoiceEvent(
    sql,
    actor,
    invoice.id,
    "created",
    `Factura creada (${invoice.ref}) — ${invoice.clientName}`,
    invoice.concepto,
  );
  return invoice;
}

async function loadSettings(sql: Sql): Promise<FirmSettings | null> {
  const rows = await sql`select * from firm_settings where id = 'default'`;
  return rows[0] ? mapSettings(rows[0]) : null;
}

async function listLawyers(sql: Sql): Promise<Lawyer[]> {
  const rows = await sql`select * from lawyers order by name asc`;
  return rows.map(mapLawyer);
}

export async function updateInvoiceFields(
  actor: Actor,
  id: string,
  patch: Partial<Invoice>,
): Promise<Invoice> {
  const sql = await getSql();
  const current = await assertCanAccessInvoice(sql, actor, id);
  const settings = (await loadSettings(sql)) ?? DEFAULT_SETTINGS;

  if (
    actor.profile.role === "lawyer" &&
    patch.lawyerId &&
    patch.lawyerId !== actor.profile.lawyerId
  ) {
    throw new Error("No puedes reasignar el letrado de la factura");
  }

  const next: Invoice = { ...current, ...patch, id: current.id };
  if (patch.clientName || patch.expediente) {
    next.sharePointPath = buildSharePointPath(
      settings,
      next.clientName,
      next.expediente,
    );
  }

  await sql`
    update invoices set
      invoice_number = ${next.invoiceNumber},
      client_name = ${next.clientName},
      client_email = ${next.clientEmail},
      client_nif = ${next.clientNif},
      expediente = ${next.expediente},
      concepto = ${next.concepto},
      base_amount = ${next.baseAmount},
      iva_rate = ${next.ivaRate},
      suplidos = ${next.suplidos},
      lawyer_id = ${next.lawyerId},
      remitente = ${next.remitente},
      status = ${next.status},
      requested_at = ${next.requestedAt ?? null},
      issued_at = ${next.issuedAt ?? null},
      sent_at = ${next.sentAt ?? null},
      due_date = ${next.dueDate ?? null},
      paid_at = ${next.paidAt ?? null},
      paid_amount = ${next.paidAmount},
      notes = ${next.notes},
      sharepoint_path = ${next.sharePointPath},
      source_file = ${next.sourceFile ?? null},
      admin_email_subject = ${next.adminEmailSubject ?? null},
      admin_email_body = ${next.adminEmailBody ?? null},
      client_email_subject = ${next.clientEmailSubject ?? null},
      client_email_body = ${next.clientEmailBody ?? null},
      admin_email_sent_at = ${next.adminEmailSentAt ?? null},
      client_email_sent_at = ${next.clientEmailSentAt ?? null},
      updated_at = now()
    where id = ${id}
  `;
  await logDiff(sql, actor, current, next);
  return next;
}

export async function deleteInvoice(
  actor: Actor,
  id: string,
): Promise<void> {
  const sql = await getSql();
  await assertCanAccessInvoice(sql, actor, id);
  // Los eventos se eliminan en cascada con la factura
  await sql`delete from invoices where id = ${id}`;
}

export async function requestAdmin(
  actor: Actor,
  id: string,
): Promise<Invoice> {
  const sql = await getSql();
  const inv = await assertCanAccessInvoice(sql, actor, id);
  if (inv.status !== "borrador") {
    throw new Error("Solo se puede solicitar a Admin desde borrador");
  }
  const settings = (await loadSettings(sql)) ?? DEFAULT_SETTINGS;
  const lawyers = await listLawyers(sql);
  const lawyer = lawyers.find((l) => l.id === inv.lawyerId);
  const admin = buildAdminEmail(inv, lawyer, settings);
  return updateInvoiceFields(actor, id, {
    status: "solicitada_admin",
    requestedAt: todayIso(),
    adminEmailSubject: admin.subject,
    adminEmailBody: admin.body,
  });
}

export async function markIssued(
  actor: Actor,
  id: string,
  invoiceNumber: string,
): Promise<Invoice> {
  const sql = await getSql();
  const inv = await assertCanAccessInvoice(sql, actor, id);
  const settings = (await loadSettings(sql)) ?? DEFAULT_SETTINGS;
  const issuedAt = todayIso();
  const dueDate =
    inv.dueDate || addDaysIso(issuedAt, settings.defaultPaymentDays);
  const updated: Invoice = {
    ...inv,
    invoiceNumber: invoiceNumber.trim(),
    status: "emitida",
    issuedAt,
    dueDate,
  };
  const lawyers = await listLawyers(sql);
  const lawyer = lawyers.find((l) => l.id === updated.lawyerId);
  const client = buildClientEmail(updated, lawyer, settings);
  return updateInvoiceFields(actor, id, {
    invoiceNumber: updated.invoiceNumber,
    status: "emitida",
    issuedAt,
    dueDate,
    clientEmailSubject: client.subject,
    clientEmailBody: client.body,
  });
}

export async function markSentToClient(
  actor: Actor,
  id: string,
): Promise<Invoice> {
  const sql = await getSql();
  const inv = await assertCanAccessInvoice(sql, actor, id);
  const settings = (await loadSettings(sql)) ?? DEFAULT_SETTINGS;
  const lawyers = await listLawyers(sql);
  const lawyer = lawyers.find((l) => l.id === inv.lawyerId);
  const client = buildClientEmail(inv, lawyer, settings);
  return updateInvoiceFields(actor, id, {
    status: "enviada_cliente",
    sentAt: todayIso(),
    clientEmailSubject: client.subject,
    clientEmailBody: client.body,
  });
}

export async function registerPayment(
  actor: Actor,
  id: string,
  amount: number,
  full?: boolean,
): Promise<Invoice> {
  const inv = await assertCanAccessInvoice(await getSql(), actor, id);
  const total = invoiceTotal(inv);
  const paid = full
    ? total
    : Math.min(total, (inv.paidAmount || 0) + amount);
  const status: InvoiceStatus =
    paid >= total - 0.001 ? "pagada" : paid > 0 ? "parcial" : inv.status;
  return updateInvoiceFields(actor, id, {
    paidAmount: paid,
    status,
    paidAt: paid >= total - 0.001 ? todayIso() : inv.paidAt,
  });
}

export async function refreshEmails(
  actor: Actor,
  id: string,
): Promise<Invoice> {
  const sql = await getSql();
  const inv = await assertCanAccessInvoice(sql, actor, id);
  const settings = (await loadSettings(sql)) ?? DEFAULT_SETTINGS;
  const lawyers = await listLawyers(sql);
  const lawyer = lawyers.find((l) => l.id === inv.lawyerId);
  const admin = buildAdminEmail(inv, lawyer, settings);
  const client = buildClientEmail(inv, lawyer, settings);
  return updateInvoiceFields(actor, id, {
    adminEmailSubject: admin.subject,
    adminEmailBody: admin.body,
    clientEmailSubject: client.subject,
    clientEmailBody: client.body,
    sharePointPath: buildSharePointPath(
      settings,
      inv.clientName,
      inv.expediente,
    ),
  });
}

async function refreshOverdueRows(
  sql: Sql,
  ids: string[] | null,
): Promise<number> {
  const rows = await sql`select * from invoices`;
  let count = 0;
  for (const row of rows) {
    const inv = mapInvoice(row);
    if (ids && !ids.includes(inv.id)) continue;
    const updated = recomputeDueStatus(inv);
    if (updated.status === "vencida" && inv.status !== "vencida") {
      await sql`
        update invoices set status = 'vencida', updated_at = now()
        where id = ${inv.id}
      `;
      count++;
    }
  }
  return count;
}

export async function batchRequestAdmin(
  actor: Actor,
  ids: string[],
): Promise<number> {
  let n = 0;
  for (const id of ids) {
    try {
      const inv = await assertCanAccessInvoice(await getSql(), actor, id);
      if (inv.status !== "borrador") continue;
      await requestAdmin(actor, id);
      n++;
    } catch {
      /* skip */
    }
  }
  return n;
}

export async function batchMarkSent(
  actor: Actor,
  ids: string[],
): Promise<number> {
  let n = 0;
  for (const id of ids) {
    try {
      const inv = await assertCanAccessInvoice(await getSql(), actor, id);
      if (inv.status !== "emitida") continue;
      await markSentToClient(actor, id);
      n++;
    } catch {
      /* skip */
    }
  }
  return n;
}

export async function batchRefreshOverdue(
  actor: Actor,
  ids: string[],
): Promise<number> {
  const sql = await getSql();
  const allowed: string[] = [];
  for (const id of ids) {
    try {
      await assertCanAccessInvoice(sql, actor, id);
      allowed.push(id);
    } catch {
      /* skip */
    }
  }
  if (allowed.length === 0 && actor.profile.role === "admin" && ids.length === 0) {
    return refreshOverdueRows(sql, null);
  }
  return refreshOverdueRows(sql, allowed.length ? allowed : ids);
}

export async function saveSettings(
  actor: Actor,
  settings: FirmSettings,
): Promise<FirmSettings> {
  requireAdmin(actor, "editar la configuración");
  const sql = await getSql();
  await sql`
    update firm_settings set
      firm_name = ${settings.firmName},
      admin_email = ${settings.adminEmail},
      admin_name = ${settings.adminName},
      sharepoint_base = ${settings.sharePointBase},
      default_iva = ${settings.defaultIva},
      default_payment_days = ${settings.defaultPaymentDays},
      sage_note = ${settings.sageNote},
      lexnext_note = ${settings.lexnextNote},
      admin_email_subject_tpl = ${settings.adminEmailSubjectTpl},
      admin_email_body_tpl = ${settings.adminEmailBodyTpl},
      client_email_subject_tpl = ${settings.clientEmailSubjectTpl},
      client_email_body_tpl = ${settings.clientEmailBodyTpl},
      updated_at = now()
    where id = 'default'
  `;
  return settings;
}

export async function upsertLawyer(
  actor: Actor,
  lawyer: Lawyer,
): Promise<Lawyer> {
  requireAdmin(actor, "gestionar letrados");
  const sql = await getSql();
  await sql`
    insert into lawyers (id, name, email, initials, user_id)
    values (
      ${lawyer.id},
      ${lawyer.name},
      ${lawyer.email},
      ${lawyer.initials},
      ${lawyer.userId ?? null}
    )
    on conflict (id) do update set
      name = excluded.name,
      email = excluded.email,
      initials = excluded.initials,
      user_id = coalesce(excluded.user_id, lawyers.user_id)
  `;
  return lawyer;
}

export async function removeLawyer(
  actor: Actor,
  id: string,
): Promise<void> {
  requireAdmin(actor, "eliminar letrados");
  const sql = await getSql();
  const used = await sql<{ n: number }>`
    select count(*)::int as n from invoices where lawyer_id = ${id}
  `;
  if ((used[0]?.n ?? 0) > 0) {
    throw new Error("No se puede eliminar un letrado con facturas asociadas");
  }
  await sql`update user_profiles set lawyer_id = null where lawyer_id = ${id}`;
  await sql`delete from lawyers where id = ${id}`;
}

export async function setUserRole(
  actor: Actor,
  targetUserId: string,
  role: UserRole,
  lawyerId: string | null,
): Promise<void> {
  requireAdmin(actor, "cambiar roles");
  const sql = await getSql();

  if (role === "lawyer" && !lawyerId) {
    throw new Error("Asigna un letrado al usuario con rol Abogado");
  }

  // No dejar el despacho sin ningún admin
  if (role === "lawyer" && targetUserId === actor.userId) {
    const admins = await sql<{ n: number }>`
      select count(*)::int as n from user_profiles
      where role = 'admin' and user_id <> ${targetUserId}
    `;
    if ((admins[0]?.n ?? 0) === 0) {
      throw new Error(
        "Debe quedar al menos un usuario con rol Administración",
      );
    }
  }

  // Liberar vínculo previo de este usuario en lawyers
  await sql`update lawyers set user_id = null where user_id = ${targetUserId}`;

  if (role === "lawyer" && lawyerId) {
    // Si otro usuario tenía ese letrado, lo desvinculamos
    await sql`update lawyers set user_id = null where id = ${lawyerId}`;
    await sql`
      update user_profiles set lawyer_id = null
      where lawyer_id = ${lawyerId} and user_id <> ${targetUserId}
    `;
    await sql`update lawyers set user_id = ${targetUserId} where id = ${lawyerId}`;
  }

  const boundLawyerId = role === "lawyer" ? lawyerId : null;
  await sql`
    insert into user_profiles (user_id, role, lawyer_id, updated_at)
    values (
      ${targetUserId},
      ${role},
      ${boundLawyerId},
      now()
    )
    on conflict (user_id) do update set
      role = excluded.role,
      lawyer_id = excluded.lawyer_id,
      updated_at = now()
  `;
}

export async function resetDemoData(actor: Actor): Promise<BillingBootstrap> {
  requireAdmin(actor, "restaurar la demo");
  const sql = await getSql();
  await sql`delete from invoices`;
  await sql`delete from user_profiles where user_id <> ${actor.userId}`;
  await sql`delete from lawyers`;
  await sql`delete from billing_counters`;
  await sql`delete from firm_settings`;
  await ensureSeeded(sql);
  await sql`
    insert into user_profiles (user_id, role, lawyer_id, email, display_name, updated_at)
    values (
      ${actor.userId}, 'admin', null, ${actor.email}, ${actor.name}, now()
    )
    on conflict (user_id) do update set
      role = 'admin',
      lawyer_id = null,
      updated_at = now()
  `;
  return loadBootstrap({
    ...actor,
    profile: {
      userId: actor.userId,
      role: "admin",
      lawyerId: null,
      email: actor.email,
      displayName: actor.name,
    },
  });
}

export async function listProfiles(actor: Actor): Promise<UserProfile[]> {
  if (actor.profile.role !== "admin") return [actor.profile];
  const sql = await getSql();
  // Preferimos datos de Better Auth "user" cuando existan
  const rows = await sql`
    select
      p.user_id,
      p.role,
      p.lawyer_id,
      coalesce(nullif(p.email, ''), u.email) as email,
      coalesce(nullif(p.display_name, ''), u.name) as display_name
    from user_profiles p
    left join "user" u on u.id = p.user_id
    order by p.created_at asc
  `;
  return rows.map(mapProfile);
}

export async function listInvoiceEvents(
  actor: Actor,
  invoiceId: string,
): Promise<InvoiceEvent[]> {
  const sql = await getSql();
  await assertCanAccessInvoice(sql, actor, invoiceId);
  const rows = await sql`
    select *
    from invoice_events
    where invoice_id = ${invoiceId}
    order by created_at desc
    limit 200
  `;
  return rows.map(mapInvoiceEvent);
}

export async function sendAdminEmail(
  actor: Actor,
  id: string,
  overrides?: { subject?: string; body?: string },
): Promise<import("./types").EmailSendResult> {
  const sql = await getSql();
  const inv = await assertCanAccessInvoice(sql, actor, id);
  const settings = (await loadSettings(sql)) ?? DEFAULT_SETTINGS;
  const lawyers = await listLawyers(sql);
  const lawyer = lawyers.find((l) => l.id === inv.lawyerId);
  const generated = buildAdminEmail(inv, lawyer, settings);
  const subject = overrides?.subject?.trim() || generated.subject;
  const body = overrides?.body?.trim() || generated.body;
  const to = settings.adminEmail;
  if (!to) throw new Error("Configura el email de Administración");

  const { sendMail } = await import("@/lib/mail/resend");
  const outcome = await sendMail({
    to,
    subject,
    text: body,
    replyTo: lawyer?.email || undefined,
  });

  const now = todayIso();
  const patch: Partial<Invoice> = {
    adminEmailSubject: subject,
    adminEmailBody: body,
    adminEmailSentAt: now,
  };
  if (inv.status === "borrador") {
    patch.status = "solicitada_admin";
    patch.requestedAt = inv.requestedAt || now;
  }
  const invoice = await updateInvoiceFields(actor, id, patch);
  return {
    mode: outcome.mode,
    invoice,
    to,
    subject,
    message:
      outcome.mode === "resend"
        ? `Correo enviado a ${to} vía Resend`
        : `Modo prueba: no se envió correo real a ${to}. Copia el contenido o usa tu cliente de correo.`,
  };
}

export async function sendClientEmail(
  actor: Actor,
  id: string,
  overrides?: { subject?: string; body?: string },
): Promise<import("./types").EmailSendResult> {
  const sql = await getSql();
  const inv = await assertCanAccessInvoice(sql, actor, id);
  const settings = (await loadSettings(sql)) ?? DEFAULT_SETTINGS;
  const lawyers = await listLawyers(sql);
  const lawyer = lawyers.find((l) => l.id === inv.lawyerId);
  const generated = buildClientEmail(inv, lawyer, settings);
  const subject = overrides?.subject?.trim() || generated.subject;
  const body = overrides?.body?.trim() || generated.body;
  const to = inv.clientEmail?.trim();
  if (!to) throw new Error("La factura no tiene email de cliente");

  const { sendMail } = await import("@/lib/mail/resend");
  const replyTo =
    inv.remitente === "administracion"
      ? settings.adminEmail
      : (lawyer?.email || settings.adminEmail);
  const outcome = await sendMail({
    to,
    subject,
    text: body,
    replyTo,
  });

  const now = todayIso();
  const patch: Partial<Invoice> = {
    clientEmailSubject: subject,
    clientEmailBody: body,
    clientEmailSentAt: now,
  };
  // Flujo: solo avanzamos a enviada_cliente desde emitida (o reenvío si ya está enviada)
  if (inv.status === "emitida") {
    patch.status = "enviada_cliente";
    patch.sentAt = now;
  } else if (inv.status === "enviada_cliente") {
    patch.sentAt = inv.sentAt || now;
  }

  const invoice = await updateInvoiceFields(actor, id, patch);
  return {
    mode: outcome.mode,
    invoice,
    to,
    subject,
    message:
      outcome.mode === "resend"
        ? `Correo enviado a ${to} vía Resend`
        : `Modo prueba: no se envió correo real a ${to}. Copia el contenido o usa tu cliente de correo.`,
  };
}

