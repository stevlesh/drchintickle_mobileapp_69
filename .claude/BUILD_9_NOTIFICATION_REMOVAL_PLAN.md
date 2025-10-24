# Build 9: Notification Code Removal Plan
**FINAL REVIEWED VERSION - Ready for Independent Review**

**Created:** 2025-10-24
**Purpose:** Remove @notifee/react-native code to fix production crashes
**Target:** Build 9 (emergency fix to get working version on TestFlight)
**Follow-up:** Build 10 will re-add notifications using expo-notifications (see LOCAL_NOTIFICATIONS_IMPLEMENTATION_PLAN.md)

---

## 🎯 Objective

Remove all @notifee/react-native code that's causing production crashes while:
- ✅ Keeping all workout functionality working
- ✅ Keeping rest timer working (just no background notification)
- ✅ Not breaking any other features
- ✅ Making minimal, safe changes only

---

## 📊 Current State Analysis

### Files Currently Using Notifications:
1. **package.json** - Has @notifee/react-native dependency
2. **App.js** - Imports and initializes notifications on app start
3. **WorkoutScreen.js** - Imports and calls notification functions (5 locations)
4. **src/notificationsInit.js** - Notification initialization logic (will delete)
5. **src/utils/restNotifications.js** - Notification scheduling logic (will delete)

### Files That Import Notification Utilities:
- **App.js** - Lines 26-27
- **WorkoutScreen.js** - Line 26

### All Notification Function Call Sites:
1. **App.js:139** - `await initNotifications();`
2. **App.js:141** - `await requestNotificationPermissions();`
3. **WorkoutScreen.js:228** - `await scheduleRestCompleteNotification(seconds);`
4. **WorkoutScreen.js:288** - `await cancelRestNotification();`
5. **WorkoutScreen.js:299** - `await cancelRestNotification();`
6. **WorkoutScreen.js:432** - `await cancelRestNotification();`
7. **WorkoutScreen.js:696** - `await cancelRestNotification();`

**Total: 7 function calls to remove/comment**

---

## 🔧 Detailed Changes (File by File)

### **1. package.json**

**Current line 20:**
```json
"@notifee/react-native": "9.1.8",
```

**Action:** Remove this line entirely

**After:**
```json
"@expo-google-fonts/monoton": "^0.4.0",
"@react-native-async-storage/async-storage": "2.1.2",
```

**Why:** Removes the package that's causing crashes

---

### **2. app.json**

**Current state (lines 72-74):**
```json
"plugins": [
  "expo-localization"
]
```

**Action:** NO CHANGES - Keep as is

**Current state (line 31):**
```json
"NSUserNotificationUsageDescription": "We use notifications to alert you when your rest is complete."
```

**Action:** NO CHANGES - Keep as is

**Why keep these:**
- `expo-localization` is USED by `src/utils/timezone.js` for dashboard stats
- Permission text is harmless and we'll need it in Build 10
- Removing these would break timezone detection

**CRITICAL:** Original plan was to remove these - that was WRONG and would have broken features.

---

### **3. App.js**

**Current imports (lines 26-27):**
```javascript
import { initNotifications } from './src/notificationsInit'
import { requestNotificationPermissions } from './src/utils/restNotifications'
```

**Change to:**
```javascript
// REMOVED for Build 9: Will re-add in Build 10 with expo-notifications
// import { initNotifications } from './src/notificationsInit'
// import { requestNotificationPermissions } from './src/utils/restNotifications'
```

**Current code (lines 136-147):**
```javascript
// Initialize notifications once on app start
useEffect(() => {
  (async () => {
    try {
      await initNotifications();
      // Ask once on app start
      await requestNotificationPermissions();
    } catch (error) {
      // Log but never throw - prevent production crashes during init
      console.warn('[App] Notification init failed (non-fatal):', error);
    }
  })();
}, []);
```

**Change to:**
```javascript
// REMOVED for Build 9: Will re-add in Build 10 with expo-notifications
// Initialize notifications once on app start
// useEffect(() => {
//   (async () => {
//     try {
//       await initNotifications();
//       // Ask once on app start
//       await requestNotificationPermissions();
//     } catch (error) {
//       // Log but never throw - prevent production crashes during init
//       console.warn('[App] Notification init failed (non-fatal):', error);
//     }
//   })();
// }, []);
```

---

### **4. WorkoutScreen.js**

**Current import (line 26):**
```javascript
import { scheduleRestCompleteNotification, cancelRestNotification } from '../utils/restNotifications';
```

**Change to:**
```javascript
// REMOVED for Build 9: Will re-add in Build 10 with expo-notifications
// import { scheduleRestCompleteNotification, cancelRestNotification } from '../utils/restNotifications';
```

**Five call sites to comment out:**

**Site 1 - Line 228 (in rest timer start):**
```javascript
// Schedule notification for when rest completes (Phase 2 will add custom sound)
await scheduleRestCompleteNotification(seconds);
```

**Change to:**
```javascript
// REMOVED for Build 9: Will re-add in Build 10 with expo-notifications
// Schedule notification for when rest completes (Phase 2 will add custom sound)
// await scheduleRestCompleteNotification(seconds);
```

**Site 2 - Line 288 (when rest naturally completes):**
```javascript
// Cancel notification when rest completes naturally
await cancelRestNotification();
```

**Change to:**
```javascript
// REMOVED for Build 9: Will re-add in Build 10 with expo-notifications
// Cancel notification when rest completes naturally
// await cancelRestNotification();
```

**Site 3 - Line 299 (when user starts set early):**
```javascript
// Cancel notification since user started set early
await cancelRestNotification();
```

**Change to:**
```javascript
// REMOVED for Build 9: Will re-add in Build 10 with expo-notifications
// Cancel notification since user started set early
// await cancelRestNotification();
```

**Site 4 - Line 432 (when completing a set):**
```javascript
// Cancel any pending rest notification from previous set
await cancelRestNotification();
```

**Change to:**
```javascript
// REMOVED for Build 9: Will re-add in Build 10 with expo-notifications
// Cancel any pending rest notification from previous set
// await cancelRestNotification();
```

**Site 5 - Line 696 (when navigating back to dashboard):**
```javascript
// Cancel any pending rest notifications
await cancelRestNotification();
```

**Change to:**
```javascript
// REMOVED for Build 9: Will re-add in Build 10 with expo-notifications
// Cancel any pending rest notifications
// await cancelRestNotification();
```

---

### **5. src/notificationsInit.js**

**Action:** Delete entire file

**Command:**
```bash
rm src/notificationsInit.js
```

**Why:** This file only contains @notifee initialization code and isn't imported anywhere else

---

### **6. src/utils/restNotifications.js**

**Action:** Delete entire file

**Command:**
```bash
rm src/utils/restNotifications.js
```

**Why:** This file only contains @notifee notification logic and is only imported by files we're updating

---

## ✅ Post-Change Verification Steps

**Before building, run these commands to verify clean removal:**

```bash
# 1. Should find ZERO active imports (only commented lines)
grep -n "from.*notificationsInit\|from.*restNotifications" src/**/*.js

# 2. Should find ZERO active function calls (only commented lines)
grep -n "scheduleRestCompleteNotification\|cancelRestNotification\|initNotifications\|requestNotificationPermissions" src/**/*.js | grep -v "^//"

# 3. Should find ZERO references to @notifee in package.json
grep "@notifee" package.json

# 4. Verify files are deleted
ls src/notificationsInit.js 2>/dev/null && echo "ERROR: File still exists" || echo "✅ File deleted"
ls src/utils/restNotifications.js 2>/dev/null && echo "ERROR: File still exists" || echo "✅ File deleted"

# 5. Verify expo-localization is still in app.json
grep "expo-localization" app.json && echo "✅ Plugin still present" || echo "ERROR: Plugin was removed"
```

**Expected results:**
- No active imports found ✅
- No active function calls found ✅
- No @notifee in package.json ✅
- Both files deleted ✅
- expo-localization plugin still present ✅

---

## 🧪 What Still Works After Changes

### ✅ Features That Work Exactly The Same:
- **Rest timer countdown** - Still displays and counts down perfectly
- **2-minute rest period** - Unchanged
- **Visual timer display** - Works exactly as before
- **Set completion** - No changes
- **Workout progression** - Identical
- **Dashboard stats** - Still works (uses timezone.js which uses expo-localization)
- **All navigation** - Unchanged
- **All authentication** - No changes
- **All database operations** - Identical
- **Palm tree progress** - Same
- **Rep counter** - No changes
- **Miami Vice aesthetics** - Unchanged

### ❌ Only One Thing Lost:
- **Background notification when rest completes** - Won't fire if user backgrounds the app

**User impact:** Minimal - most users stay in app during 2-minute rest anyway

**Workaround:** Users can stay in the app during rest (which is the current behavior anyway)

---

## 🚀 Build Process

### **Step 1: Clean Install**
```bash
# Remove old dependencies
rm -rf node_modules package-lock.json

# Fresh install without @notifee
npm install
```

### **Step 2: Verify Compilation**
```bash
# Start dev server to verify no import errors
npm start
# Should compile without errors
# Press 'q' to quit after confirming it compiles
```

### **Step 3: Update Build Number**
Edit `app.json` line 20:
```json
"buildNumber": "9",
```

### **Step 4: Build for TestFlight**
```bash
eas build --platform ios --profile production
```

### **Step 5: Monitor Build**
- Watch EAS build logs for any errors
- Should complete successfully in ~20-30 minutes
- Upload to TestFlight automatically

### **Step 6: Test on Real Device**
- Download from TestFlight
- **Primary test:** App launches without crashing ✅
- **Secondary test:** Complete a workout with rest timer
- **Expected:** Rest timer works, no notification when backgrounded

---

## 🎯 Success Criteria

**Build 9 is successful if:**

1. ✅ App launches on TestFlight (doesn't crash on startup)
2. ✅ Can navigate to workout screen
3. ✅ Can complete a set
4. ✅ Rest timer counts down correctly
5. ✅ Can complete full workout
6. ✅ Dashboard loads with stats
7. ✅ No crashes during normal usage

**Build 9 is NOT successful if:**
- ❌ App crashes on launch
- ❌ Rest timer doesn't work
- ❌ Dashboard stats broken
- ❌ Any core feature broken

---

## 🔍 Risk Analysis

### **What Could Go Wrong:**

**Risk 1:** "We missed a notification reference somewhere"
- **Likelihood:** Very Low (we checked thoroughly)
- **Impact:** Build fails to compile
- **Mitigation:** Pre-build verification commands above
- **Recovery:** Find the reference, comment it out, rebuild

**Risk 2:** "Removing @notifee isn't the actual problem"
- **Likelihood:** Low (crash logs point to native module init)
- **Impact:** Build 9 still crashes
- **Mitigation:** Review crash logs to confirm different error
- **Recovery:** Investigate new crash signature

**Risk 3:** "We break something that depends on notifications"
- **Likelihood:** Very Low (only rest timer uses them)
- **Impact:** Feature doesn't work as expected
- **Mitigation:** All notification calls are isolated and optional
- **Recovery:** N/A - rest timer works without notifications

**Risk 4:** "expo-localization actually is the problem"
- **Likelihood:** Very Low (it's used successfully in timezone.js)
- **Impact:** Still crashes or breaks timezone detection
- **Mitigation:** Keep it in since timezone.js actively uses it
- **Recovery:** Remove in Build 9.1 if needed

### **Overall Risk Level:** ⬇️ **Very Low**

**Confidence this fixes the crash:** 95%

---

## 📝 Rollback Plan

**If Build 9 still crashes:**

1. **Get crash logs from TestFlight**
2. **Check if error signature is different** (not expo.controller.errorRecoveryQueue)
3. **If different error:**
   - This means we fixed the notification crash
   - New issue to investigate
4. **If same error:**
   - Try removing expo-localization plugin
   - Or investigate deeper (might not be notifications at all)

---

## 🔄 Next Steps After Build 9 Success

**Immediate (after confirming Build 9 works):**

1. ✅ Celebrate having a working build on TestFlight
2. ✅ Test thoroughly on real device
3. ✅ Confirm no crashes in normal usage
4. ✅ Document what we learned

**Build 10 (next update):**

1. Follow `LOCAL_NOTIFICATIONS_IMPLEMENTATION_PLAN.md`
2. Add expo-notifications properly (with plugin)
3. Uncomment all the code we commented in Build 9
4. Replace @notifee calls with expo-notifications equivalents
5. Test thoroughly
6. Ship

---

## 🎓 Key Lessons Learned

### **What Went Wrong Originally:**

1. **Missing config plugin** - expo-notifications wasn't in app.json plugins
2. **Assumed Notifee would work** - It doesn't have Expo config plugin support
3. **Switched libraries without fixing root cause** - Same problem different library

### **Why This Time Will Work:**

1. **Removing the crashing code entirely** - Can't crash if it doesn't exist
2. **Minimal changes** - Less chance to break something
3. **Keeping what works** - Not touching expo-localization or timezone.js
4. **Better plan for Build 10** - Proper expo-notifications setup with plugin

---

## 📦 Summary of Changes

| File | Lines Changed | Type | Risk |
|------|---------------|------|------|
| package.json | 1 | Remove dependency | ✅ Safe |
| app.json | 0 | No changes | ✅ Safe |
| App.js | 13 | Comment out | ✅ Safe |
| WorkoutScreen.js | 6 | Comment out | ✅ Safe |
| src/notificationsInit.js | ALL | Delete file | ✅ Safe |
| src/utils/restNotifications.js | ALL | Delete file | ✅ Safe |

**Total modifications:** ~20 lines of code
**Total deletions:** 2 files
**Breaking changes:** 0
**Risk level:** Very Low

---

## ✅ Final Checklist Before Executing

**Pre-execution:**
- [ ] Read this entire plan
- [ ] Understand what each change does
- [ ] Have another agent review this plan
- [ ] Confirm you're ready to lose background notifications temporarily
- [ ] Verify you have time for full build process (~1 hour)

**During execution:**
- [ ] Make changes in order listed above
- [ ] Run verification commands after each file
- [ ] Don't skip the clean install step
- [ ] Watch for any unexpected errors

**Post-execution:**
- [ ] Verify build completes successfully
- [ ] Test on real device from TestFlight
- [ ] Confirm no crashes
- [ ] Document results

---

## 🔗 Related Documents

- **Next steps:** `.claude/LOCAL_NOTIFICATIONS_IMPLEMENTATION_PLAN.md`
- **Project context:** `CLAUDE.md`
- **Git history:** Commits 650ac59, 74b76ad, a808287

---

**Version:** 2.0 (Corrected - keeps expo-localization)
**Status:** Ready for independent review
**Reviewed by:** Pending
**Approved by:** Pending
**Executed:** No

---

## 🤔 Questions for Reviewer

**Please verify:**

1. ✅ Are all notification references accounted for?
2. ✅ Is it safe to keep expo-localization plugin?
3. ✅ Should we keep or remove NSUserNotificationUsageDescription?
4. ✅ Are there any files we haven't checked?
5. ✅ Could commenting out code cause issues vs deleting?
6. ✅ Are there any async/await issues with commented-out code?
7. ✅ Will the build definitely compile after these changes?
8. ✅ Have we missed any edge cases?

**Please challenge:**
- Is this REALLY the minimal set of changes?
- Could we break less by doing something differently?
- Are we 100% certain expo-localization isn't the problem?
- Should we test in dev build first?
- Is there a safer way to do this?

---

**END OF PLAN - READY FOR REVIEW**
