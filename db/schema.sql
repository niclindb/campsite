-- Northern Oasis Camping: bookings database (Neon Postgres).
-- Run this once in the Neon console -> SQL Editor. It is safe to run again.
--
-- Only the website's server functions (api/) talk to this database, using the
-- DATABASE_URL setting. Nothing here is reachable from the browser.

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

-- Sales tax charged, in cents, already counted in total_cents.
alter table bookings add column if not exists tax_cents int not null default 0;

create index if not exists bookings_dates on bookings (arrive, depart);

-- Nights the hosts close by hand, e.g. sites sold on Hipcamp or a family
-- weekend. Add a row in the Neon console -> Tables -> blocked_nights.
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

-- Rental gear and other limited extras in use on each night from p_from up
-- to (not including) p_to, by name. Each booking's `extras` lists
-- {name, price, qty}; older bookings without qty count as 1.
create or replace function item_usage(p_from date, p_to date)
returns table (night date, item text, used int)
language sql stable as $$
  select d::date as night, e->>'name' as item,
         sum(coalesce((e->>'qty')::int, 1))::int as used
  from generate_series(p_from, p_to - 1, interval '1 day') as d
  join bookings b
    on b.arrive <= d::date and b.depart > d::date
   and (b.status = 'confirmed' or (b.status = 'held' and b.hold_expires_at > now()))
  cross join lateral jsonb_array_elements(b.extras) as e
  group by d, e->>'name'
  order by d
$$;

-- Same as hold_booking above, and also checks limited extras: p_limits maps
-- an extra's name to how many exist (e.g. {"Canoe": 3}). Raises
-- 'item_sold_out:<name>' when one would run out on any night. The older
-- version above stays so the live site keeps working until this one is in use.
create or replace function hold_booking(
  p_arrive date, p_depart date, p_sites int, p_guests int, p_hookups int,
  p_extras jsonb, p_total_cents int, p_name text, p_email text, p_phone text, p_note text,
  p_capacity int, p_hookup_capacity int, p_limits jsonb, p_hold_minutes int
) returns uuid
language plpgsql as $$
declare
  v_id uuid;
  v_item text;
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

  select e->>'name' into v_item
  from jsonb_array_elements(p_extras) as e
  where p_limits ? (e->>'name')
    and coalesce((e->>'qty')::int, 1) + coalesce((
          select max(u.used) from item_usage(p_arrive, p_depart) u where u.item = e->>'name'
        ), 0) > (p_limits->>(e->>'name'))::int
  limit 1;
  if v_item is not null then
    raise exception 'item_sold_out:%', v_item;
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

-- Rate limits for the booking server functions: how many requests one
-- visitor (by IP address) made in the current window, per action.
create table if not exists rate_limits (
  key           text primary key,
  window_start  timestamptz not null default now(),
  hits          int not null default 1
);
alter table rate_limits enable row level security;

-- Counts one request for p_key and returns true while it is within p_limit
-- requests per p_window_seconds. Old rows are cleared as it goes.
create or replace function hit_rate_limit(p_key text, p_limit int, p_window_seconds int)
returns boolean
language plpgsql as $$
declare
  v_hits int;
begin
  delete from rate_limits where window_start < now() - interval '1 day';
  insert into rate_limits as r (key, window_start, hits) values (p_key, now(), 1)
  on conflict (key) do update
    set hits = case when r.window_start < now() - make_interval(secs => p_window_seconds) then 1 else r.hits + 1 end,
        window_start = case when r.window_start < now() - make_interval(secs => p_window_seconds) then now() else r.window_start end
  returning hits into v_hits;
  return v_hits <= p_limit;
end
$$;

-- If this schema is ever loaded into Supabase, which exposes public functions
-- to browser roles, only its service role may call these. On Neon this does nothing.
do $$
declare f text;
begin
  if exists (select 1 from pg_roles where rolname = 'service_role') then
    foreach f in array array[
      'night_usage(date, date)',
      'hold_booking(date, date, int, int, int, jsonb, int, text, text, text, text, int, int, int)',
      'hold_booking(date, date, int, int, int, jsonb, int, text, text, text, text, int, int, jsonb, int)',
      'item_usage(date, date)',
      'confirm_booking(uuid, text)',
      'expire_booking(uuid)',
      'hit_rate_limit(text, int, int)'
    ] loop
      execute format('revoke execute on function %s from public, anon, authenticated', f);
      execute format('grant execute on function %s to service_role', f);
    end loop;
  end if;
end
$$;
