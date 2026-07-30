/**
 * Server-only Harvey API key persistence (encrypted at rest).
 * Never return the full key to the client.
 */
import { getSql } from "@/lib/db";
import {
  decryptSecret,
  encryptSecret,
  last4Of,
  maskSecret,
} from "./crypto";

import type { HarveyPublicStatus } from "./types";

export type { HarveyPublicStatus };

const DEFAULT_BASE = "https://eu.api.harvey.ai";

async function ensureSecretsRow(): Promise<void> {
  const sql = await getSql();
  await sql`
    insert into firm_secrets (id, harvey_base_url)
    values ('default', ${DEFAULT_BASE})
    on conflict (id) do nothing
  `;
}

export async function getHarveyPublicStatus(): Promise<HarveyPublicStatus> {
  await ensureSecretsRow();
  const sql = await getSql();
  const rows = await sql<{
    harvey_api_key_enc: string | null;
    harvey_api_key_last4: string | null;
    harvey_base_url: string | null;
    harvey_updated_at: Date | string | null;
  }>`
    select harvey_api_key_enc, harvey_api_key_last4, harvey_base_url, harvey_updated_at
    from firm_secrets where id = 'default' limit 1
  `;
  const row = rows[0];
  const hasEnc = Boolean(row?.harvey_api_key_enc);
  // Env fallback (ops) — does not expose key
  const envKey = envHarveyKey();
  const configured = hasEnc || Boolean(envKey);
  const last4 = row?.harvey_api_key_last4 || (envKey ? last4Of(envKey) : null);
  const updated =
    row?.harvey_updated_at instanceof Date
      ? row.harvey_updated_at.toISOString()
      : row?.harvey_updated_at
        ? String(row.harvey_updated_at)
        : null;

  return {
    configured,
    maskedKey: configured && last4 ? maskSecret(last4, true) : configured ? "••••••••" : null,
    baseUrl: (row?.harvey_base_url || env("HARVEY_BASE_URL") || DEFAULT_BASE).replace(
      /\/$/,
      "",
    ),
    updatedAt: hasEnc ? updated : envKey ? null : null,
    statusLabel: configured ? "connected" : "missing",
  };
}

/** Full credentials for server-side calls only. Never log this. */
export async function getHarveyCredentials(): Promise<{
  apiKey: string;
  baseUrl: string;
  source: "firm" | "env";
} | null> {
  await ensureSecretsRow();
  const sql = await getSql();
  const rows = await sql<{
    harvey_api_key_enc: string | null;
    harvey_base_url: string | null;
  }>`
    select harvey_api_key_enc, harvey_base_url
    from firm_secrets where id = 'default' limit 1
  `;
  const row = rows[0];
  const baseUrl = (
    row?.harvey_base_url ||
    env("HARVEY_BASE_URL") ||
    DEFAULT_BASE
  ).replace(/\/$/, "");

  if (row?.harvey_api_key_enc) {
    try {
      const apiKey = decryptSecret(row.harvey_api_key_enc);
      if (apiKey) return { apiKey, baseUrl, source: "firm" };
    } catch {
      // corrupted blob — fall through to env
    }
  }

  const envKey = envHarveyKey();
  if (envKey) return { apiKey: envKey, baseUrl, source: "env" };
  return null;
}

export async function saveHarveyApiKey(
  plainKey: string,
  baseUrl?: string,
): Promise<HarveyPublicStatus> {
  const cleaned = plainKey.trim();
  if (cleaned.length < 8) {
    throw new Error("La API key de Harvey parece demasiado corta");
  }
  // Never log cleaned
  const enc = encryptSecret(cleaned);
  const last4 = last4Of(cleaned);
  const base = (baseUrl?.trim() || DEFAULT_BASE).replace(/\/$/, "");
  await ensureSecretsRow();
  const sql = await getSql();
  await sql`
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

export async function deleteHarveyApiKey(): Promise<HarveyPublicStatus> {
  await ensureSecretsRow();
  const sql = await getSql();
  await sql`
    update firm_secrets set
      harvey_api_key_enc = null,
      harvey_api_key_last4 = null,
      harvey_updated_at = now(),
      updated_at = now()
    where id = 'default'
  `;
  return getHarveyPublicStatus();
}

export async function updateHarveyBaseUrl(
  baseUrl: string,
): Promise<HarveyPublicStatus> {
  const base = baseUrl.trim().replace(/\/$/, "") || DEFAULT_BASE;
  if (!/^https:\/\//i.test(base)) {
    throw new Error("La URL de Harvey debe usar HTTPS");
  }
  await ensureSecretsRow();
  const sql = await getSql();
  await sql`
    update firm_secrets set
      harvey_base_url = ${base},
      updated_at = now()
    where id = 'default'
  `;
  return getHarveyPublicStatus();
}

function envHarveyKey(): string | undefined {
  return env("HARVEY_API_KEY");
}

function env(k: string): string | undefined {
  if (typeof process === "undefined") return undefined;
  const v = process.env[k]?.trim();
  return v || undefined;
}
