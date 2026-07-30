/**
 * Control central de “acceso abierto” (sin login).
 *
 * ## Estado actual: AUTH DESACTIVADA (temporal)
 * `TEMPORARY_OPEN_ACCESS = true` → la app entra al panel como Administración
 * sin /login ni Better Auth (evita “Invalid origin” en Vercel mientras se
 * configura OAuth).
 *
 * ## Cómo reactivar la autenticación real
 * 1. Pon `TEMPORARY_OPEN_ACCESS = false` en este archivo, **y**
 * 2. En Vercel: `VITE_AUTH_ENABLED=true` (o elimina `VITE_AUTH_ENABLED=false`),
 * 3. Redesplega (Vite embebe las variables en el build).
 *
 * También puedes dejar el flag en `false` y solo usar la env:
 * - `VITE_AUTH_ENABLED=false` → auth off
 * - `VITE_AUTH_ENABLED=true` o sin variable → auth on (si el flag es false)
 *
 * El código de Better Auth / login **no se elimina**.
 */

/** ← Cambiar a `false` para volver a exigir login / OAuth. */
export const TEMPORARY_OPEN_ACCESS = true;

/**
 * Whether sign-in and session enforcement are active.
 * Safe to import from client and server.
 */
export function isAuthEnabled(): boolean {
  // Hard off while the firm demos without OAuth origins configured.
  if (TEMPORARY_OPEN_ACCESS) return false;

  // Explicit env off (client build + server runtime)
  const fromVite = readViteAuthFlag();
  if (fromVite === false) return false;
  if (fromVite === true) return true;

  const fromProcess = readProcessAuthFlag();
  if (fromProcess === false) return false;
  if (fromProcess === true) return true;

  // Default: auth on (only reached when TEMPORARY_OPEN_ACCESS is false)
  return true;
}

/** Inverse of isAuthEnabled — shared admin dev-user mode. */
export function isOpenAccessMode(): boolean {
  return !isAuthEnabled();
}

function readViteAuthFlag(): boolean | undefined {
  try {
    // Vite injects this at build time for client and SSR bundles.
    const v = import.meta.env?.VITE_AUTH_ENABLED;
    if (v === "false" || v === false) return false;
    if (v === "true" || v === true) return true;
  } catch {
    /* ignore */
  }
  return undefined;
}

function readProcessAuthFlag(): boolean | undefined {
  if (typeof process === "undefined") return undefined;
  const v = process.env.VITE_AUTH_ENABLED?.trim().toLowerCase();
  if (v === "false" || v === "0" || v === "off") return false;
  if (v === "true" || v === "1" || v === "on") return true;
  return undefined;
}
