-- ============================================================
-- Add due_time to tasks so users can set a specific time
-- alongside the existing due_date (date) column.
-- Run this in the Supabase SQL Editor.
-- ============================================================

alter table public.tasks
  add column due_time time;
