-- Historial de cambios (audit trail) por factura

create table if not exists invoice_events (
  id text primary key,
  invoice_id text not null references invoices (id) on delete cascade,
  event_type text not null,
  summary text not null,
  detail text,
  actor_user_id text,
  actor_name text,
  actor_email text,
  created_at timestamptz not null default now()
);

create index if not exists invoice_events_invoice_id_idx
  on invoice_events (invoice_id, created_at desc);

create index if not exists invoice_events_type_idx
  on invoice_events (event_type);
