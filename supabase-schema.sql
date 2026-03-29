-- Run this in the Supabase Dashboard -> SQL Editor

-- companies
create table companies (
  id text primary key default gen_random_uuid()::text,
  name text not null,
  base_currency text not null default 'USD',
  country text not null default 'US',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- teams
create table teams (
  id text primary key default gen_random_uuid()::text,
  company_id text not null references companies(id),
  name text not null,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- users
create table users (
  id text primary key default gen_random_uuid()::text,
  name text,
  email text unique,
  password text,
  role text not null default 'EMPLOYEE',
  company_id text references companies(id),
  team text,
  team_id text references teams(id),
  image text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- expenses
create table expenses (
  id text primary key default gen_random_uuid()::text,
  amount float not null,
  currency text not null,
  converted_amount float not null,
  status text not null default 'PENDING',
  receipt_url text,
  merchant text not null,
  category text not null,
  date date not null,
  description text not null,
  current_approval_step int not null default 0,
  submitted_by text not null references users(id),
  company_id text not null references companies(id),
  submitted_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Phase 4 Extensions
alter table companies add column approval_chain jsonb default '[]'::jsonb;
alter table expenses add column rejection_comment text;
create table if not exists teams (
  id text primary key default gen_random_uuid()::text,
  company_id text not null references companies(id),
  name text not null,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
alter table users add column if not exists team text;
alter table users add column if not exists team_id text references teams(id);
create unique index if not exists teams_company_name_unique_idx on teams(company_id, lower(name));
create index if not exists users_company_team_idx on users(company_id, team);
create index if not exists users_company_team_id_idx on users(company_id, team_id);

insert into teams (company_id, name)
select distinct company_id, trim(team)
from users
where company_id is not null and team is not null and trim(team) <> ''
on conflict do nothing;

update users
set team_id = teams.id
from teams
where users.company_id = teams.company_id
  and users.team is not null
  and trim(users.team) <> ''
  and lower(trim(users.team)) = lower(teams.name)
  and users.team_id is null;
