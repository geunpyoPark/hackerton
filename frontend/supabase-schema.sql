create extension if not exists pgcrypto;

create table if not exists profiles (
  id text primary key,
  nickname text not null default 'able_user01',
  user_type text not null default 'wheelchair'
    check (user_type in ('wheelchair', 'stroller', 'elderly', 'crutch')),
  points integer not null default 0,
  level integer not null default 1,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists places (
  id text primary key,
  name text not null,
  station_name text,
  line_name text,
  exit_no text,
  lat double precision not null,
  lng double precision not null,
  has_elevator boolean not null default false,
  has_toilet boolean not null default false,
  has_escalator boolean not null default false,
  has_wheelchair_lift boolean not null default false,
  wheelchair_accessible boolean not null default false,
  slope_level text not null default 'low'
    check (slope_level in ('low', 'medium', 'high')),
  has_stairs boolean not null default false,
  has_curb boolean not null default false,
  source text not null default 'demo',
  public_data boolean not null default false,
  recent_reports_count integer not null default 0,
  last_updated timestamptz not null default now()
);

create table if not exists reports (
  id uuid primary key default gen_random_uuid(),
  place_id text not null references places(id) on delete cascade,
  user_id text not null references profiles(id) on delete cascade,
  issue_type text not null
    check (issue_type in ('elevator_broken', 'stairs', 'curb', 'steep_slope', 'slope', 'construction', 'blocked')),
  description text,
  image_url text,
  lat double precision,
  lng double precision,
  status text not null default 'active',
  verified_count integer not null default 0,
  created_at timestamptz not null default now()
);

alter table profiles enable row level security;
alter table places enable row level security;
alter table reports enable row level security;

drop policy if exists "mvp profiles read" on profiles;
drop policy if exists "mvp profiles upsert" on profiles;
drop policy if exists "mvp places read" on places;
drop policy if exists "mvp reports read" on reports;
drop policy if exists "mvp reports insert" on reports;

create policy "mvp profiles read" on profiles
  for select using (true);

create policy "mvp profiles upsert" on profiles
  for all using (true) with check (true);

create policy "mvp places read" on places
  for select using (true);

create policy "mvp reports read" on reports
  for select using (true);

create policy "mvp reports insert" on reports
  for insert with check (true);

insert into places (
  id, name, station_name, line_name, exit_no, lat, lng,
  has_elevator, has_toilet, has_escalator, has_wheelchair_lift,
  wheelchair_accessible, slope_level, has_stairs, has_curb,
  source, public_data, recent_reports_count, last_updated
) values
  ('gangnam-exit-2', '강남역 2번 출구', '강남역', '2호선', '2', 37.49794, 127.02762,
   false, true, true, false, false, 'medium', true, true, 'public+demo', true, 14, '2026-05-04T09:00:00+09:00'),
  ('gangnam-exit-4', '강남역 4번 출구', '강남역', '2호선', '4', 37.49866, 127.02812,
   true, true, true, false, true, 'low', false, false, 'public+demo', true, 3, '2026-05-05T13:00:00+09:00'),
  ('coex-main', '코엑스 동문', '삼성역', '2호선', '5', 37.51168, 127.05918,
   true, true, true, false, true, 'low', false, false, 'demo', false, 2, '2026-05-03T11:00:00+09:00')
on conflict (id) do update set
  name = excluded.name,
  station_name = excluded.station_name,
  line_name = excluded.line_name,
  exit_no = excluded.exit_no,
  lat = excluded.lat,
  lng = excluded.lng,
  has_elevator = excluded.has_elevator,
  has_toilet = excluded.has_toilet,
  has_escalator = excluded.has_escalator,
  has_wheelchair_lift = excluded.has_wheelchair_lift,
  wheelchair_accessible = excluded.wheelchair_accessible,
  slope_level = excluded.slope_level,
  has_stairs = excluded.has_stairs,
  has_curb = excluded.has_curb,
  source = excluded.source,
  public_data = excluded.public_data,
  recent_reports_count = excluded.recent_reports_count,
  last_updated = excluded.last_updated;
