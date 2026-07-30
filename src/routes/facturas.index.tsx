import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Download, Search } from "lucide-react";
import { toast } from "sonner";
import { useBillingStore } from "@/lib/billing/store";
import { downloadCsv, invoicesToCsv } from "@/lib/billing/export";
import { invoiceTotal } from "@/lib/billing/templates";
import { formatCurrency, formatDateEs } from "@/lib/billing/format";
import {
  STATUS_LABELS,
  STATUS_ORDER,
  type InvoiceStatus,
} from "@/lib/billing/types";
import { StatusBadge } from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export const Route = createFileRoute("/facturas/")({
  component: FacturasPage,
});

function FacturasPage() {
  const invoices = useBillingStore((s) => s.invoices);
  const lawyers = useBillingStore((s) => s.lawyers);
  const [q, setQ] = useState("");
  const [status, setStatus] = useState<InvoiceStatus | "all">("all");
  const [lawyerId, setLawyerId] = useState<string>("all");

  const filtered = useMemo(() => {
    const query = q.trim().toLowerCase();
    return invoices.filter((inv) => {
      if (status !== "all" && inv.status !== status) return false;
      if (lawyerId !== "all" && inv.lawyerId !== lawyerId) return false;
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
  }, [invoices, q, status, lawyerId]);

  const totals = useMemo(() => {
    let total = 0;
    let paid = 0;
    let pending = 0;
    for (const inv of filtered) {
      const t = invoiceTotal(inv);
      total += t;
      paid += inv.paidAmount || 0;
      if (inv.status !== "pagada" && inv.status !== "borrador") {
        pending += Math.max(0, t - (inv.paidAmount || 0));
      }
    }
    return { total, paid, pending, count: filtered.length };
  }, [filtered]);

  function exportExcel() {
    const csv = invoicesToCsv(filtered, lawyers);
    const stamp = new Date().toISOString().slice(0, 10);
    downloadCsv(`seguimiento-facturas-${stamp}.csv`, csv);
    toast.success("Exportado para Excel (CSV ;)");
  }

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0">
          <h1 className="text-2xl font-semibold tracking-tight">
            Seguimiento de facturas
          </h1>
          <p className="mt-1 text-sm text-muted">
            Emitidas, enviadas, pagadas y pendientes — exportable a Excel
          </p>
        </div>
        <Button
          type="button"
          variant="secondary"
          className="shrink-0"
          onClick={exportExcel}
        >
          <Download className="size-4" />
          Exportar Excel
        </Button>
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
          <CardTitle className="text-base">Filtros</CardTitle>
          <CardDescription>
            Busca por cliente, expediente, nº de factura o concepto
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-3 sm:flex-row">
          <div className="relative min-w-0 flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-subtle" />
            <Input
              className="pl-9"
              placeholder="Buscar…"
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />
          </div>
          <Select
            className="sm:w-48"
            value={status}
            onChange={(e) => setStatus(e.target.value as InvoiceStatus | "all")}
          >
            <option value="all">Todos los estados</option>
            {STATUS_ORDER.map((s) => (
              <option key={s} value={s}>
                {STATUS_LABELS[s]}
              </option>
            ))}
          </Select>
          <Select
            className="sm:w-52"
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
        </CardContent>
      </Card>

      <Card className="min-w-0">
        <CardContent className="min-w-0 overflow-x-auto p-0">
          <table className="w-full min-w-[900px] text-left text-sm">
            <thead>
              <tr className="border-b border-border bg-bg text-xs uppercase tracking-wide text-muted">
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
                  <td colSpan={7} className="px-4 py-10 text-center text-muted">
                    No hay facturas con estos filtros
                  </td>
                </tr>
              )}
              {filtered.map((inv) => {
                const lawyer = lawyers.find((l) => l.id === inv.lawyerId);
                const total = invoiceTotal(inv);
                return (
                  <tr
                    key={inv.id}
                    className="border-b border-border/70 last:border-0 hover:bg-surface-2/60"
                  >
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
