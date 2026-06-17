-- Class / User Management: allow admins to delete accounts.
-- Run this in the Supabase SQL editor after 20260617_user_management.sql.
--
-- The Class Management modal's delete button removes a member's profile row
-- (and their saved screens/visualizations). This adds the matching RLS
-- DELETE policies so an admin is allowed to do that.
--
-- NOTE: this deletes the PROFILE row in public.users, not the underlying
-- auth.users login. To also remove the auth account (so the username frees
-- up and can no longer sign in), either delete it in the Supabase dashboard
-- (Authentication → Users) or add a service-role Edge Function. If
-- public.users.id has a foreign key to auth.users(id) with ON DELETE CASCADE,
-- deleting the auth user will also remove the profile automatically.

-- Admins can delete any user profile
drop policy if exists "Admins can delete users" on public.users;
create policy "Admins can delete users"
    on public.users
    for delete
    using (public.is_admin ());

-- Admins can delete student work (so a deleted member's data goes too)
alter table public.student_screens enable row level security;
drop policy if exists "Admins can delete student screens" on public.student_screens;
create policy "Admins can delete student screens"
    on public.student_screens
    for delete
    using (public.is_admin ());

alter table public.student_visualizations enable row level security;
drop policy if exists "Admins can delete student visualizations" on public.student_visualizations;
create policy "Admins can delete student visualizations"
    on public.student_visualizations
    for delete
    using (public.is_admin ());
