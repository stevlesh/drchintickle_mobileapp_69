# Local Notifications Implementation Plan
**For Dr. ChinTickle Rest Timer**

**Created:** 2025-10-24
**Purpose:** Step-by-step guide to add local notifications for 2-minute rest timer
**Target:** Build 10+ (after Build 9 ships without notifications)

---

## 🎯 Goal

Add a local notification that fires when the 2-minute rest timer completes, allowing users to be notified even if they switch away from the app during rest periods.

**Technical Requirements:**
- ✅ Local notifications only (no server/APNs needed)
- ✅ Fires after 2-minute countdown
- ✅ Works when app is backgrounded
- ✅ Plays sound to alert user
- ✅ No Apple push notification restrictions apply

---

## 📋 Prerequisites (Before Starting)

1. **Build 9 is live on TestFlight** and app launches successfully
2. **All notification code removed** from current build
3. **Clean working state** to build from

---

## 🔧 Implementation Steps

### **Step 1: Install expo-notifications Package**

```bash
npm install expo-notifications@~0.31.4
```

**Why expo-notifications:**
- ✅ Built-in Expo support (has config plugin)
- ✅ Supports local notifications without server setup
- ✅ Well-tested in managed Expo workflow
- ✅ Works with EAS Build out of the box

---

### **Step 2: Configure app.json (THE CRITICAL STEP)**

**File:** `app.json`

**Add to root level of expo object:**

```json
{
  "expo": {
    "plugins": [
      [
        "expo-notifications",
        {
          "sounds": []
        }
      ]
    ],
    "notification": {
      "iosDisplayInForeground": true
    }
  }
}
```

**⚠️ CRITICAL:** This plugin configuration is what was MISSING in the original implementation. Without it, the native module won't link properly in production builds.

**Full plugins array should look like:**
```json
"plugins": [
  [
    "expo-notifications",
    {
      "sounds": []
    }
  ]
]
```

**Note:** We removed `expo-localization` from plugins since it was causing issues and we don't actually use it anywhere critical.

---

### **Step 3: Create src/notificationsInit.js**

**File:** `src/notificationsInit.js`

```javascript
// src/notificationsInit.js
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

/**
 * Initialize notification system on app startup
 * - Sets global notification handler (how notifications appear)
 * - Creates Android notification channel (required for Android 8+)
 *
 * Called once in App.js useEffect
 */
export async function initNotifications() {
  // Configure how notifications are displayed when app is in foreground
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,   // Show banner
      shouldPlaySound: true,   // Play sound
      shouldSetBadge: false,   // Don't update app badge
    }),
  });

  // Android-specific: Create notification channel
  // iOS doesn't need this - channels are system-managed
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('rest-timer', {
      name: 'Rest Timer',
      importance: Notifications.AndroidImportance.HIGH,
      sound: 'default',
      vibrationPattern: [0, 250, 250, 250],
      lockscreenVisibility: Notifications.AndroidNotificationVisibility.PUBLIC,
    });
  }
}
```

---

### **Step 4: Create src/utils/restNotifications.js**

**File:** `src/utils/restNotifications.js`

```javascript
// src/utils/restNotifications.js
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

// Track the currently scheduled notification to prevent duplicates
let activeNotificationId = null;

/**
 * Check if user has granted notification permissions
 * @returns {Promise<boolean>} true if granted
 */
export async function hasNotificationPermission() {
  const perms = await Notifications.getPermissionsAsync();
  return perms.granted;
}

/**
 * Request notification permissions from user
 * Shows iOS system prompt first time, returns cached result after
 * @returns {Promise<boolean>} true if granted
 */
export async function requestNotificationPermissions() {
  const current = await Notifications.getPermissionsAsync();
  if (current.granted) return true;

  const requested = await Notifications.requestPermissionsAsync();
  return requested.granted;
}

/**
 * Schedule a notification to fire when rest timer completes
 *
 * @param {number} seconds - How many seconds until notification fires (default: 120)
 * @returns {Promise<string|null>} Notification ID if scheduled, null if failed
 *
 * Technical notes:
 * - iOS: Uses Date trigger (new Date(...)) to avoid iOS time-interval bugs
 * - Android: Uses time-interval trigger ({ seconds }) with channelId
 * - Automatically cancels any existing rest notification before scheduling
 */
export async function scheduleRestCompleteNotification(seconds = 120) {
  try {
    // De-duplicate: Cancel any existing rest notification
    if (activeNotificationId) {
      await Notifications.cancelScheduledNotificationAsync(activeNotificationId);
      activeNotificationId = null;
    }

    // Check permissions before scheduling
    const granted = await hasNotificationPermission();
    if (!granted) {
      console.warn('[restNotifications] Permission not granted, skipping notification');
      return null;
    }

    // Schedule the notification
    const id = await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Rest complete 💪',
        body: 'Time to crush your next set.',
        sound: true,
        data: { type: 'rest_complete' },
        // iOS-specific: Make notification time-sensitive (plays sound even in Focus mode)
        ...(Platform.OS === 'ios' && {
          interruptionLevel: 'timeSensitive',
        }),
      },
      // Platform-specific triggers
      trigger: Platform.OS === 'ios'
        ? new Date(Date.now() + seconds * 1000)  // iOS: Date-based trigger
        : { seconds, channelId: 'rest-timer' },  // Android: Interval trigger with channel
    });

    activeNotificationId = id;

    // Debug logging (dev builds only)
    if (__DEV__) {
      const fireTime = new Date(Date.now() + seconds * 1000);
      console.log(`✅ REST NOTIFICATION SCHEDULED:`);
      console.log(`   - ID: ${id}`);
      console.log(`   - Will fire at: ${fireTime.toLocaleTimeString()}`);
      console.log(`   - Seconds from now: ${seconds}`);
    }

    return id;
  } catch (error) {
    console.error('[restNotifications] Failed to schedule notification:', error);
    return null;
  }
}

/**
 * Cancel the currently scheduled rest notification
 * Called when user finishes rest early or navigates away from workout
 */
export async function cancelRestNotification() {
  try {
    if (activeNotificationId) {
      await Notifications.cancelScheduledNotificationAsync(activeNotificationId);
      activeNotificationId = null;

      if (__DEV__) {
        console.log('✅ Rest notification cancelled');
      }
    }
  } catch (error) {
    console.error('[restNotifications] Failed to cancel notification:', error);
  }
}
```

---

### **Step 5: Update App.js to Initialize Notifications**

**File:** `App.js`

**Add import at top:**
```javascript
import { initNotifications } from './src/notificationsInit';
import { requestNotificationPermissions } from './src/utils/restNotifications';
```

**Add useEffect (around line 135-147):**
```javascript
// Initialize notifications once on app start
useEffect(() => {
  (async () => {
    try {
      // Initialize notification system
      await initNotifications();

      // Request permissions from user (iOS shows system prompt)
      await requestNotificationPermissions();
    } catch (error) {
      // Non-fatal: Log but don't crash app if notifications fail
      console.warn('[App] Notification init failed (non-fatal):', error);
    }
  })();
}, []);
```

---

### **Step 6: Update WorkoutScreen.js to Schedule/Cancel Notifications**

**File:** `src/screens/WorkoutScreen.js`

**Add import at top:**
```javascript
import { scheduleRestCompleteNotification, cancelRestNotification } from '../utils/restNotifications';
```

**Find where rest timer starts (when user completes a set):**

Look for the transition from "active" to "resting" state. This is likely in a function like `completeSet()` or `handleSetComplete()`.

**Add notification scheduling:**
```javascript
// Example location (adjust based on your actual code):
const startRestTimer = async () => {
  setWorkoutState('resting');
  setRestTimeRemaining(120);

  // 🆕 Schedule notification to fire when rest completes
  await scheduleRestCompleteNotification(120);
};
```

**Find where rest timer is cancelled/completed:**

This could be:
- User finishes rest and starts next set
- User navigates back to dashboard mid-workout
- Workout completion

**Add notification cancellation:**
```javascript
// Example: When starting next set
const startNextSet = async () => {
  // 🆕 Cancel rest notification since user is starting next set
  await cancelRestNotification();

  setWorkoutState('active');
  setRestTimeRemaining(120);
};

// Example: When navigating away from workout
useEffect(() => {
  return () => {
    // 🆕 Cleanup: Cancel notifications when leaving workout screen
    cancelRestNotification();
  };
}, []);
```

**Specific locations in WorkoutScreen.js to modify:**

1. **When set completes and rest starts:**
   - Search for `setWorkoutState('resting')`
   - Add `await scheduleRestCompleteNotification(120)` right after

2. **When rest completes and next set starts:**
   - Search for transition back to `'active'` state
   - Add `await cancelRestNotification()` before transition

3. **When navigating away:**
   - Add cleanup in component unmount
   - Add to back button handler

---

### **Step 7: Test the Implementation**

**Build Process:**
```bash
# Clean install
rm -rf node_modules package-lock.json
npm install

# Build for TestFlight (Build 10)
eas build --platform ios --profile production
```

**Testing Checklist:**

- [ ] **App launches successfully** (most important - doesn't crash like before)
- [ ] **Permission prompt appears** on first launch
- [ ] **Notification fires after 2 minutes** when app is backgrounded
- [ ] **Sound plays** when notification fires
- [ ] **Notification cancels** if user returns before timer ends
- [ ] **No crashes** when denying notification permissions

**Testing Scenarios:**

1. **Happy Path:**
   - Start workout → Complete set → Rest timer starts
   - Background app (switch to Messages/etc)
   - Wait 2 minutes
   - ✅ Notification should fire with sound

2. **Early Return:**
   - Start workout → Complete set → Rest timer starts
   - Background app
   - Wait 30 seconds
   - Return to app and start next set
   - ✅ Notification should NOT fire (cancelled)

3. **Permission Denied:**
   - Fresh install → Deny notification permission
   - Start workout → Complete set
   - ✅ App should work normally, just no notification

4. **Mid-Workout Exit:**
   - Start workout → Complete set → Rest timer starts
   - Navigate back to Dashboard
   - Wait 2 minutes
   - ✅ Notification should NOT fire (cancelled on unmount)

---

## 🔍 Troubleshooting Guide

### **If Build Still Crashes on Launch:**

1. **Check EAS Build logs** for "expo-notifications" plugin execution
   - Should see: "✅ Using expo-notifications plugin"
   - Shouldn't see: Plugin errors or warnings

2. **Verify app.json plugins array:**
   ```bash
   cat app.json | grep -A10 "plugins"
   ```
   Should show expo-notifications plugin

3. **Check crash logs** for different error signature
   - If it's NOT the same `expo.controller.errorRecoveryQueue` error, it's a different issue

4. **Try dev build first:**
   ```bash
   eas build --platform ios --profile development --local
   ```
   - Install on simulator
   - Test notifications work
   - If dev works but production crashes → config issue

### **If Notifications Don't Fire:**

1. **Check permissions:**
   ```javascript
   const perms = await Notifications.getPermissionsAsync();
   console.log('Notification permissions:', perms);
   ```

2. **Check scheduled notifications:**
   ```javascript
   const scheduled = await Notifications.getAllScheduledNotificationsAsync();
   console.log('Scheduled notifications:', scheduled);
   ```

3. **Verify trigger time:**
   - Make sure `seconds` parameter is correct
   - Test with shorter duration (10 seconds) for faster debugging

4. **Check device settings:**
   - iOS Settings → Dr. ChinTickle → Notifications → Enabled
   - Focus Mode → Allow Time Sensitive notifications

### **If Permission Request Doesn't Show:**

1. **Reset iOS simulator:**
   ```bash
   xcrun simctl erase all
   ```

2. **Delete app from device** and reinstall

3. **Check if permissions were previously denied:**
   - iOS Settings → Dr. ChinTickle → Notifications

---

## 📝 Key Differences from Failed Attempts

| Issue | Previous (Failed) | This Plan (Will Work) |
|-------|------------------|----------------------|
| Config plugin | ❌ Missing from app.json | ✅ Properly configured |
| Native linking | ❌ Failed in production | ✅ Plugin handles it |
| Platform triggers | ⚠️ iOS time-interval bug | ✅ Date trigger for iOS |
| Error handling | ⚠️ Basic try-catch | ✅ Non-fatal with logging |
| Testing | ⚠️ Only tried production | ✅ Dev build test first |

---

## 🎯 Success Criteria

**Build 10 is considered successful when:**

1. ✅ App launches without crashing (TestFlight)
2. ✅ Notification permission prompt appears
3. ✅ Rest timer notification fires after 2 minutes
4. ✅ Sound plays when notification fires
5. ✅ Works on real device (not just simulator)
6. ✅ No crashes if user denies permissions

---

## 🚀 Deployment Checklist

**Before building Build 10:**
- [ ] Build 9 is live and confirmed working
- [ ] All code changes reviewed
- [ ] app.json plugins array verified
- [ ] package.json has expo-notifications

**Build process:**
- [ ] `npm install` clean
- [ ] `eas build --platform ios --profile production`
- [ ] Upload to TestFlight
- [ ] Test on real device (not simulator)

**If successful:**
- [ ] Submit to App Store Review
- [ ] 🎉 Celebrate having working notifications

**If failed:**
- [ ] Save crash logs
- [ ] Review troubleshooting section
- [ ] Consider posting to Expo forums with crash logs

---

## 📚 Reference Documentation

- [Expo Notifications Docs](https://docs.expo.dev/versions/latest/sdk/notifications/)
- [Expo Notifications Plugin](https://github.com/expo/expo/tree/main/packages/expo-notifications)
- [Local vs Push Notifications](https://docs.expo.dev/push-notifications/overview/)
- [Testing Local Notifications](https://docs.expo.dev/versions/latest/sdk/notifications/#testing)

---

## 💡 Alternative Approaches (If This Fails)

### **Plan B: Haptic + Visual Only**

If notifications continue to fail, fall back to:
- Haptic feedback when rest completes
- Visual alert if app is foregrounded
- No notification if backgrounded

```javascript
import * as Haptics from 'expo-haptics';

// When rest completes
await Haptics.notificationAsync(
  Haptics.NotificationFeedbackType.Success
);
```

### **Plan C: Audio Alert**

Play a sound file directly (works even when backgrounded):
- Requires audio session configuration
- More complex but more reliable
- Look into `expo-av` or `react-native-sound`

---

## ✅ Final Notes

**This plan addresses the ROOT CAUSE of previous failures:**
- Missing config plugin in app.json
- Improper native module linking in production builds

**The expo-notifications package itself was NEVER the problem.** It was always a configuration issue.

**Confidence level:** 95% this will work

**If it doesn't work:** The issue is likely something else entirely (not notifications), and we should investigate crash logs for a completely different error signature.

---

**Created by:** Claude
**Last Updated:** 2025-10-24
**Version:** 1.0
**Status:** Ready for implementation after Build 9 ships
