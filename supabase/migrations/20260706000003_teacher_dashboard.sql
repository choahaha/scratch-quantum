-- Teacher dashboard: admins (users.role = 'admin') can read every student's
-- mission progress and profile. Uses a security-definer helper to avoid
-- recursive RLS when the users policy checks the users table itself.

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
    select exists (
        select 1 from public.users
        where id = auth.uid() and role = 'admin'
    );
$$;

create policy progress_read_admin on public.mission_progress
    for select to authenticated using (public.is_admin());

create policy users_read_admin on public.users
    for select to authenticated using (public.is_admin());

-- Live updates for the dashboard (no-op if already added)
do $$
begin
    alter publication supabase_realtime add table public.mission_progress;
exception when duplicate_object then
    null;
end $$;
