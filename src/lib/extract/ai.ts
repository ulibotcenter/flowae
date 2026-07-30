import type { ExtractedConcept } from "./types";
import { enhanceWithHarvey } from "./harvey";
import { getHarveyCredentials } from "@/lib/secrets/harvey-store";

/**
 * Optional LLM enhancement chain:
 * 1) Harvey (firm key encrypted in DB, or HARVEY_API_KEY env)
 * 2) Grok / OpenAI env keys
 * 3) Heuristic only
 *
 * Env (fallback, not firm UI):
 *   XAI_API_KEY / GROK_API_KEY, OPENAI_API_KEY, AI_MODEL, OPENAI_BASE_URL
 */
export function getFallbackAiConfig(): {
  configured: boolean;
  provider: "xai" | "openai" | "none";
  model: string;
} {
  const xai = env("XAI_API_KEY") || env("GROK_API_KEY");
  const openai = env("OPENAI_API_KEY");
  if (xai) {
    return {
      configured: true,
      provider: "xai",
      model: env("AI_MODEL") || "grok-3-mini",
    };
  }
  if (openai) {
    return {
      configured: true,
      provider: "openai",
      model: env("AI_MODEL") || "gpt-4o-mini",
    };
  }
  return { configured: false, provider: "none", model: "" };
}

/** @deprecated use getFallbackAiConfig + Harvey status */
export function getAiConfig() {
  return getFallbackAiConfig();
}

function env(k: string): string | undefined {
  if (typeof process === "undefined") return undefined;
  const v = process.env[k]?.trim();
  return v || undefined;
}

/**
 * Enhance heuristic extraction with the best available AI provider.
 */
export async function enhanceWithAi(
  documentText: string,
  heuristic: ExtractedConcept,
): Promise<ExtractedConcept> {
  // 1) Harvey first (despacho-configured)
  try {
    const harvey = await getHarveyCredentials();
    if (harvey?.apiKey) {
      return enhanceWithHarvey(
        documentText,
        heuristic,
        harvey.apiKey,
        harvey.baseUrl,
      );
    }
  } catch {
    // Do not fail the whole extract if secrets table is mid-migration
  }

  // 2) Grok / OpenAI
  const cfg = getFallbackAiConfig();
  if (!cfg.configured) return heuristic;

  const apiKey =
    env("XAI_API_KEY") || env("GROK_API_KEY") || env("OPENAI_API_KEY");
  if (!apiKey) return heuristic;

  const baseUrl =
    env("OPENAI_BASE_URL") ||
    env("AI_BASE_URL") ||
    (cfg.provider === "xai"
      ? "https://api.x.ai/v1"
      : "https://api.openai.com/v1");

  const system = `Eres un asistente de un despacho de abogados español.
Extraes datos de facturación de notas de expediente, minutas o escritos.
Responde SOLO con JSON válido (sin markdown) con estas claves:
clientName, clientEmail, clientNif, expediente, concepto, baseAmount (number), ivaRate (number|null), suplidos (number), notes (string).
Usa null o "" si no aparece. Importes en euros (número, no string). Concepto en español, conciso.`;

  const user = `Texto del documento (puede estar incompleto):\n---\n${documentText.slice(0, 12_000)}\n---\nHeurística previa (puedes corregirla):\n${JSON.stringify(
    {
      clientName: heuristic.clientName,
      clientEmail: heuristic.clientEmail,
      clientNif: heuristic.clientNif,
      expediente: heuristic.expediente,
      concepto: heuristic.concepto,
      baseAmount: heuristic.baseAmount,
      ivaRate: heuristic.ivaRate ?? null,
      suplidos: heuristic.suplidos,
    },
    null,
    0,
  )}`;

  try {
    const res = await fetch(`${baseUrl.replace(/\/$/, "")}/chat/completions`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: cfg.model,
        temperature: 0.1,
        messages: [
          { role: "system", content: system },
          { role: "user", content: user },
        ],
      }),
    });

    if (!res.ok) {
      const body = await res.text().catch(() => "");
      return {
        ...heuristic,
        method: "mixed",
        warnings: [
          ...heuristic.warnings,
          `IA no disponible (${res.status}): se usó extracción local. ${body.slice(0, 120)}`,
        ],
      };
    }

    const data = (await res.json()) as {
      choices?: Array<{ message?: { content?: string } }>;
    };
    const content = data.choices?.[0]?.message?.content ?? "";
    const parsed = parseJsonObject(content);
    if (!parsed) {
      return {
        ...heuristic,
        method: "mixed",
        warnings: [
          ...heuristic.warnings,
          "La IA no devolvió JSON válido; se mantuvo la extracción local",
        ],
      };
    }

    const merged: ExtractedConcept = {
      clientName: str(parsed.clientName) || heuristic.clientName,
      clientEmail: str(parsed.clientEmail) || heuristic.clientEmail,
      clientNif: str(parsed.clientNif) || heuristic.clientNif,
      expediente: str(parsed.expediente) || heuristic.expediente,
      concepto: str(parsed.concepto) || heuristic.concepto,
      baseAmount: num(parsed.baseAmount) || heuristic.baseAmount,
      ivaRate: num(parsed.ivaRate) || heuristic.ivaRate,
      suplidos: num(parsed.suplidos) || heuristic.suplidos || 0,
      notes: str(parsed.notes) || heuristic.notes,
      confidence: Math.min(1, Math.max(heuristic.confidence, 0.75)),
      method: "ai",
      warnings: [],
      preview: heuristic.preview,
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
      warnings: [
        ...heuristic.warnings,
        `Error al llamar a la IA: ${err instanceof Error ? err.message : String(err)}. Extracción local aplicada.`,
      ],
    };
  }
}

function str(v: unknown): string {
  if (v == null) return "";
  return String(v).trim();
}

function num(v: unknown): number {
  if (v == null || v === "") return 0;
  if (typeof v === "number") return Number.isFinite(v) ? v : 0;
  const n = Number(String(v).replace(",", "."));
  return Number.isFinite(n) ? n : 0;
}

function parseJsonObject(content: string): Record<string, unknown> | null {
  const trimmed = content.trim();
  const fence = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/i);
  const jsonText = fence?.[1]?.trim() || trimmed;
  try {
    const v = JSON.parse(jsonText);
    if (v && typeof v === "object") return v as Record<string, unknown>;
  } catch {
    const start = jsonText.indexOf("{");
    const end = jsonText.lastIndexOf("}");
    if (start >= 0 && end > start) {
      try {
        return JSON.parse(jsonText.slice(start, end + 1)) as Record<
          string,
          unknown
        >;
      } catch {
        return null;
      }
    }
  }
  return null;
}
