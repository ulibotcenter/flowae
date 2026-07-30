import { useEffect, useState } from "react";
import { History } from "lucide-react";
import { listInvoiceEventsFn } from "@/lib/billing/server-fns";
import type { InvoiceEvent } from "@/lib/billing/types";
import { EVENT_TYPE_LABELS } from "@/lib/billing/audit";
import { formatDateEs } from "@/lib/billing/format";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";

const TYPE_STYLES: Record<string, string> = {
  created: "bg-info-bg text-info",
  status_change: "bg-surface-2 text-fg",
  email_admin: "bg-warn-bg text-warn",
  email_client: "bg-warn-bg text-warn",
  payment: "bg-success-bg text-success",
  field_edit: "bg-surface-2 text-muted",
  deleted: "bg-danger-bg text-danger",
  note: "bg-surface-2 text-muted",
};

export function InvoiceHistory({ invoiceId }: { invoiceId: string }) {
  const [events, setEvents] = useState<InvoiceEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    void listInvoiceEventsFn({ data: { invoiceId } })
      .then((rows) => {
        if (!cancelled) setEvents(rows);
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Error al cargar historial");
          setEvents([]);
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [invoiceId, tick]);

  // Allow parent to force refresh via custom event
  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent<{ invoiceId?: string }>).detail;
      if (!detail?.invoiceId || detail.invoiceId === invoiceId) {
        setTick((t) => t + 1);
      }
    };
    window.addEventListener("facturaflow:history-refresh", handler);
    return () =>
      window.removeEventListener("facturaflow:history-refresh", handler);
  }, [invoiceId]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <History className="size-4" />
          Historial
        </CardTitle>
        <CardDescription>
          Registro de solo lectura: estados, correos, cobros y ediciones
        </CardDescription>
      </CardHeader>
      <CardContent>
        {loading && (
          <p className="text-sm text-muted">Cargando historial…</p>
        )}
        {error && (
          <p className="text-sm text-danger">{error}</p>
        )}
        {!loading && !error && events.length === 0 && (
          <p className="text-sm text-muted">
            Aún no hay eventos registrados en esta factura.
          </p>
        )}
        {!loading && events.length > 0 && (
          <ol className="relative space-y-0 border-l border-border pl-4">
            {events.map((ev) => (
              <li key={ev.id} className="relative pb-5 last:pb-0">
                <span className="absolute -left-[1.3rem] top-1.5 h-2.5 w-2.5 rounded-full border-2 border-surface bg-primary" />
                <div className="flex flex-wrap items-center gap-2">
                  <span
                    className={cn(
                      "rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide",
                      TYPE_STYLES[ev.eventType] ?? TYPE_STYLES.note,
                    )}
                  >
                    {EVENT_TYPE_LABELS[ev.eventType] ?? ev.eventType}
                  </span>
                  <time className="text-[11px] text-muted tabular">
                    {formatDateTimeEs(ev.createdAt)}
                  </time>
                </div>
                <p className="mt-1 text-sm font-medium text-fg">{ev.summary}</p>
                {ev.detail && (
                  <pre className="mt-1 whitespace-pre-wrap font-sans text-xs text-muted">
                    {ev.detail}
                  </pre>
                )}
                <p className="mt-1 text-[11px] text-subtle">
                  {ev.actorName || ev.actorEmail || "Sistema"}
                  {ev.actorEmail && ev.actorName
                    ? ` · ${ev.actorEmail}`
                    : ""}
                </p>
              </li>
            ))}
          </ol>
        )}
      </CardContent>
    </Card>
  );
}

function formatDateTimeEs(iso: string): string {
  try {
    const d = new Date(iso);
    return new Intl.DateTimeFormat("es-ES", {
      dateStyle: "short",
      timeStyle: "short",
    }).format(d);
  } catch {
    return formatDateEs(iso);
  }
}

/** Call after mutations so the history panel reloads. */
export function refreshInvoiceHistory(invoiceId: string) {
  if (typeof window === "undefined") return;
  window.dispatchEvent(
    new CustomEvent("facturaflow:history-refresh", {
      detail: { invoiceId },
    }),
  );
}
