create table public.registrations (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  phone text not null,
  email text not null,
  created_at timestamptz not null default now(),
  constraint registrations_full_name_length check (char_length(btrim(full_name)) between 1 and 160),
  constraint registrations_phone_length check (char_length(btrim(phone)) between 5 and 40),
  constraint registrations_email_format check (
    char_length(btrim(email)) between 5 and 320
    and position('@' in email) > 1
  )
);

comment on table public.registrations is
  'People registered through the Barcelona Country information form or the admin dashboard.';
comment on column public.registrations.created_at is
  'Exact registration timestamp stored with timezone.';

create unique index registrations_email_unique_idx
  on public.registrations (lower(btrim(email)));
create index registrations_created_at_idx
  on public.registrations (created_at desc);
create index registrations_full_name_idx
  on public.registrations (lower(full_name));

create table public.admin_users (
  user_id uuid primary key references auth.users(id) on delete cascade,
  email text not null unique,
  created_at timestamptz not null default now()
);

alter table public.registrations enable row level security;
alter table public.admin_users enable row level security;

revoke all on table public.registrations from anon, authenticated;
revoke all on table public.admin_users from anon, authenticated;

grant insert on table public.registrations to anon;
grant select, insert, update, delete on table public.registrations to authenticated;
grant select on table public.admin_users to authenticated;

create policy registrations_public_insert
on public.registrations
for insert
to anon
with check (
  char_length(btrim(full_name)) between 1 and 160
  and char_length(btrim(phone)) between 5 and 40
  and char_length(btrim(email)) between 5 and 320
  and position('@' in email) > 1
);

create policy admin_users_read_own
on public.admin_users
for select
to authenticated
using ((select auth.uid()) = user_id);

create policy registrations_admin_select
on public.registrations
for select
to authenticated
using (
  exists (
    select 1 from public.admin_users
    where admin_users.user_id = (select auth.uid())
  )
);

create policy registrations_admin_insert
on public.registrations
for insert
to authenticated
with check (
  exists (
    select 1 from public.admin_users
    where admin_users.user_id = (select auth.uid())
  )
);

create policy registrations_admin_update
on public.registrations
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

create policy registrations_admin_delete
on public.registrations
for delete
to authenticated
using (
  exists (
    select 1 from public.admin_users
    where admin_users.user_id = (select auth.uid())
  )
);
