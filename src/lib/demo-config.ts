/**
 * One-click demo login for client demos of the despacho tool.
 *
 * Disable either flag to hide the button and reject demo server entry:
 *   - VITE_DEMO_LOGIN=false   (client + build-time, recommended)
 *   - DEMO_LOGIN_ENABLED=false (server-only kill switch)
 *
 * Default: enabled.
 */
export const DEMO_USER_EMAIL = "demo@facturaflow.app";
export const DEMO_USER_NAME = "Demo Administración";
/** Public demo password — intentional; demo mode is open by design. */
export const DEMO_USER_PASSWORD = "DemoFacturaFlow-2026!";

export const DEMO_MODE_STORAGE_KEY = "facturaflow.demo-mode";

function envIsFalse(value: string | undefined): boolean {
  if (!value) return false;
  const v = value.trim().toLowerCase();
  return v === "false" || v === "0" || v === "off" || v === "no";
}

/**
 * Whether the "Entrar en modo demostración" entry point is available.
 * Safe to call from client and server modules bundled by Vite.
 */
export function isDemoLoginEnabled(): boolean {
  // Server kill switch (never exposed unless set as VITE_*)
  if (typeof process !== "undefined" && envIsFalse(process.env.DEMO_LOGIN_ENABLED)) {
    return false;
  }
  if (typeof process !== "undefined" && envIsFalse(process.env.VITE_DEMO_LOGIN)) {
    return false;
  }
  // Client / SSR (Vite inlines import.meta.env.VITE_*)
  try {
    if (envIsFalse(import.meta.env.VITE_DEMO_LOGIN as string | undefined)) {
      return false;
    }
  } catch {
    /* non-vite */
  }
  return true;
}

export function isDemoUserEmail(email: string | null | undefined): boolean {
  if (!email) return false;
  return email.trim().toLowerCase() === DEMO_USER_EMAIL.toLowerCase();
}
