alter table public.registrations
  add column if not exists newsletter_consent boolean not null default false,
  add column if not exists privacy_accepted_at timestamptz,
  add column if not exists subscription_locale text,
  add column if not exists welcome_newsletter_sent_at timestamptz;

alter table public.registrations
  add constraint registrations_subscription_locale_format
  check (subscription_locale is null or subscription_locale in ('de', 'es', 'ca', 'fr', 'en', 'it'));

comment on column public.registrations.newsletter_consent is
  'Consentimiento expreso para recibir la newsletter y comunicaciones del festival.';
comment on column public.registrations.privacy_accepted_at is
  'Instante en el que se aceptó la política de privacidad desde el formulario público.';
comment on column public.registrations.welcome_newsletter_sent_at is
  'Instante en el que se entregó automáticamente la newsletter número 1.';

create table public.newsletter_issues (
  id uuid primary key default gen_random_uuid(),
  issue_number integer not null unique check (issue_number > 0),
  slug text not null unique check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  title text not null check (char_length(btrim(title)) between 1 and 180),
  excerpt text not null default '' check (char_length(excerpt) <= 420),
  content text not null check (char_length(btrim(content)) between 1 and 30000),
  is_published boolean not null default false,
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.newsletter_issues is
  'Números de la newsletter redactados y publicados desde el panel de administración.';

create or replace function public.set_newsletter_issue_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  if new.is_published and (old.is_published is false or new.published_at is null) then
    new.published_at = now();
  elsif new.is_published is false then
    new.published_at = null;
  end if;
  return new;
end;
$$;

create trigger newsletter_issues_set_updated_at
before update on public.newsletter_issues
for each row execute function public.set_newsletter_issue_updated_at();

alter table public.newsletter_issues enable row level security;

revoke all on table public.newsletter_issues from anon, authenticated;
grant select on table public.newsletter_issues to anon, authenticated;
grant insert, update, delete on table public.newsletter_issues to authenticated;

create policy newsletter_issues_public_read
on public.newsletter_issues
for select
to anon, authenticated
using (
  is_published
  or exists (
    select 1 from public.admin_users
    where admin_users.user_id = (select auth.uid())
  )
);

create policy newsletter_issues_admin_insert
on public.newsletter_issues
for insert
to authenticated
with check (
  exists (
    select 1 from public.admin_users
    where admin_users.user_id = (select auth.uid())
  )
);

create policy newsletter_issues_admin_update
on public.newsletter_issues
for update
to authenticated
using (
  exists (
    select 1 from public.admin_users
    where admin_users.user_id = (select auth.uid())
  )
)
with check (
  exists (
    select 1 from public.admin_users
    where admin_users.user_id = (select auth.uid())
  )
);

create policy newsletter_issues_admin_delete
on public.newsletter_issues
for delete
to authenticated
using (
  exists (
    select 1 from public.admin_users
    where admin_users.user_id = (select auth.uid())
  )
);

create index newsletter_issues_publication_idx
  on public.newsletter_issues (is_published, published_at desc);
