import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo } from "react";
import {
  AlertTriangle,
  ArrowRight,
  Clock,
  FileEdit,
  Mail,
  Send,
} from "lucide-react";
import { useBillingStore } from "@/lib/billing/store";
import { invoiceTotal } from "@/lib/billing/templates";
import { formatCurrency, formatDateEs } from "@/lib/billing/format";
import {
  hoyReason,
  isHoyItem,
  sortByUrgency,
} from "@/lib/billing/priority";
import { STATUS_LABELS, type Invoice, type InvoiceStatus } from "@/lib/billing/types";
import { StatusBadge } from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/hoy")({
  component: HoyPage,
});

function HoyPage() {
  const invoices = useBillingStore((s) => s.invoices);
  const lawyers = useBillingStore((s) => s.lawyers);

  const hoy = useMemo(
    () => invoices.filter(isHoyItem).sort(sortByUrgency),
    [invoices],
  );

  const counts = useMemo(() => {
    const c = {
      vencida: 0,
      enviada_cliente: 0,
      solicitada_admin: 0,
      borrador: 0,
    };
    for (const inv of hoy) {
      if (inv.status === "vencida") c.vencida++;
      else if (inv.status === "enviada_cliente") c.enviada_cliente++;
      else if (inv.status === "solicitada_admin") c.solicitada_admin++;
      else if (inv.status === "borrador") c.borrador++;
    }
    return c;
  }, [hoy]);

  const pendingAmount = useMemo(
    () =>
      hoy.reduce(
        (sum, inv) =>
          sum + Math.max(0, invoiceTotal(inv) - (inv.paidAmount || 0)),
        0,
      ),
    [hoy],
  );

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0">
          <h1 className="text-2xl font-semibold tracking-tight">
            Hoy — pendientes de acción
          </h1>
          <p className="mt-1 text-sm text-muted">
            Borradores, cola de Admin, vencidas y enviadas sin cobro, ordenadas
            por urgencia
          </p>
        </div>
        <Button asChild variant="secondary" className="shrink-0">
          <Link to="/facturas">Ir al seguimiento completo</Link>
        </Button>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        <SummaryChip
          label="Total hoy"
          value={String(hoy.length)}
          tone="default"
        />
        <SummaryChip
          label="Vencidas"
          value={String(counts.vencida)}
          tone="danger"
        />
        <SummaryChip
          label="Sin pago"
          value={String(counts.enviada_cliente)}
          tone="warn"
        />
        <SummaryChip
          label="Cola Admin"
          value={String(counts.solicitada_admin)}
          tone="info"
        />
        <SummaryChip
          label="Borradores"
          value={String(counts.borrador)}
          tone="default"
        />
      </div>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Importe en juego</CardTitle>
          <CardDescription>
            Suma pendiente de las facturas de esta lista
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-semibold tabular tracking-tight">
            {formatCurrency(pendingAmount)}
          </p>
        </CardContent>
      </Card>

      {hoy.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-base font-medium">No hay pendientes de acción</p>
            <p className="mt-1 text-sm text-muted">
              Cuando haya borradores, solicitudes a Admin, vencidas o enviadas
              sin cobro, aparecerán aquí.
            </p>
            <Button asChild className="mt-6">
              <Link to="/nueva">Nueva facturación</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <ul className="flex flex-col gap-3">
          {hoy.map((inv, index) => {
            const lawyer = lawyers.find((l) => l.id === inv.lawyerId);
            return (
              <HoyCard
                key={inv.id}
                invoice={inv}
                lawyerName={lawyer?.name}
                rank={index + 1}
              />
            );
          })}
        </ul>
      )}
    </div>
  );
}

function HoyCard({
  invoice,
  lawyerName,
  rank,
}: {
  invoice: Invoice;
  lawyerName?: string;
  rank: number;
}) {
  const total = invoiceTotal(invoice);
  const pending = Math.max(0, total - (invoice.paidAmount || 0));
  const reason = hoyReason(invoice);
  const Icon = iconFor(invoice.status);

  return (
    <li>
      <Link
        to="/facturas/$id"
        params={{ id: invoice.id }}
        className={cn(
          "flex flex-col gap-3 rounded-xl border border-border bg-surface p-4 shadow-sm transition-colors hover:bg-surface-2 sm:flex-row sm:items-center sm:justify-between",
          invoice.status === "vencida" && "border-danger/30",
        )}
      >
        <div className="flex min-w-0 items-start gap-3">
          <span
            className={cn(
              "mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg",
              invoice.status === "vencida"
                ? "bg-danger-bg text-danger"
                : invoice.status === "enviada_cliente"
                  ? "bg-warn-bg text-warn"
                  : "bg-surface-2 text-primary",
            )}
          >
            <Icon className="size-4" />
          </span>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-medium tabular text-subtle">
                #{rank}
              </span>
              <p className="truncate font-semibold text-fg">
                {invoice.clientName}
              </p>
              <StatusBadge status={invoice.status} />
            </div>
            <p className="mt-0.5 text-sm text-muted">
              {invoice.ref} · {invoice.expediente}
              {lawyerName ? ` · ${lawyerName}` : ""}
            </p>
            <p className="mt-1 text-xs font-medium text-fg/80">{reason}</p>
            <p className="mt-0.5 text-xs text-subtle">
              Vence {formatDateEs(invoice.dueDate)} ·{" "}
              {STATUS_LABELS[invoice.status]}
            </p>
          </div>
        </div>
        <div className="flex items-center justify-between gap-4 sm:flex-col sm:items-end">
          <div className="text-right">
            <p className="text-xs uppercase tracking-wide text-muted">
              Pendiente
            </p>
            <p className="text-lg font-semibold tabular">
              {formatCurrency(pending)}
            </p>
          </div>
          <span className="inline-flex items-center gap-1 text-xs font-medium text-accent">
            Abrir flujo
            <ArrowRight className="size-3.5" />
          </span>
        </div>
      </Link>
    </li>
  );
}

function iconFor(status: InvoiceStatus) {
  switch (status) {
    case "vencida":
      return AlertTriangle;
    case "enviada_cliente":
      return Send;
    case "solicitada_admin":
      return Mail;
    case "borrador":
      return FileEdit;
    default:
      return Clock;
  }
}

function SummaryChip({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone: "default" | "danger" | "warn" | "info";
}) {
  return (
    <Card className="min-w-0">
      <CardContent className="p-4">
        <p className="text-xs font-medium uppercase tracking-wide text-muted">
          {label}
        </p>
        <p
          className={cn(
            "mt-1 text-xl font-semibold tabular",
            tone === "danger" && "text-danger",
            tone === "warn" && "text-warn",
            tone === "info" && "text-info",
          )}
        >
          {value}
        </p>
      </CardContent>
    </Card>
  );
}
