-- Which subscriber received which newsletter issue (so a broadcast never sends twice),
-- and messages from the contact form (kept even if the mail provider is down).

create table if not exists public.newsletter_deliveries (
  issue_id uuid not null references public.newsletter_issues(id) on delete cascade,
  registration_id uuid not null references public.registrations(id) on delete cascade,
  sent_at timestamptz not null default now(),
  provider_id text,
  primary key (issue_id, registration_id)
);
comment on table public.newsletter_deliveries is 'Envíos de cada número de la newsletter: una fila por suscriptor y número aceptado por el proveedor.';
create index if not exists newsletter_deliveries_registration_idx on public.newsletter_deliveries (registration_id);

alter table public.newsletter_deliveries enable row level security;
revoke all on table public.newsletter_deliveries from anon, authenticated;
grant select on table public.newsletter_deliveries to authenticated;
create policy newsletter_deliveries_admin_select on public.newsletter_deliveries
for select to authenticated
using (exists (select 1 from public.admin_users where admin_users.user_id = (select auth.uid())));

create table if not exists public.contact_messages (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(btrim(name)) between 1 and 160),
  email text not null check (char_length(email) between 5 and 320 and position('@' in email) > 1),
  message text not null check (char_length(btrim(message)) between 1 and 5000),
  locale text check (locale is null or locale in ('de', 'es', 'ca', 'fr', 'en', 'it')),
  created_at timestamptz not null default now(),
  notified_at timestamptz,
  replied_at timestamptz
);
comment on table public.contact_messages is 'Mensajes del formulario de contacto de la web. Se insertan solo desde la API del servidor.';
create index if not exists contact_messages_email_created_idx on public.contact_messages (lower(email), created_at desc);

alter table public.contact_messages enable row level security;
revoke all on table public.contact_messages from anon, authenticated;
grant select, delete on table public.contact_messages to authenticated;
create policy contact_messages_admin_select on public.contact_messages
for select to authenticated
using (exists (select 1 from public.admin_users where admin_users.user_id = (select auth.uid())));
create policy contact_messages_admin_delete on public.contact_messages
for delete to authenticated
using (exists (select 1 from public.admin_users where admin_users.user_id = (select auth.uid())));
