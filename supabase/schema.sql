-- Northern Oasis Camping: bookings database (Supabase / Postgres).
-- Run this once in Supabase -> SQL Editor -> New query. It is safe to run again.
--
-- The website's server functions (api/) call the functions at the bottom with
-- the service role key. Nothing here is readable from the browser.

-- One row per booking. A booking starts as 'held' while the guest pays on
-- Stripe, becomes 'confirmed' when Stripe says the payment went through, and
-- 'expired' if the guest never pays. Hosts can set 'cancelled' by hand.
create table if not exists bookings (
  id               uuid primary key default gen_random_uuid(),
  created_at       timestamptz not null default now(),
  status           text not null default 'held'
                   check (status in ('held', 'confirmed', 'expired', 'cancelled')),
  hold_expires_at  timestamptz,
  arrive           date not null,
  depart           date not null,
  sites            int  not null check (sites > 0),
  guests           int  not null check (guests > 0),
  hookups          int  not null default 0 check (hookups >= 0),
  extras           jsonb not null default '[]'::jsonb,
  total_cents      int  not null,
  name             text not null,
  email            text not null,
  phone            text,
  note             text,
  stripe_session_id text unique,
  paid_at          timestamptz,
  check (depart > arrive)
);

create index if not exists bookings_dates on bookings (arrive, depart);

-- Nights the hosts close by hand, e.g. sites sold on Hipcamp or a family
-- weekend. Add a row in Supabase -> Table Editor -> blocked_nights.
-- `sites` is how many of the 5 sites are taken that night.
create table if not exists blocked_nights (
  night  date primary key,
  sites  int  not null default 5 check (sites >= 0),
  note   text
);

alter table bookings enable row level security;
alter table blocked_nights enable row level security;

-- Sites and electric hookups in use on each night from p_from up to (not
-- including) p_to. Counts confirmed bookings, unexpired holds and blocks.
create or replace function night_usage(p_from date, p_to date)
returns table (night date, sites_used int, hookups_used int)
language sql stable as $$
  select d::date as night,
         (coalesce(sum(b.sites), 0) + coalesce(max(x.sites), 0))::int as sites_used,
         coalesce(sum(b.hookups), 0)::int as hookups_used
  from generate_series(p_from, p_to - 1, interval '1 day') as d
  left join bookings b
    on b.arrive <= d::date and b.depart > d::date
   and (b.status = 'confirmed' or (b.status = 'held' and b.hold_expires_at > now()))
  left join blocked_nights x on x.night = d::date
  group by d
  order by d
$$;

-- Holds sites for a new booking if every night has room, all in one step so
-- two guests paying at once can never both get the last site. Returns the new
-- booking id, or raises 'sold_out' / 'hookups_sold_out'.
create or replace function hold_booking(
  p_arrive date, p_depart date, p_sites int, p_guests int, p_hookups int,
  p_extras jsonb, p_total_cents int, p_name text, p_email text, p_phone text, p_note text,
  p_capacity int, p_hookup_capacity int, p_hold_minutes int
) returns uuid
language plpgsql as $$
declare
  v_id uuid;
begin
  -- One booking is checked at a time.
  perform pg_advisory_xact_lock(4242);

  if exists (select 1 from night_usage(p_arrive, p_depart) u where u.sites_used + p_sites > p_capacity) then
    raise exception 'sold_out';
  end if;
  if p_hookups > 0 and exists (
    select 1 from night_usage(p_arrive, p_depart) u where u.hookups_used + p_hookups > p_hookup_capacity
  ) then
    raise exception 'hookups_sold_out';
  end if;

  insert into bookings (status, hold_expires_at, arrive, depart, sites, guests, hookups, extras,
                        total_cents, name, email, phone, note)
  values ('held', now() + make_interval(mins => p_hold_minutes), p_arrive, p_depart, p_sites, p_guests,
          p_hookups, p_extras, p_total_cents, p_name, p_email, p_phone, p_note)
  returning id into v_id;
  return v_id;
end
$$;

-- Marks a booking paid. Returns the booking only the first time, so the
-- confirmation emails go out once even if Stripe sends the event twice.
create or replace function confirm_booking(p_id uuid, p_session_id text)
returns setof bookings
language sql as $$
  update bookings
     set status = 'confirmed', paid_at = now(), hold_expires_at = null,
         stripe_session_id = coalesce(stripe_session_id, p_session_id)
   where id = p_id and status in ('held', 'expired')
  returning *
$$;

-- Frees the sites of a booking whose Stripe payment page expired unpaid.
create or replace function expire_booking(p_id uuid)
returns void
language sql as $$
  update bookings set status = 'expired' where id = p_id and status = 'held'
$$;

-- Only the website's server (service role) may call these. Supabase exposes
-- functions in the public schema to the browser roles unless told otherwise.
do $$
declare f text;
begin
  if exists (select 1 from pg_roles where rolname = 'service_role') then
    foreach f in array array[
      'night_usage(date, date)',
      'hold_booking(date, date, int, int, int, jsonb, int, text, text, text, text, int, int, int)',
      'confirm_booking(uuid, text)',
      'expire_booking(uuid)'
    ] loop
      execute format('revoke execute on function %s from public, anon, authenticated', f);
      execute format('grant execute on function %s to service_role', f);
    end loop;
  end if;
end
$$;
