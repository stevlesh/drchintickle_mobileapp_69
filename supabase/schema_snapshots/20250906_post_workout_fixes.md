# Schema Changes: 2025-09-06

## Summary
Fixed workout generation bugs and improved security. No structural database changes were made - only function logic updates and Edge Function deployment.

## Changes Since 20250903_initial.sql

### 1. Database Functions Updated (via 20250904_security_fixes.sql)
- ✅ `complete_workout()` - Added parameter-less version using auth.uid()
- ✅ `get_user_app_state()` - Added parameter-less version
- ✅ `get_user_onboarding_status()` - Added parameter-less version
- ✅ Added legacy shim functions for backward compatibility
- ✅ Enabled RLS on `workouts` table

### 2. Edge Functions (Deployed via Supabase MCP)
- ✅ `generate-workout` v8 deployed with:
  - Database-driven multipliers (queries `workout_multipliers` table)
  - Fixed Ladder pattern (proportional allocation instead of /44)
  - Server-side validation before saves
  - Robust error handling with cap-safe Equal Sets fallback

### 3. Client Code (Not in database)
- ✅ Added client-side shape validation in `workoutApi.js`
- ✅ Smart caching logic (only cache valid workouts)

## Database Schema Status
**No structural changes** - The schema from 20250903_initial.sql is still current.
Only function implementations and business logic were updated.

## Next Scheduled Changes
- `20250911_drop_legacy_rpcs.sql` - Remove legacy shim functions after client migration

## Notes
Since no table structures changed, a full schema dump would be identical to 20250903_initial.sql except for the function bodies. The migration files (20250904_security_fixes.sql) document the specific changes made.