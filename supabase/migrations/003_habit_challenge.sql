-- ============================================================
-- Add "challenge" frequency + challenge_days to habits.
-- Run this in the Supabase SQL Editor.
-- ============================================================

alter type habit_frequency add value 'challenge';

alter table public.habits
  add column challenge_days integer check (challenge_days > 0);
