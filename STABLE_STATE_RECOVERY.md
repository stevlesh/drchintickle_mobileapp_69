# Stable State Recovery Guide
## Created: 2025-08-21

This document captures the exact stable working state of the Dr. ChinTickle app where both Expo Go and development builds are functioning correctly.

## Git Commit Reference
- **Commit Hash**: Run `git log -1 --format="%H"` to see latest
- **Commit Message**: "Stable working state - Expo Go and dev build both functional"
- **Branch**: main

## Environment Setup

### Node & Package Versions
```bash
node --version  # Should be v18.x or higher
npm --version   # Should be 9.x or higher
expo --version  # Should be ~53.0.0
eas --version   # Latest EAS CLI
```

### Required Environment Variables (.env)
```
EXPO_PUBLIC_SUPABASE_URL=https://kccujasnqjflqyldrqsj.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtjY3VqYXNucWpmbHF5bGRycXNqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzc0MTY2MDUsImV4cCI6MjA1Mjk5MjYwNX0.wl7c5vI7N5l5lVkKQD2U9QJJqw_2tn84jVG6uCvhvnQ
EXPO_PUBLIC_ASYNC_STORAGE_NAMESPACE=@drchintickle
```

## Recovery Steps

### 1. Clean Install from This State
```bash
# Clone or navigate to project
cd /Users/stevenleshinger/Developer/drchintickle_mobileapp_69_fresh

# Reset to stable commit
git reset --hard 29d9f18  # Use actual commit hash from git log

# Clean install dependencies
rm -rf node_modules
rm -rf ios/Pods
rm -rf ~/.expo
npm ci  # Uses package-lock.json for exact versions

# iOS specific (if needed)
cd ios && pod install && cd ..
```

### 2. Running Expo Go
```bash
# Start Expo Go development server
npx expo start

# Press 'i' for iOS simulator
# Press 'a' for Android emulator
# Scan QR code with Expo Go app on physical device
```

### 3. Running Development Build
```bash
# For iOS Simulator
npx expo run:ios

# Or using the pre-built dev client
npx expo start --dev-client
# Then press 'i' to open in simulator
```

### 4. Building New Development Client (if needed)
```bash
# Local build for iOS simulator
eas build --platform ios --profile development-simulator --local

# Install the resulting .app file
# Drag the .app file to iOS Simulator or use:
xcrun simctl install booted [path-to-app]
```

## Key Working Files

### Core Authentication Flow
- `src/lib/supabase.js` - Supabase client with proper AsyncStorage
- `src/utils/ensureProfileRow.js` - Profile sync utility
- `App.js` - Main app with auth state management

### Screen Components
- `src/screens/LoginScreen.js` - Email/password auth
- `src/screens/DashboardScreen.js` - Main dashboard with profile loading
- `src/components/WorkoutProgressTracker.js` - Progress visualization

## Known Working Configuration

### app.json
- SDK Version: ~53.0.0
- iOS Bundle ID: com.drchintickle.app
- Development client configured
- Scheme: drchintickle

### package.json Key Dependencies
- expo: ~53.0.0-preview.0
- react-native: 0.79.5
- @supabase/supabase-js: ^2.51.0
- @react-native-async-storage/async-storage: ^2.1.0

## Troubleshooting

### If Expo Go stops working
1. Clear Expo cache: `npx expo start -c`
2. Delete .expo folder: `rm -rf .expo`
3. Restart Metro bundler

### If Dev Build stops working
1. Clean build folders: `npx expo run:ios --clear`
2. Reset Metro cache: `npx react-native start --reset-cache`
3. Rebuild development client

### If Supabase auth fails
1. Verify .env file exists with correct keys
2. Check network connectivity
3. Verify Supabase project is active
4. Check auth settings in Supabase dashboard

## Database State
- Tables: profiles, workouts, workout_sessions
- RPC functions working
- Auth configured for email/password

## What's Working
✅ Expo Go development
✅ iOS development build
✅ Supabase authentication
✅ Profile creation and sync
✅ Dashboard loading
✅ Navigation between screens
✅ AsyncStorage persistence
✅ Environment variables loading

## Quick Test Checklist
1. [ ] App launches without errors
2. [ ] Can navigate to login screen
3. [ ] Can log in with existing account
4. [ ] Dashboard loads user profile
5. [ ] Can log out successfully
6. [ ] App works in both Expo Go and dev build

## Support Files Backup
- This document: STABLE_STATE_RECOVERY.md
- Environment: .env (keep secure)
- Package lock: package-lock.json (critical for exact versions)
- iOS Podfile.lock (for iOS dependencies)

---
**Note**: This represents a known good state as of 2025-08-21. If issues arise, return to this configuration as a baseline.