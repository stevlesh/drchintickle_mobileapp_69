-- ================================================
-- STATS PAGE RPC FUNCTION
-- Generated: 2025-09-20
-- Purpose: Get all stats data for stats page
-- Timezone-aware and performance optimized
-- ================================================

-- Create the stats RPC function with timezone support
CREATE OR REPLACE FUNCTION public.get_stats_data(p_tz text DEFAULT 'America/New_York')
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
DECLARE
  uid uuid := auth.uid();
  result jsonb;
BEGIN
  -- Security: Ensure user is authenticated
  IF uid IS NULL THEN
    RAISE EXCEPTION 'unauthenticated';
  END IF;

  WITH
  -- Get max test history (using correct column names)
  max_tests AS (
    SELECT
      ROW_NUMBER() OVER (ORDER BY workout_date) as test_number,
      workout_date::date as test_date,
      completed_reps as pullups
    FROM workout_sessions
    WHERE user_id = uid
      AND workout_type = 'max_test'
      AND completed_reps IS NOT NULL
  ),

  -- Get first workout date for days calculation (timezone-aware)
  first_workout AS (
    SELECT MIN(workout_date::date) as start_date
    FROM workout_sessions
    WHERE user_id = uid
  ),

  -- Calculate training consistency (timezone-corrected)
  training_stats AS (
    SELECT
      COALESCE(
        DATE_PART('day', (now() AT TIME ZONE p_tz)::date - fw.start_date)::int + 1,
        0
      ) as total_days,
      COUNT(DISTINCT ws.workout_date::date) as completed_days
    FROM first_workout fw
    LEFT JOIN workout_sessions ws ON ws.user_id = uid
    GROUP BY fw.start_date
  ),

  -- Get current cycle info from profiles (existing data)
  cycle_info AS (
    SELECT
      cycle_num,
      current_workout_in_cycle
    FROM profiles
    WHERE id = uid
  )

  SELECT jsonb_build_object(
    'max_test_history', COALESCE(
      (SELECT jsonb_agg(
        jsonb_build_object(
          'test_number', test_number,
          'pullups', pullups,
          'date', to_char(test_date, 'YYYY-MM-DD')
        ) ORDER BY test_number
      ) FROM max_tests), '[]'::jsonb
    ),
    'current_cycle', (
      SELECT jsonb_build_object(
        'cycle_num', COALESCE(cycle_num, 1),
        'workout_num', COALESCE(current_workout_in_cycle, 1),
        'total_workouts', 8
      ) FROM cycle_info
    ),
    'days_since_start', COALESCE((SELECT total_days FROM training_stats), 0),
    'training_consistency', (
      SELECT jsonb_build_object(
        'completion_rate', CASE
          WHEN total_days = 0 THEN 0
          ELSE ROUND(100.0 * completed_days / total_days)::int
        END,
        'completed_days', completed_days,
        'total_days', total_days
      ) FROM training_stats
    )
  ) INTO result;

  RETURN result;
END;
$$;

-- Add performance indexes
CREATE INDEX IF NOT EXISTS workout_sessions_user_date_idx
ON workout_sessions(user_id, workout_date);

CREATE INDEX IF NOT EXISTS workout_sessions_user_type_date_idx
ON workout_sessions(user_id, workout_type, workout_date);

-- Add comment for documentation
COMMENT ON FUNCTION public.get_stats_data(text) IS 'Get all stats data for stats page with timezone support';