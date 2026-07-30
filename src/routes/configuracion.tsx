import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Plus, RotateCcw, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useBillingStore } from "@/lib/billing/store";
import type { Lawyer } from "@/lib/billing/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
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
  const updateSettings = useBillingStore((s) => s.updateSettings);
  const upsertLawyer = useBillingStore((s) => s.upsertLawyer);
  const removeLawyer = useBillingStore((s) => s.removeLawyer);
  const resetDemo = useBillingStore((s) => s.resetDemo);

  const [form, setForm] = useState(settings);
  const [newLawyer, setNewLawyer] = useState({
    name: "",
    email: "",
    initials: "",
  });

  function saveSettings(e: React.FormEvent) {
    e.preventDefault();
    updateSettings(form);
    toast.success("Configuración guardada");
  }

  function addLawyer(e: React.FormEvent) {
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
    upsertLawyer(lawyer);
    setNewLawyer({ name: "", email: "", initials: "" });
    toast.success("Letrado añadido");
  }

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Configuración</h1>
        <p className="mt-1 text-sm text-muted">
          Datos del despacho, Admin, SharePoint y letrados
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Despacho y Administración</CardTitle>
          <CardDescription>
            Se usan en las plantillas de email y en la ruta de SharePoint
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form className="grid gap-4" onSubmit={saveSettings}>
            <Field label="Nombre del despacho">
              <Input
                value={form.firmName}
                onChange={(e) => setForm({ ...form, firmName: e.target.value })}
              />
            </Field>
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="Nombre Admin">
                <Input
                  value={form.adminName}
                  onChange={(e) =>
                    setForm({ ...form, adminName: e.target.value })
                  }
                />
              </Field>
              <Field label="Email Admin">
                <Input
                  type="email"
                  value={form.adminEmail}
                  onChange={(e) =>
                    setForm({ ...form, adminEmail: e.target.value })
                  }
                />
              </Field>
            </div>
            <Field label="Base SharePoint (carpetas por cliente/caso)">
              <Input
                value={form.sharePointBase}
                onChange={(e) =>
                  setForm({ ...form, sharePointBase: e.target.value })
                }
                placeholder="SharePoint/Clientes"
              />
            </Field>
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="IVA por defecto %">
                <Input
                  type="number"
                  value={form.defaultIva}
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
                  onChange={(e) =>
                    setForm({
                      ...form,
                      defaultPaymentDays: Number(e.target.value) || 0,
                    })
                  }
                />
              </Field>
            </div>
            <Field label="Nota para SAGE (en email a Admin)">
              <Textarea
                value={form.sageNote}
                onChange={(e) => setForm({ ...form, sageNote: e.target.value })}
              />
            </Field>
            <Field label="Nota para LEXNEXT (en email a Admin)">
              <Textarea
                value={form.lexnextNote}
                onChange={(e) =>
                  setForm({ ...form, lexnextNote: e.target.value })
                }
              />
            </Field>
            <Button type="submit">Guardar configuración</Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Letrados</CardTitle>
          <CardDescription>
            Varios abogados — cada uno con su email para remisión al cliente
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
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  aria-label="Eliminar letrado"
                  onClick={() => {
                    removeLawyer(l.id);
                    toast.success("Letrado eliminado");
                  }}
                >
                  <Trash2 className="size-4 text-muted" />
                </Button>
              </li>
            ))}
          </ul>

          <form
            className="grid gap-3 rounded-xl border border-dashed border-border-strong p-4 sm:grid-cols-4"
            onSubmit={addLawyer}
          >
            <Input
              className="sm:col-span-1"
              placeholder="Iniciales"
              value={newLawyer.initials}
              onChange={(e) =>
                setNewLawyer({ ...newLawyer, initials: e.target.value })
              }
            />
            <Input
              className="sm:col-span-1"
              placeholder="Nombre"
              value={newLawyer.name}
              onChange={(e) =>
                setNewLawyer({ ...newLawyer, name: e.target.value })
              }
            />
            <Input
              className="sm:col-span-1"
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
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Datos de demostración</CardTitle>
          <CardDescription>
            Restaura el panel con facturas de ejemplo del despacho
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              resetDemo();
              setForm(useBillingStore.getState().settings);
              toast.success("Datos de demo restaurados");
            }}
          >
            <RotateCcw className="size-4" />
            Restaurar demo
          </Button>
        </CardContent>
      </Card>
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
