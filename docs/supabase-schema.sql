-- BestInSeattle v1 schema
-- Run in Supabase SQL editor

create table if not exists public.items_curated (
  id bigserial primary key,
  item_type text not null check (item_type in ('event', 'restaurant', 'place')),
  title text not null,
  summary text,
  source text,
  zone text,
  category text,
  score numeric(5,2),
  sponsored boolean not null default false,
  status text not null default 'pending' check (status in ('pending', 'approved', 'published', 'rejected')),
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_items_curated_status on public.items_curated(status);
create index if not exists idx_items_curated_type on public.items_curated(item_type);
create index if not exists idx_items_curated_zone on public.items_curated(zone);

create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists trg_items_curated_updated_at on public.items_curated;
create trigger trg_items_curated_updated_at
before update on public.items_curated
for each row execute function public.set_updated_at();

-- Optional RLS (enable later once auth model is ready)
-- alter table public.items_curated enable row level security;
