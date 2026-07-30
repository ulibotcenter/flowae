import { createServerFn } from "@tanstack/react-start";
import { authMiddleware } from "@/lib/auth/middleware";
import type {
  ExtractedConcept,
  ExtractProviderStatus,
  ExtractRequest,
} from "./types";
import { extractFromText } from "./heuristic";
import { fileBytesToText } from "./file-text";
import { enhanceWithAi, getFallbackAiConfig } from "./ai";
import {
  deleteHarveyApiKey,
  getHarveyCredentials,
  getHarveyPublicStatus,
  saveHarveyApiKey,
  updateHarveyBaseUrl,
} from "@/lib/secrets/harvey-store";
import { testHarveyConnection } from "./harvey";

async function requireAdmin(userId: string) {
  const repo = await import("@/lib/billing/server-repo");
  let email: string | null = null;
  let name: string | null = null;
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
  const actor = await repo.resolveActor(userId, email, name);
  if (actor.profile.role !== "admin") {
    throw new Error("Solo Administración puede gestionar la API de Harvey");
  }
  return actor;
}

export const getExtractStatusFn = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async (): Promise<ExtractProviderStatus> => {
    const harvey = await getHarveyPublicStatus();
    const fallback = getFallbackAiConfig();
    const activeProvider: ExtractProviderStatus["activeProvider"] =
      harvey.configured
        ? "harvey"
        : fallback.configured
          ? fallback.provider
          : "none";
    return {
      activeProvider,
      harveyConfigured: harvey.configured,
      harveyMasked: harvey.maskedKey,
      fallbackConfigured: fallback.configured,
      fallbackProvider: fallback.provider,
      model: activeProvider === "harvey" ? "Harvey Assistant" : fallback.model,
      formats: [".pdf", ".docx", ".txt", ".csv", "texto pegado"],
    };
  });

export const extractConceptFn = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((data: ExtractRequest) => data)
  .handler(async ({ data }): Promise<ExtractedConcept> => {
    let text = (data.text ?? "").trim();
    let format = "text";

    if (data.fileBase64) {
      const buf = Buffer.from(data.fileBase64, "base64");
      if (buf.length > 8 * 1024 * 1024) {
        throw new Error("El archivo supera 8 MB");
      }
      const out = fileBytesToText(
        buf,
        data.fileName ?? "",
        data.mimeType ?? "",
      );
      text = out.text;
      format = out.format;
    }

    if (!text.trim()) {
      throw new Error(
        "No se obtuvo texto del documento. Pega el contenido o sube un PDF/Word con texto.",
      );
    }

    let result = extractFromText(text);
    result.notes =
      result.notes ||
      (data.fileName
        ? `Extraído de ${data.fileName} (${format})`
        : "Extraído de texto pegado");

    // AI enhancement: Harvey (if firm key) → Grok/OpenAI → local only
    result = await enhanceWithAi(text, result);
    if (data.fileName && result.notes && !result.notes.includes(data.fileName)) {
      result.notes = `Extraído de ${data.fileName} · ${result.notes}`.slice(
        0,
        300,
      );
    }

    result.preview = text.slice(0, 500);
    return result;
  });

/** Public status for Config UI (no full key). */
export const getHarveyStatusFn = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    await requireAdmin(context.userId);
    return getHarveyPublicStatus();
  });

export const saveHarveyApiKeyFn = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((data: { apiKey: string; baseUrl?: string }) => data)
  .handler(async ({ context, data }) => {
    await requireAdmin(context.userId);
    // data.apiKey is only held in memory for encrypt; never logged
    return saveHarveyApiKey(data.apiKey, data.baseUrl);
  });

export const deleteHarveyApiKeyFn = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    await requireAdmin(context.userId);
    return deleteHarveyApiKey();
  });

export const updateHarveyBaseUrlFn = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((data: { baseUrl: string }) => data)
  .handler(async ({ context, data }) => {
    await requireAdmin(context.userId);
    return updateHarveyBaseUrl(data.baseUrl);
  });

export const testHarveyConnectionFn = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((data?: { apiKey?: string; baseUrl?: string }) => data ?? {})
  .handler(async ({ context, data }) => {
    await requireAdmin(context.userId);
    // Optional one-shot key from the form (before save) — not persisted unless user saves
    let apiKey = data.apiKey?.trim() || "";
    let baseUrl = data.baseUrl?.trim() || "";

    if (!apiKey) {
      const creds = await getHarveyCredentials();
      if (!creds) {
        return {
          ok: false as const,
          message: "No hay API key de Harvey configurada",
        };
      }
      apiKey = creds.apiKey;
      baseUrl = baseUrl || creds.baseUrl;
    }
    if (!baseUrl) {
      const st = await getHarveyPublicStatus();
      baseUrl = st.baseUrl;
    }

    return testHarveyConnection(apiKey, baseUrl);
  });
