import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { FileUp, Sparkles, Upload, Bot, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useBillingStore } from "@/lib/billing/store";
import { parseConceptCsv } from "@/lib/billing/export";
import { formatCurrency } from "@/lib/billing/format";
import { invoiceTotal } from "@/lib/billing/templates";
import type { BillingConceptDraft, RemitenteTipo } from "@/lib/billing/types";
import {
  extractConceptFn,
  getExtractStatusFn,
} from "@/lib/extract/server-fn";
import type { ExtractedConcept } from "@/lib/extract/types";
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
  const profile = useBillingStore((s) => s.profile);
  const createFromDraft = useBillingStore((s) => s.createFromDraft);

  const defaultLawyerId =
    profile?.role === "lawyer" && profile.lawyerId
      ? profile.lawyerId
      : (lawyers[0]?.id ?? "");

  const [draft, setDraft] = useState<BillingConceptDraft>(() =>
    emptyDraft(defaultLawyerId, settings.defaultIva),
  );
  const [paste, setPaste] = useState("");
  const [sourceHint, setSourceHint] = useState("");
  const [busy, setBusy] = useState(false);
  const [extracting, setExtracting] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [extractMeta, setExtractMeta] = useState<ExtractedConcept | null>(null);
  const [aiStatus, setAiStatus] = useState<{
    activeProvider: string;
    harveyConfigured: boolean;
    harveyMasked: string | null;
    fallbackConfigured: boolean;
    fallbackProvider: string;
    model: string;
  } | null>(null);

  useEffect(() => {
    void getExtractStatusFn()
      .then(setAiStatus)
      .catch(() => setAiStatus(null));
  }, []);

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

  function applyExtracted(
    data: Partial<BillingConceptDraft> & {
      confidence?: number;
      method?: string;
      warnings?: string[];
    },
    source: string,
  ) {
    setDraft((d) => ({
      ...d,
      clientName: data.clientName?.trim() || d.clientName,
      clientEmail: data.clientEmail?.trim() || d.clientEmail,
      clientNif: data.clientNif?.trim() || d.clientNif,
      expediente: data.expediente?.trim() || d.expediente,
      concepto: data.concepto?.trim() || d.concepto,
      baseAmount:
        typeof data.baseAmount === "number" && data.baseAmount > 0
          ? data.baseAmount
          : d.baseAmount,
      ivaRate:
        typeof data.ivaRate === "number" && data.ivaRate > 0
          ? data.ivaRate
          : d.ivaRate || settings.defaultIva,
      suplidos:
        typeof data.suplidos === "number" ? data.suplidos : d.suplidos,
      notes: data.notes?.trim() || d.notes,
      sourceFile: source || d.sourceFile,
    }));
    setSourceHint(source);
  }

  function applyParsed(
    rows: ReturnType<typeof parseConceptCsv>,
    fileName?: string,
  ) {
    const row = rows[0];
    if (!row) {
      toast.error("No se detectó ningún concepto en el archivo o texto");
      return;
    }
    applyExtracted(row, fileName || "Texto pegado / exportación SharePoint");
    toast.success(
      rows.length > 1
        ? `Se importó el primer concepto de ${rows.length} filas detectadas`
        : "Concepto importado correctamente",
    );
  }

  async function fileToBase64(f: File): Promise<string> {
    const buf = await f.arrayBuffer();
    const bytes = new Uint8Array(buf);
    let binary = "";
    const chunk = 0x8000;
    for (let i = 0; i < bytes.length; i += chunk) {
      binary += String.fromCharCode(...bytes.subarray(i, i + chunk));
    }
    return btoa(binary);
  }

  async function onExtractAi() {
    if (!file && !paste.trim()) {
      toast.error("Sube un PDF/Word o pega el texto del expediente");
      return;
    }
    setExtracting(true);
    setExtractMeta(null);
    try {
      const payload: {
        text?: string;
        fileBase64?: string;
        fileName?: string;
        mimeType?: string;
      } = {};
      if (file) {
        payload.fileBase64 = await fileToBase64(file);
        payload.fileName = file.name;
        payload.mimeType = file.type;
      }
      if (paste.trim()) {
        payload.text = paste.trim();
      }
      // If both, server prefers file text then can use paste? Our server uses file OR we merge:
      // Send paste as text and file separately - server uses file if present, else text.
      // If user has both, prefer combining: if file, also append paste in text for extra context
      if (file && paste.trim()) {
        // file wins for body; paste passed as notes context by appending after extract on client
      }

      const result = await extractConceptFn({ data: payload });
      setExtractMeta(result);
      applyExtracted(result, file?.name || "Texto pegado (extracción IA/heurística)");

      const confPct = Math.round((result.confidence || 0) * 100);
      if (result.warnings.length) {
        toast.message(`Extracción ${result.method} · confianza ~${confPct}%`, {
          description: result.warnings.slice(0, 3).join(" · "),
        });
      } else {
        toast.success(
          `Datos extraídos (${result.method}, confianza ~${confPct}%). Revisa y confirma.`,
        );
      }
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "No se pudo extraer el documento",
      );
    } finally {
      setExtracting(false);
    }
  }

  async function onFile(selected: File | null) {
    if (!selected) return;
    setFile(selected);
    const name = selected.name.toLowerCase();
    // CSV/TXT still allow instant local parse
    if (
      name.endsWith(".csv") ||
      name.endsWith(".txt") ||
      name.endsWith(".tsv") ||
      selected.type.startsWith("text/")
    ) {
      try {
        const text = await selected.text();
        setPaste(text.slice(0, 20_000));
        applyParsed(parseConceptCsv(text), selected.name);
      } catch {
        toast.message("Archivo cargado", {
          description: "Pulsa «Extraer datos con IA» para analizarlo",
        });
      }
    } else {
      toast.message(`Archivo listo: ${selected.name}`, {
        description: "Pulsa «Extraer datos con IA» para rellenar el formulario",
      });
    }
  }

  function onImportPaste() {
    applyParsed(parseConceptCsv(paste));
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (
      !draft.clientName.trim() ||
      !draft.expediente.trim() ||
      !draft.concepto.trim()
    ) {
      toast.error("Cliente, expediente y concepto son obligatorios");
      return;
    }
    if (!draft.baseAmount || draft.baseAmount <= 0) {
      toast.error("Indica una base imponible válida");
      return;
    }
    setBusy(true);
    try {
      const inv = await createFromDraft({
        ...draft,
        lawyerId:
          profile?.role === "lawyer" && profile.lawyerId
            ? profile.lawyerId
            : draft.lawyerId,
      });
      toast.success(`Borrador ${inv.ref} creado`);
      void navigate({ to: "/facturas/$id", params: { id: inv.id } });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Error al crear");
    } finally {
      setBusy(false);
    }
  }

  const lawyerOptions =
    profile?.role === "lawyer" && profile.lawyerId
      ? lawyers.filter((l) => l.id === profile.lawyerId)
      : lawyers;

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">
          Nueva facturación
        </h1>
        <p className="mt-1 text-sm text-muted">
          Extrae el concepto con IA desde PDF/Word o introdúcelo manualmente
        </p>
      </div>

      <div className="grid gap-4 lg:grid-cols-5">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileUp className="size-4" />
              Documento del expediente
            </CardTitle>
            <CardDescription>
              PDF, Word (.docx), CSV/texto o pega el contenido. Luego extrae los
              datos al formulario.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            {aiStatus && (
              <div
                className={
                  aiStatus.activeProvider === "harvey"
                    ? "rounded-lg border border-border bg-success-bg px-3 py-2 text-xs text-success"
                    : aiStatus.activeProvider !== "none"
                      ? "rounded-lg border border-border bg-success-bg px-3 py-2 text-xs text-success"
                      : "rounded-lg border border-border bg-info-bg px-3 py-2 text-xs text-info"
                }
              >
                <Bot className="mr-1 inline size-3.5" />
                {aiStatus.activeProvider === "harvey" ? (
                  <>
                    Extracción con <strong>Harvey</strong>
                    {aiStatus.harveyMasked
                      ? ` (${aiStatus.harveyMasked})`
                      : ""}
                    . Si falla, se usa extracción local.
                  </>
                ) : aiStatus.activeProvider !== "none" ? (
                  <>
                    IA activa ({aiStatus.fallbackProvider}
                    {aiStatus.model ? ` · ${aiStatus.model}` : ""}). Configura
                    Harvey en Configuración para el despacho.
                  </>
                ) : (
                  <>
                    Extracción local (heurísticas). Configura Harvey en{" "}
                    <strong>Configuración</strong> o variables de entorno de
                    respaldo.
                  </>
                )}
              </div>
            )}

            <label className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-border-strong bg-bg px-4 py-8 text-center transition-colors hover:bg-surface-2">
              <Upload className="size-6 text-muted" />
              <span className="text-sm font-medium">
                {file ? file.name : "Subir PDF, Word o CSV"}
              </span>
              <span className="text-xs text-muted">
                .pdf · .docx · .csv · .txt (máx. 8 MB)
              </span>
              <input
                type="file"
                accept=".pdf,.docx,.doc,.csv,.txt,.tsv,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/csv,text/plain"
                className="sr-only"
                onChange={(e) => void onFile(e.target.files?.[0] ?? null)}
              />
            </label>

            <div className="space-y-2">
              <Label>Pegar texto del Word / expediente</Label>
              <Textarea
                placeholder={`Cliente: Acme Legal S.L.\nNIF: B12345678\nExpediente: CIV-2026-0100\nConcepto: Honorarios fase demanda\nBase imponible: 2.500,00 €\nSuplidos: 120\nEmail: facturas@acme.es`}
                value={paste}
                onChange={(e) => setPaste(e.target.value)}
                className="min-h-[140px] font-mono text-xs"
              />
            </div>

            <Button
              type="button"
              className="w-full"
              disabled={extracting || (!file && !paste.trim())}
              onClick={() => void onExtractAi()}
            >
              {extracting ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Sparkles className="size-4" />
              )}
              {extracting ? "Extrayendo…" : "Extraer datos con IA"}
            </Button>

            <Button
              type="button"
              variant="secondary"
              className="w-full"
              onClick={onImportPaste}
              disabled={!paste.trim() || extracting}
            >
              Importar solo como CSV / clave:valor
            </Button>

            {sourceHint && (
              <p className="rounded-md bg-info-bg px-3 py-2 text-xs text-info">
                Origen: {sourceHint}
              </p>
            )}

            {extractMeta && (
              <div className="rounded-md border border-border bg-bg px-3 py-2 text-xs text-muted">
                <p>
                  Método: <strong className="text-fg">{extractMeta.method}</strong>
                  {" · "}
                  Confianza:{" "}
                  <strong className="text-fg">
                    {Math.round(extractMeta.confidence * 100)}%
                  </strong>
                </p>
                {extractMeta.warnings.length > 0 && (
                  <ul className="mt-1 list-inside list-disc">
                    {extractMeta.warnings.map((w) => (
                      <li key={w}>{w}</li>
                    ))}
                  </ul>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>Datos del concepto</CardTitle>
            <CardDescription>
              Revisa y corrige lo extraído antes de generar el flujo de
              facturación
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form className="grid gap-4" onSubmit={(e) => void onSubmit(e)}>
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
                    onChange={(e) =>
                      patch("ivaRate", Number(e.target.value) || 0)
                    }
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
                    disabled={profile?.role === "lawyer"}
                  >
                    {lawyerOptions.map((l) => (
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
                <Button type="submit" size="lg" disabled={busy || extracting}>
                  {busy ? "Creando…" : "Crear y abrir flujo"}
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
