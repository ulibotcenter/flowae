import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { FileUp, Sparkles, Upload } from "lucide-react";
import { toast } from "sonner";
import { useBillingStore } from "@/lib/billing/store";
import { parseConceptCsv } from "@/lib/billing/export";
import { formatCurrency } from "@/lib/billing/format";
import { invoiceTotal } from "@/lib/billing/templates";
import type { BillingConceptDraft, RemitenteTipo } from "@/lib/billing/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export const Route = createFileRoute("/nueva")({
  component: NuevaPage,
});

const emptyDraft = (lawyerId: string, iva: number): BillingConceptDraft => ({
  clientName: "",
  clientEmail: "",
  clientNif: "",
  expediente: "",
  concepto: "",
  baseAmount: 0,
  ivaRate: iva,
  suplidos: 0,
  lawyerId,
  remitente: "abogado",
  notes: "",
});

function NuevaPage() {
  const navigate = useNavigate();
  const lawyers = useBillingStore((s) => s.lawyers);
  const settings = useBillingStore((s) => s.settings);
  const createFromDraft = useBillingStore((s) => s.createFromDraft);

  const [draft, setDraft] = useState<BillingConceptDraft>(() =>
    emptyDraft(lawyers[0]?.id ?? "", settings.defaultIva),
  );
  const [paste, setPaste] = useState("");
  const [sourceHint, setSourceHint] = useState("");

  const total = useMemo(
    () =>
      invoiceTotal({
        baseAmount: draft.baseAmount || 0,
        ivaRate: draft.ivaRate || 0,
        suplidos: draft.suplidos || 0,
      }),
    [draft.baseAmount, draft.ivaRate, draft.suplidos],
  );

  function patch<K extends keyof BillingConceptDraft>(
    key: K,
    value: BillingConceptDraft[K],
  ) {
    setDraft((d) => ({ ...d, [key]: value }));
  }

  function applyParsed(rows: ReturnType<typeof parseConceptCsv>, fileName?: string) {
    const row = rows[0];
    if (!row) {
      toast.error("No se detectó ningún concepto en el archivo o texto");
      return;
    }
    setDraft((d) => ({
      ...d,
      clientName: String(row.clientName ?? d.clientName),
      clientEmail: String(row.clientEmail ?? d.clientEmail),
      clientNif: String(row.clientNif ?? d.clientNif),
      expediente: String(row.expediente ?? d.expediente),
      concepto: String(row.concepto ?? d.concepto),
      baseAmount:
        typeof row.baseAmount === "number" ? row.baseAmount : d.baseAmount,
      ivaRate:
        typeof row.ivaRate === "number" ? row.ivaRate : d.ivaRate || settings.defaultIva,
      suplidos: typeof row.suplidos === "number" ? row.suplidos : d.suplidos,
      notes: String(row.notes ?? d.notes),
      sourceFile: fileName || d.sourceFile || "importación SharePoint",
    }));
    setSourceHint(fileName || "Texto pegado / exportación SharePoint");
    toast.success(
      rows.length > 1
        ? `Se importó el primer concepto de ${rows.length} filas detectadas`
        : "Concepto importado correctamente",
    );
  }

  async function onFile(file: File | null) {
    if (!file) return;
    const text = await file.text();
    applyParsed(parseConceptCsv(text), file.name);
  }

  function onImportPaste() {
    applyParsed(parseConceptCsv(paste));
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!draft.clientName.trim() || !draft.expediente.trim() || !draft.concepto.trim()) {
      toast.error("Cliente, expediente y concepto son obligatorios");
      return;
    }
    if (!draft.baseAmount || draft.baseAmount <= 0) {
      toast.error("Indica una base imponible válida");
      return;
    }
    const inv = createFromDraft(draft);
    toast.success(`Borrador ${inv.ref} creado`);
    navigate({ to: "/facturas/$id", params: { id: inv.id } });
  }

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Nueva facturación</h1>
        <p className="mt-1 text-sm text-muted">
          Extrae el concepto desde Excel/Word de SharePoint o introdúcelo manualmente
        </p>
      </div>

      <div className="grid gap-4 lg:grid-cols-5">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileUp className="size-4" />
              Desde SharePoint
            </CardTitle>
            <CardDescription>
              Sube un CSV/Excel exportado o pega el contenido del Word/Excel del
              expediente
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <label className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-border-strong bg-bg px-4 py-8 text-center transition-colors hover:bg-surface-2">
              <Upload className="size-6 text-muted" />
              <span className="text-sm font-medium">Subir CSV / texto</span>
              <span className="text-xs text-muted">
                Columnas: Cliente; Expediente; Concepto; Base; Email…
              </span>
              <input
                type="file"
                accept=".csv,.txt,.tsv,text/csv,text/plain"
                className="sr-only"
                onChange={(e) => onFile(e.target.files?.[0] ?? null)}
              />
            </label>

            <div className="space-y-2">
              <Label>Pegar desde Word / Excel</Label>
              <Textarea
                placeholder={`Cliente: Acme S.L.\nExpediente: CIV-2026-0100\nConcepto: Honorarios fase demanda\nBase: 2500\nEmail: facturas@acme.es\nNIF: B12345678`}
                value={paste}
                onChange={(e) => setPaste(e.target.value)}
                className="min-h-[140px] font-mono text-xs"
              />
              <Button
                type="button"
                variant="secondary"
                className="w-full"
                onClick={onImportPaste}
                disabled={!paste.trim()}
              >
                <Sparkles className="size-4" />
                Extraer concepto
              </Button>
            </div>

            {sourceHint && (
              <p className="rounded-md bg-info-bg px-3 py-2 text-xs text-info">
                Origen: {sourceHint}
              </p>
            )}
          </CardContent>
        </Card>

        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>Datos del concepto</CardTitle>
            <CardDescription>
              Revisa y completa antes de generar el flujo de facturación
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form className="grid gap-4" onSubmit={onSubmit}>
              <div className="grid gap-3 sm:grid-cols-2">
                <Field label="Cliente / razón social">
                  <Input
                    value={draft.clientName}
                    onChange={(e) => patch("clientName", e.target.value)}
                    placeholder="Ej. Inmobiliaria Norte S.L."
                    required
                  />
                </Field>
                <Field label="NIF / CIF">
                  <Input
                    value={draft.clientNif}
                    onChange={(e) => patch("clientNif", e.target.value)}
                    placeholder="B12345678"
                  />
                </Field>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <Field label="Email del cliente">
                  <Input
                    type="email"
                    value={draft.clientEmail}
                    onChange={(e) => patch("clientEmail", e.target.value)}
                    placeholder="facturacion@cliente.es"
                  />
                </Field>
                <Field label="Expediente">
                  <Input
                    value={draft.expediente}
                    onChange={(e) => patch("expediente", e.target.value)}
                    placeholder="CIV-2026-0412"
                    required
                  />
                </Field>
              </div>

              <Field label="Concepto de facturación">
                <Textarea
                  value={draft.concepto}
                  onChange={(e) => patch("concepto", e.target.value)}
                  placeholder="Descripción de honorarios y fase del procedimiento"
                  required
                />
              </Field>

              <div className="grid gap-3 sm:grid-cols-3">
                <Field label="Base imponible (€)">
                  <Input
                    type="number"
                    min={0}
                    step="0.01"
                    value={draft.baseAmount || ""}
                    onChange={(e) =>
                      patch("baseAmount", Number(e.target.value) || 0)
                    }
                    required
                  />
                </Field>
                <Field label="IVA %">
                  <Input
                    type="number"
                    min={0}
                    step="1"
                    value={draft.ivaRate}
                    onChange={(e) => patch("ivaRate", Number(e.target.value) || 0)}
                  />
                </Field>
                <Field label="Suplidos (€)">
                  <Input
                    type="number"
                    min={0}
                    step="0.01"
                    value={draft.suplidos || ""}
                    onChange={(e) =>
                      patch("suplidos", Number(e.target.value) || 0)
                    }
                  />
                </Field>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <Field label="Letrado responsable">
                  <Select
                    value={draft.lawyerId}
                    onChange={(e) => patch("lawyerId", e.target.value)}
                  >
                    {lawyers.map((l) => (
                      <option key={l.id} value={l.id}>
                        {l.name}
                      </option>
                    ))}
                  </Select>
                </Field>
                <Field label="Quién remite al cliente">
                  <Select
                    value={draft.remitente}
                    onChange={(e) =>
                      patch("remitente", e.target.value as RemitenteTipo)
                    }
                  >
                    <option value="abogado">Abogado</option>
                    <option value="administracion">Administración</option>
                  </Select>
                </Field>
              </div>

              <Field label="Observaciones internas">
                <Textarea
                  value={draft.notes}
                  onChange={(e) => patch("notes", e.target.value)}
                  placeholder="Notas para Admin o para el email al cliente"
                />
              </Field>

              <div className="flex flex-col gap-3 rounded-xl border border-border bg-bg p-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-muted">
                    Total estimado
                  </p>
                  <p className="text-2xl font-semibold tabular">
                    {formatCurrency(total)}
                  </p>
                </div>
                <Button type="submit" size="lg">
                  Crear y abrir flujo
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <Label>{label}</Label>
      {children}
    </div>
  );
}
