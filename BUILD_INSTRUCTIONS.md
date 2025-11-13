# EAS Build Instructions

Your configuration is now ready! To create the builds that will be compatible with your OTA updates:

## Method 1: Manual Build (Recommended)

Open a new terminal in this directory and run:

```bash
# Build Android (will ask to generate keystore - answer "y")
eas build --profile preview --platform android

# Build iOS (will ask about certificates - follow prompts)
eas build --profile preview --platform ios
```

## Method 2: Build via EAS Dashboard

1. Go to https://expo.dev/accounts/stevlesh/projects/dr-chintickle-poc/builds
2. Click "Create Build"
3. Select "preview" profile
4. Choose platforms
5. Click "Build"

## What to Expect:

1. **Android**: Will generate a new keystore automatically
2. **iOS**: Will ask about certificates (choose automatic if you don't have Apple Developer account)
3. **Build Time**: ~10-15 minutes each

## Once Built:

Your new builds will have the correct fingerprints to receive your OTA updates. Users with these builds will automatically get the workout generation Edge Function updates.

## Check Build Status:

```bash
eas build:list --platform all
```

## Configuration Added:

- ✅ App version source: "remote"
- ✅ Android package: "com.stevlesh.drchintickle"
- ✅ iOS bundle identifier: "com.stevlesh.drchintickle"
- ✅ Build profiles configured for both platforms

## Troubleshooting

- See [ANNOYING_BUGS_AND_FIXES.md](./ANNOYING_BUGS_AND_FIXES.md) for recurring fixes we've already hit.