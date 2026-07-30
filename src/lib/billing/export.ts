import type { Invoice, Lawyer } from "./types";
import { STATUS_LABELS } from "./types";
import { invoiceIva, invoiceTotal } from "./templates";
import { formatDateEs } from "./format";

/** Excel-friendly CSV with BOM + semicolon (locale es-ES). */
export function invoicesToCsv(invoices: Invoice[], lawyers: Lawyer[]): string {
  const lawyerMap = new Map(lawyers.map((l) => [l.id, l.name]));
  const headers = [
    "Ref",
    "Nº factura",
    "Cliente",
    "Email cliente",
    "NIF/CIF",
    "Expediente",
    "Concepto",
    "Base",
    "IVA %",
    "Cuota IVA",
    "Suplidos",
    "Total",
    "Pagado",
    "Pendiente",
    "Estado",
    "Letrado",
    "Remitente",
    "Creada",
    "Solicitada",
    "Emitida",
    "Enviada",
    "Vencimiento",
    "Pagada el",
    "Ruta SharePoint",
    "Notas",
  ];

  const rows = invoices.map((inv) => {
    const total = invoiceTotal(inv);
    const pending = Math.max(0, total - (inv.paidAmount || 0));
    return [
      inv.ref,
      inv.invoiceNumber,
      inv.clientName,
      inv.clientEmail,
      inv.clientNif,
      inv.expediente,
      inv.concepto,
      inv.baseAmount.toFixed(2),
      inv.ivaRate.toString(),
      invoiceIva(inv).toFixed(2),
      inv.suplidos.toFixed(2),
      total.toFixed(2),
      (inv.paidAmount || 0).toFixed(2),
      pending.toFixed(2),
      STATUS_LABELS[inv.status],
      lawyerMap.get(inv.lawyerId) ?? "",
      inv.remitente === "administracion" ? "Administración" : "Abogado",
      formatDateEs(inv.createdAt),
      formatDateEs(inv.requestedAt),
      formatDateEs(inv.issuedAt),
      formatDateEs(inv.sentAt),
      formatDateEs(inv.dueDate),
      formatDateEs(inv.paidAt),
      inv.sharePointPath,
      inv.notes,
    ];
  });

  const escape = (cell: string | number) => {
    const s = String(cell ?? "");
    if (/[;"\n\r]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
    return s;
  };

  const lines = [headers, ...rows].map((row) => row.map(escape).join(";"));
  return "\uFEFF" + lines.join("\r\n");
}

export function downloadCsv(filename: string, content: string) {
  const blob = new Blob([content], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export function parseConceptCsv(text: string): Partial<{
  clientName: string;
  clientEmail: string;
  clientNif: string;
  expediente: string;
  concepto: string;
  baseAmount: number;
  ivaRate: number;
  suplidos: number;
  notes: string;
}>[] {
  const cleaned = text.replace(/^\uFEFF/, "").trim();
  if (!cleaned) return [];

  const lines = cleaned.split(/\r?\n/).filter((l) => l.trim());
  if (lines.length === 0) return [];

  const sep = detectSeparator(lines[0]);
  const cells = (line: string) => splitCsvLine(line, sep);

  const headerCells = cells(lines[0]).map((h) => normalizeHeader(h));
  const hasHeader = headerCells.some((h) =>
    ["cliente", "client", "expediente", "concepto", "base", "importe", "email"].includes(h),
  );

  const mapHeader = (h: string): string | null => {
    if (["cliente", "client", "clientname", "razon social", "razonsocial"].includes(h))
      return "clientName";
    if (["email", "emailcliente", "correo", "mail"].includes(h)) return "clientEmail";
    if (["nif", "cif", "nifc", "nife", "vat"].includes(h)) return "clientNif";
    if (["expediente", "exp", "caso", "matter", "ref expediente"].includes(h))
      return "expediente";
    if (["concepto", "descripcion", "description", "servicios"].includes(h)) return "concepto";
    if (["base", "baseimponible", "importe", "honorarios", "amount", "neto"].includes(h))
      return "baseAmount";
    if (["iva", "ivarate", "%iva", "tipoiva"].includes(h)) return "ivaRate";
    if (["suplidos", "gastos", "disbursements"].includes(h)) return "suplidos";
    if (["notas", "observaciones", "notes"].includes(h)) return "notes";
    return null;
  };

  if (hasHeader) {
    const keys = headerCells.map(mapHeader);
    return lines.slice(1).map((line) => {
      const cols = cells(line);
      const row: Record<string, string | number> = {};
      keys.forEach((key, i) => {
        if (!key) return;
        const raw = cols[i] ?? "";
        if (["baseAmount", "ivaRate", "suplidos"].includes(key)) {
          row[key] = parseNumberEs(raw);
        } else {
          row[key] = raw.trim();
        }
      });
      return row;
    });
  }

  // Free-form: try key: value lines (Word paste) or single-row without header
  if (lines.length === 1 || lines.every((l) => l.includes(":"))) {
    const fromKv = parseKeyValueBlock(cleaned);
    if (Object.keys(fromKv).length) return [fromKv];
  }

  // Assume fixed order: cliente;expediente;concepto;base;email
  return lines.map((line) => {
    const cols = cells(line);
    return {
      clientName: cols[0] ?? "",
      expediente: cols[1] ?? "",
      concepto: cols[2] ?? "",
      baseAmount: parseNumberEs(cols[3] ?? "0"),
      clientEmail: cols[4] ?? "",
      clientNif: cols[5] ?? "",
      ivaRate: cols[6] ? parseNumberEs(cols[6]) : undefined,
      suplidos: cols[7] ? parseNumberEs(cols[7]) : undefined,
    };
  });
}

function detectSeparator(line: string): string {
  const semis = (line.match(/;/g) || []).length;
  const commas = (line.match(/,/g) || []).length;
  const tabs = (line.match(/\t/g) || []).length;
  if (tabs >= semis && tabs >= commas && tabs > 0) return "\t";
  if (semis >= commas) return ";";
  return ",";
}

function splitCsvLine(line: string, sep: string): string[] {
  const out: string[] = [];
  let cur = "";
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      if (inQuotes && line[i + 1] === '"') {
        cur += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (ch === sep && !inQuotes) {
      out.push(cur);
      cur = "";
    } else {
      cur += ch;
    }
  }
  out.push(cur);
  return out;
}

function normalizeHeader(h: string): string {
  return h
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9% ]/g, "")
    .replace(/\s+/g, "");
}

function parseNumberEs(raw: string): number {
  const s = raw.trim().replace(/\s/g, "").replace(/€/g, "");
  if (!s) return 0;
  // 1.234,56 → 1234.56 ; 1234.56 stays
  if (s.includes(",") && s.includes(".")) {
    return Number(s.replace(/\./g, "").replace(",", ".")) || 0;
  }
  if (s.includes(",")) return Number(s.replace(",", ".")) || 0;
  return Number(s) || 0;
}

function parseKeyValueBlock(text: string): Record<string, string | number> {
  const row: Record<string, string | number> = {};
  for (const line of text.split(/\r?\n/)) {
    const m = line.match(/^([^:]+):\s*(.+)$/);
    if (!m) continue;
    const key = normalizeHeader(m[1]);
    const val = m[2].trim();
    if (["cliente", "client", "clientname", "razonsocial"].includes(key)) row.clientName = val;
    else if (["email", "correo", "mail"].includes(key)) row.clientEmail = val;
    else if (["nif", "cif"].includes(key)) row.clientNif = val;
    else if (["expediente", "exp", "caso"].includes(key)) row.expediente = val;
    else if (["concepto", "descripcion"].includes(key)) row.concepto = val;
    else if (["base", "baseimponible", "importe", "honorarios"].includes(key))
      row.baseAmount = parseNumberEs(val);
    else if (["iva", "tipoiva"].includes(key)) row.ivaRate = parseNumberEs(val);
    else if (["suplidos", "gastos"].includes(key)) row.suplidos = parseNumberEs(val);
    else if (["notas", "observaciones"].includes(key)) row.notes = val;
  }
  return row;
}
