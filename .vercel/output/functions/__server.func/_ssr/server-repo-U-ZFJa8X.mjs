import { d as buildClientEmail, f as buildSharePointPath, g as invoiceTotal, l as addDaysIso, r as DEFAULT_CLIENT_EMAIL_BODY, t as DEFAULT_ADMIN_EMAIL_BODY, u as buildAdminEmail, v as todayIso } from "./types-FkcXPGqw.mjs";
import { n as DEFAULT_SETTINGS, r as createSeedInvoices, t as DEFAULT_LAWYERS } from "./seed-CIUWINzu.mjs";
import { i as getSql } from "./db-BEMyIp3V.mjs";
import { n as planAuditEvents } from "./audit-DFUmXwe9.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/server-repo-U-ZFJa8X.js
function num(v, fallback = 0) {
	if (v == null || v === "") return fallback;
	const n = typeof v === "number" ? v : Number(v);
	return Number.isFinite(n) ? n : fallback;
}
function iso(v) {
	if (v == null || v === "") return void 0;
	if (v instanceof Date) return v.toISOString();
	const d = new Date(String(v));
	return Number.isNaN(d.getTime()) ? void 0 : d.toISOString();
}
function isoReq(v) {
	return iso(v) ?? (/* @__PURE__ */ new Date()).toISOString();
}
function mapLawyer(row) {
	return {
		id: String(row.id),
		name: String(row.name ?? ""),
		email: String(row.email ?? ""),
		initials: String(row.initials ?? ""),
		userId: row.user_id == null ? null : String(row.user_id)
	};
}
function mapSettings(row) {
	const adminSub = String(row.admin_email_subject_tpl ?? "").trim();
	const adminBody = String(row.admin_email_body_tpl ?? "").trim();
	const clientSub = String(row.client_email_subject_tpl ?? "").trim();
	const clientBody = String(row.client_email_body_tpl ?? "").trim();
	return {
		firmName: String(row.firm_name ?? ""),
		adminEmail: String(row.admin_email ?? ""),
		adminName: String(row.admin_name ?? ""),
		sharePointBase: String(row.sharepoint_base ?? ""),
		defaultIva: num(row.default_iva, 21),
		defaultPaymentDays: num(row.default_payment_days, 30),
		sageNote: String(row.sage_note ?? ""),
		lexnextNote: String(row.lexnext_note ?? ""),
		adminEmailSubjectTpl: adminSub || "[Facturación] {{cliente}} · {{expediente}} · {{ref}}",
		adminEmailBodyTpl: adminBody || DEFAULT_ADMIN_EMAIL_BODY,
		clientEmailSubjectTpl: clientSub || "Factura {{numero_factura}} — {{despacho}} · {{expediente}}",
		clientEmailBodyTpl: clientBody || DEFAULT_CLIENT_EMAIL_BODY
	};
}
function mapProfile(row) {
	return {
		userId: String(row.user_id),
		role: String(row.role) === "admin" ? "admin" : "lawyer",
		lawyerId: row.lawyer_id == null ? null : String(row.lawyer_id),
		email: row.email == null ? null : String(row.email),
		displayName: row.display_name == null ? null : String(row.display_name)
	};
}
function mapInvoice(row) {
	return {
		id: String(row.id),
		ref: String(row.ref ?? ""),
		invoiceNumber: String(row.invoice_number ?? ""),
		clientName: String(row.client_name ?? ""),
		clientEmail: String(row.client_email ?? ""),
		clientNif: String(row.client_nif ?? ""),
		expediente: String(row.expediente ?? ""),
		concepto: String(row.concepto ?? ""),
		baseAmount: num(row.base_amount),
		ivaRate: num(row.iva_rate, 21),
		suplidos: num(row.suplidos),
		currency: "EUR",
		lawyerId: String(row.lawyer_id ?? ""),
		remitente: String(row.remitente) === "administracion" ? "administracion" : "abogado",
		status: String(row.status),
		createdAt: isoReq(row.created_at),
		requestedAt: iso(row.requested_at),
		issuedAt: iso(row.issued_at),
		sentAt: iso(row.sent_at),
		dueDate: iso(row.due_date),
		paidAt: iso(row.paid_at),
		paidAmount: num(row.paid_amount),
		notes: String(row.notes ?? ""),
		sharePointPath: String(row.sharepoint_path ?? ""),
		sourceFile: row.source_file == null ? void 0 : String(row.source_file),
		adminEmailSubject: row.admin_email_subject == null ? void 0 : String(row.admin_email_subject),
		adminEmailBody: row.admin_email_body == null ? void 0 : String(row.admin_email_body),
		clientEmailSubject: row.client_email_subject == null ? void 0 : String(row.client_email_subject),
		clientEmailBody: row.client_email_body == null ? void 0 : String(row.client_email_body),
		adminEmailSentAt: iso(row.admin_email_sent_at),
		clientEmailSentAt: iso(row.client_email_sent_at),
		createdBy: row.created_by == null ? null : String(row.created_by)
	};
}
function mapInvoiceEvent(row) {
	return {
		id: String(row.id),
		invoiceId: String(row.invoice_id),
		eventType: String(row.event_type),
		summary: String(row.summary ?? ""),
		detail: row.detail == null ? null : String(row.detail),
		actorUserId: row.actor_user_id == null ? null : String(row.actor_user_id),
		actorName: row.actor_name == null ? null : String(row.actor_name),
		actorEmail: row.actor_email == null ? null : String(row.actor_email),
		createdAt: row.created_at instanceof Date ? row.created_at.toISOString() : String(row.created_at ?? (/* @__PURE__ */ new Date()).toISOString())
	};
}
/**
* Server-only billing repository (Postgres / PGLite via getSql).
* Call only from createServerFn handlers.
*/
function requireAdmin(actor, action = "esta acción") {
	if (actor.profile.role !== "admin") throw new Error(`Solo Administración puede realizar ${action}`);
}
async function logInvoiceEvent(sql, actor, invoiceId, eventType, summary, detail) {
	await sql`
    insert into invoice_events (
      id, invoice_id, event_type, summary, detail,
      actor_user_id, actor_name, actor_email, created_at
    ) values (
      ${`evt-${crypto.randomUUID().slice(0, 12)}`},
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
async function logDiff(sql, actor, current, next) {
	const planned = planAuditEvents(current, next);
	for (const ev of planned) await logInvoiceEvent(sql, actor, next.id, ev.eventType, ev.summary, ev.detail);
}
function recomputeDueStatus(inv) {
	if (inv.status === "pagada" || inv.status === "borrador" || inv.status === "solicitada_admin" || inv.status === "vencida") return inv;
	if (inv.dueDate && new Date(inv.dueDate) < /* @__PURE__ */ new Date() && inv.paidAmount < invoiceTotal(inv) && (inv.status === "enviada_cliente" || inv.status === "emitida" || inv.status === "parcial") && inv.paidAmount === 0) return {
		...inv,
		status: "vencida"
	};
	return inv;
}
async function ensureSeeded(sql) {
	if (((await sql`
    select count(*)::int as n from firm_settings where id = 'default'
  `)[0]?.n ?? 0) > 0) return;
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
	for (const l of DEFAULT_LAWYERS) await sql`
      insert into lawyers (id, name, email, initials, user_id)
      values (${l.id}, ${l.name}, ${l.email}, ${l.initials}, null)
      on conflict (id) do nothing
    `;
	await sql`
    insert into billing_counters (year, seq) values (${(/* @__PURE__ */ new Date()).getFullYear()}, 42)
    on conflict (year) do nothing
  `;
	const invoices = createSeedInvoices(s);
	for (const inv of invoices) await insertInvoiceRow(sql, inv, null);
}
async function insertInvoiceRow(sql, inv, createdBy) {
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
async function resolveActor(userId, email, name) {
	const sql = await getSql();
	await ensureSeeded(sql);
	const rows = await sql`
    select user_id, role, lawyer_id, email, display_name
    from user_profiles where user_id = ${userId}
  `;
	if (rows[0]) return {
		userId,
		email,
		name,
		profile: mapProfile(rows[0])
	};
	const profileCount = await sql`
    select count(*)::int as n from user_profiles
  `;
	const settingsRows = await sql`select * from firm_settings where id = 'default'`;
	const settings = settingsRows[0] ? mapSettings(settingsRows[0]) : DEFAULT_SETTINGS;
	let role = "lawyer";
	let lawyerId = null;
	const isFirst = (profileCount[0]?.n ?? 0) === 0;
	const emailLower = (email ?? "").trim().toLowerCase();
	const isAdminEmail = emailLower && emailLower === settings.adminEmail.trim().toLowerCase();
	if (isFirst || isAdminEmail) role = "admin";
	else if (emailLower) {
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
			const initials = (name ?? email ?? "AB").split(/\s+/).map((p) => p[0]).join("").slice(0, 2).toUpperCase();
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
	return {
		userId,
		email,
		name,
		profile: mapProfile((await sql`
    select user_id, role, lawyer_id, email, display_name
    from user_profiles where user_id = ${userId}
  `)[0])
	};
}
async function loadBootstrap(actor) {
	const sql = await getSql();
	await ensureSeeded(sql);
	await refreshOverdueRows(sql, null);
	const settingsRows = await sql`select * from firm_settings where id = 'default'`;
	const settings = settingsRows[0] ? mapSettings(settingsRows[0]) : DEFAULT_SETTINGS;
	const lawyers = (await sql`select * from lawyers order by name asc`).map(mapLawyer);
	let invoiceRows;
	if (actor.profile.role === "admin") invoiceRows = await sql`select * from invoices order by created_at desc`;
	else if (actor.profile.lawyerId) invoiceRows = await sql`
      select * from invoices
      where lawyer_id = ${actor.profile.lawyerId}
      order by created_at desc
    `;
	else invoiceRows = [];
	const seq = (await sql`
    select seq from billing_counters where year = ${(/* @__PURE__ */ new Date()).getFullYear()}
  `)[0]?.seq ?? 0;
	return {
		profile: actor.profile,
		settings,
		lawyers,
		invoices: invoiceRows.map(mapInvoice),
		seq
	};
}
async function assertCanAccessInvoice(sql, actor, invoiceId) {
	const rows = await sql`select * from invoices where id = ${invoiceId}`;
	if (!rows[0]) throw new Error("Factura no encontrada");
	const inv = mapInvoice(rows[0]);
	if (actor.profile.role === "admin") return inv;
	if (actor.profile.lawyerId && inv.lawyerId === actor.profile.lawyerId) return inv;
	throw new Error("No tienes permiso sobre esta factura");
}
async function nextRef(sql) {
	const year = (/* @__PURE__ */ new Date()).getFullYear();
	await sql`
    insert into billing_counters (year, seq) values (${year}, 0)
    on conflict (year) do nothing
  `;
	const seq = (await sql`
    update billing_counters
    set seq = seq + 1
    where year = ${year}
    returning seq
  `)[0]?.seq ?? 1;
	return {
		ref: `FAC-${year}-${String(seq).padStart(4, "0")}`,
		seq
	};
}
async function createInvoiceFromDraft(actor, draft) {
	const sql = await getSql();
	const settings = await loadSettings(sql) ?? DEFAULT_SETTINGS;
	let lawyerId = draft.lawyerId;
	if (actor.profile.role === "lawyer") {
		if (!actor.profile.lawyerId) throw new Error("Tu cuenta no está vinculada a un letrado");
		lawyerId = actor.profile.lawyerId;
	}
	const lawyer = (await listLawyers(sql)).find((l) => l.id === lawyerId);
	const { ref } = await nextRef(sql);
	const id = `inv-${crypto.randomUUID().slice(0, 8)}`;
	const createdAt = todayIso();
	const path = buildSharePointPath(settings, draft.clientName, draft.expediente);
	const invoice = {
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
		dueDate: addDaysIso(createdAt, draft.dueDays ?? settings.defaultPaymentDays),
		createdBy: actor.userId
	};
	const admin = buildAdminEmail(invoice, lawyer, settings);
	const client = buildClientEmail(invoice, lawyer, settings);
	invoice.adminEmailSubject = admin.subject;
	invoice.adminEmailBody = admin.body;
	invoice.clientEmailSubject = client.subject;
	invoice.clientEmailBody = client.body;
	await insertInvoiceRow(sql, invoice, actor.userId);
	await logInvoiceEvent(sql, actor, invoice.id, "created", `Factura creada (${invoice.ref}) — ${invoice.clientName}`, invoice.concepto);
	return invoice;
}
async function loadSettings(sql) {
	const rows = await sql`select * from firm_settings where id = 'default'`;
	return rows[0] ? mapSettings(rows[0]) : null;
}
async function listLawyers(sql) {
	return (await sql`select * from lawyers order by name asc`).map(mapLawyer);
}
async function updateInvoiceFields(actor, id, patch) {
	const sql = await getSql();
	const current = await assertCanAccessInvoice(sql, actor, id);
	const settings = await loadSettings(sql) ?? DEFAULT_SETTINGS;
	if (actor.profile.role === "lawyer" && patch.lawyerId && patch.lawyerId !== actor.profile.lawyerId) throw new Error("No puedes reasignar el letrado de la factura");
	const next = {
		...current,
		...patch,
		id: current.id
	};
	if (patch.clientName || patch.expediente) next.sharePointPath = buildSharePointPath(settings, next.clientName, next.expediente);
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
async function deleteInvoice(actor, id) {
	const sql = await getSql();
	await assertCanAccessInvoice(sql, actor, id);
	await sql`delete from invoices where id = ${id}`;
}
async function requestAdmin(actor, id) {
	const sql = await getSql();
	const inv = await assertCanAccessInvoice(sql, actor, id);
	if (inv.status !== "borrador") throw new Error("Solo se puede solicitar a Admin desde borrador");
	const settings = await loadSettings(sql) ?? DEFAULT_SETTINGS;
	const admin = buildAdminEmail(inv, (await listLawyers(sql)).find((l) => l.id === inv.lawyerId), settings);
	return updateInvoiceFields(actor, id, {
		status: "solicitada_admin",
		requestedAt: todayIso(),
		adminEmailSubject: admin.subject,
		adminEmailBody: admin.body
	});
}
async function markIssued(actor, id, invoiceNumber) {
	const sql = await getSql();
	const inv = await assertCanAccessInvoice(sql, actor, id);
	const settings = await loadSettings(sql) ?? DEFAULT_SETTINGS;
	const issuedAt = todayIso();
	const dueDate = inv.dueDate || addDaysIso(issuedAt, settings.defaultPaymentDays);
	const updated = {
		...inv,
		invoiceNumber: invoiceNumber.trim(),
		status: "emitida",
		issuedAt,
		dueDate
	};
	const client = buildClientEmail(updated, (await listLawyers(sql)).find((l) => l.id === updated.lawyerId), settings);
	return updateInvoiceFields(actor, id, {
		invoiceNumber: updated.invoiceNumber,
		status: "emitida",
		issuedAt,
		dueDate,
		clientEmailSubject: client.subject,
		clientEmailBody: client.body
	});
}
async function markSentToClient(actor, id) {
	const sql = await getSql();
	const inv = await assertCanAccessInvoice(sql, actor, id);
	const settings = await loadSettings(sql) ?? DEFAULT_SETTINGS;
	const client = buildClientEmail(inv, (await listLawyers(sql)).find((l) => l.id === inv.lawyerId), settings);
	return updateInvoiceFields(actor, id, {
		status: "enviada_cliente",
		sentAt: todayIso(),
		clientEmailSubject: client.subject,
		clientEmailBody: client.body
	});
}
async function registerPayment(actor, id, amount, full) {
	const inv = await assertCanAccessInvoice(await getSql(), actor, id);
	const total = invoiceTotal(inv);
	const paid = full ? total : Math.min(total, (inv.paidAmount || 0) + amount);
	return updateInvoiceFields(actor, id, {
		paidAmount: paid,
		status: paid >= total - .001 ? "pagada" : paid > 0 ? "parcial" : inv.status,
		paidAt: paid >= total - .001 ? todayIso() : inv.paidAt
	});
}
async function refreshEmails(actor, id) {
	const sql = await getSql();
	const inv = await assertCanAccessInvoice(sql, actor, id);
	const settings = await loadSettings(sql) ?? DEFAULT_SETTINGS;
	const lawyer = (await listLawyers(sql)).find((l) => l.id === inv.lawyerId);
	const admin = buildAdminEmail(inv, lawyer, settings);
	const client = buildClientEmail(inv, lawyer, settings);
	return updateInvoiceFields(actor, id, {
		adminEmailSubject: admin.subject,
		adminEmailBody: admin.body,
		clientEmailSubject: client.subject,
		clientEmailBody: client.body,
		sharePointPath: buildSharePointPath(settings, inv.clientName, inv.expediente)
	});
}
async function refreshOverdueRows(sql, ids) {
	const rows = await sql`select * from invoices`;
	let count = 0;
	for (const row of rows) {
		const inv = mapInvoice(row);
		if (ids && !ids.includes(inv.id)) continue;
		if (recomputeDueStatus(inv).status === "vencida" && inv.status !== "vencida") {
			await sql`
        update invoices set status = 'vencida', updated_at = now()
        where id = ${inv.id}
      `;
			count++;
		}
	}
	return count;
}
async function batchRequestAdmin(actor, ids) {
	let n = 0;
	for (const id of ids) try {
		if ((await assertCanAccessInvoice(await getSql(), actor, id)).status !== "borrador") continue;
		await requestAdmin(actor, id);
		n++;
	} catch {}
	return n;
}
async function batchMarkSent(actor, ids) {
	let n = 0;
	for (const id of ids) try {
		if ((await assertCanAccessInvoice(await getSql(), actor, id)).status !== "emitida") continue;
		await markSentToClient(actor, id);
		n++;
	} catch {}
	return n;
}
async function batchRefreshOverdue(actor, ids) {
	const sql = await getSql();
	const allowed = [];
	for (const id of ids) try {
		await assertCanAccessInvoice(sql, actor, id);
		allowed.push(id);
	} catch {}
	if (allowed.length === 0 && actor.profile.role === "admin" && ids.length === 0) return refreshOverdueRows(sql, null);
	return refreshOverdueRows(sql, allowed.length ? allowed : ids);
}
async function saveSettings(actor, settings) {
	requireAdmin(actor, "editar la configuración");
	await (await getSql())`
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
async function upsertLawyer(actor, lawyer) {
	requireAdmin(actor, "gestionar letrados");
	await (await getSql())`
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
async function removeLawyer(actor, id) {
	requireAdmin(actor, "eliminar letrados");
	const sql = await getSql();
	if (((await sql`
    select count(*)::int as n from invoices where lawyer_id = ${id}
  `)[0]?.n ?? 0) > 0) throw new Error("No se puede eliminar un letrado con facturas asociadas");
	await sql`update user_profiles set lawyer_id = null where lawyer_id = ${id}`;
	await sql`delete from lawyers where id = ${id}`;
}
async function setUserRole(actor, targetUserId, role, lawyerId) {
	requireAdmin(actor, "cambiar roles");
	const sql = await getSql();
	if (role === "lawyer" && !lawyerId) throw new Error("Asigna un letrado al usuario con rol Abogado");
	if (role === "lawyer" && targetUserId === actor.userId) {
		if (((await sql`
      select count(*)::int as n from user_profiles
      where role = 'admin' and user_id <> ${targetUserId}
    `)[0]?.n ?? 0) === 0) throw new Error("Debe quedar al menos un usuario con rol Administración");
	}
	await sql`update lawyers set user_id = null where user_id = ${targetUserId}`;
	if (role === "lawyer" && lawyerId) {
		await sql`update lawyers set user_id = null where id = ${lawyerId}`;
		await sql`
      update user_profiles set lawyer_id = null
      where lawyer_id = ${lawyerId} and user_id <> ${targetUserId}
    `;
		await sql`update lawyers set user_id = ${targetUserId} where id = ${lawyerId}`;
	}
	await sql`
    insert into user_profiles (user_id, role, lawyer_id, updated_at)
    values (
      ${targetUserId},
      ${role},
      ${role === "lawyer" ? lawyerId : null},
      now()
    )
    on conflict (user_id) do update set
      role = excluded.role,
      lawyer_id = excluded.lawyer_id,
      updated_at = now()
  `;
}
async function resetDemoData(actor) {
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
			displayName: actor.name
		}
	});
}
async function listProfiles(actor) {
	if (actor.profile.role !== "admin") return [actor.profile];
	return (await (await getSql())`
    select
      p.user_id,
      p.role,
      p.lawyer_id,
      coalesce(nullif(p.email, ''), u.email) as email,
      coalesce(nullif(p.display_name, ''), u.name) as display_name
    from user_profiles p
    left join "user" u on u.id = p.user_id
    order by p.created_at asc
  `).map(mapProfile);
}
async function listInvoiceEvents(actor, invoiceId) {
	const sql = await getSql();
	await assertCanAccessInvoice(sql, actor, invoiceId);
	return (await sql`
    select *
    from invoice_events
    where invoice_id = ${invoiceId}
    order by created_at desc
    limit 200
  `).map(mapInvoiceEvent);
}
async function sendAdminEmail(actor, id, overrides) {
	const sql = await getSql();
	const inv = await assertCanAccessInvoice(sql, actor, id);
	const settings = await loadSettings(sql) ?? DEFAULT_SETTINGS;
	const lawyer = (await listLawyers(sql)).find((l) => l.id === inv.lawyerId);
	const generated = buildAdminEmail(inv, lawyer, settings);
	const subject = overrides?.subject?.trim() || generated.subject;
	const body = overrides?.body?.trim() || generated.body;
	const to = settings.adminEmail;
	if (!to) throw new Error("Configura el email de Administración");
	const { sendMail } = await import("./resend-BV1h-HJu.mjs");
	const outcome = await sendMail({
		to,
		subject,
		text: body,
		replyTo: lawyer?.email || void 0
	});
	const now = todayIso();
	const patch = {
		adminEmailSubject: subject,
		adminEmailBody: body,
		adminEmailSentAt: now
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
		message: outcome.mode === "resend" ? `Correo enviado a ${to} vía Resend` : `Modo prueba: no se envió correo real a ${to}. Copia el contenido o usa tu cliente de correo.`
	};
}
async function sendClientEmail(actor, id, overrides) {
	const sql = await getSql();
	const inv = await assertCanAccessInvoice(sql, actor, id);
	const settings = await loadSettings(sql) ?? DEFAULT_SETTINGS;
	const lawyer = (await listLawyers(sql)).find((l) => l.id === inv.lawyerId);
	const generated = buildClientEmail(inv, lawyer, settings);
	const subject = overrides?.subject?.trim() || generated.subject;
	const body = overrides?.body?.trim() || generated.body;
	const to = inv.clientEmail?.trim();
	if (!to) throw new Error("La factura no tiene email de cliente");
	const { sendMail } = await import("./resend-BV1h-HJu.mjs");
	const outcome = await sendMail({
		to,
		subject,
		text: body,
		replyTo: inv.remitente === "administracion" ? settings.adminEmail : lawyer?.email || settings.adminEmail
	});
	const now = todayIso();
	const patch = {
		clientEmailSubject: subject,
		clientEmailBody: body,
		clientEmailSentAt: now
	};
	if (inv.status === "emitida") {
		patch.status = "enviada_cliente";
		patch.sentAt = now;
	} else if (inv.status === "enviada_cliente") patch.sentAt = inv.sentAt || now;
	const invoice = await updateInvoiceFields(actor, id, patch);
	return {
		mode: outcome.mode,
		invoice,
		to,
		subject,
		message: outcome.mode === "resend" ? `Correo enviado a ${to} vía Resend` : `Modo prueba: no se envió correo real a ${to}. Copia el contenido o usa tu cliente de correo.`
	};
}
//#endregion
export { batchMarkSent, batchRefreshOverdue, batchRequestAdmin, createInvoiceFromDraft, deleteInvoice, listInvoiceEvents, listProfiles, loadBootstrap, markIssued, markSentToClient, refreshEmails, registerPayment, removeLawyer, requestAdmin, resetDemoData, resolveActor, saveSettings, sendAdminEmail, sendClientEmail, setUserRole, updateInvoiceFields, upsertLawyer };
