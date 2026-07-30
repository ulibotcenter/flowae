import { cn } from "@/lib/utils";
import type { InvoiceStatus } from "@/lib/billing/types";
import { Check } from "lucide-react";

const steps = [
  { key: "concepto", label: "Concepto", statuses: ["borrador"] },
  {
    key: "admin",
    label: "Email Admin",
    statuses: ["solicitada_admin"],
  },
  {
    key: "archivo",
    label: "SharePoint",
    statuses: ["emitida"],
  },
  {
    key: "cliente",
    label: "Email cliente",
    statuses: ["enviada_cliente"],
  },
  {
    key: "cobro",
    label: "Cobro",
    statuses: ["parcial", "pagada", "vencida"],
  },
] as const;

function stepIndex(status: InvoiceStatus): number {
  switch (status) {
    case "borrador":
      return 0;
    case "solicitada_admin":
      return 1;
    case "emitida":
      return 2;
    case "enviada_cliente":
      return 3;
    case "parcial":
    case "pagada":
    case "vencida":
      return 4;
    default:
      return 0;
  }
}

export function WorkflowSteps({ status }: { status: InvoiceStatus }) {
  const current = stepIndex(status);
  const paid = status === "pagada";

  return (
    <ol className="grid grid-cols-2 gap-2 sm:grid-cols-5">
      {steps.map((step, i) => {
        const done = i < current || (i === current && paid && i === 4);
        const active = i === current && !done;
        return (
          <li
            key={step.key}
            className={cn(
              "flex items-center gap-2 rounded-lg border px-3 py-2.5 text-xs font-medium",
              done && "border-success/30 bg-success-bg text-success",
              active && "border-accent/40 bg-info-bg text-info",
              !done && !active && "border-border bg-surface text-muted",
            )}
          >
            <span
              className={cn(
                "flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[11px]",
                done && "bg-success text-white",
                active && "bg-accent text-primary-fg",
                !done && !active && "bg-surface-2 text-muted",
              )}
            >
              {done ? <Check className="size-3.5" /> : i + 1}
            </span>
            <span className="leading-tight">{step.label}</span>
          </li>
        );
      })}
    </ol>
  );
}
