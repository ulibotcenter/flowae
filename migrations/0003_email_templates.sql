-- Plantillas de correo editables + timestamps de envío real/simulado

alter table firm_settings
  add column if not exists admin_email_subject_tpl text not null default '';

alter table firm_settings
  add column if not exists admin_email_body_tpl text not null default '';

alter table firm_settings
  add column if not exists client_email_subject_tpl text not null default '';

alter table firm_settings
  add column if not exists client_email_body_tpl text not null default '';

alter table invoices
  add column if not exists admin_email_sent_at timestamptz;

alter table invoices
  add column if not exists client_email_sent_at timestamptz;
