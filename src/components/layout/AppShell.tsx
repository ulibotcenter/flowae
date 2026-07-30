import { Link, useRouterState } from "@tanstack/react-router";
import {
  LayoutDashboard,
  FilePlus2,
  ListChecks,
  Settings,
  Scale,
  Menu,
  X,
  SunMedium,
  FlaskConical,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { cn } from "@/lib/utils";
import { useBillingStore } from "@/lib/billing/store";
import { isHoyItem } from "@/lib/billing/priority";
import { ROLE_LABELS } from "@/lib/billing/types";
import { UserButton } from "@/lib/auth/gates";
import { authEnabled } from "@/lib/auth/client";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { isDemoModeActive } from "@/lib/auth/demo-login";

const nav = [
  { to: "/", label: "Panel", icon: LayoutDashboard, exact: true },
  { to: "/hoy", label: "Hoy", icon: SunMedium, exact: true },
  { to: "/nueva", label: "Nueva facturación", icon: FilePlus2, exact: true },
  { to: "/facturas", label: "Seguimiento", icon: ListChecks, exact: false },
  { to: "/configuracion", label: "Configuración", icon: Settings, exact: true },
] as const;

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const firmName = useBillingStore((s) => s.settings.firmName);
  const invoices = useBillingStore((s) => s.invoices);
  const profile = useBillingStore((s) => s.profile);
  const { user, isPending } = useCurrentUserState();
  const hoyCount = useMemo(
    () => invoices.filter(isHoyItem).length,
    [invoices],
  );
  const [demoMode, setDemoMode] = useState(false);
  const [open, setOpen] = useState(false);

  // sessionStorage only exists on client — avoid SSR/client hydration mismatch
  useEffect(() => {
    setDemoMode(isDemoModeActive(user?.primaryEmail));
  }, [user?.primaryEmail]);

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

        {!authEnabled && (
          <div className="mx-3 mt-3 flex items-center gap-2 rounded-lg bg-warn/25 px-3 py-2 text-xs font-semibold text-sidebar-fg">
            <FlaskConical className="size-3.5 shrink-0" />
            Acceso abierto (sin login)
          </div>
        )}
        {demoMode && authEnabled && (
          <div className="mx-3 mt-3 flex items-center gap-2 rounded-lg bg-warn/25 px-3 py-2 text-xs font-semibold text-sidebar-fg">
            <FlaskConical className="size-3.5 shrink-0" />
            Modo demostración
          </div>
        )}

        <nav className="flex flex-1 flex-col gap-1 p-3">
          {nav.map((item) => {
            const active = item.exact
              ? pathname === item.to
              : pathname === item.to || pathname.startsWith(`${item.to}/`);
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
                <span className="flex-1">{item.label}</span>
                {item.to === "/hoy" && hoyCount > 0 && (
                  <span className="rounded-full bg-white/15 px-2 py-0.5 text-[11px] font-semibold tabular text-sidebar-fg">
                    {hoyCount}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        <div className="space-y-2 border-t border-white/10 p-4">
          {profile && (
            <p className="text-xs text-sidebar-muted">
              Rol:{" "}
              <span className="font-medium text-sidebar-fg">
                {ROLE_LABELS[profile.role]}
              </span>
            </p>
          )}
          <p className="text-xs text-sidebar-muted">
            Datos en servidor · multiusuario
          </p>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col overflow-x-hidden">
        {!authEnabled && (
          <div className="flex items-center justify-center gap-2 bg-warn px-3 py-1.5 text-center text-xs font-semibold text-white">
            <FlaskConical className="size-3.5 shrink-0" />
            Acceso abierto temporal — auth desactivada (VITE_AUTH_ENABLED=false)
          </div>
        )}
        {demoMode && authEnabled && (
          <div className="flex items-center justify-center gap-2 bg-warn px-3 py-1.5 text-center text-xs font-semibold text-white">
            <FlaskConical className="size-3.5 shrink-0" />
            Estás en modo demostración — los datos son de ejemplo
          </div>
        )}
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
          {!authEnabled && (
            <span className="hidden items-center gap-1 rounded-full bg-warn-bg px-2.5 py-1 text-[11px] font-semibold text-warn sm:inline-flex">
              <FlaskConical className="size-3" />
              Acceso abierto
            </span>
          )}
          {demoMode && authEnabled && (
            <span className="hidden items-center gap-1 rounded-full bg-warn-bg px-2.5 py-1 text-[11px] font-semibold text-warn sm:inline-flex">
              <FlaskConical className="size-3" />
              Demo
            </span>
          )}
          <div className="shrink-0">
            {isPending ? (
              <div className="h-8 w-8 animate-pulse rounded-full bg-surface-2" />
            ) : user ? (
              <UserButton />
            ) : authEnabled ? (
              <Link
                to="/login"
                className="text-sm font-medium text-accent hover:underline"
              >
                Entrar
              </Link>
            ) : (
              <UserButton />
            )}
          </div>
        </header>
        <main className="min-w-0 flex-1 overflow-x-hidden px-4 py-6 lg:px-8 lg:py-8">
          {children}
        </main>
      </div>
    </div>
  );
}
