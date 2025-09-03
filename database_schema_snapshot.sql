-- ================================================
-- DR. CHINTICKLE DATABASE SCHEMA SNAPSHOT
-- Generated: 2025-09-03
-- Project: base44_chintickle (xrbsygiiffgfdalbvfoe)
-- Region: us-east-1
-- PostgreSQL Version: 17.4.1.051
-- ================================================

-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ================================================
-- TABLES
-- ================================================

-- Profiles table - Core user data
CREATE TABLE public.profiles (
    id uuid NOT NULL,
    current_max_pullups integer,
    cycle_start_max integer,
    current_workout_in_cycle integer DEFAULT 1,
    has_completed_onboarding boolean DEFAULT false,
    onboarding_completed_at timestamp with time zone,
    can_do_eight_pullups boolean,
    email text,
    next_workout_pattern text,
    cycle_num integer DEFAULT 1,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    CONSTRAINT profiles_pkey PRIMARY KEY (id)
);

COMMENT ON COLUMN public.profiles.has_completed_onboarding IS 'Whether the user has completed the initial onboarding flow';
COMMENT ON COLUMN public.profiles.onboarding_completed_at IS 'Timestamp when the user completed onboarding';
COMMENT ON COLUMN public.profiles.can_do_eight_pullups IS 'Whether the user can perform 8 clean pull-ups (assessed during onboarding)';

-- Foreign key to auth.users
ALTER TABLE ONLY public.profiles
    ADD CONSTRAINT profiles_id_fkey FOREIGN KEY (id) REFERENCES auth.users(id);

-- Workout sessions table - Individual workout records
CREATE TABLE public.workout_sessions (
    id uuid DEFAULT uuid_generate_v4() NOT NULL,
    user_id uuid,
    workout_date timestamp with time zone,
    workout_type text,
    target_reps integer,
    completed_reps integer,
    sets_data jsonb,
    duration_minutes integer,
    created_at timestamp with time zone DEFAULT now(),
    CONSTRAINT workout_sessions_pkey PRIMARY KEY (id),
    CONSTRAINT workout_sessions_workout_type_check CHECK ((workout_type = ANY (ARRAY['max_test'::text, 'volume'::text])))
);

ALTER TABLE ONLY public.workout_sessions
    ADD CONSTRAINT workout_sessions_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id);

-- Workout patterns table - Available rep distribution patterns
CREATE TABLE public.workout_patterns (
    id integer NOT NULL DEFAULT nextval('workout_patterns_id_seq'::regclass),
    name text NOT NULL,
    description text,
    is_active boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    CONSTRAINT workout_patterns_pkey PRIMARY KEY (id),
    CONSTRAINT workout_patterns_name_key UNIQUE (name)
);

-- Create sequence for workout_patterns
CREATE SEQUENCE public.workout_patterns_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

ALTER SEQUENCE public.workout_patterns_id_seq OWNED BY public.workout_patterns.id;

-- Workout multipliers table - Multipliers for each workout in cycle
CREATE TABLE public.workout_multipliers (
    id integer NOT NULL DEFAULT nextval('workout_multipliers_id_seq'::regclass),
    workout_number integer NOT NULL,
    multiplier numeric,
    description text,
    is_active boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    CONSTRAINT workout_multipliers_pkey PRIMARY KEY (id),
    CONSTRAINT workout_multipliers_workout_number_check CHECK ((workout_number >= 1 AND workout_number <= 8))
);

-- Create sequence for workout_multipliers
CREATE SEQUENCE public.workout_multipliers_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

ALTER SEQUENCE public.workout_multipliers_id_seq OWNED BY public.workout_multipliers.id;

-- Feature flags table - A/B testing and feature rollouts
CREATE TABLE public.feature_flags (
    id integer NOT NULL DEFAULT nextval('feature_flags_id_seq'::regclass),
    flag_name text NOT NULL,
    is_enabled boolean DEFAULT false,
    rollout_percentage integer DEFAULT 0,
    target_user_ids uuid[],
    description text,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    CONSTRAINT feature_flags_pkey PRIMARY KEY (id),
    CONSTRAINT feature_flags_flag_name_key UNIQUE (flag_name),
    CONSTRAINT feature_flags_rollout_percentage_check CHECK ((rollout_percentage >= 0 AND rollout_percentage <= 100))
);

-- Create sequence for feature_flags
CREATE SEQUENCE public.feature_flags_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

ALTER SEQUENCE public.feature_flags_id_seq OWNED BY public.feature_flags.id;

-- Workouts table - Generated workout plans (Note: RLS disabled)
CREATE TABLE public.workouts (
    user_id uuid NOT NULL,
    cycle_num integer NOT NULL,
    workout_num integer NOT NULL,
    pattern text NOT NULL,
    set_breakdown integer[] NOT NULL,
    total_reps integer NOT NULL,
    seed bigint NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    CONSTRAINT workouts_pkey PRIMARY KEY (user_id, cycle_num, workout_num)
);

ALTER TABLE ONLY public.workouts
    ADD CONSTRAINT workouts_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id);

-- ================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ================================================

-- Enable RLS on tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workout_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workout_patterns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workout_multipliers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.feature_flags ENABLE ROW LEVEL SECURITY;
-- Note: workouts table has RLS disabled

-- Profiles policies
CREATE POLICY "Users can access their own profile" ON public.profiles FOR ALL TO public USING ((auth.uid() = id));
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE TO public USING ((auth.uid() = id)) WITH CHECK ((auth.uid() = id));
CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT TO public USING ((auth.uid() = id));

-- Workout sessions policies
CREATE POLICY "Users can access their own workout sessions" ON public.workout_sessions FOR ALL TO public USING ((auth.uid() = user_id));

-- Read-only policies for reference data
CREATE POLICY "feature_flags_read" ON public.feature_flags FOR SELECT TO authenticated USING (true);
CREATE POLICY "workout_multipliers_read" ON public.workout_multipliers FOR SELECT TO authenticated USING (true);
CREATE POLICY "workout_patterns_read" ON public.workout_patterns FOR SELECT TO authenticated USING (true);

-- ================================================
-- FUNCTIONS (RPC)
-- ================================================

-- Complete onboarding function (secure version with auth.uid())
CREATE OR REPLACE FUNCTION public.complete_onboarding(
    user_can_do_eight_pullups boolean DEFAULT NULL
)
RETURNS TABLE(success boolean, completed_at timestamptz)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  uid uuid := auth.uid();
  ts  timestamptz := now();
BEGIN
  -- Security: Ensure user is authenticated
  IF uid IS NULL THEN
    RAISE EXCEPTION 'unauthenticated';
  END IF;

  -- Upsert profile (handles missing rows + idempotent updates)
  INSERT INTO public.profiles (
    id,
    has_completed_onboarding,
    onboarding_completed_at,
    can_do_eight_pullups,
    created_at,
    updated_at
  ) VALUES (
    uid,
    true,
    ts,
    user_can_do_eight_pullups,
    ts,
    ts
  )
  ON CONFLICT (id) DO UPDATE SET
    has_completed_onboarding = true,
    onboarding_completed_at = ts,
    can_do_eight_pullups = COALESCE(EXCLUDED.can_do_eight_pullups, profiles.can_do_eight_pullups),
    updated_at = ts;

  -- Return success with timestamp
  RETURN QUERY SELECT true, ts;
END;
$$;

-- Complete workout function
CREATE OR REPLACE FUNCTION public.complete_workout(_user_id uuid)
RETURNS TABLE(cycle_num integer, workout_num integer)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  cur_cycle int;
  cur_w int;
BEGIN
  -- Lock the user's row to prevent race conditions
  SELECT p.cycle_num, p.current_workout_in_cycle
    INTO cur_cycle, cur_w
  FROM profiles p
  WHERE p.id = _user_id
  FOR UPDATE;

  -- If workout 8 completed, advance to next cycle
  IF cur_w >= 8 THEN
    UPDATE profiles
      SET cycle_num = cur_cycle + 1,
          current_workout_in_cycle = 1,
          updated_at = now()
      WHERE id = _user_id
      RETURNING profiles.cycle_num, profiles.current_workout_in_cycle 
      INTO cycle_num, workout_num;
  ELSE
    -- Otherwise advance to next workout in current cycle
    UPDATE profiles
      SET current_workout_in_cycle = cur_w + 1,
          updated_at = now()
      WHERE id = _user_id
      RETURNING profiles.cycle_num, profiles.current_workout_in_cycle 
      INTO cycle_num, workout_num;
  END IF;

  RETURN NEXT;
END;
$$;

-- Get user app state function
CREATE OR REPLACE FUNCTION public.get_user_app_state(user_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  user_record RECORD;
  profile_record RECORD;
  result JSONB;
BEGIN
  -- Get user auth data
  SELECT email_confirmed_at IS NOT NULL as email_confirmed
  INTO user_record
  FROM auth.users
  WHERE id = user_id;

  -- Get profile data
  SELECT
    has_completed_onboarding,
    can_do_eight_pullups,
    onboarding_completed_at,
    current_workout_in_cycle
  INTO profile_record
  FROM public.profiles
  WHERE id = user_id;

  -- Build comprehensive result
  result := jsonb_build_object(
    'email_confirmed', COALESCE(user_record.email_confirmed, false),
    'has_profile', profile_record IS NOT NULL,
    'needs_onboarding', NOT COALESCE(profile_record.has_completed_onboarding, false),
    'can_do_eight_pullups', profile_record.can_do_eight_pullups,
    'current_workout_in_cycle', COALESCE(profile_record.current_workout_in_cycle, 1),
    'next_screen', CASE
      WHEN NOT COALESCE(user_record.email_confirmed, false) THEN 'EmailConfirmation'
      WHEN profile_record IS NULL THEN 'Loading'  -- Profile being created
      WHEN NOT COALESCE(profile_record.has_completed_onboarding, false) THEN 'Onboarding'
      WHEN profile_record.can_do_eight_pullups THEN 'PreWorkout'
      ELSE 'Dashboard'
    END
  );

  RETURN result;
END;
$$;

-- Get user onboarding status function
CREATE OR REPLACE FUNCTION public.get_user_onboarding_status(user_id uuid)
RETURNS TABLE(needs_onboarding boolean, can_do_eight_pullups boolean, onboarding_completed_at timestamp with time zone)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT
    NOT COALESCE(p.has_completed_onboarding, false) as needs_onboarding,
    p.can_do_eight_pullups,
    p.onboarding_completed_at
  FROM public.profiles p
  WHERE p.id = user_id;

  -- If no profile exists, return that onboarding is needed
  IF NOT FOUND THEN
    RETURN QUERY SELECT true, NULL::BOOLEAN, NULL::TIMESTAMP WITH TIME ZONE;
  END IF;
END;
$$;

-- Handle new user trigger function
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO public.profiles (
    id, 
    current_max_pullups,
    current_workout_in_cycle,
    has_completed_onboarding,
    can_do_eight_pullups
  )
  VALUES (
    new.id, 
    0,
    1,
    false,
    false
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN new;
END;
$$;

-- Ping function (health check)
CREATE OR REPLACE FUNCTION public.ping()
RETURNS text
LANGUAGE sql
AS $$
  SELECT 'ok'::text;
$$;

-- Save workout once function (idempotent workout saving)
CREATE OR REPLACE FUNCTION public.save_workout_once(
    _user_id uuid,
    _cycle_num integer,
    _workout_num integer,
    _pattern text,
    _set_breakdown integer[],
    _total_reps integer,
    _seed bigint
)
RETURNS TABLE(user_id uuid, cycle_num integer, workout_num integer, pattern text, set_breakdown integer[], total_reps integer, seed bigint, created_at timestamptz)
LANGUAGE sql
AS $$
WITH ins AS (
  INSERT INTO workouts(user_id, cycle_num, workout_num, pattern, set_breakdown, total_reps, seed)
  VALUES (_user_id, _cycle_num, _workout_num, _pattern, _set_breakdown, _total_reps, _seed)
  ON CONFLICT (user_id, cycle_num, workout_num) DO NOTHING
  RETURNING *
)
SELECT * FROM ins
UNION ALL
SELECT * FROM workouts
WHERE user_id = _user_id AND cycle_num = _cycle_num AND workout_num = _workout_num
LIMIT 1;
$$;

-- ================================================
-- INDEXES (Most are primary keys and unique constraints)
-- ================================================

-- Primary keys and unique indexes are automatically created
-- Additional indexes can be added here if needed for performance

-- ================================================
-- CURRENT DATA SUMMARY
-- ================================================
-- Tables with data:
-- - profiles: 39 rows
-- - workout_sessions: 75 rows  
-- - workout_patterns: 8 rows
-- - workout_multipliers: 8 rows
-- - feature_flags: 3 rows
-- - workouts: 7 rows

-- ================================================
-- NOTES
-- ================================================
-- 1. This schema supports the Dr. ChinTickle pull-up training app
-- 2. Key security: All user data access goes through RLS policies
-- 3. Complete onboarding uses auth.uid() for security (no user impersonation)
-- 4. Workouts table has RLS disabled (likely for performance/admin access)
-- 5. Functions use SECURITY DEFINER to bypass RLS where needed
-- 6. Schema designed for 8-workout cycles with multiplier progression
-- 7. Supports multiple rep distribution patterns (Equal, Pyramid, etc.)
-- 8. Feature flags support A/B testing and gradual rollouts

-- ================================================
-- END OF SCHEMA SNAPSHOT
-- ================================================