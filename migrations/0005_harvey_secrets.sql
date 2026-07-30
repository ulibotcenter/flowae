-- Secretos del despacho (API keys). Nunca se exponen en bootstrap ni al frontend en claro.

create table if not exists firm_secrets (
  id text primary key default 'default',
  -- Blob cifrado AES-256-GCM (formato v1:iv:tag:ciphertext). Nunca en claro.
  harvey_api_key_enc text,
  -- Últimos 4 caracteres para UI enmascarada (••••abcd)
  harvey_api_key_last4 text,
  -- Endpoint Harvey (UE por defecto)
  harvey_base_url text not null default 'https://eu.api.harvey.ai',
  harvey_updated_at timestamptz,
  updated_at timestamptz not null default now()
);

insert into firm_secrets (id, harvey_base_url)
values ('default', 'https://eu.api.harvey.ai')
on conflict (id) do nothing;
