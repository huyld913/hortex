-- ============================================================
-- Hortex: Initial Schema
-- Personal productivity platform
-- ============================================================

-- Enable UUID generation
create extension if not exists "uuid-ossp";

-- ============================================================
-- PROFILES (extends Supabase auth.users)
-- ============================================================
create table public.profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  display_name text not null default '',
  avatar_url  text,
  timezone    text not null default 'Asia/Ho_Chi_Minh',
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, display_name)
  values (new.id, coalesce(new.raw_user_meta_data->>'display_name', new.email));
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ============================================================
-- PROJECTS
-- ============================================================
create type project_status as enum ('active', 'paused', 'completed', 'archived');

create table public.projects (
  id          uuid primary key default uuid_generate_v4(),
  user_id     uuid not null references public.profiles(id) on delete cascade,
  name        text not null,
  description text default '',
  status      project_status not null default 'active',
  color       text default '#6366f1',  -- indigo default
  sort_order  integer not null default 0,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create index idx_projects_user on public.projects(user_id);

-- ============================================================
-- TASKS
-- ============================================================
create type task_status as enum ('todo', 'in_progress', 'done', 'cancelled');
create type task_priority as enum ('p1', 'p2', 'p3', 'p4');  -- p1 = urgent, p4 = low

create table public.tasks (
  id              uuid primary key default uuid_generate_v4(),
  user_id         uuid not null references public.profiles(id) on delete cascade,
  project_id      uuid references public.projects(id) on delete set null,
  parent_task_id  uuid references public.tasks(id) on delete cascade,
  title           text not null,
  description     text default '',
  status          task_status not null default 'todo',
  priority        task_priority not null default 'p3',
  due_date        date,
  tags            text[] default '{}',
  sort_order      integer not null default 0,
  -- Recurring: null = one-off, cron string = recurring template
  recurring_rule  text,
  -- Metadata
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),
  completed_at    timestamptz
);

create index idx_tasks_user on public.tasks(user_id);
create index idx_tasks_project on public.tasks(project_id);
create index idx_tasks_status on public.tasks(user_id, status);
create index idx_tasks_due on public.tasks(user_id, due_date) where due_date is not null;
create index idx_tasks_parent on public.tasks(parent_task_id) where parent_task_id is not null;
create index idx_tasks_tags on public.tasks using gin(tags);

-- Auto-set completed_at
create or replace function public.handle_task_completion()
returns trigger as $$
begin
  if new.status = 'done' and old.status != 'done' then
    new.completed_at = now();
  elsif new.status != 'done' and old.status = 'done' then
    new.completed_at = null;
  end if;
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger on_task_update
  before update on public.tasks
  for each row execute function public.handle_task_completion();

-- ============================================================
-- HABITS
-- ============================================================
create type habit_frequency as enum ('daily', 'weekly', 'weekdays', 'custom');

create table public.habits (
  id            uuid primary key default uuid_generate_v4(),
  user_id       uuid not null references public.profiles(id) on delete cascade,
  name          text not null,
  description   text default '',
  frequency     habit_frequency not null default 'daily',
  -- null target = boolean (did/didn't), number = quantified goal
  target_value  numeric,
  unit          text,  -- 'pages', 'minutes', 'ml', 'km', etc.
  color         text default '#10b981',  -- emerald default
  active        boolean not null default true,
  sort_order    integer not null default 0,
  -- For 'custom' frequency: which days (0=Sun, 6=Sat)
  custom_days   integer[] default '{}',
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create index idx_habits_user on public.habits(user_id);

-- ============================================================
-- HABIT LOGS (daily check-ins)
-- ============================================================
create table public.habit_logs (
  id          uuid primary key default uuid_generate_v4(),
  habit_id    uuid not null references public.habits(id) on delete cascade,
  user_id     uuid not null references public.profiles(id) on delete cascade,
  log_date    date not null default current_date,
  value       numeric not null default 1,  -- 1 for boolean habits, actual value for quantified
  note        text default '',
  created_at  timestamptz not null default now(),
  -- One log per habit per day
  unique(habit_id, log_date)
);

create index idx_habit_logs_habit on public.habit_logs(habit_id, log_date);
create index idx_habit_logs_user_date on public.habit_logs(user_id, log_date);

-- ============================================================
-- AI API KEYS (for agent integration)
-- ============================================================
create table public.api_keys (
  id          uuid primary key default uuid_generate_v4(),
  user_id     uuid not null references public.profiles(id) on delete cascade,
  name        text not null default 'default',
  key_hash    text not null,  -- store hashed, never raw
  prefix      text not null,  -- first 8 chars for identification: "ctx_abc1..."
  last_used   timestamptz,
  expires_at  timestamptz,
  created_at  timestamptz not null default now(),
  unique(key_hash)
);

create index idx_api_keys_hash on public.api_keys(key_hash);

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

-- Enable RLS on all tables
alter table public.profiles enable row level security;
alter table public.projects enable row level security;
alter table public.tasks enable row level security;
alter table public.habits enable row level security;
alter table public.habit_logs enable row level security;
alter table public.api_keys enable row level security;

-- Profiles: users can only see/edit their own
create policy "Users can view own profile"
  on public.profiles for select using (auth.uid() = id);
create policy "Users can update own profile"
  on public.profiles for update using (auth.uid() = id);

-- Projects: users can only CRUD their own
create policy "Users can view own projects"
  on public.projects for select using (auth.uid() = user_id);
create policy "Users can insert own projects"
  on public.projects for insert with check (auth.uid() = user_id);
create policy "Users can update own projects"
  on public.projects for update using (auth.uid() = user_id);
create policy "Users can delete own projects"
  on public.projects for delete using (auth.uid() = user_id);

-- Tasks: users can only CRUD their own
create policy "Users can view own tasks"
  on public.tasks for select using (auth.uid() = user_id);
create policy "Users can insert own tasks"
  on public.tasks for insert with check (auth.uid() = user_id);
create policy "Users can update own tasks"
  on public.tasks for update using (auth.uid() = user_id);
create policy "Users can delete own tasks"
  on public.tasks for delete using (auth.uid() = user_id);

-- Habits: users can only CRUD their own
create policy "Users can view own habits"
  on public.habits for select using (auth.uid() = user_id);
create policy "Users can insert own habits"
  on public.habits for insert with check (auth.uid() = user_id);
create policy "Users can update own habits"
  on public.habits for update using (auth.uid() = user_id);
create policy "Users can delete own habits"
  on public.habits for delete using (auth.uid() = user_id);

-- Habit Logs: users can only CRUD their own
create policy "Users can view own habit logs"
  on public.habit_logs for select using (auth.uid() = user_id);
create policy "Users can insert own habit logs"
  on public.habit_logs for insert with check (auth.uid() = user_id);
create policy "Users can update own habit logs"
  on public.habit_logs for update using (auth.uid() = user_id);
create policy "Users can delete own habit logs"
  on public.habit_logs for delete using (auth.uid() = user_id);

-- API Keys: users can only manage their own
create policy "Users can view own api keys"
  on public.api_keys for select using (auth.uid() = user_id);
create policy "Users can insert own api keys"
  on public.api_keys for insert with check (auth.uid() = user_id);
create policy "Users can delete own api keys"
  on public.api_keys for delete using (auth.uid() = user_id);

-- ============================================================
-- UPDATED_AT TRIGGER (generic)
-- ============================================================
create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger set_updated_at before update on public.profiles
  for each row execute function public.set_updated_at();
create trigger set_updated_at before update on public.projects
  for each row execute function public.set_updated_at();
create trigger set_updated_at before update on public.habits
  for each row execute function public.set_updated_at();
