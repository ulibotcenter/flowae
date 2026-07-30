import { parseConceptCsv } from "@/lib/billing/export";
import type { ExtractedConcept } from "./types";

const empty = (): ExtractedConcept => ({
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
  warnings: [],
});

/**
 * Extracción inteligente por regex + heurísticas para textos de despachos (ES).
 * También reutiliza el parser CSV/clave:valor existente.
 */
export function extractFromText(raw: string): ExtractedConcept {
  const text = normalizeText(raw);
  if (!text.trim()) {
    return { ...empty(), warnings: ["No hay texto para analizar"] };
  }

  // 1) CSV / filas estructuradas
  try {
    const rows = parseConceptCsv(text);
    const row = rows[0];
    if (row && hasUsefulFields(row)) {
      const result: ExtractedConcept = {
        clientName: String(row.clientName ?? ""),
        clientEmail: String(row.clientEmail ?? ""),
        clientNif: String(row.clientNif ?? ""),
        expediente: String(row.expediente ?? ""),
        concepto: String(row.concepto ?? ""),
        baseAmount:
          typeof row.baseAmount === "number" ? row.baseAmount : 0,
        ivaRate: typeof row.ivaRate === "number" ? row.ivaRate : undefined,
        suplidos: typeof row.suplidos === "number" ? row.suplidos : 0,
        notes: String(row.notes ?? ""),
        confidence: scoreResult({
          clientName: String(row.clientName ?? ""),
          clientEmail: String(row.clientEmail ?? ""),
          clientNif: String(row.clientNif ?? ""),
          expediente: String(row.expediente ?? ""),
          concepto: String(row.concepto ?? ""),
          baseAmount:
            typeof row.baseAmount === "number" ? row.baseAmount : 0,
          suplidos: typeof row.suplidos === "number" ? row.suplidos : 0,
          notes: "",
          confidence: 0,
          method: "csv",
          warnings: [],
        }),
        method: "csv",
        warnings: [],
        preview: text.slice(0, 400),
      };
      result.confidence = scoreResult(result);
      result.warnings = missingWarnings(result);
      if (result.confidence >= 0.45) return result;
    }
  } catch {
    /* fall through to free-form */
  }

  const result = empty();
  result.preview = text.slice(0, 400);
  result.method = "heuristic";

  result.clientEmail = firstMatch(text, [
    /(?:e-?mail|correo)(?:\s*(?:del\s*cliente|cliente))?[:\s]+([^\s;,]+@[^\s;,]+)/i,
    /\b([a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,})\b/i,
  ]);

  result.clientNif = normalizeNif(
    firstMatch(text, [
      /(?:NIF|CIF|N\.?I\.?F\.?|C\.?I\.?F\.?)[:\s]*([A-Z0-9]{8,10})/i,
      /\b([ABCDEFGHJNPQRSUVW]\d{7}[0-9A-J])\b/i,
      /\b(\d{8}[A-Z])\b/,
    ]),
  );

  result.expediente = firstMatch(text, [
    /(?:expediente|exp\.?|n[ºo°]\s*exp\.?|ref\.?\s*expediente|asunto\s*n[ºo°]?)[:\s#]*([A-ZÁÉÍÓÚ]{1,6}[-\/\s]?\d{2,4}[-\/\s]?\d{2,6})/i,
    /\b([A-Z]{2,5}[-/]\d{4}[-/]\d{2,6})\b/,
    /\b((?:CIV|MER|LAB|FAM|ADM|IP|PEN|CON)[-/]\d{4}[-/]\d{2,6})\b/i,
  ]);

  result.clientName = cleanClient(
    firstMatch(text, [
      /(?:cliente|raz[oó]n\s*social|sociedad|demandante|cliente\s*\/\s*raz[oó]n)[:\s]+([^\n\r;|]{3,80})/i,
      /(?:facturar\s+a|a\s+nombre\s+de)[:\s]+([^\n\r;|]{3,80})/i,
    ]),
  );

  // Si no hay etiqueta, buscar S.L. / S.A. cerca del inicio
  if (!result.clientName) {
    const corp = text.match(
      /([A-ZÁÉÍÓÚÑ][A-Za-zÁÉÍÓÚáéíóúñÑ0-9 .,&'-]{2,60}\s(?:S\.?L\.?U?\.?|S\.?A\.?|S\.?C\.?P\.?|S\.?Coop\.?))\b/,
    );
    if (corp?.[1]) result.clientName = cleanClient(corp[1]);
  }

  result.concepto = cleanConcept(
    firstMatch(text, [
      /(?:concepto|descripci[oó]n|honorarios|servicios|objeto)[:\s]+([^\n\r]{8,300})/i,
      /(?:por\s+los\s+siguientes\s+servicios)[:\s]+([^\n\r]{8,300})/i,
    ]),
  );

  // Importe base
  const baseStr = firstMatch(text, [
    /(?:base\s*imponible|honorarios|importe\s*(?:neto|base)?|cantidad)[:\s]*([0-9]{1,3}(?:[.\s][0-9]{3})*(?:[.,][0-9]{1,2})?)\s*€?/i,
    /(?:€|EUR)\s*([0-9]{1,3}(?:[.\s][0-9]{3})*(?:[.,][0-9]{1,2})?)/i,
  ]);
  result.baseAmount = parseNumberEs(baseStr);

  // Si no hay base etiquetada, coger el mayor importe razonable del texto
  if (!result.baseAmount) {
    const amounts = [...text.matchAll(/([0-9]{1,3}(?:[.\s][0-9]{3})+[.,][0-9]{2}|[0-9]+[.,][0-9]{2})\s*€?/g)]
      .map((m) => parseNumberEs(m[1] ?? ""))
      .filter((n) => n >= 50 && n <= 500_000);
    if (amounts.length) {
      result.baseAmount = Math.max(...amounts);
      result.warnings.push(
        "Importe inferido del mayor valor detectado; revisa la base imponible",
      );
    }
  }

  const suplStr = firstMatch(text, [
    /(?:suplidos?|gastos\s*(?:repercutidos|adelantados)?|provisi[oó]n\s*de\s*fondos)[:\s]*([0-9]{1,3}(?:[.\s][0-9]{3})*(?:[.,][0-9]{1,2})?)/i,
  ]);
  result.suplidos = parseNumberEs(suplStr);

  const ivaStr = firstMatch(text, [
    /(?:IVA|I\.V\.A\.)[:\s]*([0-9]{1,2})(?:\s*%|\s*por\s*ciento)?/i,
    /([0-9]{1,2})\s*%\s*(?:IVA|I\.V\.A\.)/i,
  ]);
  if (ivaStr) {
    const iva = parseNumberEs(ivaStr);
    if (iva > 0 && iva <= 30) result.ivaRate = iva;
  }

  // Concepto fallback: párrafo con “honorarios” o primera línea larga
  if (!result.concepto) {
    const honor = text.match(
      /([^\n\r]{0,40}honorarios[^\n\r]{5,200})/i,
    );
    if (honor?.[1]) result.concepto = cleanConcept(honor[1]);
  }
  if (!result.concepto) {
    const lines = text
      .split(/\n/)
      .map((l) => l.trim())
      .filter((l) => l.length > 25 && l.length < 220);
    if (lines[0]) result.concepto = cleanConcept(lines[0]);
  }

  result.confidence = scoreResult(result);
  result.warnings = [...result.warnings, ...missingWarnings(result)];
  return result;
}

function hasUsefulFields(row: Record<string, unknown>): boolean {
  return Boolean(
    row.clientName ||
      row.expediente ||
      row.concepto ||
      (typeof row.baseAmount === "number" && row.baseAmount > 0),
  );
}

function normalizeText(raw: string): string {
  return raw
    .replace(/\u0000/g, "")
    .replace(/\r\n/g, "\n")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function firstMatch(text: string, patterns: RegExp[]): string {
  for (const re of patterns) {
    const m = text.match(re);
    if (m?.[1]?.trim()) return m[1].trim();
  }
  return "";
}

function parseNumberEs(raw: string): number {
  if (!raw) return 0;
  let s = raw.replace(/\s/g, "").replace(/€/g, "").replace(/EUR/gi, "");
  // 1.234,56 → 1234.56 ; 1,234.56 → 1234.56
  if (/\d\.\d{3}/.test(s) && s.includes(",")) {
    s = s.replace(/\./g, "").replace(",", ".");
  } else if (/\d,\d{3}/.test(s) && s.includes(".")) {
    s = s.replace(/,/g, "");
  } else if (s.includes(",") && !s.includes(".")) {
    s = s.replace(",", ".");
  }
  const n = Number(s);
  return Number.isFinite(n) ? n : 0;
}

function normalizeNif(raw: string): string {
  return raw.replace(/\s/g, "").toUpperCase();
}

function cleanClient(raw: string): string {
  return raw
    .replace(/\s{2,}/g, " ")
    .replace(/[|;].*$/, "")
    .replace(/\s*[-–]\s*NIF.*$/i, "")
    .trim()
    .slice(0, 120);
}

function cleanConcept(raw: string): string {
  return raw
    .replace(/\s{2,}/g, " ")
    .replace(/^[:\-\s]+/, "")
    .trim()
    .slice(0, 500);
}

function scoreResult(r: ExtractedConcept): number {
  let score = 0;
  if (r.clientName.length > 2) score += 0.22;
  if (r.clientNif.length >= 8) score += 0.12;
  if (r.clientEmail.includes("@")) score += 0.1;
  if (r.expediente.length > 3) score += 0.2;
  if (r.concepto.length > 8) score += 0.2;
  if (r.baseAmount > 0) score += 0.16;
  return Math.min(1, Math.round(score * 100) / 100);
}

function missingWarnings(r: ExtractedConcept): string[] {
  const w: string[] = [];
  if (!r.clientName) w.push("No se detectó el nombre del cliente");
  if (!r.expediente) w.push("No se detectó el número de expediente");
  if (!r.concepto) w.push("No se detectó el concepto de honorarios");
  if (!r.baseAmount) w.push("No se detectó la base imponible");
  if (!r.clientNif) w.push("NIF/CIF no encontrado (opcional)");
  if (!r.clientEmail) w.push("Email del cliente no encontrado (opcional)");
  return w;
}
