-- FlowAE / FacturaFlow — schema de facturación multiusuario
-- Roles: admin (ve todo) | lawyer (solo sus facturas)

create table if not exists firm_settings (
  id text primary key default 'default',
  firm_name text not null,
  admin_email text not null,
  admin_name text not null,
  sharepoint_base text not null,
  default_iva numeric(5,2) not null default 21,
  default_payment_days integer not null default 30,
  sage_note text not null default '',
  lexnext_note text not null default '',
  updated_at timestamptz not null default now()
);

create table if not exists lawyers (
  id text primary key,
  name text not null,
  email text not null,
  initials text not null,
  user_id text unique,
  created_at timestamptz not null default now()
);

create index if not exists lawyers_user_id_idx on lawyers (user_id);

-- Per-user role for this despacho (linked to Better Auth "user".id)
create table if not exists user_profiles (
  user_id text primary key,
  role text not null check (role in ('admin', 'lawyer')),
  lawyer_id text references lawyers (id) on delete set null,
  email text,
  display_name text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists user_profiles_lawyer_id_idx on user_profiles (lawyer_id);
create index if not exists user_profiles_role_idx on user_profiles (role);

create table if not exists invoices (
  id text primary key,
  ref text not null,
  invoice_number text not null default '',
  client_name text not null,
  client_email text not null default '',
  client_nif text not null default '',
  expediente text not null,
  concepto text not null,
  base_amount numeric(14,2) not null default 0,
  iva_rate numeric(5,2) not null default 21,
  suplidos numeric(14,2) not null default 0,
  currency text not null default 'EUR',
  lawyer_id text not null references lawyers (id),
  remitente text not null default 'abogado' check (remitente in ('abogado', 'administracion')),
  status text not null default 'borrador',
  created_at timestamptz not null default now(),
  requested_at timestamptz,
  issued_at timestamptz,
  sent_at timestamptz,
  due_date timestamptz,
  paid_at timestamptz,
  paid_amount numeric(14,2) not null default 0,
  notes text not null default '',
  sharepoint_path text not null default '',
  source_file text,
  admin_email_subject text,
  admin_email_body text,
  client_email_subject text,
  client_email_body text,
  created_by text,
  updated_at timestamptz not null default now()
);

create index if not exists invoices_status_idx on invoices (status);
create index if not exists invoices_lawyer_id_idx on invoices (lawyer_id);
create index if not exists invoices_created_at_idx on invoices (created_at desc);
create index if not exists invoices_due_date_idx on invoices (due_date);
create index if not exists invoices_client_name_idx on invoices (client_name);

-- Sequence helper for FAC-YYYY-#### refs
create table if not exists billing_counters (
  year integer primary key,
  seq integer not null default 0
);
