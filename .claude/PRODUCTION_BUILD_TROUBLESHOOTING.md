# Production Build Troubleshooting Guide

## 🚨 Common Issue: Production Crashes, Dev Works Fine

### Symptom
- ✅ App works perfectly in development (`npx expo start --dev-client`)
- ❌ App crashes immediately on TestFlight (within ~300ms of launch)
- Crash log shows `SIGABRT` in `expo.controller.errorRecoveryQueue`

### Root Cause
**Missing environment variables in production builds.**

- Development builds load `.env` file via Metro bundler
- EAS production builds **do NOT** automatically read `.env`
- Critical env vars (like `EXPO_PUBLIC_SUPABASE_URL`) are `undefined` in production
- App crashes during initialization when modules can't initialize properly

### Solution: Use EAS Secrets

**Never hardcode secrets in `eas.json`.** Use EAS Secrets instead:

```bash
# Create secrets (one-time setup)
eas secret:create --scope project --name EXPO_PUBLIC_SUPABASE_URL --value https://your-project.supabase.co
eas secret:create --scope project --name EXPO_PUBLIC_SUPABASE_ANON_KEY --value your-anon-key
eas secret:create --scope project --name EXPO_PUBLIC_USE_SERVER_PLANS --value true

# Verify secrets exist
eas secret:list
```

These secrets are:
- ✅ Stored securely in EAS cloud
- ✅ Automatically injected into production builds
- ✅ Never committed to git
- ✅ Available as `process.env.EXPO_PUBLIC_*` in your app code

### How to Diagnose

**Step 1: Add error guards to critical modules**

Example in `src/lib/supabase.js`:
```javascript
const url  = process.env.EXPO_PUBLIC_SUPABASE_URL;
const anon = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

if (!url || !anon) {
  // This will show in device logs
  console.error('Missing Supabase env vars', {
    hasURL: !!url,
    hasKey: !!anon
  });
  throw new Error('Missing EXPO_PUBLIC_SUPABASE_URL or EXPO_PUBLIC_SUPABASE_ANON_KEY');
}
```

**Step 2: Check device logs**
- Connect device to Xcode
- Window → Devices and Simulators
- Select your device → Open Console
- Look for error messages when app crashes

**Step 3: Test locally with missing env vars**
```bash
# This should crash with clear error message
EXPO_PUBLIC_SUPABASE_URL= EXPO_PUBLIC_SUPABASE_ANON_KEY= npx expo start --dev-client
```

### Common Mistakes to Avoid

❌ **DON'T** hardcode secrets in `eas.json`:
```json
// BAD - secrets exposed in git
"production": {
  "env": {
    "EXPO_PUBLIC_SUPABASE_URL": "https://..."
  }
}
```

✅ **DO** use EAS Secrets:
```json
// GOOD - clean config, secrets stored securely
"production": {
  "developmentClient": false,
  "channel": "production"
}
```

### Red Herrings (Things That AREN'T the Problem)

- ❌ Expo Updates OTA configuration (unless you actually see update-related errors)
- ❌ Missing JavaScript bundle (would show white screen, not crash)
- ❌ Native module linking (would crash in dev too)
- ❌ Code minification issues (rare with Expo)

### Historical Context

**Builds 2-9 (October 2025)**: All crashed due to missing `EXPO_PUBLIC_SUPABASE_*` env vars
- Tried disabling Expo Updates → white screen (env vars still missing)
- Tried removing @notifee → still crashed (not the issue)
- **Fix**: Added EAS Secrets in Build 10 → worked perfectly

### Quick Reference Commands

```bash
# Create secrets
eas secret:create --scope project --name VAR_NAME --value var-value

# List all secrets
eas secret:list

# Delete a secret
eas secret:delete --scope project --name VAR_NAME

# Build with secrets
git add . && git commit -m "your message" && git push
eas build --platform ios --profile production
```

### Key Takeaway

**If dev works but production crashes:**
1. Check environment variables first
2. Add error logging to initialization code
3. Use EAS Secrets for production env vars
4. Never commit secrets to git

---

*Last updated: October 2025 (Build 10 fix)*
