/**
 * Harvey AI completion client (EU by default).
 * Auth: Bearer token. Endpoint: POST /api/v2/completion (multipart).
 * Never log the API key.
 */
import type { ExtractedConcept } from "./types";

export type HarveyTestResult = {
  ok: boolean;
  message: string;
  status?: number;
};

/**
 * Minimal connectivity check — does not include user documents.
 */
export async function testHarveyConnection(
  apiKey: string,
  baseUrl: string,
): Promise<HarveyTestResult> {
  try {
    const res = await harveyCompletion(
      apiKey,
      baseUrl,
      "Responde únicamente con la palabra OK, sin más texto.",
    );
    if (!res.ok) {
      return {
        ok: false,
        status: res.status,
        message: mapHarveyError(res.status, res.errorBody),
      };
    }
    return {
      ok: true,
      message: "Conexión con Harvey correcta (endpoint UE o configurado).",
    };
  } catch (err) {
    return {
      ok: false,
      message: `No se pudo contactar con Harvey: ${err instanceof Error ? err.message : String(err)}`,
    };
  }
}

export async function enhanceWithHarvey(
  documentText: string,
  heuristic: ExtractedConcept,
  apiKey: string,
  baseUrl: string,
): Promise<ExtractedConcept> {
  const prompt = buildExtractPrompt(documentText, heuristic);
  try {
    const res = await harveyCompletion(apiKey, baseUrl, prompt);
    if (!res.ok) {
      return {
        ...heuristic,
        method: "mixed",
        warnings: [
          ...heuristic.warnings,
          `Harvey no disponible (${res.status}): se usó extracción local. ${mapHarveyError(res.status, res.errorBody)}`,
        ],
      };
    }
    const parsed = parseJsonObject(res.text);
    if (!parsed) {
      return {
        ...heuristic,
        method: "mixed",
        warnings: [
          ...heuristic.warnings,
          "Harvey no devolvió JSON válido; se mantuvo la extracción local",
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
      confidence: Math.min(1, Math.max(heuristic.confidence, 0.82)),
      method: "harvey",
      warnings: [],
      preview: heuristic.preview,
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
      warnings: [
        ...heuristic.warnings,
        `Error Harvey: ${err instanceof Error ? err.message : String(err)}. Extracción local aplicada.`,
      ],
    };
  }
}

function buildExtractPrompt(
  documentText: string,
  heuristic: ExtractedConcept,
): string {
  return `Eres un asistente de un despacho de abogados español.
Extrae datos de facturación del siguiente texto de expediente/minuta.
Responde SOLO con JSON válido (sin markdown ni texto adicional) con estas claves exactas:
clientName, clientEmail, clientNif, expediente, concepto, baseAmount (number), ivaRate (number|null), suplidos (number), notes (string).
Usa "" o null si un dato no aparece. Importes en euros como número. Concepto en español, conciso.

Heurística previa (puedes corregirla):
${JSON.stringify(
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
)}

Texto del documento:
---
${documentText.slice(0, 12_000)}
---`;
}

async function harveyCompletion(
  apiKey: string,
  baseUrl: string,
  prompt: string,
): Promise<{ ok: true; text: string } | { ok: false; status: number; errorBody: string }> {
  const url = `${baseUrl.replace(/\/$/, "")}/api/v2/completion`;
  const form = new FormData();
  form.append("prompt", prompt.slice(0, 20_000));
  form.append("stream", "false");
  form.append("mode", "draft");

  const res = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      // Do not set Content-Type; FormData sets multipart boundary
    },
    body: form,
  });

  if (!res.ok) {
    const errorBody = await res.text().catch(() => "");
    // Strip anything that might echo the key (unlikely)
    return {
      ok: false,
      status: res.status,
      errorBody: sanitizeErrorBody(errorBody).slice(0, 240),
    };
  }

  const data = (await res.json()) as {
    response?: string;
    text?: string;
    completion?: string;
  };
  const text =
    data.response ?? data.text ?? data.completion ?? JSON.stringify(data);
  return { ok: true, text: String(text) };
}

function mapHarveyError(status: number, body: string): string {
  if (status === 401 || status === 403) {
    return "API key inválida o sin permisos. Revisa la clave en Configuración.";
  }
  if (status === 429) return "Límite de uso de Harvey superado. Inténtalo más tarde.";
  if (status === 404) {
    return "Endpoint no encontrado. Comprueba la URL base (UE: https://eu.api.harvey.ai).";
  }
  return body || `HTTP ${status}`;
}

function sanitizeErrorBody(body: string): string {
  // Avoid leaking tokens if the API echoes them
  return body.replace(/Bearer\s+[A-Za-z0-9._\-]+/gi, "Bearer [redacted]");
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
