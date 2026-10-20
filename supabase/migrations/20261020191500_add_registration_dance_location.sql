alter table public.registrations
  add column dance_location text;

alter table public.registrations
  add constraint registrations_dance_location_length_check
  check (
    dance_location is null
    or char_length(btrim(dance_location)) between 1 and 180
  );

comment on column public.registrations.dance_location is
  'Lugar, sala, escuela, asociación o ciudad donde la persona suele bailar.';
