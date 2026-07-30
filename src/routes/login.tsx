import { createFileRoute, Link, Navigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { FlaskConical, Scale } from "lucide-react";
import {
  GROK_PROVIDERS,
  authClient,
  authEnabled,
  signIn,
} from "@/lib/auth/client";
import { enterDemoMode } from "@/lib/auth/demo-login";
import { isDemoLoginEnabled } from "@/lib/demo-config";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { getDbStatusFn } from "@/lib/db-status-fn";
import { DATABASE_REQUIRED_MESSAGE } from "@/lib/db-messages";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export const Route = createFileRoute("/login")({
  component: LoginPage,
});

function LoginPage() {
  const { user, isPending } = useCurrentUserState();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [demoBusy, setDemoBusy] = useState(false);
  const [dbError, setDbError] = useState<string | null>(null);
  const demoEnabled = isDemoLoginEnabled();

  useEffect(() => {
    void getDbStatusFn()
      .then((st) => {
        if (!st.ready) setDbError(st.message || DATABASE_REQUIRED_MESSAGE);
      })
      .catch((err) => {
        const msg = err instanceof Error ? err.message : String(err);
        if (
          msg.includes("DATABASE_URL") ||
          msg.includes("pglite") ||
          msg.includes("ENOENT")
        ) {
          setDbError(DATABASE_REQUIRED_MESSAGE);
        }
      });
  }, []);

  function friendlyDbError(err: unknown): string {
    const msg = err instanceof Error ? err.message : String(err ?? "");
    if (
      msg.includes("DATABASE_URL") ||
      msg.includes("pglite.data") ||
      msg.includes("ENOENT") ||
      msg.includes("PGLite")
    ) {
      return DATABASE_REQUIRED_MESSAGE;
    }
    return msg || "Error de autenticación";
  }

  if (isPending) {
    return (
      <div className="grid min-h-dvh place-items-center bg-bg text-sm text-muted">
        Cargando…
      </div>
    );
  }

  // Auth desactivada (VITE_AUTH_ENABLED=false): ir al panel sin login
  if (!authEnabled) {
    return <Navigate to="/" />;
  }

  if (user) {
    return <Navigate to="/" />;
  }

  async function onEmailSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      if (mode === "signup") {
        const res = await authClient.signUp.email({
          email: email.trim(),
          password,
          name: name.trim() || email.split("@")[0] || "Usuario",
        });
        if (res.error) {
          setError(res.error.message ?? "No se pudo registrar");
          return;
        }
      } else {
        const res = await authClient.signIn.email({
          email: email.trim(),
          password,
        });
        if (res.error) {
          setError(res.error.message ?? "Credenciales incorrectas");
          return;
        }
      }
      window.location.href = "/";
    } catch (err) {
      setError(friendlyDbError(err));
    } finally {
      setBusy(false);
    }
  }

  async function onDemoEnter() {
    setError(null);
    if (dbError) {
      setError(dbError);
      return;
    }
    setDemoBusy(true);
    try {
      await enterDemoMode();
    } catch (err) {
      setError(friendlyDbError(err));
      setDemoBusy(false);
    }
  }

  return (
    <div className="grid min-h-dvh place-items-center bg-bg px-4 py-10">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-primary-fg">
            <Scale className="size-6" />
          </div>
          <CardTitle className="text-xl">FacturaFlow</CardTitle>
          <CardDescription>
            Acceso seguro para abogados y Administración del despacho
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          {dbError && (
            <div
              role="alert"
              className="rounded-lg border border-danger/40 bg-danger-bg px-3 py-2 text-sm text-danger"
            >
              {dbError}
            </div>
          )}

          {demoEnabled && (
            <div className="space-y-2 rounded-xl border-2 border-accent/40 bg-info-bg/50 p-4">
              <p className="text-center text-sm font-medium text-fg">
                Prueba sin registrarte
              </p>
              <Button
                type="button"
                size="lg"
                className="w-full text-base"
                disabled={demoBusy || busy}
                onClick={() => void onDemoEnter()}
              >
                <FlaskConical className="size-5" />
                {demoBusy
                  ? "Entrando en demo…"
                  : "Entrar en modo demostración"}
              </Button>
              <p className="text-center text-xs text-muted">
                Acceso completo como Administración con datos de ejemplo.
                Ideal para enseñar la herramienta a clientes.
              </p>
            </div>
          )}

          {authEnabled ? (
            <>
              {demoEnabled && (
                <div className="relative py-1 text-center text-xs text-muted">
                  <span className="bg-surface px-2">o inicia sesión real</span>
                  <div className="absolute inset-x-0 top-1/2 -z-10 border-t border-border" />
                </div>
              )}

              <div className="space-y-2">
                {GROK_PROVIDERS.map((p) => (
                  <Button
                    key={p.providerId}
                    type="button"
                    variant="secondary"
                    className="w-full"
                    disabled={demoBusy}
                    onClick={() =>
                      void signIn(p.providerId, { callbackURL: "/" })
                    }
                  >
                    Continuar con {p.label}
                  </Button>
                ))}
              </div>

              <div className="relative py-1 text-center text-xs text-muted">
                <span className="bg-surface px-2">o con email del despacho</span>
                <div className="absolute inset-x-0 top-1/2 -z-10 border-t border-border" />
              </div>

              <form className="space-y-3" onSubmit={onEmailSubmit}>
                {mode === "signup" && (
                  <div className="space-y-1.5">
                    <Label>Nombre</Label>
                    <Input
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="María González"
                      autoComplete="name"
                    />
                  </div>
                )}
                <div className="space-y-1.5">
                  <Label>Email</Label>
                  <Input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="tu@bufete.es"
                    autoComplete="email"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>Contraseña</Label>
                  <Input
                    type="password"
                    required
                    minLength={8}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Mínimo 8 caracteres"
                    autoComplete={
                      mode === "signup" ? "new-password" : "current-password"
                    }
                  />
                </div>
                {error && (
                  <p className="rounded-md bg-danger-bg px-3 py-2 text-xs text-danger">
                    {error}
                  </p>
                )}
                <Button
                  type="submit"
                  variant="secondary"
                  className="w-full"
                  disabled={busy || demoBusy}
                >
                  {busy
                    ? "Espera…"
                    : mode === "signup"
                      ? "Crear cuenta"
                      : "Entrar"}
                </Button>
              </form>

              <p className="text-center text-xs text-muted">
                {mode === "signin" ? (
                  <>
                    ¿Primera vez?{" "}
                    <button
                      type="button"
                      className="font-medium text-accent underline-offset-2 hover:underline"
                      onClick={() => setMode("signup")}
                    >
                      Crear cuenta
                    </button>
                  </>
                ) : (
                  <>
                    ¿Ya tienes cuenta?{" "}
                    <button
                      type="button"
                      className="font-medium text-accent underline-offset-2 hover:underline"
                      onClick={() => setMode("signin")}
                    >
                      Iniciar sesión
                    </button>
                  </>
                )}
              </p>
            </>
          ) : (
            <p className="text-sm text-muted">
              El inicio de sesión está desactivado en este entorno.
            </p>
          )}

          {error && !authEnabled && (
            <p className="rounded-md bg-danger-bg px-3 py-2 text-xs text-danger">
              {error}
            </p>
          )}

          <p className="text-center text-xs text-subtle">
            <Link to="/" className="hover:underline">
              Volver al inicio
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
