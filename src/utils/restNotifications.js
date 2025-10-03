// src/utils/restNotifications.js
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

let activeNotificationId = null;

export async function hasNotificationPermission() {
  const perms = await Notifications.getPermissionsAsync();
  return !!perms.granted;
}

export async function requestNotificationPermissions() {
  const cur = await Notifications.getPermissionsAsync();
  if (cur.granted) return true;
  const req = await Notifications.requestPermissionsAsync();
  return !!req.granted;
}

export async function scheduleRestCompleteNotification(seconds = 120) {
  try {
    // De-dupe: only one pending rest notification at a time
    if (activeNotificationId) {
      await Notifications.cancelScheduledNotificationAsync(activeNotificationId);
      activeNotificationId = null;
    }

    const granted = await hasNotificationPermission();
    if (!granted) return null;

    const id = await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Rest complete 💪',
        body: 'Time to crush your next set.',
        sound: true, // Changed from 'default' to true for better iOS compatibility
        vibrate: [0, 250, 250, 250],
        data: { type: 'rest_complete' },
        ...(Platform.OS === 'ios' && {
          interruptionLevel: 'timeSensitive', // Makes sound more prominent on iOS
        }),
      },
      trigger: Platform.OS === 'ios'
        ? new Date(Date.now() + seconds * 1000) // A/B TEST: Use Date trigger instead of time-interval
        : {
            seconds: seconds,
            channelId: 'rest-timer',
          },
    });

    activeNotificationId = id;

    // Debug: verify notification scheduled correctly
    if (__DEV__) {
      const fireTime = new Date(Date.now() + seconds * 1000);
      console.log(`✅ REST NOTIFICATION SCHEDULED (DATE TRIGGER TEST):`);
      console.log(`   - ID: ${id}`);
      console.log(`   - Will fire at: ${fireTime.toLocaleTimeString()}`);
    }

    return id;
  } catch (e) {
    console.error('scheduleRestCompleteNotification error', e);
    return null;
  }
}

export async function cancelRestNotification() {
  try {
    if (activeNotificationId) {
      await Notifications.cancelScheduledNotificationAsync(activeNotificationId);
      activeNotificationId = null;
    }
  } catch (e) {
    console.error('cancelRestNotification error', e);
  }
}
