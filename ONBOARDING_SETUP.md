# Dr. ChinTickle Onboarding Flow Setup

## Overview
The onboarding flow has been successfully integrated into your React Native app with **server-side logic** for better security and maintainability. First-time users will see a 3-screen onboarding flow that:
1. Explains what makes Dr. ChinTickle different
2. Shows how the system works (8 sets, 15 minutes daily)
3. Assesses their current pull-up ability

## What's Been Done

### 1. Created OnboardingScreen Component
- Located at: `/src/screens/OnboardingScreen.js`
- Uses your existing components: GlassCard, NeonButton, NeonHeader, BackgroundContainer
- Matches your Miami Vice theme with neon effects
- Three screens with navigation dots
- Responsive design for mobile

### 2. Server-Side Database Logic
- **SQL Migration**: `/supabase/updated_profile_trigger.sql`
  - Automatically adds onboarding fields if they don't exist
  - Updates the user creation trigger
  - Creates RPC functions for server-side logic
- **RPC Functions**:
  - `get_user_onboarding_status()` - Check onboarding status
  - `complete_onboarding()` - Mark onboarding complete
- **Edge Function**: `/supabase/functions/onboarding/`
  - Alternative to RPC with more complex logic
  - Supports analytics and future enhancements

### 3. App.js Auth Flow Updates
- Uses server-side RPC to check onboarding status
- Routes to OnboardingScreen for first-time users
- Routes to Dashboard for returning users
- Shows loading screen while checking status

## Setup Instructions

### 1. Run the Database Migration
Go to your Supabase dashboard and run the SQL in `/supabase/updated_profile_trigger.sql`:
```bash
https://app.supabase.com/project/[your-project-id]/sql/new
```

This SQL script:
- Checks if columns exist before adding them (safe to run multiple times)
- Creates server-side RPC functions
- Updates the user creation trigger

### 2. Test the Flow
1. Create a new user account
2. You should see the onboarding flow automatically
3. Complete the flow and verify you're routed correctly:
   - If you select "YES, EASILY" → PreWorkout (max test)
   - If you select "NO / BARELY" → Dashboard

### 3. Verify Existing Users
Existing users should skip onboarding and go straight to Dashboard.

## How It Works

### Server-Side Architecture
All onboarding logic runs on the server for better security:

1. **Database Trigger**: Automatically creates profile with onboarding fields when user signs up
2. **RPC Functions**: Server-side functions handle all database operations
3. **Client**: Only calls RPC functions, no direct database access

### Routing Logic
```javascript
// App.js calls server-side RPC
const status = await supabase.rpc('get_user_onboarding_status', { user_id })

if (user is logged in) {
  if (status.needs_onboarding) {
    → OnboardingScreen
  } else {
    → Dashboard
  }
} else {
  → LoginScreen
}
```

### User Flow
1. **Screen 1**: Problem/Solution
   - Shows what's wrong with typical fitness apps
   - Introduces Dr. ChinTickle's approach

2. **Screen 2**: The System
   - 8 sets, 2 minutes rest
   - 15 minutes daily
   - Philosophy: consistency > intensity

3. **Screen 3**: Assessment & Program Selection
   - Asks if user can do 8 pull-ups
   - Shows appropriate program based on answer
   - Saves preference to database

## Customization

### To modify the onboarding content:
Edit `/src/screens/OnboardingScreen.js`

### To change when onboarding shows:
Modify the logic in `App.js` checkOnboardingStatus()

### To reset onboarding for testing:
Run this SQL in Supabase:
```sql
UPDATE profiles 
SET has_completed_onboarding = false,
    onboarding_completed_at = NULL,
    can_do_eight_pullups = NULL
WHERE id = 'your-user-id';
```

## Next Steps

1. Consider adding analytics to track:
   - Onboarding completion rate
   - Which option users select (8+ pullups vs not)
   - Drop-off points

2. Future enhancements:
   - Add animations between screens
   - Include demo videos
   - Add skip option for returning users who reinstall

3. When Assisted Program is ready:
   - Update Screen 3 to route beginners to assisted program
   - Add progression tracking from assisted → standard program