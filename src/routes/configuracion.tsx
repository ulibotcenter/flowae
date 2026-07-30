import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  Plus,
  RotateCcw,
  Trash2,
  Mail,
  Bot,
  Eye,
  EyeOff,
  Loader2,
  ShieldCheck,
} from "lucide-react";
import { toast } from "sonner";
import { useBillingStore } from "@/lib/billing/store";
import {
  listProfilesFn,
  setUserRoleFn,
  getMailStatusFn,
} from "@/lib/billing/server-fns";
import {
  getHarveyStatusFn,
  saveHarveyApiKeyFn,
  deleteHarveyApiKeyFn,
  testHarveyConnectionFn,
  updateHarveyBaseUrlFn,
} from "@/lib/extract/server-fn";
import type { HarveyPublicStatus } from "@/lib/secrets/types";
import type { Lawyer, UserProfile, UserRole } from "@/lib/billing/types";
import { ROLE_LABELS } from "@/lib/billing/types";
import { EMAIL_TEMPLATE_VARS } from "@/lib/billing/templates";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export const Route = createFileRoute("/configuracion")({
  component: ConfigPage,
});

function ConfigPage() {
  const settings = useBillingStore((s) => s.settings);
  const lawyers = useBillingStore((s) => s.lawyers);
  const profile = useBillingStore((s) => s.profile);
  const updateSettings = useBillingStore((s) => s.updateSettings);
  const upsertLawyer = useBillingStore((s) => s.upsertLawyer);
  const removeLawyer = useBillingStore((s) => s.removeLawyer);
  const resetDemo = useBillingStore((s) => s.resetDemo);
  const bootstrap = useBillingStore((s) => s.bootstrap);

  const [form, setForm] = useState(settings);
  const [newLawyer, setNewLawyer] = useState({
    name: "",
    email: "",
    initials: "",
  });
  const [profiles, setProfiles] = useState<UserProfile[]>([]);
  const [mailStatus, setMailStatus] = useState<{
    mode: "resend" | "simulated";
    from: string;
    configured: boolean;
  } | null>(null);
  const [harvey, setHarvey] = useState<HarveyPublicStatus | null>(null);
  const [harveyKeyInput, setHarveyKeyInput] = useState("");
  const [harveyBaseUrl, setHarveyBaseUrl] = useState(
    "https://eu.api.harvey.ai",
  );
  const [showHarveyKey, setShowHarveyKey] = useState(false);
  const [harveyBusy, setHarveyBusy] = useState(false);
  const isAdmin = profile?.role === "admin";

  useEffect(() => {
    setForm(settings);
  }, [settings]);

  useEffect(() => {
    if (!isAdmin) return;
    void listProfilesFn()
      .then(setProfiles)
      .catch(() => setProfiles([]));
    void getMailStatusFn()
      .then(setMailStatus)
      .catch(() => setMailStatus(null));
    void getHarveyStatusFn()
      .then((st) => {
        setHarvey(st);
        if (st.baseUrl) setHarveyBaseUrl(st.baseUrl);
      })
      .catch(() => setHarvey(null));
  }, [isAdmin, profile?.userId]);

  async function saveHarveyKey() {
    if (!harveyKeyInput.trim()) {
      toast.error("Introduce la API key de Harvey");
      return;
    }
    setHarveyBusy(true);
    try {
      const st = await saveHarveyApiKeyFn({
        data: { apiKey: harveyKeyInput.trim(), baseUrl: harveyBaseUrl },
      });
      setHarvey(st);
      setHarveyKeyInput("");
      setShowHarveyKey(false);
      toast.success("API key de Harvey guardada de forma segura");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Error al guardar");
    } finally {
      setHarveyBusy(false);
    }
  }

  async function removeHarveyKey() {
    setHarveyBusy(true);
    try {
      const st = await deleteHarveyApiKeyFn();
      setHarvey(st);
      setHarveyKeyInput("");
      toast.success("API key de Harvey eliminada");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Error al eliminar");
    } finally {
      setHarveyBusy(false);
    }
  }

  async function testHarvey() {
    setHarveyBusy(true);
    try {
      // If user typed a new key, test that without requiring save first
      const res = await testHarveyConnectionFn({
        data: {
          apiKey: harveyKeyInput.trim() || undefined,
          baseUrl: harveyBaseUrl,
        },
      });
      if (res.ok) toast.success(res.message);
      else toast.error(res.message);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Error al probar");
    } finally {
      setHarveyBusy(false);
    }
  }

  async function saveHarveyUrl() {
    setHarveyBusy(true);
    try {
      const st = await updateHarveyBaseUrlFn({
        data: { baseUrl: harveyBaseUrl },
      });
      setHarvey(st);
      toast.success("URL de Harvey actualizada");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Error");
    } finally {
      setHarveyBusy(false);
    }
  }

  async function saveSettings(e: React.FormEvent) {
    e.preventDefault();
    try {
      await updateSettings(form);
      toast.success("Configuración guardada en el servidor");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Error al guardar");
    }
  }

  async function addLawyer(e: React.FormEvent) {
    e.preventDefault();
    if (!newLawyer.name.trim() || !newLawyer.email.trim()) {
      toast.error("Nombre y email del letrado son obligatorios");
      return;
    }
    const lawyer: Lawyer = {
      id: `law-${crypto.randomUUID().slice(0, 6)}`,
      name: newLawyer.name.trim(),
      email: newLawyer.email.trim(),
      initials:
        newLawyer.initials.trim() ||
        newLawyer.name
          .split(/\s+/)
          .map((p) => p[0])
          .join("")
          .slice(0, 2)
          .toUpperCase(),
    };
    try {
      await upsertLawyer(lawyer);
      setNewLawyer({ name: "", email: "", initials: "" });
      toast.success("Letrado añadido");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Error");
    }
  }

  async function onRoleChange(
    userId: string,
    role: UserRole,
    lawyerId: string | null,
  ) {
    try {
      await setUserRoleFn({
        data: {
          userId,
          role,
          lawyerId: role === "lawyer" ? lawyerId : null,
        },
      });
      const next = await listProfilesFn();
      setProfiles(next);
      await bootstrap();
      toast.success("Rol actualizado");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Error de permisos");
    }
  }

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Configuración</h1>
        <p className="mt-1 text-sm text-muted">
          Despacho, letrados y roles multiusuario (servidor)
        </p>
      </div>

      {profile && (
        <Card>
          <CardContent className="flex flex-wrap items-center gap-3 p-4 text-sm">
            <span className="text-muted">Tu rol actual:</span>
            <span className="font-semibold">{ROLE_LABELS[profile.role]}</span>
            {profile.lawyerId && (
              <span className="text-muted">
                · Letrado vinculado:{" "}
                {lawyers.find((l) => l.id === profile.lawyerId)?.name ??
                  profile.lawyerId}
              </span>
            )}
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Despacho y Administración</CardTitle>
          <CardDescription>
            {isAdmin
              ? "Se usan en plantillas de email y rutas SharePoint"
              : "Solo lectura — Admin puede editar"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form className="grid gap-4" onSubmit={(e) => void saveSettings(e)}>
            <Field label="Nombre del despacho">
              <Input
                value={form.firmName}
                disabled={!isAdmin}
                onChange={(e) => setForm({ ...form, firmName: e.target.value })}
              />
            </Field>
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="Nombre Admin">
                <Input
                  value={form.adminName}
                  disabled={!isAdmin}
                  onChange={(e) =>
                    setForm({ ...form, adminName: e.target.value })
                  }
                />
              </Field>
              <Field label="Email Admin">
                <Input
                  type="email"
                  value={form.adminEmail}
                  disabled={!isAdmin}
                  onChange={(e) =>
                    setForm({ ...form, adminEmail: e.target.value })
                  }
                />
              </Field>
            </div>
            <Field label="Base SharePoint">
              <Input
                value={form.sharePointBase}
                disabled={!isAdmin}
                onChange={(e) =>
                  setForm({ ...form, sharePointBase: e.target.value })
                }
              />
            </Field>
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="IVA por defecto %">
                <Input
                  type="number"
                  value={form.defaultIva}
                  disabled={!isAdmin}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      defaultIva: Number(e.target.value) || 0,
                    })
                  }
                />
              </Field>
              <Field label="Días de vencimiento">
                <Input
                  type="number"
                  value={form.defaultPaymentDays}
                  disabled={!isAdmin}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      defaultPaymentDays: Number(e.target.value) || 0,
                    })
                  }
                />
              </Field>
            </div>
            <Field label="Nota SAGE">
              <Textarea
                value={form.sageNote}
                disabled={!isAdmin}
                onChange={(e) => setForm({ ...form, sageNote: e.target.value })}
              />
            </Field>
            <Field label="Nota LEXNEXT">
              <Textarea
                value={form.lexnextNote}
                disabled={!isAdmin}
                onChange={(e) =>
                  setForm({ ...form, lexnextNote: e.target.value })
                }
              />
            </Field>
            {isAdmin && <Button type="submit">Guardar configuración</Button>}
          </form>
        </CardContent>
      </Card>

      {isAdmin && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bot className="size-4" />
              Inteligencia Artificial – Harvey
            </CardTitle>
            <CardDescription>
              Configura la API key del despacho. Se cifra en el servidor y nunca
              se muestra completa en la interfaz ni se envía de nuevo al
              navegador.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div
              className={
                harvey?.configured
                  ? "flex items-center gap-2 rounded-lg border border-border bg-success-bg px-3 py-2 text-sm text-success"
                  : "flex items-center gap-2 rounded-lg border border-border bg-surface-2 px-3 py-2 text-sm text-muted"
              }
            >
              <ShieldCheck className="size-4 shrink-0" />
              {harvey?.configured ? (
                <span>
                  <strong>Harvey conectado</strong>
                  {harvey.maskedKey ? ` · clave ${harvey.maskedKey}` : ""}
                  {harvey.updatedAt
                    ? ` · actualizada ${new Date(harvey.updatedAt).toLocaleString("es-ES")}`
                    : ""}
                </span>
              ) : (
                <span>
                  Sin API de Harvey – usando extracción local
                  {mailStatus ? "" : ""}
                </span>
              )}
            </div>

            <Field label="URL del endpoint (UE recomendada)">
              <div className="flex flex-col gap-2 sm:flex-row">
                <Input
                  value={harveyBaseUrl}
                  onChange={(e) => setHarveyBaseUrl(e.target.value)}
                  placeholder="https://eu.api.harvey.ai"
                  className="font-mono text-xs"
                />
                <Button
                  type="button"
                  variant="outline"
                  disabled={harveyBusy}
                  onClick={() => void saveHarveyUrl()}
                >
                  Guardar URL
                </Button>
              </div>
              <p className="mt-1 text-[11px] text-muted">
                Despachos en España/UE:{" "}
                <code className="text-[10px]">https://eu.api.harvey.ai</code>
              </p>
            </Field>

            <Field label="API Key de Harvey">
              <div className="flex gap-2">
                <Input
                  type={showHarveyKey ? "text" : "password"}
                  autoComplete="off"
                  value={harveyKeyInput}
                  onChange={(e) => setHarveyKeyInput(e.target.value)}
                  placeholder={
                    harvey?.configured
                      ? "Nueva clave (deja vacío para no cambiar)"
                      : "Pega aquí la API key del despacho"
                  }
                  className="font-mono text-xs"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  aria-label={showHarveyKey ? "Ocultar" : "Mostrar"}
                  onClick={() => setShowHarveyKey((v) => !v)}
                >
                  {showHarveyKey ? (
                    <EyeOff className="size-4" />
                  ) : (
                    <Eye className="size-4" />
                  )}
                </Button>
              </div>
              <p className="mt-1 text-[11px] text-muted">
                Solo Administración. La clave se cifra (AES-256-GCM) y solo el
                servidor la usa para llamar a Harvey.
              </p>
            </Field>

            <div className="flex flex-wrap gap-2">
              <Button
                type="button"
                disabled={harveyBusy || !harveyKeyInput.trim()}
                onClick={() => void saveHarveyKey()}
              >
                {harveyBusy ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : null}
                Guardar clave
              </Button>
              <Button
                type="button"
                variant="secondary"
                disabled={harveyBusy || (!harveyKeyInput.trim() && !harvey?.configured)}
                onClick={() => void testHarvey()}
              >
                Probar conexión
              </Button>
              {harvey?.configured && (
                <Button
                  type="button"
                  variant="outline"
                  className="text-danger"
                  disabled={harveyBusy}
                  onClick={() => void removeHarveyKey()}
                >
                  Eliminar clave
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="size-4" />
            Plantillas de correo
          </CardTitle>
          <CardDescription>
            Variables disponibles:{" "}
            {EMAIL_TEMPLATE_VARS.map((v) => `{{${v}}}`).join(", ")}. Se
            sustituyen automáticamente en cada factura.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {mailStatus && (
            <div
              className={
                mailStatus.configured
                  ? "rounded-lg border border-border bg-success-bg px-3 py-2 text-xs text-success"
                  : "rounded-lg border border-border bg-warn-bg px-3 py-2 text-xs text-warn"
              }
            >
              {mailStatus.configured ? (
                <>
                  Envío real activo (Resend). Remitente:{" "}
                  <strong>{mailStatus.from}</strong>
                </>
              ) : (
                <>
                  Modo prueba: no hay <code>RESEND_API_KEY</code>. Los envíos
                  copiarán el correo y actualizarán el estado sin enviar de
                  verdad. Remitente previsto: {mailStatus.from}
                </>
              )}
            </div>
          )}

          <div className="space-y-3">
            <p className="text-sm font-medium">Email a Administración</p>
            <Field label="Asunto">
              <Input
                value={form.adminEmailSubjectTpl}
                disabled={!isAdmin}
                onChange={(e) =>
                  setForm({ ...form, adminEmailSubjectTpl: e.target.value })
                }
              />
            </Field>
            <Field label="Cuerpo">
              <Textarea
                className="min-h-[180px] font-mono text-xs"
                value={form.adminEmailBodyTpl}
                disabled={!isAdmin}
                onChange={(e) =>
                  setForm({ ...form, adminEmailBodyTpl: e.target.value })
                }
              />
            </Field>
          </div>

          <div className="space-y-3 border-t border-border pt-4">
            <p className="text-sm font-medium">Email al Cliente</p>
            <Field label="Asunto">
              <Input
                value={form.clientEmailSubjectTpl}
                disabled={!isAdmin}
                onChange={(e) =>
                  setForm({ ...form, clientEmailSubjectTpl: e.target.value })
                }
              />
            </Field>
            <Field label="Cuerpo">
              <Textarea
                className="min-h-[180px] font-mono text-xs"
                value={form.clientEmailBodyTpl}
                disabled={!isAdmin}
                onChange={(e) =>
                  setForm({ ...form, clientEmailBodyTpl: e.target.value })
                }
              />
            </Field>
          </div>

          {isAdmin && (
            <Button
              type="button"
              onClick={() => {
                void updateSettings(form)
                  .then(() => toast.success("Plantillas guardadas"))
                  .catch((err) =>
                    toast.error(
                      err instanceof Error ? err.message : "Error al guardar",
                    ),
                  );
              }}
            >
              Guardar plantillas
            </Button>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Letrados</CardTitle>
          <CardDescription>
            Si un usuario se registra con el mismo email, se vincula como Abogado
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <ul className="divide-y divide-border rounded-xl border border-border">
            {lawyers.map((l) => (
              <li
                key={l.id}
                className="flex items-center gap-3 px-4 py-3 text-sm"
              >
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-surface-2 text-xs font-semibold">
                  {l.initials}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="font-medium">{l.name}</p>
                  <p className="truncate text-xs text-muted">{l.email}</p>
                  {l.userId && (
                    <p className="text-[11px] text-success">Usuario vinculado</p>
                  )}
                </div>
                {isAdmin && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    aria-label="Eliminar letrado"
                    onClick={() => {
                      void removeLawyer(l.id)
                        .then(() => toast.success("Letrado eliminado"))
                        .catch((err) =>
                          toast.error(
                            err instanceof Error ? err.message : "Error",
                          ),
                        );
                    }}
                  >
                    <Trash2 className="size-4 text-muted" />
                  </Button>
                )}
              </li>
            ))}
          </ul>

          {isAdmin && (
            <form
              className="grid gap-3 rounded-xl border border-dashed border-border-strong p-4 sm:grid-cols-4"
              onSubmit={(e) => void addLawyer(e)}
            >
              <Input
                placeholder="Iniciales"
                value={newLawyer.initials}
                onChange={(e) =>
                  setNewLawyer({ ...newLawyer, initials: e.target.value })
                }
              />
              <Input
                placeholder="Nombre"
                value={newLawyer.name}
                onChange={(e) =>
                  setNewLawyer({ ...newLawyer, name: e.target.value })
                }
              />
              <Input
                placeholder="Email"
                type="email"
                value={newLawyer.email}
                onChange={(e) =>
                  setNewLawyer({ ...newLawyer, email: e.target.value })
                }
              />
              <Button type="submit" variant="secondary">
                <Plus className="size-4" />
                Añadir
              </Button>
            </form>
          )}
        </CardContent>
      </Card>

      {isAdmin && (
        <Card>
          <CardHeader>
            <CardTitle>Usuarios y roles</CardTitle>
            <CardDescription>
              Administración ve y edita todas las facturas. Abogado solo las del
              letrado al que está vinculado. Los cambios se aplican de inmediato
              en el servidor.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-lg border border-border bg-bg px-3 py-2 text-xs text-muted">
              <ul className="list-inside list-disc space-y-0.5">
                <li>
                  <strong className="text-fg">Administración</strong>: panel
                  completo, configuración, plantillas y roles.
                </li>
                <li>
                  <strong className="text-fg">Abogado</strong>: solo facturas de
                  su letrado; no puede cambiar configuración ni roles.
                </li>
              </ul>
            </div>
            {profiles.length === 0 && (
              <p className="text-sm text-muted">
                Aún no hay usuarios. Cuando alguien se registre o entre en demo,
                aparecerá aquí.
              </p>
            )}
            {profiles.map((p) => {
              const linked = lawyers.find((l) => l.id === p.lawyerId);
              return (
                <div
                  key={p.userId}
                  className="flex flex-col gap-3 rounded-xl border border-border p-4"
                >
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="text-sm font-semibold">
                        {p.displayName || p.email || p.userId.slice(0, 8)}
                      </p>
                      <p className="truncate text-xs text-muted">
                        {p.email || "Sin email"}
                      </p>
                      {p.role === "lawyer" && (
                        <p className="mt-1 text-[11px] text-muted">
                          Letrado vinculado:{" "}
                          <span className="font-medium text-fg">
                            {linked?.name ?? "Pendiente de asignar"}
                          </span>
                        </p>
                      )}
                    </div>
                    <span
                      className={
                        p.role === "admin"
                          ? "rounded-full bg-primary/10 px-2.5 py-0.5 text-[11px] font-semibold text-primary"
                          : "rounded-full bg-surface-2 px-2.5 py-0.5 text-[11px] font-semibold text-fg"
                      }
                    >
                      {ROLE_LABELS[p.role]}
                    </span>
                  </div>
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                    <div className="space-y-1 sm:w-44">
                      <Label className="text-xs">Rol</Label>
                      <Select
                        value={p.role}
                        onChange={(e) =>
                          void onRoleChange(
                            p.userId,
                            e.target.value as UserRole,
                            e.target.value === "lawyer"
                              ? p.lawyerId || lawyers[0]?.id || null
                              : null,
                          )
                        }
                      >
                        <option value="admin">Administración</option>
                        <option value="lawyer">Abogado</option>
                      </Select>
                    </div>
                    {p.role === "lawyer" && (
                      <div className="min-w-0 flex-1 space-y-1">
                        <Label className="text-xs">Letrado del despacho</Label>
                        <Select
                          value={p.lawyerId ?? ""}
                          onChange={(e) =>
                            void onRoleChange(
                              p.userId,
                              "lawyer",
                              e.target.value || null,
                            )
                          }
                        >
                          <option value="">Seleccionar letrado…</option>
                          {lawyers.map((l) => (
                            <option key={l.id} value={l.id}>
                              {l.name} ({l.email})
                            </option>
                          ))}
                        </Select>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>
      )}

      {!isAdmin && profile && (
        <Card>
          <CardHeader>
            <CardTitle>Tu acceso</CardTitle>
            <CardDescription>
              Solo Administración puede gestionar usuarios y roles
            </CardDescription>
          </CardHeader>
          <CardContent className="text-sm text-muted">
            Rol actual:{" "}
            <strong className="text-fg">{ROLE_LABELS[profile.role]}</strong>
            {profile.lawyerId && (
              <>
                {" "}
                · Letrado:{" "}
                {lawyers.find((l) => l.id === profile.lawyerId)?.name ??
                  profile.lawyerId}
              </>
            )}
            . Ves y editas únicamente las facturas de tu letrado.
          </CardContent>
        </Card>
      )}

      {isAdmin && (
        <Card>
          <CardHeader>
            <CardTitle>Datos de demostración</CardTitle>
            <CardDescription>
              Restaura facturas y letrados de ejemplo en la base de datos
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                void resetDemo()
                  .then(() => {
                    setForm(useBillingStore.getState().settings);
                    toast.success("Demo restaurada en el servidor");
                  })
                  .catch((err) =>
                    toast.error(err instanceof Error ? err.message : "Error"),
                  );
              }}
            >
              <RotateCcw className="size-4" />
              Restaurar demo
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <Label>{label}</Label>
      {children}
    </div>
  );
}
