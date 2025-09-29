-- Fix max_test RPC with clean contract, proper concurrency, and idempotency
-- Based on ChatGPT's comprehensive approach

-- 0) Ensure extension exists
create extension if not exists pgcrypto; -- for gen_random_uuid()

-- 1) Schema (additive, matches the client)
-- workout_sessions: add idempotency + duration
alter table public.workout_sessions
  add column if not exists session_key uuid,
  add column if not exists duration_sec integer;

-- unique key for idempotent upserts
do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'workout_sessions_session_key_key'
  ) then
    alter table public.workout_sessions
      add constraint workout_sessions_session_key_key unique (session_key);
  end if;
end $$;

-- audit log for max tests
create table if not exists public.max_test_events (
  id uuid primary key default gen_random_uuid(),
  session_key uuid not null,
  user_id uuid not null references public.profiles(id),
  prev_max int,
  new_max int not null,
  reps int not null,
  occurred_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  unique (session_key)
);

-- Enable RLS on max_test_events
alter table public.max_test_events enable row level security;

-- RLS policy for max_test_events (create if not exists)
do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'max_test_events'
      and policyname = 'Users can access their own max test events'
  ) then
    create policy "Users can access their own max test events"
    on public.max_test_events for all to authenticated
    using (auth.uid() = user_id);
  end if;
end $$;

-- Grant access to max_test_events
grant all on public.max_test_events to authenticated;

-- 2) Drop existing function and recreate with new signature
drop function if exists public.record_max_test_and_progress(int, int, timestamptz, uuid, jsonb);

-- RPC replacement (keep signature/returns exactly as the client calls)
create or replace function public.record_max_test_and_progress(
  p_reps         int,
  p_duration_sec int,
  p_occurred_at  timestamptz,
  p_session_key  uuid,
  p_sets_data    jsonb
)
returns table (
  prev_max integer,
  prev_date timestamptz,
  new_max integer,
  delta integer,
  is_baseline boolean,
  occurred_at timestamptz,
  next_workout_num integer,
  next_cycle_num integer
)
language plpgsql
security definer
set search_path = public
as $$
declare
  uid uuid := auth.uid();
  v_prev_max int;
  v_prev_date timestamptz;
  v_new_max  int;
  v_next_cycle int;
  v_next_workout int;
  v_event_date timestamptz;
  v_delta int;
begin
  if uid is null then
    raise exception 'unauthenticated';
  end if;

  -- Validate input
  if p_reps is null or p_reps <= 0 then
    raise exception 'invalid reps: %', p_reps;
  end if;

  -- Strict serialization for this user (blocking lock)
  perform pg_advisory_xact_lock(hashtext('max_test:' || uid::text));

  -- Set event date
  v_event_date := coalesce(p_occurred_at, now());

  -- Lock the profile row we mutate and get previous max
  select current_max_pullups
    into v_prev_max
    from profiles
   where id = uid
   for update;

  -- Deterministic compute (no tri-state)
  v_new_max := greatest(coalesce(v_prev_max, 0), p_reps);

  -- Idempotent session write keyed by session_key
  insert into workout_sessions (
    id, user_id, workout_type, session_key, completed_reps,
    sets_data, duration_sec, duration_minutes, workout_date, created_at
  )
  values (
    gen_random_uuid(), uid, 'max_test', p_session_key, p_reps,
    p_sets_data, p_duration_sec,
    case when p_duration_sec is not null then round(p_duration_sec::numeric / 60) else null end,
    v_event_date, now()
  )
  on conflict (session_key) do update
    set completed_reps = excluded.completed_reps,
        sets_data      = excluded.sets_data,
        duration_sec   = excluded.duration_sec,
        duration_minutes = excluded.duration_minutes,
        workout_date   = excluded.workout_date;

  -- Get previous max date (strictly before this session's date)
  select completed_reps, workout_date
    into v_prev_max, v_prev_date
  from workout_sessions
  where user_id = uid
    and workout_type = 'max_test'
    and workout_date < v_event_date
  order by workout_date desc
  limit 1;

  -- Recalculate v_new_max after getting actual previous
  v_new_max := greatest(coalesce(v_prev_max, 0), p_reps);

  -- Calculate delta
  v_delta := case
    when v_prev_max is null then v_new_max
    else v_new_max - v_prev_max
  end;

  -- Update profile only upward; seed cycle_start_max if empty
  update profiles
     set current_max_pullups = greatest(coalesce(current_max_pullups, 0), v_new_max),
         cycle_start_max = greatest(
           coalesce(cycle_start_max, 0),
           v_new_max
         ),
         updated_at = now()
   where id = uid;

  -- Advance progression (existing business rule)
  update profiles
  set
    current_workout_in_cycle = case
      when current_workout_in_cycle >= 8 then 1  -- Reset to 1 after workout 8
      else coalesce(current_workout_in_cycle, 1) + 1
    end,
    cycle_num = case
      when current_workout_in_cycle >= 8 then coalesce(cycle_num, 1) + 1
      else coalesce(cycle_num, 1)
    end
  where id = uid;

  -- Get updated workout/cycle numbers
  select current_workout_in_cycle, cycle_num
    into v_next_workout, v_next_cycle
  from profiles
  where id = uid;

  -- Idempotent event log
  insert into max_test_events (session_key, user_id, prev_max, new_max, reps, occurred_at)
  values (p_session_key, uid, v_prev_max, v_new_max, p_reps, v_event_date)
  on conflict (session_key) do nothing;

  -- Log for observability
  raise log 'MAX TEST: user=%, new_max=%, prev_max=%, delta=%, session=%',
    uid, v_new_max, v_prev_max, v_delta, p_session_key;

  -- Return the payload the client consumes (exact same shape)
  return query
  select
    v_prev_max,
    v_prev_date,
    v_new_max,
    v_delta,
    (v_prev_max is null),
    v_event_date,
    v_next_workout,
    v_next_cycle;
end $$;

-- Grant execute permission
grant execute on function public.record_max_test_and_progress(int, int, timestamptz, uuid, jsonb)
to authenticated;