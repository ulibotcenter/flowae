import { execFileSync } from "node:child_process";
import { mkdtempSync, writeFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

/**
 * Convert uploaded file bytes to plain text (server-side).
 * Supports: plain text, CSV, DOCX (via unzip), PDF (basic stream parse).
 */
export function fileBytesToText(
  bytes: Buffer,
  fileName = "",
  mimeType = "",
): { text: string; format: string } {
  const name = fileName.toLowerCase();
  const mime = mimeType.toLowerCase();

  if (
    name.endsWith(".docx") ||
    mime.includes("wordprocessingml") ||
    mime.includes("officedocument.wordprocessingml")
  ) {
    return { text: extractDocx(bytes), format: "docx" };
  }

  if (name.endsWith(".pdf") || mime === "application/pdf") {
    return { text: extractPdfBasic(bytes), format: "pdf" };
  }

  // doc (legacy binary) — limited
  if (name.endsWith(".doc") && !name.endsWith(".docx")) {
    const asLatin = bytes.toString("latin1");
    const cleaned = asLatin
      .replace(/[^\x09\x0A\x0D\x20-\x7E\xA0-\xFF]/g, " ")
      .replace(/\s{2,}/g, " ");
    return {
      text: cleaned.slice(0, 50_000),
      format: "doc",
    };
  }

  // Default: utf-8 / latin1 text
  let text = bytes.toString("utf8");
  if (text.includes("\uFFFD") || hasManyNulls(bytes)) {
    text = bytes.toString("latin1");
  }
  return { text: text.slice(0, 200_000), format: "text" };
}

function hasManyNulls(buf: Buffer): boolean {
  let n = 0;
  const step = Math.max(1, Math.floor(buf.length / 500));
  for (let i = 0; i < buf.length; i += step) {
    if (buf[i] === 0) n++;
  }
  return n > 20;
}

function extractDocx(bytes: Buffer): string {
  const dir = mkdtempSync(join(tmpdir(), "flowae-docx-"));
  const path = join(dir, "doc.docx");
  try {
    writeFileSync(path, bytes);
    const xml = execFileSync(
      "unzip",
      ["-p", path, "word/document.xml"],
      { encoding: "utf8", maxBuffer: 10 * 1024 * 1024 },
    );
    return stripOfficeXml(xml);
  } catch (err) {
    throw new Error(
      `No se pudo leer el Word (.docx): ${err instanceof Error ? err.message : String(err)}`,
    );
  } finally {
    try {
      rmSync(dir, { recursive: true, force: true });
    } catch {
      /* ignore */
    }
  }
}

function stripOfficeXml(xml: string): string {
  return xml
    .replace(/<w:tab[^/]*\/>/g, "\t")
    .replace(/<\/w:p>/g, "\n")
    .replace(/<w:br[^/]*\/>/g, "\n")
    .replace(/<[^>]+>/g, "")
    .replace(/&/g, "&")
    .replace(/</g, "<")
    .replace(/>/g, ">")
    .replace(/"/g, '"')
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(Number(n)))
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

/**
 * Very lightweight PDF text extraction for text-based PDFs (no images/OCR).
 * Parses string literals and common Tj/TJ operators.
 */
function extractPdfBasic(bytes: Buffer): string {
  const raw = bytes.toString("latin1");
  const chunks: string[] = [];

  // Literal strings (...)
  const lit = /(?<!\\)\((?:\\.|[^\\)])*\)/g;
  let m: RegExpExecArray | null;
  while ((m = lit.exec(raw))) {
    const inner = m[0].slice(1, -1);
    const decoded = decodePdfString(inner);
    if (decoded.trim().length >= 1) chunks.push(decoded);
  }

  // Hex strings <...>
  const hex = /<([0-9A-Fa-f\s]+)>/g;
  while ((m = hex.exec(raw))) {
    const h = m[1]!.replace(/\s/g, "");
    if (h.length < 4 || h.length % 2 !== 0) continue;
    try {
      let s = "";
      for (let i = 0; i < h.length; i += 2) {
        s += String.fromCharCode(parseInt(h.slice(i, i + 2), 16));
      }
      if (/[\x20-\x7EÁÉÍÓÚáéíóúñÑ]/.test(s)) chunks.push(s);
    } catch {
      /* ignore */
    }
  }

  let text = chunks.join(" ");
  text = text
    .replace(/\s{2,}/g, " ")
    .replace(/\s+([,.;:])/g, "$1")
    .trim();

  if (text.length < 20) {
    throw new Error(
      "PDF sin texto extraíble (puede ser escaneado/imagen). Pega el texto o usa un PDF con texto seleccionable.",
    );
  }
  return text.slice(0, 100_000);
}

function decodePdfString(s: string): string {
  return s
    .replace(/\\n/g, "\n")
    .replace(/\\r/g, "\r")
    .replace(/\\t/g, "\t")
    .replace(/\\\(/g, "(")
    .replace(/\\\)/g, ")")
    .replace(/\\\\/g, "\\")
    .replace(/\\(\d{1,3})/g, (_, oct) =>
      String.fromCharCode(parseInt(oct, 8)),
    );
}
