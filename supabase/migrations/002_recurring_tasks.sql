-- ============================================================
-- Add recurring_instance_of to link generated instances back
-- to their recurring task template.
-- Run this in the Supabase SQL Editor.
-- ============================================================

alter table public.tasks
  add column recurring_instance_of uuid
    references public.tasks(id) on delete set null;

create index idx_tasks_recurring_instance on public.tasks(recurring_instance_of)
  where recurring_instance_of is not null;
