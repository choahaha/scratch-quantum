-- FIX: student green-flag saves stopped working.
--
-- 20260617_user_management_delete.sql ran `enable row level security` on
-- student_screens / student_visualizations but only added a DELETE policy.
-- Reads kept working (a permissive SELECT policy was already present), but with
-- RLS on and no INSERT policy, students could no longer save their screens.
--
-- This adds the missing INSERT policy (students may insert rows for themselves)
-- and an explicit SELECT policy (own rows, or admins see all). Run in the
-- Supabase SQL editor.

-- ---- student_screens ----
alter table public.student_screens enable row level security;

-- NOTE: user_id is a text column, so cast auth.uid() (uuid) to text.
drop policy if exists "Students insert own screens" on public.student_screens;
create policy "Students insert own screens"
    on public.student_screens
    for insert
    with check (auth.uid ()::text = user_id::text);

drop policy if exists "Read own or admin screens" on public.student_screens;
create policy "Read own or admin screens"
    on public.student_screens
    for select
    using (public.is_admin () or auth.uid ()::text = user_id::text);

-- ---- student_visualizations ----
alter table public.student_visualizations enable row level security;

drop policy if exists "Students insert own visualizations" on public.student_visualizations;
create policy "Students insert own visualizations"
    on public.student_visualizations
    for insert
    with check (auth.uid ()::text = user_id::text);

drop policy if exists "Read own or admin visualizations" on public.student_visualizations;
create policy "Read own or admin visualizations"
    on public.student_visualizations
    for select
    using (public.is_admin () or auth.uid ()::text = user_id::text);
