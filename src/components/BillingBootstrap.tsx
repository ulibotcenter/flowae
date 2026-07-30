import { useEffect } from "react";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { RedirectToSignIn } from "@/lib/auth/gates";
import { useBillingStore } from "@/lib/billing/store";
import { ROLE_LABELS } from "@/lib/billing/types";

/**
 * Ensures the signed-in user has loaded billing data from the server DB
 * before rendering children. Replaces the old localStorage hydrate path.
 */
export function BillingBootstrap({ children }: { children: React.ReactNode }) {
  const { user, isPending } = useCurrentUserState();
  const bootstrap = useBillingStore((s) => s.bootstrap);
  const hydrated = useBillingStore((s) => s.hydrated);
  const loading = useBillingStore((s) => s.loading);
  const error = useBillingStore((s) => s.error);
  const profile = useBillingStore((s) => s.profile);

  useEffect(() => {
    if (!user || isPending) return;
    let cancelled = false;
    void (async () => {
      try {
        await bootstrap();
      } catch {
        if (cancelled) return;
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [user?.id, isPending, bootstrap]);

  if (isPending) {
    return <LoadingScreen label="Comprobando sesión…" />;
  }

  if (!user) {
    return <RedirectToSignIn />;
  }

  if (!hydrated || loading) {
    return <LoadingScreen label="Cargando facturación del despacho…" />;
  }

  if (error) {
    return (
      <div className="mx-auto flex max-w-md flex-col gap-3 py-20 text-center">
        <h1 className="text-lg font-semibold">No se pudieron cargar los datos</h1>
        <p className="text-sm text-muted">{error}</p>
        <button
          type="button"
          className="rounded-md bg-primary px-4 py-2 text-sm text-primary-fg"
          onClick={() => void bootstrap()}
        >
          Reintentar
        </button>
      </div>
    );
  }

  return (
    <>
      {profile && (
        <div className="sr-only" aria-live="polite">
          Rol: {ROLE_LABELS[profile.role]}
        </div>
      )}
      {children}
    </>
  );
}

function LoadingScreen({ label }: { label: string }) {
  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center gap-3">
      <div className="h-8 w-8 animate-pulse rounded-full bg-surface-2" />
      <p className="text-sm text-muted">{label}</p>
    </div>
  );
}
