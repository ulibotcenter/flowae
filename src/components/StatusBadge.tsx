import type { InvoiceStatus } from "@/lib/billing/types";
import { STATUS_LABELS } from "@/lib/billing/types";
import { Badge } from "@/components/ui/badge";

const map: Record<
  InvoiceStatus,
  "default" | "primary" | "success" | "warn" | "danger" | "outline"
> = {
  borrador: "outline",
  solicitada_admin: "primary",
  emitida: "primary",
  enviada_cliente: "default",
  pagada: "success",
  parcial: "warn",
  vencida: "danger",
};

export function StatusBadge({ status }: { status: InvoiceStatus }) {
  return <Badge variant={map[status]}>{STATUS_LABELS[status]}</Badge>;
}
