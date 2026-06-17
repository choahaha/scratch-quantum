-- Class / User Management feature
-- Run this in the Supabase SQL editor (or via `supabase db push`).
--
-- It does three things:
--   1. Adds a `class_name` column to public.users so each member can be
--      assigned to a class.
--   2. Adds an `is_admin()` helper (SECURITY DEFINER) so RLS policies can
--      check the caller's role WITHOUT recursing into the users table.
--   3. Adds RLS policies letting admins read and update every user row,
--      which is what the Class Management modal needs.

-- 1. New column ---------------------------------------------------------------
alter table public.users
    add column if not exists class_name text;

-- 2. Admin check helper (avoids RLS recursion on public.users) -----------------
create or replace function public.is_admin ()
    returns boolean
    language sql
    security definer
    set search_path = public
    stable
    as $$
    select exists (
        select 1
        from public.users
        where id = auth.uid ()
            and role = 'admin'
    );
$$;

-- 3. Row level security policies ----------------------------------------------
alter table public.users enable row level security;

-- Each user can always read their own profile (keeps login/profile fetch working)
drop policy if exists "Users can view own profile" on public.users;
create policy "Users can view own profile"
    on public.users
    for select
    using (auth.uid () = id);

-- Admins can read every user row (member list)
drop policy if exists "Admins can view all users" on public.users;
create policy "Admins can view all users"
    on public.users
    for select
    using (public.is_admin ());

-- Admins can update any user row (assign role / class)
drop policy if exists "Admins can update all users" on public.users;
create policy "Admins can update all users"
    on public.users
    for update
    using (public.is_admin ())
    with check (public.is_admin ());

-- NOTE: the `role` column should only ever be 'student', 'teacher', or 'admin'.
-- Optionally enforce that with a check constraint:
-- alter table public.users
--     add constraint users_role_check check (role in ('student', 'teacher', 'admin'));
