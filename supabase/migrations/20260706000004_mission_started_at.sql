-- Track how long a mission took: started_at is stamped when the student
-- first opens the mission (MissionPage inserts the in_progress row);
-- duration = passed_at - started_at.

alter table public.mission_progress
    add column started_at timestamptz default now();

-- Rows created before this migration have no real start time: adding a
-- column with a default backfills them with the migration timestamp,
-- which would produce bogus (even negative) durations. Null them out;
-- the dashboard shows '—' for unknown durations.
update public.mission_progress set started_at = null;
