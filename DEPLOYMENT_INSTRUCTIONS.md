# Dr. ChinTickle Mobile App - Deployment Instructions

## Summary of Fixes Applied

### 1. **Onboarding Flow Timing Issue** ✅
- **Problem**: New users saw email confirmation alert that disrupted onboarding
- **Solution**: 
  - Reduced signup delay from 5s to 1s
  - Created dedicated `EmailConfirmationScreen` for unconfirmed users
  - Removed conflicting modal from `LoginScreen`
  - Added server-side RPC function `get_user_app_state` for unified state management

### 2. **Google Sign-In for Expo Go** ✅
- **Problem**: OAuth redirect doesn't work in Expo Go (custom URL schemes not supported)
- **Solution**:
  - Implemented polling mechanism to detect session changes
  - Added platform-specific redirect URLs for production builds
  - Added console instructions for Expo Go users
  - Session detection runs for up to 2 minutes after OAuth initiation

### 3. **Server-Side Architecture** ✅
- **Created**: `/supabase/add_user_state_check.sql` - RPC function for complete user state
- **Benefits**: All routing logic can be updated server-side without app updates

## Deployment Steps

### 1. Database Migration (REQUIRED)

Run these SQL scripts in your Supabase dashboard:

```bash
# Go to: https://app.supabase.com/project/xrbsygiiffgfdalbvfoe/sql/new
```

**Script 1**: Run the existing profile trigger (if not already done)
```sql
-- Copy contents from: /supabase/updated_profile_trigger.sql
```

**Script 2**: Add the new user state check function
```sql
-- Copy contents from: /supabase/add_user_state_check.sql
```

### 2. Environment Security

⚠️ **CRITICAL**: Remove `.env` from version control:
```bash
# Add to .gitignore
echo ".env" >> .gitignore
git rm --cached .env
git commit -m "Remove .env from version control"
```

### 3. Testing Before App Store Submission

#### Test Email/Password Flow:
1. Create new account with email/password
2. Verify email confirmation screen appears
3. Click email link
4. Verify automatic navigation to onboarding
5. Complete onboarding
6. Verify routing based on pull-up ability

#### Test Google Sign-In (Expo Go):
1. Click "Sign in with Google"
2. Complete Google auth in browser
3. Return to Expo Go app
4. Wait up to 30 seconds for session detection
5. Verify automatic login and routing

#### Test Google Sign-In (Standalone Build):
1. Build preview APK: `./build-preview.sh`
2. Install on device
3. Test Google sign-in
4. Verify automatic redirect back to app

### 4. App Store Configuration

#### For iOS:
Add to `app.json`:
```json
{
  "expo": {
    "ios": {
      "infoPlist": {
        "CFBundleURLTypes": [
          {
            "CFBundleURLSchemes": ["drchintickle"]
          }
        ]
      }
    }
  }
}
```

#### For Android:
Add to `app.json`:
```json
{
  "expo": {
    "android": {
      "intentFilters": [
        {
          "action": "VIEW",
          "data": [{
            "scheme": "drchintickle",
            "host": "auth",
            "pathPrefix": "/callback"
          }],
          "category": ["BROWSABLE", "DEFAULT"]
        }
      ]
    }
  }
}
```

### 5. Google Cloud Console Setup (For Production)

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Select your project
3. APIs & Services → Credentials → Your OAuth 2.0 Client
4. Add Authorized redirect URIs:
   - `https://xrbsygiiffgfdalbvfoe.supabase.co/auth/v1/callback`
   - Your custom domain (if applicable)

### 6. Pre-Launch Checklist

- [ ] Database migrations applied
- [ ] `.env` removed from git
- [ ] Test email confirmation flow
- [ ] Test Google sign-in (both Expo Go and standalone)
- [ ] Test onboarding flow
- [ ] Update `app.json` version number
- [ ] Build production APK/IPA
- [ ] Test on physical devices

### 7. Quick Iteration Setup

Since you want server-side control for quick updates:

1. **Routing Logic**: All in `get_user_app_state()` RPC function
2. **Onboarding Content**: Can be made dynamic by:
   ```sql
   -- Create table for dynamic content
   CREATE TABLE onboarding_content (
     id SERIAL PRIMARY KEY,
     screen_number INT,
     content JSONB,
     active BOOLEAN DEFAULT true
   );
   ```

3. **Feature Flags**: 
   ```sql
   -- Create feature flags table
   CREATE TABLE feature_flags (
     name TEXT PRIMARY KEY,
     enabled BOOLEAN DEFAULT false,
     metadata JSONB
   );
   ```

## Troubleshooting

### Issue: Google Sign-In not working in Expo Go
**Solution**: This is expected. Users must:
1. Complete auth in browser
2. Return to app manually
3. Wait for automatic session detection

### Issue: Email confirmation not detected
**Solution**: Check that the RPC function `get_user_app_state` is properly deployed

### Issue: Onboarding shows for existing users
**Solution**: Run this SQL to fix:
```sql
UPDATE profiles 
SET has_completed_onboarding = true 
WHERE created_at < NOW() - INTERVAL '1 day';
```

## Support

For quick changes post-deployment:
1. Modify server-side RPC functions
2. No app update needed
3. Changes take effect immediately

Ready for App Store submission! 🚀