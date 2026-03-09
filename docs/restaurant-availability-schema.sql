-- BestInSeattle restaurant availability schema

create table if not exists public.restaurants (
  id bigserial primary key,
  name text not null,
  slug text unique,
  city text not null,
  zone text,
  address text,
  lat double precision,
  lng double precision,
  cuisine text,
  price_band text,
  editorial_score numeric(5,2),
  status text not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.restaurant_booking_sources (
  id bigserial primary key,
  restaurant_id bigint not null references public.restaurants(id) on delete cascade,
  provider text not null,
  provider_restaurant_id text,
  booking_url text not null,
  is_primary boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.restaurant_availability_snapshots (
  id bigserial primary key,
  restaurant_id bigint not null references public.restaurants(id) on delete cascade,
  provider text not null,
  party_size int not null,
  target_date date not null,
  time_window_start time not null,
  time_window_end time not null,
  available_slots jsonb not null default '[]'::jsonb,
  slot_count int not null default 0,
  fetched_at timestamptz not null default now()
);

create table if not exists public.restaurant_booking_clicks (
  id bigserial primary key,
  restaurant_id bigint not null references public.restaurants(id) on delete cascade,
  provider text not null,
  surface text not null,
  zone text,
  clicked_at timestamptz not null default now(),
  session_id text
);

create table if not exists public.restaurant_waitlist_alerts (
  id bigserial primary key,
  email text not null,
  restaurant_id bigint not null references public.restaurants(id) on delete cascade,
  party_size int not null,
  target_date date not null,
  time_window_start time,
  time_window_end time,
  status text not null default 'active',
  created_at timestamptz not null default now()
);

create index if not exists idx_restaurants_city_zone on public.restaurants(city, zone);
create index if not exists idx_booking_sources_restaurant on public.restaurant_booking_sources(restaurant_id);
create index if not exists idx_availability_restaurant_date on public.restaurant_availability_snapshots(restaurant_id, target_date);
create index if not exists idx_waitlist_restaurant_status on public.restaurant_waitlist_alerts(restaurant_id, status);

create or replace function public.set_updated_at_generic()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists trg_restaurants_updated_at on public.restaurants;
create trigger trg_restaurants_updated_at
before update on public.restaurants
for each row execute function public.set_updated_at_generic();
