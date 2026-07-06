-- Mission platform schema: chapters > missions (sequential), per-user progress.
-- Progress writes (grading results) happen only through the backend with the
-- service role key; students can only mark a mission as started.

create table public.chapters (
    id bigint generated always as identity primary key,
    title text not null,
    order_index int not null unique,
    created_at timestamptz not null default now()
);

create table public.missions (
    id bigint generated always as identity primary key,
    chapter_id bigint not null references public.chapters (id) on delete cascade,
    order_index int not null,
    title text not null,
    description text not null default '',
    starter_project jsonb,
    grading_spec jsonb not null,
    created_at timestamptz not null default now(),
    unique (chapter_id, order_index)
);

create table public.mission_progress (
    user_id uuid not null references auth.users (id) on delete cascade,
    mission_id bigint not null references public.missions (id) on delete cascade,
    status text not null default 'in_progress'
        check (status in ('in_progress', 'passed')),
    attempts int not null default 0,
    last_result jsonb,
    passed_at timestamptz,
    updated_at timestamptz not null default now(),
    primary key (user_id, mission_id)
);

alter table public.chapters enable row level security;
alter table public.missions enable row level security;
alter table public.mission_progress enable row level security;

create policy chapters_read on public.chapters
    for select to authenticated using (true);

create policy missions_read on public.missions
    for select to authenticated using (true);

create policy progress_read_own on public.mission_progress
    for select to authenticated using (auth.uid() = user_id);

-- Students may only record that they started a mission; 'passed' is
-- unreachable from the client (no update/delete policies either).
create policy progress_start_own on public.mission_progress
    for insert to authenticated
    with check (auth.uid() = user_id and status = 'in_progress');

-- Atomic submission recording, called by the grading backend (service role).
-- Once passed, a mission stays passed regardless of later failed attempts.
create function public.record_submission(
    p_user_id uuid,
    p_mission_id bigint,
    p_passed boolean,
    p_result jsonb
) returns void
language sql
as $$
    insert into public.mission_progress
        (user_id, mission_id, status, attempts, last_result, passed_at, updated_at)
    values
        (p_user_id, p_mission_id,
         case when p_passed then 'passed' else 'in_progress' end,
         1, p_result, case when p_passed then now() end, now())
    on conflict (user_id, mission_id) do update set
        attempts    = public.mission_progress.attempts + 1,
        status      = case when p_passed or public.mission_progress.status = 'passed'
                           then 'passed' else 'in_progress' end,
        last_result = excluded.last_result,
        passed_at   = coalesce(public.mission_progress.passed_at, excluded.passed_at),
        updated_at  = now();
$$;

revoke execute on function public.record_submission from public, anon, authenticated;
