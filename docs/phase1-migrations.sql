-- Phase 1 stabilization migrations

create table if not exists public.items_ingest_staging (
  id bigserial primary key,
  run_id text not null,
  pack_city text,
  payload jsonb not null,
  ingested_at timestamptz not null default now()
);

create table if not exists public.items_conflict_queue (
  id bigserial primary key,
  left_item_id bigint,
  right_item_id bigint,
  reason text not null,
  confidence numeric(5,2),
  status text not null default 'open',
  created_at timestamptz not null default now()
);

-- Newsletter subscribers
create table if not exists public.newsletter_subscribers (
  id bigserial primary key,
  email text not null unique,
  subscribed_at timestamptz not null default now()
);

-- Booking click tracking (affiliate revenue attribution)
create table if not exists public.booking_clicks (
  id bigserial primary key,
  item_id bigint references public.items_curated(id),
  destination_url text not null,
  referrer text,
  clicked_at timestamptz not null default now()
);
