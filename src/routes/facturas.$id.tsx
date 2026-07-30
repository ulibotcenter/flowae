import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  ArrowLeft,
  CheckCircle2,
  ExternalLink,
  FolderOpen,
  Mail,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
import { useBillingStore } from "@/lib/billing/store";
import {
  buildAdminEmail,
  buildClientEmail,
  invoiceIva,
  invoiceTotal,
  mailtoHref,
} from "@/lib/billing/templates";
import { formatCurrency, formatDateEs } from "@/lib/billing/format";
import { WorkflowSteps } from "@/components/WorkflowSteps";
import { StatusBadge } from "@/components/StatusBadge";
import { CopyButton } from "@/components/CopyButton";
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
import type { Invoice } from "@/lib/billing/types";

export const Route = createFileRoute("/facturas/$id")({
  component: FacturaDetailPage,
});

function FacturaDetailPage() {
  const { id } = Route.useParams();
  const invoice = useBillingStore((s) => s.invoices.find((i) => i.id === id));

  if (!invoice) {
    return (
      <div className="mx-auto max-w-lg py-16 text-center">
        <h1 className="text-xl font-semibold">Factura no encontrada</h1>
        <p className="mt-2 text-sm text-muted">
          Puede haber sido eliminada o el enlace no es válido.
        </p>
        <Button asChild className="mt-6">
          <Link to="/facturas">Volver al seguimiento</Link>
        </Button>
      </div>
    );
  }

  return <FacturaDetail invoice={invoice} />;
}

function FacturaDetail({ invoice }: { invoice: Invoice }) {
  const navigate = useNavigate();
  const lawyers = useBillingStore((s) => s.lawyers);
  const settings = useBillingStore((s) => s.settings);
  const requestAdmin = useBillingStore((s) => s.requestAdmin);
  const markIssued = useBillingStore((s) => s.markIssued);
  const markSentToClient = useBillingStore((s) => s.markSentToClient);
  const registerPayment = useBillingStore((s) => s.registerPayment);
  const updateInvoice = useBillingStore((s) => s.updateInvoice);
  const deleteInvoice = useBillingStore((s) => s.deleteInvoice);
  const refreshEmails = useBillingStore((s) => s.refreshEmails);

  const [invoiceNumber, setInvoiceNumber] = useState(invoice.invoiceNumber);
  const [payment, setPayment] = useState("");
  const [adminSubject, setAdminSubject] = useState("");
  const [adminBody, setAdminBody] = useState("");
  const [clientSubject, setClientSubject] = useState("");
  const [clientBody, setClientBody] = useState("");

  const lawyer = lawyers.find((l) => l.id === invoice.lawyerId);

  useEffect(() => {
    const admin = invoice.adminEmailBody
      ? {
          subject: invoice.adminEmailSubject ?? "",
          body: invoice.adminEmailBody,
        }
      : buildAdminEmail(invoice, lawyer, settings);
    const client = invoice.clientEmailBody
      ? {
          subject: invoice.clientEmailSubject ?? "",
          body: invoice.clientEmailBody,
        }
      : buildClientEmail(invoice, lawyer, settings);
    setAdminSubject(admin.subject);
    setAdminBody(admin.body);
    setClientSubject(client.subject);
    setClientBody(client.body);
    setInvoiceNumber(invoice.invoiceNumber);
  }, [
    invoice.id,
    invoice.status,
    invoice.invoiceNumber,
    invoice.adminEmailBody,
    invoice.clientEmailBody,
    invoice.remitente,
    lawyer,
    settings,
  ]);

  const total = invoiceTotal(invoice);
  const iva = invoiceIva(invoice);
  const pending = Math.max(0, total - (invoice.paidAmount || 0));

  function onRequestAdmin() {
    updateInvoice(invoice.id, {
      adminEmailSubject: adminSubject,
      adminEmailBody: adminBody,
    });
    requestAdmin(invoice.id);
    const fresh = useBillingStore
      .getState()
      .invoices.find((i) => i.id === invoice.id);
    if (fresh?.adminEmailSubject) {
      setAdminSubject(fresh.adminEmailSubject);
      setAdminBody(fresh.adminEmailBody ?? "");
    }
    toast.success("Marcada como solicitada a Administración");
  }

  function onMarkIssued() {
    if (!invoiceNumber.trim()) {
      toast.error("Introduce el nº de factura de SAGE");
      return;
    }
    markIssued(invoice.id, invoiceNumber);
    const fresh = useBillingStore
      .getState()
      .invoices.find((i) => i.id === invoice.id);
    if (fresh) {
      setClientSubject(fresh.clientEmailSubject ?? "");
      setClientBody(fresh.clientEmailBody ?? "");
    }
    toast.success("Factura marcada como emitida (SAGE/LEXNEXT)");
  }

  function onSendClient() {
    updateInvoice(invoice.id, {
      clientEmailSubject: clientSubject,
      clientEmailBody: clientBody,
    });
    markSentToClient(invoice.id);
    toast.success("Marcada como enviada al cliente");
  }

  function onPayment(full?: boolean) {
    if (full) {
      registerPayment(invoice.id, 0, true);
      toast.success("Registrado cobro total");
      return;
    }
    const amount = Number(payment.replace(",", "."));
    if (!amount || amount <= 0) {
      toast.error("Importe de cobro no válido");
      return;
    }
    registerPayment(invoice.id, amount);
    setPayment("");
    toast.success("Cobro registrado");
  }

  function onDelete() {
    if (!confirm("¿Eliminar esta factura del panel?")) return;
    deleteInvoice(invoice.id);
    toast.success("Eliminada");
    navigate({ to: "/facturas" });
  }

  function saveEmailEdits() {
    updateInvoice(invoice.id, {
      adminEmailSubject: adminSubject,
      adminEmailBody: adminBody,
      clientEmailSubject: clientSubject,
      clientEmailBody: clientBody,
    });
    toast.success("Plantillas guardadas");
  }

  const adminMailto = mailtoHref(settings.adminEmail, adminSubject, adminBody);
  const clientMailto = mailtoHref(
    invoice.clientEmail || "",
    clientSubject,
    clientBody,
  );

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-6">
      <div className="flex flex-col gap-4">
        <div className="flex flex-wrap items-center gap-2">
          <Button asChild variant="ghost" size="sm">
            <Link to="/facturas">
              <ArrowLeft className="size-4" />
              Seguimiento
            </Link>
          </Button>
          <StatusBadge status={invoice.status} />
          <span className="text-xs text-muted tabular">{invoice.ref}</span>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">
              {invoice.clientName}
            </h1>
            <p className="mt-1 text-sm text-muted">
              {invoice.expediente}
              {invoice.invoiceNumber ? ` · Factura ${invoice.invoiceNumber}` : ""}
              {lawyer ? ` · ${lawyer.name}` : ""}
            </p>
          </div>
          <div className="sm:text-right">
            <p className="text-xs font-medium uppercase tracking-wide text-muted">
              Total
            </p>
            <p className="text-2xl font-semibold tabular">
              {formatCurrency(total)}
            </p>
            <p className="text-xs text-muted">
              Pendiente: {formatCurrency(pending)}
            </p>
          </div>
        </div>
        <WorkflowSteps status={invoice.status} />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Resumen</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <Row label="Concepto" value={invoice.concepto} />
            <Row label="Base" value={formatCurrency(invoice.baseAmount)} />
            <Row label={`IVA ${invoice.ivaRate}%`} value={formatCurrency(iva)} />
            <Row label="Suplidos" value={formatCurrency(invoice.suplidos)} />
            <Row label="NIF/CIF" value={invoice.clientNif || "—"} />
            <Row label="Email cliente" value={invoice.clientEmail || "—"} />
            <Row
              label="Remite"
              value={
                invoice.remitente === "administracion"
                  ? "Administración"
                  : "Abogado"
              }
            />
            <Row label="Creada" value={formatDateEs(invoice.createdAt)} />
            <Row label="Vencimiento" value={formatDateEs(invoice.dueDate)} />
            {invoice.sourceFile && (
              <Row label="Origen" value={invoice.sourceFile} />
            )}
            {invoice.notes && <Row label="Notas" value={invoice.notes} />}

            <div className="space-y-1.5 border-t border-border pt-3">
              <Label>Quién remite al cliente</Label>
              <Select
                value={invoice.remitente}
                onChange={(e) => {
                  updateInvoice(invoice.id, {
                    remitente: e.target.value as "abogado" | "administracion",
                  });
                  refreshEmails(invoice.id);
                }}
              >
                <option value="abogado">Abogado</option>
                <option value="administracion">Administración</option>
              </Select>
            </div>

            <Button
              type="button"
              variant="outline"
              size="sm"
              className="w-full text-danger"
              onClick={onDelete}
            >
              <Trash2 className="size-3.5" />
              Eliminar del panel
            </Button>
          </CardContent>
        </Card>

        <div className="flex flex-col gap-4 lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-xs text-primary-fg">
                  2
                </span>
                Email a Administración (SAGE + LEXNEXT)
              </CardTitle>
              <CardDescription>
                Genera el correo para que Admin emita la factura en SAGE y la
                registre en LEXNEXT
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-1.5">
                <Label>Asunto</Label>
                <Input
                  value={adminSubject}
                  onChange={(e) => setAdminSubject(e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label>Cuerpo</Label>
                <Textarea
                  className="min-h-[200px] font-mono text-xs leading-relaxed"
                  value={adminBody}
                  onChange={(e) => setAdminBody(e.target.value)}
                />
              </div>
              <div className="flex flex-wrap gap-2">
                <CopyButton
                  text={`${adminSubject}\n\n${adminBody}`}
                  label="Copiar email"
                />
                <Button asChild variant="secondary" size="sm">
                  <a href={adminMailto}>
                    <Mail className="size-3.5" />
                    Abrir en correo
                    <ExternalLink className="size-3" />
                  </a>
                </Button>
                {invoice.status === "borrador" && (
                  <Button type="button" size="sm" onClick={onRequestAdmin}>
                    Marcar solicitada a Admin
                  </Button>
                )}
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={saveEmailEdits}
                >
                  Guardar cambios
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-xs text-primary-fg">
                  3
                </span>
                Archivo en SharePoint
              </CardTitle>
              <CardDescription>
                Deja el PDF aquí para evitar hilos de email y búsquedas manuales
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-start gap-3 rounded-xl border border-border bg-bg p-4">
                <FolderOpen className="mt-0.5 size-5 shrink-0 text-accent" />
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-medium uppercase tracking-wide text-muted">
                    Ruta propuesta
                  </p>
                  <p className="mt-1 break-all font-mono text-sm text-fg">
                    {invoice.sharePointPath}
                  </p>
                </div>
              </div>
              <div className="space-y-1.5">
                <Label>Ajustar ruta si el caso lo requiere</Label>
                <Input
                  value={invoice.sharePointPath}
                  onChange={(e) =>
                    updateInvoice(invoice.id, {
                      sharePointPath: e.target.value,
                    })
                  }
                />
              </div>
              <div className="flex flex-wrap gap-2">
                <CopyButton text={invoice.sharePointPath} label="Copiar ruta" />
              </div>

              {(invoice.status === "solicitada_admin" ||
                invoice.status === "emitida") && (
                <div className="rounded-xl border border-border bg-surface-2/50 p-4">
                  <p className="text-sm font-medium">
                    Registrar emisión (nº SAGE / LEXNEXT)
                  </p>
                  <p className="mt-1 text-xs text-muted">
                    Cuando Admin haya emitido y archivado el PDF, indica el
                    número de factura.
                  </p>
                  <div className="mt-3 flex flex-col gap-2 sm:flex-row">
                    <Input
                      placeholder="Ej. 2026/0115"
                      value={invoiceNumber}
                      onChange={(e) => setInvoiceNumber(e.target.value)}
                    />
                    <Button type="button" onClick={onMarkIssued}>
                      <CheckCircle2 className="size-4" />
                      Marcar emitida
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-xs text-primary-fg">
                  4
                </span>
                Email personalizado al cliente
              </CardTitle>
              <CardDescription>
                Listo para que el{" "}
                {invoice.remitente === "administracion"
                  ? "equipo de Administración"
                  : "abogado"}{" "}
                remita la factura (adjuntar PDF desde SharePoint)
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-1.5">
                <Label>Para</Label>
                <Input
                  value={invoice.clientEmail}
                  onChange={(e) =>
                    updateInvoice(invoice.id, { clientEmail: e.target.value })
                  }
                  placeholder="email@cliente.es"
                />
              </div>
              <div className="space-y-1.5">
                <Label>Asunto</Label>
                <Input
                  value={clientSubject}
                  onChange={(e) => setClientSubject(e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label>Cuerpo</Label>
                <Textarea
                  className="min-h-[180px] font-mono text-xs leading-relaxed"
                  value={clientBody}
                  onChange={(e) => setClientBody(e.target.value)}
                />
              </div>
              <div className="flex flex-wrap gap-2">
                <CopyButton
                  text={`${clientSubject}\n\n${clientBody}`}
                  label="Copiar email"
                />
                <Button
                  asChild
                  variant="secondary"
                  size="sm"
                  disabled={!invoice.clientEmail}
                >
                  <a href={invoice.clientEmail ? clientMailto : undefined}>
                    <Mail className="size-3.5" />
                    Abrir en correo
                  </a>
                </Button>
                {["emitida", "enviada_cliente"].includes(invoice.status) && (
                  <Button type="button" size="sm" onClick={onSendClient}>
                    Marcar enviada al cliente
                  </Button>
                )}
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={saveEmailEdits}
                >
                  Guardar cambios
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-xs text-primary-fg">
                  5
                </span>
                Seguimiento de cobro
              </CardTitle>
              <CardDescription>
                Registra pagos parciales o totales sin depender de Excel manual
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-3 sm:grid-cols-3">
                <Mini label="Total" value={formatCurrency(total)} />
                <Mini
                  label="Cobrado"
                  value={formatCurrency(invoice.paidAmount || 0)}
                />
                <Mini label="Pendiente" value={formatCurrency(pending)} />
              </div>
              {invoice.status !== "borrador" &&
                invoice.status !== "solicitada_admin" &&
                invoice.status !== "pagada" && (
                  <div className="flex flex-col gap-2 sm:flex-row">
                    <Input
                      type="number"
                      min={0}
                      step="0.01"
                      placeholder="Importe cobrado"
                      value={payment}
                      onChange={(e) => setPayment(e.target.value)}
                    />
                    <Button
                      type="button"
                      variant="secondary"
                      onClick={() => onPayment()}
                    >
                      Registrar cobro
                    </Button>
                    <Button type="button" onClick={() => onPayment(true)}>
                      Marcar pagada
                    </Button>
                  </div>
                )}
              {invoice.status === "pagada" && (
                <p className="rounded-lg bg-success-bg px-3 py-2 text-sm text-success">
                  Cobro completo registrado
                  {invoice.paidAt ? ` el ${formatDateEs(invoice.paidAt)}` : ""}.
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[11px] font-medium uppercase tracking-wide text-muted">
        {label}
      </p>
      <p className="mt-0.5 whitespace-pre-wrap text-fg">{value}</p>
    </div>
  );
}

function Mini({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-border bg-bg px-3 py-2.5">
      <p className="text-[11px] font-medium uppercase tracking-wide text-muted">
        {label}
      </p>
      <p className="mt-0.5 font-semibold tabular">{value}</p>
    </div>
  );
}
