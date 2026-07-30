import { Link, useRouterState } from "@tanstack/react-router";
import {
  LayoutDashboard,
  FilePlus2,
  ListChecks,
  Settings,
  Scale,
  Menu,
  X,
} from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { useBillingStore } from "@/lib/billing/store";

const nav = [
  { to: "/", label: "Panel", icon: LayoutDashboard },
  { to: "/nueva", label: "Nueva facturación", icon: FilePlus2 },
  { to: "/facturas", label: "Seguimiento", icon: ListChecks },
  { to: "/configuracion", label: "Configuración", icon: Settings },
] as const;

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const firmName = useBillingStore((s) => s.settings.firmName);
  const [open, setOpen] = useState(false);

  return (
    <div className="flex min-h-dvh max-w-[100vw] overflow-x-hidden bg-bg">
      {open && (
        <button
          type="button"
          className="fixed inset-0 z-40 bg-fg/40 lg:hidden"
          aria-label="Cerrar menú"
          onClick={() => setOpen(false)}
        />
      )}

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-64 flex-col bg-sidebar text-sidebar-fg transition-transform duration-200 lg:static lg:translate-x-0",
          open ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex items-center gap-3 border-b border-white/10 px-5 py-5">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/10">
            <Scale className="size-5 text-sidebar-fg" />
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold tracking-tight">
              FacturaFlow
            </p>
            <p className="truncate text-xs text-sidebar-muted">{firmName}</p>
          </div>
          <button
            type="button"
            className="ml-auto rounded-md p-2 text-sidebar-muted hover:bg-sidebar-hover lg:hidden"
            onClick={() => setOpen(false)}
            aria-label="Cerrar"
          >
            <X className="size-4" />
          </button>
        </div>

        <nav className="flex flex-1 flex-col gap-1 p-3">
          {nav.map((item) => {
            const active =
              item.to === "/"
                ? pathname === "/"
                : pathname.startsWith(item.to);
            const Icon = item.icon;
            return (
              <Link
                key={item.to}
                to={item.to}
                onClick={() => setOpen(false)}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                  active
                    ? "bg-sidebar-active text-sidebar-fg"
                    : "text-sidebar-muted hover:bg-sidebar-hover hover:text-sidebar-fg",
                )}
              >
                <Icon className="size-4 shrink-0" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-white/10 p-4 text-xs text-sidebar-muted">
          Flujo: concepto → Admin (SAGE/LEXNEXT) → SharePoint → cliente → cobro
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col overflow-x-hidden">
        <header className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b border-border bg-surface/90 px-4 backdrop-blur lg:px-8">
          <button
            type="button"
            className="rounded-md p-2 text-muted hover:bg-surface-2 lg:hidden"
            onClick={() => setOpen(true)}
            aria-label="Abrir menú"
          >
            <Menu className="size-5" />
          </button>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-fg lg:hidden">
              FacturaFlow
            </p>
            <p className="hidden text-sm text-muted lg:block">
              Optimización de facturación y cobros del despacho
            </p>
          </div>
        </header>
        <main className="min-w-0 flex-1 overflow-x-hidden px-4 py-6 lg:px-8 lg:py-8">
          {children}
        </main>
      </div>
    </div>
  );
}
