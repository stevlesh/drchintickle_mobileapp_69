# Dr. ChinTickle Development Setup Status
Last Updated: September 2, 2025

## Current Development Environment

### iOS Simulator Setup
- **Simulator**: iPhone 16 Pro (iOS 18.4)
- **App Type**: EAS Development Build (NOT using native folders)
- **Build File**: `build-1755775966353.tar.gz` (Aug 21, 2025)
- **App Installed**: DrChinTickle Development Build (successfully installed and running)

### Important Context
- **Native folders (ios/android) exist BUT are NOT being used**
  - These were created earlier but the simulator is using the EAS build
  - DO NOT run `npx expo run:ios` as this would use native folders
  - Keep them for now to avoid git complications

### Current Workflow
```bash
# To start development (daily use):
npx expo start --dev-client

# App will auto-connect to Metro bundler
# Make changes, save, and see live reload
```

### When New Build is Needed
Only rebuild with `eas build --platform ios --profile development-simulator --local` when:
1. Adding new native dependencies
2. Changing native config in app.json
3. Updating Expo SDK version

Regular JavaScript/React changes do NOT require new builds.

## Project State
- **Git Branch**: main (clean, up to date with origin)
- **Last Major Update**: Sep 2, 2025 - Architecture fixes and Edge Function v7 deployment
- **EAS Updates**: "gym-today" branch deployed with all latest fixes
- **Expo SDK**: 53.0.20 (minor update to 53.0.22 available but not critical)
- **Runtime**: Using EAS builds with development client
- **Edge Functions**: v7 deployed with server-side contract guarantees

## Workout Logic Confirmed Working
- Volume calculation: 2.6x to 3.0x multiplier progression
- 8 workout cycles with workout 1 as max test
- 8 rep distribution patterns working correctly
- Beginner/advanced adaptations planned but not yet implemented

## Key Files for Reference
- `CLAUDE.md` - Main project context and instructions (updated with recent fixes)
- `DEV_SETUP_STATUS.md` - This file, current setup state
- `eas.json` - Build configurations
- `src/utils/workoutEngine.js` - Core workout algorithm
- `src/utils/baseline.js` - NEW: Baseline popup logic with object parameters
- `src/utils/workoutApi.js` - NEW: Request deduplication for Edge Functions

## Quick Start for New Session
If starting fresh after closing Cursor/Claude:
1. Open simulator: `open -a Simulator`
2. Start dev server: `npx expo start --dev-client`
3. Press `i` if app doesn't auto-connect
4. You're ready to code!

## What NOT to Do
- ❌ Don't run `npx expo run:ios` (uses native folders)
- ❌ Don't delete ios/android folders yet
- ❌ Don't worry about the "native config" warning from expo-doctor

## Current Issues/Warnings
- Expo version slightly outdated (53.0.20 vs 53.0.22) - not critical
- Native folders present but unused - informational warning only
- App icon appears blank on simulator - cosmetic issue only