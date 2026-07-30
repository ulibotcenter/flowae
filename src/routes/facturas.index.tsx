import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import {
  Download,
  FilterX,
  Mail,
  RefreshCw,
  Search,
  Send,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { useBillingStore } from "@/lib/billing/store";
import { downloadCsv, invoicesToCsv } from "@/lib/billing/export";
import { invoiceTotal } from "@/lib/billing/templates";
import { formatCurrency, formatDateEs } from "@/lib/billing/format";
import {
  STATUS_LABELS,
  STATUS_ORDER,
  type Invoice,
  type InvoiceStatus,
} from "@/lib/billing/types";
import {
  inDateRange,
  isActionPending,
  type DateField,
} from "@/lib/billing/priority";
import { StatusBadge } from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/facturas/")({
  component: FacturasPage,
});

function FacturasPage() {
  const invoices = useBillingStore((s) => s.invoices);
  const lawyers = useBillingStore((s) => s.lawyers);
  const batchRequestAdmin = useBillingStore((s) => s.batchRequestAdmin);
  const batchMarkSentToClient = useBillingStore((s) => s.batchMarkSentToClient);
  const batchRefreshOverdue = useBillingStore((s) => s.batchRefreshOverdue);

  const [q, setQ] = useState("");
  const [status, setStatus] = useState<InvoiceStatus | "all">("all");
  const [lawyerId, setLawyerId] = useState<string>("all");
  const [dateField, setDateField] = useState<DateField>("createdAt");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [onlyOverdue, setOnlyOverdue] = useState(false);
  const [onlyAction, setOnlyAction] = useState(false);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [busy, setBusy] = useState(false);

  const filtered = useMemo(() => {
    const query = q.trim().toLowerCase();
    return invoices.filter((inv) => {
      if (status !== "all" && inv.status !== status) return false;
      if (lawyerId !== "all" && inv.lawyerId !== lawyerId) return false;
      if (onlyOverdue && inv.status !== "vencida") return false;
      if (onlyAction && !isActionPending(inv)) return false;
      const dateVal = dateField === "dueDate" ? inv.dueDate : inv.createdAt;
      if (!inDateRange(dateVal, dateFrom, dateTo)) return false;
      if (!query) return true;
      const hay = [
        inv.ref,
        inv.invoiceNumber,
        inv.clientName,
        inv.expediente,
        inv.concepto,
        inv.clientEmail,
      ]
        .join(" ")
        .toLowerCase();
      return hay.includes(query);
    });
  }, [
    invoices,
    q,
    status,
    lawyerId,
    onlyOverdue,
    onlyAction,
    dateField,
    dateFrom,
    dateTo,
  ]);

  useEffect(() => {
    const visible = new Set(filtered.map((i) => i.id));
    setSelected((prev) => {
      let changed = false;
      const next = new Set<string>();
      prev.forEach((id) => {
        if (visible.has(id)) next.add(id);
        else changed = true;
      });
      return changed ? next : prev;
    });
  }, [filtered]);

  const totals = useMemo(() => {
    let total = 0;
    let pending = 0;
    for (const inv of filtered) {
      const t = invoiceTotal(inv);
      total += t;
      if (inv.status !== "pagada" && inv.status !== "borrador") {
        pending += Math.max(0, t - (inv.paidAmount || 0));
      }
    }
    return { total, pending, count: filtered.length };
  }, [filtered]);

  const activeFilterCount = useMemo(() => {
    let n = 0;
    if (q.trim()) n++;
    if (status !== "all") n++;
    if (lawyerId !== "all") n++;
    if (dateFrom || dateTo) n++;
    if (onlyOverdue) n++;
    if (onlyAction) n++;
    return n;
  }, [q, status, lawyerId, dateFrom, dateTo, onlyOverdue, onlyAction]);

  const allVisibleSelected =
    filtered.length > 0 && filtered.every((i) => selected.has(i.id));
  const someSelected = selected.size > 0;

  function clearFilters() {
    setQ("");
    setStatus("all");
    setLawyerId("all");
    setDateField("createdAt");
    setDateFrom("");
    setDateTo("");
    setOnlyOverdue(false);
    setOnlyAction(false);
  }

  function toggleOne(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function toggleAllVisible() {
    if (allVisibleSelected) {
      setSelected(new Set());
      return;
    }
    setSelected(new Set(filtered.map((i) => i.id)));
  }

  function selectedInvoices(): Invoice[] {
    return invoices.filter((i) => selected.has(i.id));
  }

  function exportAllFiltered() {
    const csv = invoicesToCsv(filtered, lawyers);
    const stamp = new Date().toISOString().slice(0, 10);
    downloadCsv(`seguimiento-facturas-${stamp}.csv`, csv);
    toast.success(`Exportadas ${filtered.length} facturas a Excel (CSV)`);
  }

  function exportSelected() {
    const rows = selectedInvoices();
    if (rows.length === 0) {
      toast.error("Selecciona al menos una factura");
      return;
    }
    const csv = invoicesToCsv(rows, lawyers);
    const stamp = new Date().toISOString().slice(0, 10);
    downloadCsv(`facturas-seleccionadas-${stamp}.csv`, csv);
    toast.success(`Exportadas ${rows.length} seleccionadas`);
  }

  async function onBatchRequestAdmin() {
    setBusy(true);
    try {
      const n = await batchRequestAdmin([...selected]);
      if (n === 0) toast.message("Ninguna seleccionada está en borrador");
      else toast.success(`${n} factura(s) solicitadas a Administración`);
      setSelected(new Set());
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Error en lote");
    } finally {
      setBusy(false);
    }
  }

  async function onBatchSendClient() {
    setBusy(true);
    try {
      const n = await batchMarkSentToClient([...selected]);
      if (n === 0) toast.message("Ninguna seleccionada está en estado Emitida");
      else toast.success(`${n} factura(s) marcadas como enviadas al cliente`);
      setSelected(new Set());
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Error en lote");
    } finally {
      setBusy(false);
    }
  }

  async function onBatchOverdue() {
    setBusy(true);
    try {
      const n = await batchRefreshOverdue([...selected]);
      if (n === 0) {
        toast.message("No había facturas nuevas que marcar como vencidas");
      } else {
        toast.success(`${n} factura(s) actualizadas a vencida`);
      }
      setSelected(new Set());
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Error en lote");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0">
          <h1 className="text-2xl font-semibold tracking-tight">
            Seguimiento de facturas
          </h1>
          <p className="mt-1 text-sm text-muted">
            Datos del servidor · filtros y acciones en lote por rol
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button asChild variant="outline" className="shrink-0">
            <Link to="/hoy">Ver pendientes de hoy</Link>
          </Button>
          <Button
            type="button"
            variant="secondary"
            className="shrink-0"
            onClick={exportAllFiltered}
          >
            <Download className="size-4" />
            Exportar filtradas
          </Button>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <MiniStat label="Facturas filtradas" value={String(totals.count)} />
        <MiniStat label="Importe total" value={formatCurrency(totals.total)} />
        <MiniStat
          label="Pendiente de cobro"
          value={formatCurrency(totals.pending)}
        />
      </div>

      <Card className="min-w-0">
        <CardHeader className="pb-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <CardTitle className="text-base">Filtros avanzados</CardTitle>
              <CardDescription>
                Cliente, expediente, referencia, estado, letrado y fechas
              </CardDescription>
            </div>
            {activeFilterCount > 0 && (
              <Button type="button" variant="ghost" size="sm" onClick={clearFilters}>
                <FilterX className="size-3.5" />
                Limpiar ({activeFilterCount})
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="relative min-w-0">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-subtle" />
            <Input
              className="pl-9"
              placeholder="Buscar por cliente, expediente o referencia…"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              aria-label="Buscar facturas"
            />
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <div className="space-y-1.5">
              <Label>Estado</Label>
              <Select
                value={status}
                onChange={(e) =>
                  setStatus(e.target.value as InvoiceStatus | "all")
                }
              >
                <option value="all">Todos los estados</option>
                {STATUS_ORDER.map((s) => (
                  <option key={s} value={s}>
                    {STATUS_LABELS[s]}
                  </option>
                ))}
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Letrado responsable</Label>
              <Select
                value={lawyerId}
                onChange={(e) => setLawyerId(e.target.value)}
              >
                <option value="all">Todos los letrados</option>
                {lawyers.map((l) => (
                  <option key={l.id} value={l.id}>
                    {l.name}
                  </option>
                ))}
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Campo de fecha</Label>
              <Select
                value={dateField}
                onChange={(e) => setDateField(e.target.value as DateField)}
              >
                <option value="createdAt">Fecha de creación</option>
                <option value="dueDate">Fecha de vencimiento</option>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1.5">
                <Label>Desde</Label>
                <Input
                  type="date"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label>Hasta</Label>
                <Input
                  type="date"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                />
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-4 rounded-lg border border-border bg-bg px-3 py-3">
            <Checkbox
              id="only-overdue"
              checked={onlyOverdue}
              onChange={(e) => setOnlyOverdue(e.target.checked)}
              label="Solo vencidas"
            />
            <Checkbox
              id="only-action"
              checked={onlyAction}
              onChange={(e) => setOnlyAction(e.target.checked)}
              label="Solo pendientes de acción"
            />
          </div>
        </CardContent>
      </Card>

      {someSelected && (
        <div className="sticky top-14 z-20 flex flex-col gap-3 rounded-xl border border-border bg-surface p-3 shadow-md sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2 text-sm">
            <span className="inline-flex h-7 min-w-7 items-center justify-center rounded-full bg-primary px-2 text-xs font-semibold text-primary-fg tabular">
              {selected.size}
            </span>
            <span className="font-medium">
              seleccionada{selected.size === 1 ? "" : "s"}
            </span>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setSelected(new Set())}
            >
              <X className="size-3.5" />
              Deseleccionar
            </Button>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              size="sm"
              variant="secondary"
              disabled={busy}
              onClick={() => void onBatchRequestAdmin()}
            >
              <Mail className="size-3.5" />
              Solicitar a Admin
            </Button>
            <Button
              type="button"
              size="sm"
              variant="secondary"
              disabled={busy}
              onClick={() => void onBatchSendClient()}
            >
              <Send className="size-3.5" />
              Marcar enviada
            </Button>
            <Button
              type="button"
              size="sm"
              variant="secondary"
              disabled={busy}
              onClick={() => void onBatchOverdue()}
            >
              <RefreshCw className="size-3.5" />
              Actualizar vencidas
            </Button>
            <Button type="button" size="sm" onClick={exportSelected}>
              <Download className="size-3.5" />
              Exportar selección
            </Button>
          </div>
        </div>
      )}

      <Card className="min-w-0">
        <CardContent className="min-w-0 overflow-x-auto p-0">
          <table className="w-full min-w-[960px] text-left text-sm">
            <thead>
              <tr className="border-b border-border bg-bg text-xs uppercase tracking-wide text-muted">
                <th className="w-12 px-4 py-3">
                  <Checkbox
                    id="select-all"
                    checked={allVisibleSelected}
                    onChange={toggleAllVisible}
                    aria-label="Seleccionar todas las visibles"
                  />
                </th>
                <th className="px-4 py-3 font-medium">Ref / Nº</th>
                <th className="px-4 py-3 font-medium">Cliente</th>
                <th className="px-4 py-3 font-medium">Letrado</th>
                <th className="px-4 py-3 font-medium">Estado</th>
                <th className="px-4 py-3 font-medium">Total</th>
                <th className="px-4 py-3 font-medium">Pagado</th>
                <th className="px-4 py-3 font-medium">Vence</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-4 py-10 text-center text-muted">
                    No hay facturas con estos filtros
                  </td>
                </tr>
              )}
              {filtered.map((inv) => {
                const lawyer = lawyers.find((l) => l.id === inv.lawyerId);
                const total = invoiceTotal(inv);
                const isSel = selected.has(inv.id);
                return (
                  <tr
                    key={inv.id}
                    className={cn(
                      "border-b border-border/70 last:border-0 hover:bg-surface-2/60",
                      isSel && "bg-info-bg/40",
                    )}
                  >
                    <td className="px-4 py-3">
                      <Checkbox
                        id={`sel-${inv.id}`}
                        checked={isSel}
                        onChange={() => toggleOne(inv.id)}
                        aria-label={`Seleccionar ${inv.ref}`}
                      />
                    </td>
                    <td className="px-4 py-3">
                      <Link
                        to="/facturas/$id"
                        params={{ id: inv.id }}
                        className="font-medium text-accent hover:underline"
                      >
                        {inv.ref}
                      </Link>
                      <div className="text-xs text-muted">
                        {inv.invoiceNumber || "Sin nº SAGE"}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-medium">{inv.clientName}</div>
                      <div className="text-xs text-muted">{inv.expediente}</div>
                    </td>
                    <td className="px-4 py-3 text-muted">
                      {lawyer?.initials ?? "—"}
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={inv.status} />
                    </td>
                    <td className="px-4 py-3 tabular">
                      {formatCurrency(total)}
                    </td>
                    <td className="px-4 py-3 tabular text-muted">
                      {formatCurrency(inv.paidAmount || 0)}
                    </td>
                    <td className="px-4 py-3 text-muted">
                      {formatDateEs(inv.dueDate)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <Card className="min-w-0">
      <CardContent className="p-4">
        <p className="text-xs font-medium uppercase tracking-wide text-muted">
          {label}
        </p>
        <p className="mt-1 text-lg font-semibold tabular">{value}</p>
      </CardContent>
    </Card>
  );
}
