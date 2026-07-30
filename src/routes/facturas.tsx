import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/facturas")({
  component: FacturasLayout,
});

function FacturasLayout() {
  return <Outlet />;
}
