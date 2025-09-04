-- ================================================
-- DROP LEGACY RPC SIGNATURES
-- Scheduled: 2025-09-11
-- Purpose: Remove legacy RPC shims after client migration complete
-- ================================================

-- Drop legacy function signatures that accept user_id parameters
drop function if exists public.complete_workout(uuid);
drop function if exists public.get_user_app_state(uuid);
drop function if exists public.get_user_onboarding_status(uuid);

-- Completion notice
do $$
begin
  raise notice 'Legacy RPC signatures removed successfully.';
  raise notice 'All RPCs now use auth.uid() exclusively.';
end$$;