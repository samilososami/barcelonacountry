alter table public.registrations
  add column if not exists country_iso text;

do $$
begin
  alter table public.registrations
    add constraint registrations_country_iso_format
    check (country_iso is null or country_iso ~ '^[A-Z]{2}$');
exception
  when duplicate_object then null;
end $$;

with normalized_phones as (
  select
    id,
    regexp_replace(phone, '[[:space:]().-]', '', 'g') as normalized_phone
  from public.registrations
)
update public.registrations as registrations
set country_iso = case
  when normalized_phones.normalized_phone like '+376%' then 'AD'
  when normalized_phones.normalized_phone like '+353%' then 'IE'
  when normalized_phones.normalized_phone like '+351%' then 'PT'
  when normalized_phones.normalized_phone like '+598%' then 'UY'
  when normalized_phones.normalized_phone like '+34%' then 'ES'
  when normalized_phones.normalized_phone like '+49%' then 'DE'
  when normalized_phones.normalized_phone like '+54%' then 'AR'
  when normalized_phones.normalized_phone like '+32%' then 'BE'
  when normalized_phones.normalized_phone like '+55%' then 'BR'
  when normalized_phones.normalized_phone like '+56%' then 'CL'
  when normalized_phones.normalized_phone like '+57%' then 'CO'
  when normalized_phones.normalized_phone like '+33%' then 'FR'
  when normalized_phones.normalized_phone like '+39%' then 'IT'
  when normalized_phones.normalized_phone like '+52%' then 'MX'
  when normalized_phones.normalized_phone like '+31%' then 'NL'
  when normalized_phones.normalized_phone like '+44%' then 'GB'
  when normalized_phones.normalized_phone like '+41%' then 'CH'
  -- El prefijo +1 se mostraba como Estados Unidos antes de guardar country_iso.
  -- Los nuevos registros conservan la elección explícita entre Estados Unidos y Canadá.
  when normalized_phones.normalized_phone like '+1%' then 'US'
  else null
end
from normalized_phones
where registrations.id = normalized_phones.id
  and registrations.country_iso is null;

create index if not exists registrations_country_iso_idx
  on public.registrations (country_iso);

comment on column public.registrations.country_iso is
  'ISO 3166-1 alpha-2 country selected with the phone prefix. Historical records are derived from their prefix when possible.';
