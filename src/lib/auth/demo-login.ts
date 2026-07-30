/**
 * Client-side one-click demo login.
 * Ensures the demo admin user exists (server), then signs in via Better Auth
 * email/password and stores the session bearer for live-preview iframes.
 *
 * When auth is temporarily disabled (open-access), just navigates to the panel
 * without calling Better Auth (avoids Invalid origin).
 */
import { authClient, authEnabled, setBearerToken } from "./client";
import {
  DEMO_MODE_STORAGE_KEY,
  DEMO_USER_EMAIL,
  DEMO_USER_NAME,
  DEMO_USER_PASSWORD,
  isDemoLoginEnabled,
  isDemoUserEmail,
} from "@/lib/demo-config";
import { ensureDemoUserFn } from "@/lib/billing/demo-server-fn";

function markDemoMode(on: boolean) {
  if (typeof window === "undefined") return;
  try {
    if (on) window.sessionStorage.setItem(DEMO_MODE_STORAGE_KEY, "1");
    else window.sessionStorage.removeItem(DEMO_MODE_STORAGE_KEY);
  } catch {
    /* ignore */
  }
}

/** True when this browser tab entered via the demo button (or is the demo user). */
export function isDemoModeActive(email?: string | null): boolean {
  if (typeof window !== "undefined") {
    try {
      if (window.sessionStorage.getItem(DEMO_MODE_STORAGE_KEY) === "1") {
        return true;
      }
    } catch {
      /* ignore */
    }
  }
  return isDemoUserEmail(email);
}

export function clearDemoModeFlag() {
  markDemoMode(false);
}

/**
 * Enter demo mode: provision demo admin + seed data, then sign in without UI credentials.
 * If auth is off (open access), redirects to the panel without Better Auth.
 */
export async function enterDemoMode(): Promise<void> {
  // Acceso abierto: no llamar a Better Auth (evita Invalid origin en Vercel)
  if (!authEnabled) {
    markDemoMode(true);
    if (typeof window !== "undefined") {
      window.location.href = "/";
    }
    return;
  }

  if (!isDemoLoginEnabled()) {
    throw new Error("El modo demostración está desactivado");
  }

  await ensureDemoUserFn();

  try {
    await authClient.signOut();
  } catch {
    /* no session */
  }
  setBearerToken(null);

  let token: string | null = null;

  const signInRes = await authClient.signIn.email({
    email: DEMO_USER_EMAIL,
    password: DEMO_USER_PASSWORD,
  });

  if (signInRes.error) {
    const signUpRes = await authClient.signUp.email({
      email: DEMO_USER_EMAIL,
      password: DEMO_USER_PASSWORD,
      name: DEMO_USER_NAME,
    });
    if (
      signUpRes.error &&
      !String(signUpRes.error.message ?? "")
        .toLowerCase()
        .match(/exist|already|registered/)
    ) {
      // ensureDemoUser may have created the account — still try sign-in
    }
    const retry = await authClient.signIn.email({
      email: DEMO_USER_EMAIL,
      password: DEMO_USER_PASSWORD,
    });
    if (retry.error) {
      throw new Error(retry.error.message ?? "No se pudo entrar en modo demo");
    }
    token = extractToken(retry.data);
  } else {
    token = extractToken(signInRes.data);
  }

  if (token) {
    setBearerToken(token);
  }

  markDemoMode(true);

  try {
    await authClient.getSession();
  } catch {
    /* session store refreshes on next useSession */
  }

  if (typeof window !== "undefined") {
    window.location.href = "/";
  }
}

function extractToken(data: unknown): string | null {
  if (!data || typeof data !== "object") return null;
  const d = data as Record<string, unknown>;
  if (typeof d.token === "string" && d.token) return d.token;
  const session = d.session as Record<string, unknown> | undefined;
  if (session && typeof session.token === "string") return session.token;
  return null;
}
