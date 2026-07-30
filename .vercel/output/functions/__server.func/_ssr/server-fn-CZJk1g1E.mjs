import { r as createServerFn } from "./ssr.mjs";
import { t as authMiddleware } from "./middleware-DQfimyJH.mjs";
import { i as getSql } from "./db-BEMyIp3V.mjs";
import { t as createServerRpc } from "./createServerRpc-CcvdN_gc.mjs";
import { r as parseConceptCsv } from "./export-Dmhiqqsz.mjs";
import { createCipheriv, createDecipheriv, createHash, randomBytes } from "node:crypto";
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { execFileSync } from "node:child_process";
//#region node_modules/.nitro/vite/services/ssr/assets/server-fn-CZJk1g1E.js
var empty = () => ({
	clientName: "",
	clientEmail: "",
	clientNif: "",
	expediente: "",
	concepto: "",
	baseAmount: 0,
	suplidos: 0,
	notes: "",
	confidence: 0,
	method: "heuristic",
	warnings: []
});
/**
* Extracción inteligente por regex + heurísticas para textos de despachos (ES).
* También reutiliza el parser CSV/clave:valor existente.
*/
function extractFromText(raw) {
	const text = normalizeText(raw);
	if (!text.trim()) return {
		...empty(),
		warnings: ["No hay texto para analizar"]
	};
	try {
		const row = parseConceptCsv(text)[0];
		if (row && hasUsefulFields(row)) {
			const result = {
				clientName: String(row.clientName ?? ""),
				clientEmail: String(row.clientEmail ?? ""),
				clientNif: String(row.clientNif ?? ""),
				expediente: String(row.expediente ?? ""),
				concepto: String(row.concepto ?? ""),
				baseAmount: typeof row.baseAmount === "number" ? row.baseAmount : 0,
				ivaRate: typeof row.ivaRate === "number" ? row.ivaRate : void 0,
				suplidos: typeof row.suplidos === "number" ? row.suplidos : 0,
				notes: String(row.notes ?? ""),
				confidence: scoreResult({
					clientName: String(row.clientName ?? ""),
					clientEmail: String(row.clientEmail ?? ""),
					clientNif: String(row.clientNif ?? ""),
					expediente: String(row.expediente ?? ""),
					concepto: String(row.concepto ?? ""),
					baseAmount: typeof row.baseAmount === "number" ? row.baseAmount : 0,
					suplidos: typeof row.suplidos === "number" ? row.suplidos : 0,
					notes: "",
					confidence: 0,
					method: "csv",
					warnings: []
				}),
				method: "csv",
				warnings: [],
				preview: text.slice(0, 400)
			};
			result.confidence = scoreResult(result);
			result.warnings = missingWarnings(result);
			if (result.confidence >= .45) return result;
		}
	} catch {}
	const result = empty();
	result.preview = text.slice(0, 400);
	result.method = "heuristic";
	result.clientEmail = firstMatch(text, [/(?:e-?mail|correo)(?:\s*(?:del\s*cliente|cliente))?[:\s]+([^\s;,]+@[^\s;,]+)/i, /\b([a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,})\b/i]);
	result.clientNif = normalizeNif(firstMatch(text, [
		/(?:NIF|CIF|N\.?I\.?F\.?|C\.?I\.?F\.?)[:\s]*([A-Z0-9]{8,10})/i,
		/\b([ABCDEFGHJNPQRSUVW]\d{7}[0-9A-J])\b/i,
		/\b(\d{8}[A-Z])\b/
	]));
	result.expediente = firstMatch(text, [
		/(?:expediente|exp\.?|n[ºo°]\s*exp\.?|ref\.?\s*expediente|asunto\s*n[ºo°]?)[:\s#]*([A-ZÁÉÍÓÚ]{1,6}[-\/\s]?\d{2,4}[-\/\s]?\d{2,6})/i,
		/\b([A-Z]{2,5}[-/]\d{4}[-/]\d{2,6})\b/,
		/\b((?:CIV|MER|LAB|FAM|ADM|IP|PEN|CON)[-/]\d{4}[-/]\d{2,6})\b/i
	]);
	result.clientName = cleanClient(firstMatch(text, [/(?:cliente|raz[oó]n\s*social|sociedad|demandante|cliente\s*\/\s*raz[oó]n)[:\s]+([^\n\r;|]{3,80})/i, /(?:facturar\s+a|a\s+nombre\s+de)[:\s]+([^\n\r;|]{3,80})/i]));
	if (!result.clientName) {
		const corp = text.match(/([A-ZÁÉÍÓÚÑ][A-Za-zÁÉÍÓÚáéíóúñÑ0-9 .,&'-]{2,60}\s(?:S\.?L\.?U?\.?|S\.?A\.?|S\.?C\.?P\.?|S\.?Coop\.?))\b/);
		if (corp?.[1]) result.clientName = cleanClient(corp[1]);
	}
	result.concepto = cleanConcept(firstMatch(text, [/(?:concepto|descripci[oó]n|honorarios|servicios|objeto)[:\s]+([^\n\r]{8,300})/i, /(?:por\s+los\s+siguientes\s+servicios)[:\s]+([^\n\r]{8,300})/i]));
	result.baseAmount = parseNumberEs(firstMatch(text, [/(?:base\s*imponible|honorarios|importe\s*(?:neto|base)?|cantidad)[:\s]*([0-9]{1,3}(?:[.\s][0-9]{3})*(?:[.,][0-9]{1,2})?)\s*€?/i, /(?:€|EUR)\s*([0-9]{1,3}(?:[.\s][0-9]{3})*(?:[.,][0-9]{1,2})?)/i]));
	if (!result.baseAmount) {
		const amounts = [...text.matchAll(/([0-9]{1,3}(?:[.\s][0-9]{3})+[.,][0-9]{2}|[0-9]+[.,][0-9]{2})\s*€?/g)].map((m) => parseNumberEs(m[1] ?? "")).filter((n) => n >= 50 && n <= 5e5);
		if (amounts.length) {
			result.baseAmount = Math.max(...amounts);
			result.warnings.push("Importe inferido del mayor valor detectado; revisa la base imponible");
		}
	}
	result.suplidos = parseNumberEs(firstMatch(text, [/(?:suplidos?|gastos\s*(?:repercutidos|adelantados)?|provisi[oó]n\s*de\s*fondos)[:\s]*([0-9]{1,3}(?:[.\s][0-9]{3})*(?:[.,][0-9]{1,2})?)/i]));
	const ivaStr = firstMatch(text, [/(?:IVA|I\.V\.A\.)[:\s]*([0-9]{1,2})(?:\s*%|\s*por\s*ciento)?/i, /([0-9]{1,2})\s*%\s*(?:IVA|I\.V\.A\.)/i]);
	if (ivaStr) {
		const iva = parseNumberEs(ivaStr);
		if (iva > 0 && iva <= 30) result.ivaRate = iva;
	}
	if (!result.concepto) {
		const honor = text.match(/([^\n\r]{0,40}honorarios[^\n\r]{5,200})/i);
		if (honor?.[1]) result.concepto = cleanConcept(honor[1]);
	}
	if (!result.concepto) {
		const lines = text.split(/\n/).map((l) => l.trim()).filter((l) => l.length > 25 && l.length < 220);
		if (lines[0]) result.concepto = cleanConcept(lines[0]);
	}
	result.confidence = scoreResult(result);
	result.warnings = [...result.warnings, ...missingWarnings(result)];
	return result;
}
function hasUsefulFields(row) {
	return Boolean(row.clientName || row.expediente || row.concepto || typeof row.baseAmount === "number" && row.baseAmount > 0);
}
function normalizeText(raw) {
	return raw.replace(/\u0000/g, "").replace(/\r\n/g, "\n").replace(/[ \t]+\n/g, "\n").replace(/\n{3,}/g, "\n\n").trim();
}
function firstMatch(text, patterns) {
	for (const re of patterns) {
		const m = text.match(re);
		if (m?.[1]?.trim()) return m[1].trim();
	}
	return "";
}
function parseNumberEs(raw) {
	if (!raw) return 0;
	let s = raw.replace(/\s/g, "").replace(/€/g, "").replace(/EUR/gi, "");
	if (/\d\.\d{3}/.test(s) && s.includes(",")) s = s.replace(/\./g, "").replace(",", ".");
	else if (/\d,\d{3}/.test(s) && s.includes(".")) s = s.replace(/,/g, "");
	else if (s.includes(",") && !s.includes(".")) s = s.replace(",", ".");
	const n = Number(s);
	return Number.isFinite(n) ? n : 0;
}
function normalizeNif(raw) {
	return raw.replace(/\s/g, "").toUpperCase();
}
function cleanClient(raw) {
	return raw.replace(/\s{2,}/g, " ").replace(/[|;].*$/, "").replace(/\s*[-–]\s*NIF.*$/i, "").trim().slice(0, 120);
}
function cleanConcept(raw) {
	return raw.replace(/\s{2,}/g, " ").replace(/^[:\-\s]+/, "").trim().slice(0, 500);
}
function scoreResult(r) {
	let score = 0;
	if (r.clientName.length > 2) score += .22;
	if (r.clientNif.length >= 8) score += .12;
	if (r.clientEmail.includes("@")) score += .1;
	if (r.expediente.length > 3) score += .2;
	if (r.concepto.length > 8) score += .2;
	if (r.baseAmount > 0) score += .16;
	return Math.min(1, Math.round(score * 100) / 100);
}
function missingWarnings(r) {
	const w = [];
	if (!r.clientName) w.push("No se detectó el nombre del cliente");
	if (!r.expediente) w.push("No se detectó el número de expediente");
	if (!r.concepto) w.push("No se detectó el concepto de honorarios");
	if (!r.baseAmount) w.push("No se detectó la base imponible");
	if (!r.clientNif) w.push("NIF/CIF no encontrado (opcional)");
	if (!r.clientEmail) w.push("Email del cliente no encontrado (opcional)");
	return w;
}
/**
* Convert uploaded file bytes to plain text (server-side).
* Supports: plain text, CSV, DOCX (via unzip), PDF (basic stream parse).
*/
function fileBytesToText(bytes, fileName = "", mimeType = "") {
	const name = fileName.toLowerCase();
	const mime = mimeType.toLowerCase();
	if (name.endsWith(".docx") || mime.includes("wordprocessingml") || mime.includes("officedocument.wordprocessingml")) return {
		text: extractDocx(bytes),
		format: "docx"
	};
	if (name.endsWith(".pdf") || mime === "application/pdf") return {
		text: extractPdfBasic(bytes),
		format: "pdf"
	};
	if (name.endsWith(".doc") && !name.endsWith(".docx")) return {
		text: bytes.toString("latin1").replace(/[^\x09\x0A\x0D\x20-\x7E\xA0-\xFF]/g, " ").replace(/\s{2,}/g, " ").slice(0, 5e4),
		format: "doc"
	};
	let text = bytes.toString("utf8");
	if (text.includes("�") || hasManyNulls(bytes)) text = bytes.toString("latin1");
	return {
		text: text.slice(0, 2e5),
		format: "text"
	};
}
function hasManyNulls(buf) {
	let n = 0;
	const step = Math.max(1, Math.floor(buf.length / 500));
	for (let i = 0; i < buf.length; i += step) if (buf[i] === 0) n++;
	return n > 20;
}
function extractDocx(bytes) {
	const dir = mkdtempSync(join(tmpdir(), "flowae-docx-"));
	const path = join(dir, "doc.docx");
	try {
		writeFileSync(path, bytes);
		return stripOfficeXml(execFileSync("unzip", [
			"-p",
			path,
			"word/document.xml"
		], {
			encoding: "utf8",
			maxBuffer: 10 * 1024 * 1024
		}));
	} catch (err) {
		throw new Error(`No se pudo leer el Word (.docx): ${err instanceof Error ? err.message : String(err)}`);
	} finally {
		try {
			rmSync(dir, {
				recursive: true,
				force: true
			});
		} catch {}
	}
}
function stripOfficeXml(xml) {
	return xml.replace(/<w:tab[^/]*\/>/g, "	").replace(/<\/w:p>/g, "\n").replace(/<w:br[^/]*\/>/g, "\n").replace(/<[^>]+>/g, "").replace(/&/g, "&").replace(/</g, "<").replace(/>/g, ">").replace(/"/g, "\"").replace(/&#(\d+);/g, (_, n) => String.fromCharCode(Number(n))).replace(/[ \t]+\n/g, "\n").replace(/\n{3,}/g, "\n\n").trim();
}
/**
* Very lightweight PDF text extraction for text-based PDFs (no images/OCR).
* Parses string literals and common Tj/TJ operators.
*/
function extractPdfBasic(bytes) {
	const raw = bytes.toString("latin1");
	const chunks = [];
	const lit = /(?<!\\)\((?:\\.|[^\\)])*\)/g;
	let m;
	while (m = lit.exec(raw)) {
		const decoded = decodePdfString(m[0].slice(1, -1));
		if (decoded.trim().length >= 1) chunks.push(decoded);
	}
	const hex = /<([0-9A-Fa-f\s]+)>/g;
	while (m = hex.exec(raw)) {
		const h = m[1].replace(/\s/g, "");
		if (h.length < 4 || h.length % 2 !== 0) continue;
		try {
			let s = "";
			for (let i = 0; i < h.length; i += 2) s += String.fromCharCode(parseInt(h.slice(i, i + 2), 16));
			if (/[\x20-\x7EÁÉÍÓÚáéíóúñÑ]/.test(s)) chunks.push(s);
		} catch {}
	}
	let text = chunks.join(" ");
	text = text.replace(/\s{2,}/g, " ").replace(/\s+([,.;:])/g, "$1").trim();
	if (text.length < 20) throw new Error("PDF sin texto extraíble (puede ser escaneado/imagen). Pega el texto o usa un PDF con texto seleccionable.");
	return text.slice(0, 1e5);
}
function decodePdfString(s) {
	return s.replace(/\\n/g, "\n").replace(/\\r/g, "\r").replace(/\\t/g, "	").replace(/\\\(/g, "(").replace(/\\\)/g, ")").replace(/\\\\/g, "\\").replace(/\\(\d{1,3})/g, (_, oct) => String.fromCharCode(parseInt(oct, 8)));
}
/**
* Minimal connectivity check — does not include user documents.
*/
async function testHarveyConnection(apiKey, baseUrl) {
	try {
		const res = await harveyCompletion(apiKey, baseUrl, "Responde únicamente con la palabra OK, sin más texto.");
		if (!res.ok) return {
			ok: false,
			status: res.status,
			message: mapHarveyError(res.status, res.errorBody)
		};
		return {
			ok: true,
			message: "Conexión con Harvey correcta (endpoint UE o configurado)."
		};
	} catch (err) {
		return {
			ok: false,
			message: `No se pudo contactar con Harvey: ${err instanceof Error ? err.message : String(err)}`
		};
	}
}
async function enhanceWithHarvey(documentText, heuristic, apiKey, baseUrl) {
	const prompt = buildExtractPrompt(documentText, heuristic);
	try {
		const res = await harveyCompletion(apiKey, baseUrl, prompt);
		if (!res.ok) return {
			...heuristic,
			method: "mixed",
			warnings: [...heuristic.warnings, `Harvey no disponible (${res.status}): se usó extracción local. ${mapHarveyError(res.status, res.errorBody)}`]
		};
		const parsed = parseJsonObject$1(res.text);
		if (!parsed) return {
			...heuristic,
			method: "mixed",
			warnings: [...heuristic.warnings, "Harvey no devolvió JSON válido; se mantuvo la extracción local"]
		};
		const merged = {
			clientName: str$1(parsed.clientName) || heuristic.clientName,
			clientEmail: str$1(parsed.clientEmail) || heuristic.clientEmail,
			clientNif: str$1(parsed.clientNif) || heuristic.clientNif,
			expediente: str$1(parsed.expediente) || heuristic.expediente,
			concepto: str$1(parsed.concepto) || heuristic.concepto,
			baseAmount: num$1(parsed.baseAmount) || heuristic.baseAmount,
			ivaRate: num$1(parsed.ivaRate) || heuristic.ivaRate,
			suplidos: num$1(parsed.suplidos) || heuristic.suplidos || 0,
			notes: str$1(parsed.notes) || heuristic.notes,
			confidence: Math.min(1, Math.max(heuristic.confidence, .82)),
			method: "harvey",
			warnings: [],
			preview: heuristic.preview
		};
		if (!merged.clientName) merged.warnings.push("Harvey no encontró cliente");
		if (!merged.concepto) merged.warnings.push("Harvey no encontró concepto");
		if (!merged.baseAmount) merged.warnings.push("Harvey no encontró importe");
		if (!merged.expediente) merged.warnings.push("Harvey no encontró expediente");
		return merged;
	} catch (err) {
		return {
			...heuristic,
			method: "mixed",
			warnings: [...heuristic.warnings, `Error Harvey: ${err instanceof Error ? err.message : String(err)}. Extracción local aplicada.`]
		};
	}
}
function buildExtractPrompt(documentText, heuristic) {
	return `Eres un asistente de un despacho de abogados español.
Extrae datos de facturación del siguiente texto de expediente/minuta.
Responde SOLO con JSON válido (sin markdown ni texto adicional) con estas claves exactas:
clientName, clientEmail, clientNif, expediente, concepto, baseAmount (number), ivaRate (number|null), suplidos (number), notes (string).
Usa "" o null si un dato no aparece. Importes en euros como número. Concepto en español, conciso.

Heurística previa (puedes corregirla):
${JSON.stringify({
		clientName: heuristic.clientName,
		clientEmail: heuristic.clientEmail,
		clientNif: heuristic.clientNif,
		expediente: heuristic.expediente,
		concepto: heuristic.concepto,
		baseAmount: heuristic.baseAmount,
		ivaRate: heuristic.ivaRate ?? null,
		suplidos: heuristic.suplidos
	}, null, 0)}

Texto del documento:
---
${documentText.slice(0, 12e3)}
---`;
}
async function harveyCompletion(apiKey, baseUrl, prompt) {
	const url = `${baseUrl.replace(/\/$/, "")}/api/v2/completion`;
	const form = new FormData();
	form.append("prompt", prompt.slice(0, 2e4));
	form.append("stream", "false");
	form.append("mode", "draft");
	const res = await fetch(url, {
		method: "POST",
		headers: { Authorization: `Bearer ${apiKey}` },
		body: form
	});
	if (!res.ok) {
		const errorBody = await res.text().catch(() => "");
		return {
			ok: false,
			status: res.status,
			errorBody: sanitizeErrorBody(errorBody).slice(0, 240)
		};
	}
	const data = await res.json();
	const text = data.response ?? data.text ?? data.completion ?? JSON.stringify(data);
	return {
		ok: true,
		text: String(text)
	};
}
function mapHarveyError(status, body) {
	if (status === 401 || status === 403) return "API key inválida o sin permisos. Revisa la clave en Configuración.";
	if (status === 429) return "Límite de uso de Harvey superado. Inténtalo más tarde.";
	if (status === 404) return "Endpoint no encontrado. Comprueba la URL base (UE: https://eu.api.harvey.ai).";
	return body || `HTTP ${status}`;
}
function sanitizeErrorBody(body) {
	return body.replace(/Bearer\s+[A-Za-z0-9._\-]+/gi, "Bearer [redacted]");
}
function str$1(v) {
	if (v == null) return "";
	return String(v).trim();
}
function num$1(v) {
	if (v == null || v === "") return 0;
	if (typeof v === "number") return Number.isFinite(v) ? v : 0;
	const n = Number(String(v).replace(",", "."));
	return Number.isFinite(n) ? n : 0;
}
function parseJsonObject$1(content) {
	const trimmed = content.trim();
	const jsonText = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/i)?.[1]?.trim() || trimmed;
	try {
		const v = JSON.parse(jsonText);
		if (v && typeof v === "object") return v;
	} catch {
		const start = jsonText.indexOf("{");
		const end = jsonText.lastIndexOf("}");
		if (start >= 0 && end > start) try {
			return JSON.parse(jsonText.slice(start, end + 1));
		} catch {
			return null;
		}
	}
	return null;
}
/**
* AES-256-GCM helpers for firm secrets (server-only).
* Master key from SECRETS_ENCRYPTION_KEY or BETTER_AUTH_SECRET (SHA-256).
* Stored format: v1:<iv_b64>:<tag_b64>:<cipher_b64>
*/
var PREFIX = "v1";
function masterKey() {
	const raw = typeof process !== "undefined" && (process.env.SECRETS_ENCRYPTION_KEY || process.env.BETTER_AUTH_SECRET)?.trim() || "facturaflow-dev-only-secrets-key";
	return createHash("sha256").update(raw).digest();
}
function encryptSecret(plain) {
	if (!plain) throw new Error("Secreto vacío");
	const iv = randomBytes(12);
	const cipher = createCipheriv("aes-256-gcm", masterKey(), iv);
	const enc = Buffer.concat([cipher.update(plain, "utf8"), cipher.final()]);
	const tag = cipher.getAuthTag();
	return [
		PREFIX,
		iv.toString("base64url"),
		tag.toString("base64url"),
		enc.toString("base64url")
	].join(":");
}
function decryptSecret(blob) {
	if (!blob || !blob.startsWith(`${PREFIX}:`)) throw new Error("Formato de secreto no válido");
	const parts = blob.split(":");
	if (parts.length !== 4) throw new Error("Formato de secreto no válido");
	const [, ivB64, tagB64, dataB64] = parts;
	const iv = Buffer.from(ivB64, "base64url");
	const tag = Buffer.from(tagB64, "base64url");
	const data = Buffer.from(dataB64, "base64url");
	const decipher = createDecipheriv("aes-256-gcm", masterKey(), iv);
	decipher.setAuthTag(tag);
	return Buffer.concat([decipher.update(data), decipher.final()]).toString("utf8");
}
/** Mask for UI: never returns the full key. */
function maskSecret(plainOrLast4, last4Only = false) {
	if (!plainOrLast4) return "";
	const last4 = last4Only ? plainOrLast4.slice(-4) : plainOrLast4.replace(/\s/g, "").slice(-4);
	if (!last4) return "••••••••";
	return `••••••••${last4}`;
}
function last4Of(plain) {
	return plain.replace(/\s/g, "").slice(-4);
}
/**
* Server-only Harvey API key persistence (encrypted at rest).
* Never return the full key to the client.
*/
var DEFAULT_BASE = "https://eu.api.harvey.ai";
async function ensureSecretsRow() {
	await (await getSql())`
    insert into firm_secrets (id, harvey_base_url)
    values ('default', ${DEFAULT_BASE})
    on conflict (id) do nothing
  `;
}
async function getHarveyPublicStatus() {
	await ensureSecretsRow();
	const row = (await (await getSql())`
    select harvey_api_key_enc, harvey_api_key_last4, harvey_base_url, harvey_updated_at
    from firm_secrets where id = 'default' limit 1
  `)[0];
	const hasEnc = Boolean(row?.harvey_api_key_enc);
	const envKey = envHarveyKey();
	const configured = hasEnc || Boolean(envKey);
	const last4 = row?.harvey_api_key_last4 || (envKey ? last4Of(envKey) : null);
	const updated = row?.harvey_updated_at instanceof Date ? row.harvey_updated_at.toISOString() : row?.harvey_updated_at ? String(row.harvey_updated_at) : null;
	return {
		configured,
		maskedKey: configured && last4 ? maskSecret(last4, true) : configured ? "••••••••" : null,
		baseUrl: (row?.harvey_base_url || env$1("HARVEY_BASE_URL") || DEFAULT_BASE).replace(/\/$/, ""),
		updatedAt: hasEnc ? updated : envKey ? null : null,
		statusLabel: configured ? "connected" : "missing"
	};
}
/** Full credentials for server-side calls only. Never log this. */
async function getHarveyCredentials() {
	await ensureSecretsRow();
	const row = (await (await getSql())`
    select harvey_api_key_enc, harvey_base_url
    from firm_secrets where id = 'default' limit 1
  `)[0];
	const baseUrl = (row?.harvey_base_url || env$1("HARVEY_BASE_URL") || DEFAULT_BASE).replace(/\/$/, "");
	if (row?.harvey_api_key_enc) try {
		const apiKey = decryptSecret(row.harvey_api_key_enc);
		if (apiKey) return {
			apiKey,
			baseUrl,
			source: "firm"
		};
	} catch {}
	const envKey = envHarveyKey();
	if (envKey) return {
		apiKey: envKey,
		baseUrl,
		source: "env"
	};
	return null;
}
async function saveHarveyApiKey(plainKey, baseUrl) {
	const cleaned = plainKey.trim();
	if (cleaned.length < 8) throw new Error("La API key de Harvey parece demasiado corta");
	const enc = encryptSecret(cleaned);
	const last4 = last4Of(cleaned);
	const base = (baseUrl?.trim() || DEFAULT_BASE).replace(/\/$/, "");
	await ensureSecretsRow();
	await (await getSql())`
    update firm_secrets set
      harvey_api_key_enc = ${enc},
      harvey_api_key_last4 = ${last4},
      harvey_base_url = ${base},
      harvey_updated_at = now(),
      updated_at = now()
    where id = 'default'
  `;
	return getHarveyPublicStatus();
}
async function deleteHarveyApiKey() {
	await ensureSecretsRow();
	await (await getSql())`
    update firm_secrets set
      harvey_api_key_enc = null,
      harvey_api_key_last4 = null,
      harvey_updated_at = now(),
      updated_at = now()
    where id = 'default'
  `;
	return getHarveyPublicStatus();
}
async function updateHarveyBaseUrl(baseUrl) {
	const base = baseUrl.trim().replace(/\/$/, "") || DEFAULT_BASE;
	if (!/^https:\/\//i.test(base)) throw new Error("La URL de Harvey debe usar HTTPS");
	await ensureSecretsRow();
	await (await getSql())`
    update firm_secrets set
      harvey_base_url = ${base},
      updated_at = now()
    where id = 'default'
  `;
	return getHarveyPublicStatus();
}
function envHarveyKey() {
	return env$1("HARVEY_API_KEY");
}
function env$1(k) {
	if (typeof process === "undefined") return void 0;
	return process.env[k]?.trim() || void 0;
}
/**
* Optional LLM enhancement chain:
* 1) Harvey (firm key encrypted in DB, or HARVEY_API_KEY env)
* 2) Grok / OpenAI env keys
* 3) Heuristic only
*
* Env (fallback, not firm UI):
*   XAI_API_KEY / GROK_API_KEY, OPENAI_API_KEY, AI_MODEL, OPENAI_BASE_URL
*/
function getFallbackAiConfig() {
	const xai = env("XAI_API_KEY") || env("GROK_API_KEY");
	const openai = env("OPENAI_API_KEY");
	if (xai) return {
		configured: true,
		provider: "xai",
		model: env("AI_MODEL") || "grok-3-mini"
	};
	if (openai) return {
		configured: true,
		provider: "openai",
		model: env("AI_MODEL") || "gpt-4o-mini"
	};
	return {
		configured: false,
		provider: "none",
		model: ""
	};
}
function env(k) {
	if (typeof process === "undefined") return void 0;
	return process.env[k]?.trim() || void 0;
}
/**
* Enhance heuristic extraction with the best available AI provider.
*/
async function enhanceWithAi(documentText, heuristic) {
	try {
		const harvey = await getHarveyCredentials();
		if (harvey?.apiKey) return enhanceWithHarvey(documentText, heuristic, harvey.apiKey, harvey.baseUrl);
	} catch {}
	const cfg = getFallbackAiConfig();
	if (!cfg.configured) return heuristic;
	const apiKey = env("XAI_API_KEY") || env("GROK_API_KEY") || env("OPENAI_API_KEY");
	if (!apiKey) return heuristic;
	const baseUrl = env("OPENAI_BASE_URL") || env("AI_BASE_URL") || (cfg.provider === "xai" ? "https://api.x.ai/v1" : "https://api.openai.com/v1");
	const system = `Eres un asistente de un despacho de abogados español.
Extraes datos de facturación de notas de expediente, minutas o escritos.
Responde SOLO con JSON válido (sin markdown) con estas claves:
clientName, clientEmail, clientNif, expediente, concepto, baseAmount (number), ivaRate (number|null), suplidos (number), notes (string).
Usa null o "" si no aparece. Importes en euros (número, no string). Concepto en español, conciso.`;
	const user = `Texto del documento (puede estar incompleto):\n---\n${documentText.slice(0, 12e3)}\n---\nHeurística previa (puedes corregirla):\n${JSON.stringify({
		clientName: heuristic.clientName,
		clientEmail: heuristic.clientEmail,
		clientNif: heuristic.clientNif,
		expediente: heuristic.expediente,
		concepto: heuristic.concepto,
		baseAmount: heuristic.baseAmount,
		ivaRate: heuristic.ivaRate ?? null,
		suplidos: heuristic.suplidos
	}, null, 0)}`;
	try {
		const res = await fetch(`${baseUrl.replace(/\/$/, "")}/chat/completions`, {
			method: "POST",
			headers: {
				Authorization: `Bearer ${apiKey}`,
				"Content-Type": "application/json"
			},
			body: JSON.stringify({
				model: cfg.model,
				temperature: .1,
				messages: [{
					role: "system",
					content: system
				}, {
					role: "user",
					content: user
				}]
			})
		});
		if (!res.ok) {
			const body = await res.text().catch(() => "");
			return {
				...heuristic,
				method: "mixed",
				warnings: [...heuristic.warnings, `IA no disponible (${res.status}): se usó extracción local. ${body.slice(0, 120)}`]
			};
		}
		const parsed = parseJsonObject((await res.json()).choices?.[0]?.message?.content ?? "");
		if (!parsed) return {
			...heuristic,
			method: "mixed",
			warnings: [...heuristic.warnings, "La IA no devolvió JSON válido; se mantuvo la extracción local"]
		};
		const merged = {
			clientName: str(parsed.clientName) || heuristic.clientName,
			clientEmail: str(parsed.clientEmail) || heuristic.clientEmail,
			clientNif: str(parsed.clientNif) || heuristic.clientNif,
			expediente: str(parsed.expediente) || heuristic.expediente,
			concepto: str(parsed.concepto) || heuristic.concepto,
			baseAmount: num(parsed.baseAmount) || heuristic.baseAmount,
			ivaRate: num(parsed.ivaRate) || heuristic.ivaRate,
			suplidos: num(parsed.suplidos) || heuristic.suplidos || 0,
			notes: str(parsed.notes) || heuristic.notes,
			confidence: Math.min(1, Math.max(heuristic.confidence, .75)),
			method: "ai",
			warnings: [],
			preview: heuristic.preview
		};
		if (!merged.clientName) merged.warnings.push("IA no encontró cliente");
		if (!merged.concepto) merged.warnings.push("IA no encontró concepto");
		if (!merged.baseAmount) merged.warnings.push("IA no encontró importe");
		if (!merged.expediente) merged.warnings.push("IA no encontró expediente");
		return merged;
	} catch (err) {
		return {
			...heuristic,
			method: "mixed",
			warnings: [...heuristic.warnings, `Error al llamar a la IA: ${err instanceof Error ? err.message : String(err)}. Extracción local aplicada.`]
		};
	}
}
function str(v) {
	if (v == null) return "";
	return String(v).trim();
}
function num(v) {
	if (v == null || v === "") return 0;
	if (typeof v === "number") return Number.isFinite(v) ? v : 0;
	const n = Number(String(v).replace(",", "."));
	return Number.isFinite(n) ? n : 0;
}
function parseJsonObject(content) {
	const trimmed = content.trim();
	const jsonText = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/i)?.[1]?.trim() || trimmed;
	try {
		const v = JSON.parse(jsonText);
		if (v && typeof v === "object") return v;
	} catch {
		const start = jsonText.indexOf("{");
		const end = jsonText.lastIndexOf("}");
		if (start >= 0 && end > start) try {
			return JSON.parse(jsonText.slice(start, end + 1));
		} catch {
			return null;
		}
	}
	return null;
}
async function requireAdmin(userId) {
	const repo = await import("./server-repo-U-ZFJa8X.mjs");
	let email = null;
	let name = null;
	try {
		const { getSql } = await import("./db-BEMyIp3V.mjs").then((n) => n.t).then((n) => n.t);
		const rows = await (await getSql())`
      select name, email from "user" where id = ${userId} limit 1
    `;
		if (rows[0]) {
			name = rows[0].name ?? null;
			email = rows[0].email ?? null;
		}
	} catch {}
	const actor = await repo.resolveActor(userId, email, name);
	if (actor.profile.role !== "admin") throw new Error("Solo Administración puede gestionar la API de Harvey");
	return actor;
}
var getExtractStatusFn_createServerFn_handler = createServerRpc({
	id: "561a5f79b607985070e782c7591116d014da2c95a45e1ced7e4ec0b61db2f265",
	name: "getExtractStatusFn",
	filename: "src/lib/extract/server-fn.ts"
}, (opts) => getExtractStatusFn.__executeServer(opts));
var getExtractStatusFn = createServerFn({ method: "GET" }).middleware([authMiddleware]).handler(getExtractStatusFn_createServerFn_handler, async () => {
	const harvey = await getHarveyPublicStatus();
	const fallback = getFallbackAiConfig();
	const activeProvider = harvey.configured ? "harvey" : fallback.configured ? fallback.provider : "none";
	return {
		activeProvider,
		harveyConfigured: harvey.configured,
		harveyMasked: harvey.maskedKey,
		fallbackConfigured: fallback.configured,
		fallbackProvider: fallback.provider,
		model: activeProvider === "harvey" ? "Harvey Assistant" : fallback.model,
		formats: [
			".pdf",
			".docx",
			".txt",
			".csv",
			"texto pegado"
		]
	};
});
var extractConceptFn_createServerFn_handler = createServerRpc({
	id: "ed784e5864a007de5c9ab19434a9517ddb7fbb653a4310eee5c4cf1f6a1d478c",
	name: "extractConceptFn",
	filename: "src/lib/extract/server-fn.ts"
}, (opts) => extractConceptFn.__executeServer(opts));
var extractConceptFn = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((data) => data).handler(extractConceptFn_createServerFn_handler, async ({ data }) => {
	let text = (data.text ?? "").trim();
	let format = "text";
	if (data.fileBase64) {
		const buf = Buffer.from(data.fileBase64, "base64");
		if (buf.length > 8 * 1024 * 1024) throw new Error("El archivo supera 8 MB");
		const out = fileBytesToText(buf, data.fileName ?? "", data.mimeType ?? "");
		text = out.text;
		format = out.format;
	}
	if (!text.trim()) throw new Error("No se obtuvo texto del documento. Pega el contenido o sube un PDF/Word con texto.");
	let result = extractFromText(text);
	result.notes = result.notes || (data.fileName ? `Extraído de ${data.fileName} (${format})` : "Extraído de texto pegado");
	result = await enhanceWithAi(text, result);
	if (data.fileName && result.notes && !result.notes.includes(data.fileName)) result.notes = `Extraído de ${data.fileName} · ${result.notes}`.slice(0, 300);
	result.preview = text.slice(0, 500);
	return result;
});
var getHarveyStatusFn_createServerFn_handler = createServerRpc({
	id: "22043478ae92c45a834ddbd031382a522dc49b13d8a37c67cda87c949abd8e86",
	name: "getHarveyStatusFn",
	filename: "src/lib/extract/server-fn.ts"
}, (opts) => getHarveyStatusFn.__executeServer(opts));
var getHarveyStatusFn = createServerFn({ method: "GET" }).middleware([authMiddleware]).handler(getHarveyStatusFn_createServerFn_handler, async ({ context }) => {
	await requireAdmin(context.userId);
	return getHarveyPublicStatus();
});
var saveHarveyApiKeyFn_createServerFn_handler = createServerRpc({
	id: "30a1c7af74e7f3cc1da1659eeff548ff88d806ac33f59c5903a85e98ff84bf79",
	name: "saveHarveyApiKeyFn",
	filename: "src/lib/extract/server-fn.ts"
}, (opts) => saveHarveyApiKeyFn.__executeServer(opts));
var saveHarveyApiKeyFn = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((data) => data).handler(saveHarveyApiKeyFn_createServerFn_handler, async ({ context, data }) => {
	await requireAdmin(context.userId);
	return saveHarveyApiKey(data.apiKey, data.baseUrl);
});
var deleteHarveyApiKeyFn_createServerFn_handler = createServerRpc({
	id: "68475eddc80014473b1a0a55ae4ff6f82c90d052b485d9a05bdb8bc097d980bb",
	name: "deleteHarveyApiKeyFn",
	filename: "src/lib/extract/server-fn.ts"
}, (opts) => deleteHarveyApiKeyFn.__executeServer(opts));
var deleteHarveyApiKeyFn = createServerFn({ method: "POST" }).middleware([authMiddleware]).handler(deleteHarveyApiKeyFn_createServerFn_handler, async ({ context }) => {
	await requireAdmin(context.userId);
	return deleteHarveyApiKey();
});
var updateHarveyBaseUrlFn_createServerFn_handler = createServerRpc({
	id: "e7f8d4b892b7deb62794395f842240cdb761b68f35b9f05365ec6843bb474f55",
	name: "updateHarveyBaseUrlFn",
	filename: "src/lib/extract/server-fn.ts"
}, (opts) => updateHarveyBaseUrlFn.__executeServer(opts));
var updateHarveyBaseUrlFn = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((data) => data).handler(updateHarveyBaseUrlFn_createServerFn_handler, async ({ context, data }) => {
	await requireAdmin(context.userId);
	return updateHarveyBaseUrl(data.baseUrl);
});
var testHarveyConnectionFn_createServerFn_handler = createServerRpc({
	id: "bcd2db5234a6e52499312e968143e5eef093597672bca99e8cfc8c2cccddccd2",
	name: "testHarveyConnectionFn",
	filename: "src/lib/extract/server-fn.ts"
}, (opts) => testHarveyConnectionFn.__executeServer(opts));
var testHarveyConnectionFn = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((data) => data ?? {}).handler(testHarveyConnectionFn_createServerFn_handler, async ({ context, data }) => {
	await requireAdmin(context.userId);
	let apiKey = data.apiKey?.trim() || "";
	let baseUrl = data.baseUrl?.trim() || "";
	if (!apiKey) {
		const creds = await getHarveyCredentials();
		if (!creds) return {
			ok: false,
			message: "No hay API key de Harvey configurada"
		};
		apiKey = creds.apiKey;
		baseUrl = baseUrl || creds.baseUrl;
	}
	if (!baseUrl) baseUrl = (await getHarveyPublicStatus()).baseUrl;
	return testHarveyConnection(apiKey, baseUrl);
});
//#endregion
export { deleteHarveyApiKeyFn_createServerFn_handler, extractConceptFn_createServerFn_handler, getExtractStatusFn_createServerFn_handler, getHarveyStatusFn_createServerFn_handler, saveHarveyApiKeyFn_createServerFn_handler, testHarveyConnectionFn_createServerFn_handler, updateHarveyBaseUrlFn_createServerFn_handler };
