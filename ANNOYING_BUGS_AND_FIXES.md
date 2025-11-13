# Annoying Bugs & Fixes

## EAS build 403 at “Uploading to EAS Build”
- Symptom: Build fails during upload with “403 (Forbidden)”.  
- What fixed it (worked for me):
  ```bash
  nvm use 20.18.2
  npm i -g eas-cli@latest
  eas --version   # should end with node-v20.18.2
  # Turn OFF VPN
  unset EXPO_TOKEN
  eas logout && eas login && eas whoami  # should show stevlesh
  EXPO_DEBUG=1 eas build --platform ios --profile production
  ```

## Dev works, production crashes instantly (secrets)
- Symptom: App OK in dev; crashes immediately on TestFlight/production.  
- What fixed it (worked for me): Set EAS Secrets for Supabase envs.
  ```bash
  eas secret:create --scope project --name EXPO_PUBLIC_SUPABASE_URL --value https://YOUR.supabase.co
  eas secret:create --scope project --name EXPO_PUBLIC_SUPABASE_ANON_KEY --value YOUR-ANON-KEY
  eas secret:list
  ```
- Notes: More detail in `.claude/PRODUCTION_BUILD_TROUBLESHOOTING.md`. A guard exists in `src/lib/supabase.js` that logs and throws if the Supabase env vars are missing.


