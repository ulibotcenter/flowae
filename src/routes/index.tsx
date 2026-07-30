import { createFileRoute, Link } from "@tanstack/react-router";
import {
  AlertTriangle,
  ArrowRight,
  Clock,
  Euro,
  FileText,
  Send,
  Wallet,
} from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useMemo } from "react";
import { useBillingStore } from "@/lib/billing/store";
import { invoiceTotal } from "@/lib/billing/templates";
import { formatCurrency, formatDateEs } from "@/lib/billing/format";
import { StatusBadge } from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { Invoice } from "@/lib/billing/types";

export const Route = createFileRoute("/")({
  component: DashboardPage,
});

function DashboardPage() {
  const invoices = useBillingStore((s) => s.invoices);
  const lawyers = useBillingStore((s) => s.lawyers);

  const stats = useMemo(() => computeStats(invoices), [invoices]);

  const actionItems = useMemo(() => {
    return invoices
      .filter((i) =>
        [
          "borrador",
          "solicitada_admin",
          "emitida",
          "vencida",
          "parcial",
        ].includes(i.status),
      )
      .slice(0, 6);
  }, [invoices]);

  const byLawyer = useMemo(() => {
    return lawyers.map((l) => {
      const mine = invoices.filter((i) => i.lawyerId === l.id);
      const pendiente = mine
        .filter((i) => !["pagada", "borrador"].includes(i.status))
        .reduce(
          (sum, i) => sum + Math.max(0, invoiceTotal(i) - i.paidAmount),
          0,
        );
      return { name: l.initials, pendiente: Math.round(pendiente) };
    });
  }, [invoices, lawyers]);

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0">
          <h1 className="text-2xl font-semibold tracking-tight text-fg">
            Panel de facturación
          </h1>
          <p className="mt-1 text-sm text-muted">
            Visión del flujo y cobros — pensado para más de 250 facturas/año
          </p>
        </div>
        <Button asChild className="shrink-0">
          <Link to="/nueva">
            Nueva facturación
            <ArrowRight className="size-4" />
          </Link>
        </Button>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          icon={Euro}
          label="Pendiente de cobro"
          value={formatCurrency(stats.pending)}
          hint={`${stats.pendingCount} facturas`}
        />
        <StatCard
          icon={AlertTriangle}
          label="Vencidas"
          value={formatCurrency(stats.overdue)}
          hint={`${stats.overdueCount} en riesgo`}
          tone="danger"
        />
        <StatCard
          icon={Clock}
          label="En proceso"
          value={String(stats.inProcess)}
          hint="Borrador → enviada"
        />
        <StatCard
          icon={Wallet}
          label="Cobrado (muestra)"
          value={formatCurrency(stats.collected)}
          hint="Estado pagada"
          tone="success"
        />
      </div>

      <div className="grid min-w-0 gap-4 lg:grid-cols-5">
        <Card className="min-w-0 lg:col-span-3">
          <CardHeader>
            <CardTitle>Pendiente por letrado</CardTitle>
            <CardDescription>
              Importe pendiente de cobro agrupado por abogado responsable
            </CardDescription>
          </CardHeader>
          <CardContent className="h-64 min-w-0">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={byLawyer}
                margin={{ top: 8, right: 8, left: 0, bottom: 0 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="var(--color-border)"
                />
                <XAxis
                  dataKey="name"
                  tick={{ fill: "var(--color-muted)", fontSize: 12 }}
                />
                <YAxis
                  tick={{ fill: "var(--color-muted)", fontSize: 12 }}
                  tickFormatter={(v) => `${Math.round(v / 1000)}k`}
                  width={36}
                />
                <Tooltip
                  formatter={(v: number) => [formatCurrency(v), "Pendiente"]}
                  contentStyle={{
                    borderRadius: 8,
                    border: "1px solid var(--color-border)",
                    fontSize: 12,
                  }}
                />
                <Bar
                  dataKey="pendiente"
                  fill="var(--color-primary)"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="min-w-0 lg:col-span-2">
          <CardHeader>
            <CardTitle>Acciones prioritarias</CardTitle>
            <CardDescription>
              Pasos del flujo que requieren intervención
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-2">
            {actionItems.length === 0 && (
              <p className="text-sm text-muted">No hay acciones pendientes.</p>
            )}
            {actionItems.map((inv) => (
              <Link
                key={inv.id}
                to="/facturas/$id"
                params={{ id: inv.id }}
                className="flex items-start gap-3 rounded-lg border border-border px-3 py-2.5 transition-colors hover:bg-surface-2"
              >
                <ActionIcon status={inv.status} />
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="truncate text-sm font-medium">
                      {inv.clientName}
                    </p>
                    <StatusBadge status={inv.status} />
                  </div>
                  <p className="truncate text-xs text-muted">
                    {inv.expediente} · {formatCurrency(invoiceTotal(inv))}
                  </p>
                </div>
              </Link>
            ))}
            <Button asChild variant="outline" className="mt-1">
              <Link to="/facturas">Ver todo el seguimiento</Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      <Card className="min-w-0">
        <CardHeader className="flex-row items-center justify-between gap-2 space-y-0">
          <div>
            <CardTitle>Últimas facturas</CardTitle>
            <CardDescription>Actividad reciente en el panel</CardDescription>
          </div>
        </CardHeader>
        <CardContent className="min-w-0 overflow-x-auto">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead>
              <tr className="border-b border-border text-xs uppercase tracking-wide text-muted">
                <th className="pb-2 pr-3 font-medium">Ref</th>
                <th className="pb-2 pr-3 font-medium">Cliente</th>
                <th className="pb-2 pr-3 font-medium">Estado</th>
                <th className="pb-2 pr-3 font-medium">Total</th>
                <th className="pb-2 font-medium">Creada</th>
              </tr>
            </thead>
            <tbody>
              {invoices.slice(0, 8).map((inv) => (
                <tr
                  key={inv.id}
                  className="border-b border-border/70 last:border-0"
                >
                  <td className="py-3 pr-3">
                    <Link
                      to="/facturas/$id"
                      params={{ id: inv.id }}
                      className="font-medium text-accent hover:underline"
                    >
                      {inv.ref}
                    </Link>
                  </td>
                  <td className="py-3 pr-3">
                    <div className="font-medium">{inv.clientName}</div>
                    <div className="text-xs text-muted">{inv.expediente}</div>
                  </td>
                  <td className="py-3 pr-3">
                    <StatusBadge status={inv.status} />
                  </td>
                  <td className="py-3 pr-3 tabular">
                    {formatCurrency(invoiceTotal(inv))}
                  </td>
                  <td className="py-3 text-muted">
                    {formatDateEs(inv.createdAt)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  hint,
  tone,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  hint: string;
  tone?: "danger" | "success";
}) {
  return (
    <Card className="min-w-0">
      <CardContent className="flex items-start gap-3 p-5">
        <div
          className={
            tone === "danger"
              ? "rounded-lg bg-danger-bg p-2.5 text-danger"
              : tone === "success"
                ? "rounded-lg bg-success-bg p-2.5 text-success"
                : "rounded-lg bg-surface-2 p-2.5 text-primary"
          }
        >
          <Icon className="size-5" />
        </div>
        <div className="min-w-0">
          <p className="text-xs font-medium uppercase tracking-wide text-muted">
            {label}
          </p>
          <p className="mt-0.5 truncate text-xl font-semibold tabular tracking-tight">
            {value}
          </p>
          <p className="text-xs text-subtle">{hint}</p>
        </div>
      </CardContent>
    </Card>
  );
}

function ActionIcon({ status }: { status: Invoice["status"] }) {
  if (status === "vencida")
    return (
      <span className="mt-0.5 rounded-md bg-danger-bg p-1.5 text-danger">
        <AlertTriangle className="size-4" />
      </span>
    );
  if (status === "emitida")
    return (
      <span className="mt-0.5 rounded-md bg-info-bg p-1.5 text-info">
        <Send className="size-4" />
      </span>
    );
  return (
    <span className="mt-0.5 rounded-md bg-surface-2 p-1.5 text-muted">
      <FileText className="size-4" />
    </span>
  );
}

function computeStats(invoices: Invoice[]) {
  let pending = 0;
  let pendingCount = 0;
  let overdue = 0;
  let overdueCount = 0;
  let collected = 0;
  let inProcess = 0;

  for (const inv of invoices) {
    const total = invoiceTotal(inv);
    const rest = Math.max(0, total - (inv.paidAmount || 0));
    if (inv.status === "pagada") {
      collected += inv.paidAmount || total;
      continue;
    }
    if (inv.status === "borrador") {
      inProcess++;
      continue;
    }
    if (rest > 0) {
      pending += rest;
      pendingCount++;
    }
    if (inv.status === "vencida") {
      overdue += rest;
      overdueCount++;
    }
    if (
      ["solicitada_admin", "emitida", "enviada_cliente", "parcial"].includes(
        inv.status,
      )
    ) {
      inProcess++;
    }
  }

  return {
    pending,
    pendingCount,
    overdue,
    overdueCount,
    collected,
    inProcess,
  };
}
