/**
 * AES-256-GCM helpers for firm secrets (server-only).
 *
 * Clave maestra (prioridad fija):
 *   1. SECRETS_ENCRYPTION_KEY  ← preferida para cifrar API keys (Harvey / firm_secrets)
 *   2. BETTER_AUTH_SECRET      ← fallback si (1) no está definida
 *   3. valor de desarrollo local solo si no hay ninguna (no usar en producción)
 *
 * El material se deriva con SHA-256 a 32 bytes. Formato almacenado:
 *   v1:<iv_b64url>:<tag_b64url>:<cipher_b64url>
 */
import { createCipheriv, createDecipheriv, createHash, randomBytes } from "node:crypto";

const PREFIX = "v1";

/**
 * Resuelve la clave maestra de cifrado.
 * Preferir siempre SECRETS_ENCRYPTION_KEY; BETTER_AUTH_SECRET solo como respaldo.
 */
function masterKey(): Buffer {
  const preferred =
    typeof process !== "undefined"
      ? process.env.SECRETS_ENCRYPTION_KEY?.trim()
      : undefined;
  const fallback =
    typeof process !== "undefined"
      ? process.env.BETTER_AUTH_SECRET?.trim()
      : undefined;
  // Prioridad: SECRETS_ENCRYPTION_KEY → BETTER_AUTH_SECRET → dev-only
  const raw =
    preferred || fallback || "facturaflow-dev-only-secrets-key";
  return createHash("sha256").update(raw).digest(); // 32 bytes
}

export function encryptSecret(plain: string): string {
  if (!plain) throw new Error("Secreto vacío");
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", masterKey(), iv);
  const enc = Buffer.concat([
    cipher.update(plain, "utf8"),
    cipher.final(),
  ]);
  const tag = cipher.getAuthTag();
  return [
    PREFIX,
    iv.toString("base64url"),
    tag.toString("base64url"),
    enc.toString("base64url"),
  ].join(":");
}

export function decryptSecret(blob: string): string {
  if (!blob || !blob.startsWith(`${PREFIX}:`)) {
    throw new Error("Formato de secreto no válido");
  }
  const parts = blob.split(":");
  if (parts.length !== 4) throw new Error("Formato de secreto no válido");
  const [, ivB64, tagB64, dataB64] = parts;
  const iv = Buffer.from(ivB64!, "base64url");
  const tag = Buffer.from(tagB64!, "base64url");
  const data = Buffer.from(dataB64!, "base64url");
  const decipher = createDecipheriv("aes-256-gcm", masterKey(), iv);
  decipher.setAuthTag(tag);
  const dec = Buffer.concat([decipher.update(data), decipher.final()]);
  return dec.toString("utf8");
}

/** Mask for UI: never returns the full key. */
export function maskSecret(plainOrLast4: string, last4Only = false): string {
  if (!plainOrLast4) return "";
  const last4 = last4Only
    ? plainOrLast4.slice(-4)
    : plainOrLast4.replace(/\s/g, "").slice(-4);
  if (!last4) return "••••••••";
  return `••••••••${last4}`;
}

export function last4Of(plain: string): string {
  const cleaned = plain.replace(/\s/g, "");
  return cleaned.slice(-4);
}
