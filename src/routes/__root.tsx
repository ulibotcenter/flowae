import {
  createRootRoute,
  HeadContent,
  Outlet,
  Scripts,
} from "@tanstack/react-router";
import { Toaster } from "sonner";
import { AuthProvider } from "@/lib/auth/provider";
import { AppShell } from "@/components/layout/AppShell";
import appCss from "../styles.css?url";

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      {
        title: "FacturaFlow — Facturación del despacho",
      },
      {
        name: "description",
        content:
          "Flujo optimizado de facturación para bufetes: concepto, Admin, SharePoint, cliente y cobros.",
      },
    ],
    links: [{ rel: "stylesheet", href: appCss }],
  }),
  component: RootComponent,
});

function RootComponent() {
  return (
    <html lang="es" suppressHydrationWarning>
      <head>
        <HeadContent />
      </head>
      <body>
        <AuthProvider>
          <AppShell>
            <Outlet />
          </AppShell>
          <Toaster richColors position="top-right" closeButton />
        </AuthProvider>
        <Scripts />
      </body>
    </html>
  );
}
