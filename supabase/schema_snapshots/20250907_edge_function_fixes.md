# Edge Function Fixes - September 7, 2025

## Changes Made
No database schema changes - only Edge Function and client code updates.

### 1. Edge Function v14 - Fixed Rep Distribution Bug
**Problem**: Workouts were generating with fewer reps than target (e.g., 28 reps instead of 32)

**Root Cause**: In the deficit distribution loop, `currentTotal` was calculated once at the beginning but never updated as reps were added to sets.

**Fix**: Added `currentTotal = sets.reduce((a, b) => a + b, 0);` inside the deficit loop to recalculate after each increment.

**File**: Edge Function `generate-workout` (deployed to Supabase)

### 2. Client Validation Removal
**Problem**: Client was rejecting valid workouts from server, causing false warnings

**Root Cause**: Mismatch between client cap (0.6 × maxPullups) and server cap (0.65 × maxPullups)

**Fix**: Removed client-side validation entirely - now returns `true` and trusts server validation

**File**: `src/utils/workoutApi.js`

## Testing Notes
- Confirmed workouts now generate with correct total reps
- No more false warnings about "invalid/fallback workout"
- Server validation remains intact - no safety compromised

## Commit Reference
- Commit: f67fcd6 - "fix: workout generation rep distribution and client validation"