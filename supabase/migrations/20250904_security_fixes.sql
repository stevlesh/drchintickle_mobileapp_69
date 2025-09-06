-- ================================================
-- SECURITY FIXES MIGRATION
-- Generated: 2025-09-04
-- Purpose: Enable RLS on workouts, convert RPCs to param-less with auth.uid()
-- ================================================

-- === RLS on workouts ===
alter table if exists public.workouts enable row level security;

revoke all on table public.workouts from public, anon;
grant select, insert, update, delete on table public.workouts to authenticated;

do $$
begin
  if not exists (
    select 1 from pg_policies 
    where schemaname = 'public' 
    and tablename = 'workouts' 
    and policyname = 'workouts_rw'
  ) then
    create policy workouts_rw on public.workouts
    for all
    to authenticated
    using (user_id = auth.uid())
    with check (user_id = auth.uid());
  end if;
end$$;

-- === Handle new users: seed "unknown" properly ===
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (
    id, current_max_pullups, current_workout_in_cycle,
    has_completed_onboarding, can_do_eight_pullups
  )
  values (new.id, 0, 1, false, null)
  on conflict (id) do nothing;
  return new;
end;
$$;

-- Ensure trigger exists on auth.users (idempotent)
do $$
begin
  if not exists (
    select 1 from pg_trigger t
    join pg_class c on c.oid = t.tgrelid
    join pg_namespace n on n.oid = c.relnamespace
    where t.tgname = 'on_auth_user_created' 
    and n.nspname = 'auth' 
    and c.relname = 'users'
  ) then
    create trigger on_auth_user_created
    after insert on auth.users
    for each row execute function public.handle_new_user();
  end if;
end$$;

-- ================================================
-- PARAM-LESS RPCs WITH auth.uid()
-- ================================================

-- === complete_workout (canonical version) ===
create or replace function public.complete_workout()
returns table(cycle_num int, workout_num int)
language plpgsql
security definer
set search_path = public
as $$
declare
  uid uuid := auth.uid();
  cur_cycle int;
  cur_workout int;
begin
  if uid is null then
    raise exception 'unauthenticated';
  end if;

  -- Lock the caller's profile row
  select p.cycle_num, p.current_workout_in_cycle
    into cur_cycle, cur_workout
  from public.profiles p
  where p.id = uid
  for update;

  if cur_workout >= 8 then
    update public.profiles as p
      set cycle_num = cur_cycle + 1,
          current_workout_in_cycle = 1,
          updated_at = now()
      where p.id = uid
      returning p.cycle_num, p.current_workout_in_cycle
        into cycle_num, workout_num;
  else
    update public.profiles as p
      set current_workout_in_cycle = cur_workout + 1,
          updated_at = now()
      where p.id = uid
      returning p.cycle_num, p.current_workout_in_cycle
        into cycle_num, workout_num;
  end if;

  return next;
end;
$$;

revoke all on function public.complete_workout() from public, anon;
grant execute on function public.complete_workout() to authenticated;

-- TODO(REMOVE BY: 2025-09-11): Drop legacy signature after clients are on param-less version.
-- Legacy shim for one release: forbid impersonation, call the new function.
create or replace function public.complete_workout(_user_id uuid)
returns table(cycle_num int, workout_num int)
language plpgsql
security definer
set search_path = public
as $$
begin
  if _user_id is distinct from auth.uid() then
    raise exception 'forbidden';
  end if;
  return query select * from public.complete_workout();
end;
$$;

revoke all on function public.complete_workout(uuid) from public, anon;
grant execute on function public.complete_workout(uuid) to authenticated;

-- === get_user_app_state (canonical version) ===
create or replace function public.get_user_app_state()
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  uid uuid := auth.uid();
  user_record record;
  profile_record record;
  result jsonb;
begin
  if uid is null then 
    raise exception 'unauthenticated'; 
  end if;

  select email_confirmed_at is not null as email_confirmed
    into user_record 
  from auth.users 
  where id = uid;

  select has_completed_onboarding, can_do_eight_pullups,
         onboarding_completed_at, current_workout_in_cycle
    into profile_record 
  from public.profiles 
  where id = uid;

  result := jsonb_build_object(
    'email_confirmed', coalesce(user_record.email_confirmed, false),
    'has_profile', profile_record is not null,
    'needs_onboarding', not coalesce(profile_record.has_completed_onboarding, false),
    'can_do_eight_pullups', profile_record.can_do_eight_pullups,
    'current_workout_in_cycle', coalesce(profile_record.current_workout_in_cycle, 1)
  );
  
  return result;
end;
$$;

revoke all on function public.get_user_app_state() from public, anon;
grant execute on function public.get_user_app_state() to authenticated;

-- TODO(REMOVE BY: 2025-09-11): Drop legacy signature after clients are on param-less version.
-- Legacy shim (one release)
create or replace function public.get_user_app_state(user_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
begin
  if user_id is distinct from auth.uid() then
    raise exception 'forbidden';
  end if;
  return public.get_user_app_state();
end;
$$;

revoke all on function public.get_user_app_state(uuid) from public, anon;
grant execute on function public.get_user_app_state(uuid) to authenticated;

-- === get_user_onboarding_status (canonical version) ===
create or replace function public.get_user_onboarding_status()
returns table(needs_onboarding boolean, can_do_eight_pullups boolean, onboarding_completed_at timestamptz)
language plpgsql
security definer
set search_path = public
as $$
declare 
  uid uuid := auth.uid();
begin
  if uid is null then 
    raise exception 'unauthenticated'; 
  end if;

  return query
    select not coalesce(p.has_completed_onboarding, false),
           p.can_do_eight_pullups,
           p.onboarding_completed_at
    from public.profiles p
    where p.id = uid;

  if not found then
    return query select true, null::boolean, null::timestamptz;
  end if;
end;
$$;

revoke all on function public.get_user_onboarding_status() from public, anon;
grant execute on function public.get_user_onboarding_status() to authenticated;

-- TODO(REMOVE BY: 2025-09-11): Drop legacy signature after clients are on param-less version.
-- Legacy shim (one release)
create or replace function public.get_user_onboarding_status(user_id uuid)
returns table(needs_onboarding boolean, can_do_eight_pullups boolean, onboarding_completed_at timestamptz)
language plpgsql
security definer
set search_path = public
as $$
begin
  if user_id is distinct from auth.uid() then
    raise exception 'forbidden';
  end if;
  return query select * from public.get_user_onboarding_status();
end;
$$;

revoke all on function public.get_user_onboarding_status(uuid) from public, anon;
grant execute on function public.get_user_onboarding_status(uuid) to authenticated;

-- ================================================
-- OWNERSHIP NORMALIZATION
-- ================================================

-- Best-effort ownership normalization (ignored if not permitted)
do $$
begin
  alter function public.complete_workout() owner to postgres;
  alter function public.complete_workout(uuid) owner to postgres;
  alter function public.get_user_app_state() owner to postgres;
  alter function public.get_user_app_state(uuid) owner to postgres;
  alter function public.get_user_onboarding_status() owner to postgres;
  alter function public.get_user_onboarding_status(uuid) owner to postgres;
  alter function public.handle_new_user() owner to postgres;
exception when insufficient_privilege then
  raise notice 'Skipped owner changes (insufficient privilege).';
end$$;

-- ================================================
-- CLEANUP REMINDER
-- ================================================

-- Shim cleanup reminder (non-blocking)
do $reminder$
begin
  raise notice 'Legacy RPC shims present. Schedule removal by 2025-09-11.';
  raise notice 'Run 20250911_drop_legacy_rpcs.sql on or after that date.';
end
$reminder$;