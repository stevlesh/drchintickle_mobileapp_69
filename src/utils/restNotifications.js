// src/utils/restNotifications.js
import notifee, { AuthorizationStatus } from '@notifee/react-native';
import { Platform } from 'react-native';

let activeNotificationId = null;

export async function hasNotificationPermission() {
  const settings = await notifee.getNotificationSettings();
  return settings.authorizationStatus === AuthorizationStatus.AUTHORIZED;
}

export async function requestNotificationPermissions() {
  const current = await notifee.getNotificationSettings();

  if (current.authorizationStatus === AuthorizationStatus.AUTHORIZED) {
    return true;
  }

  const settings = await notifee.requestPermission();
  return settings.authorizationStatus === AuthorizationStatus.AUTHORIZED;
}

export async function scheduleRestCompleteNotification(seconds = 120) {
  try {
    // De-dupe: only one pending rest notification at a time
    if (activeNotificationId) {
      await notifee.cancelNotification(activeNotificationId);
      activeNotificationId = null;
    }

    const granted = await hasNotificationPermission();
    if (!granted) return null;

    // Calculate fire timestamp (UNIX timestamp in milliseconds)
    const fireTimestamp = Date.now() + seconds * 1000;

    // Create trigger for scheduled notification
    const trigger = {
      type: 0, // TimestampTrigger (bypasses 15-min iOS minimum for IntervalTrigger)
      timestamp: fireTimestamp,
    };

    // Create notification
    const id = await notifee.createTriggerNotification(
      {
        title: 'Rest complete 💪',
        body: 'Time to crush your next set.',
        data: { type: 'rest_complete' },
        ...(Platform.OS === 'android' && {
          android: {
            channelId: 'rest-timer',
            sound: 'default',
            pressAction: {
              id: 'default',
            },
          },
        }),
        ...(Platform.OS === 'ios' && {
          ios: {
            sound: 'default',
            interruptionLevel: 'timeSensitive',
          },
        }),
      },
      trigger
    );

    activeNotificationId = id;

    // Debug: verify notification scheduled correctly
    if (__DEV__) {
      const fireTime = new Date(fireTimestamp);
      console.log(`✅ REST NOTIFICATION SCHEDULED (NOTIFEE):`);
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
      await notifee.cancelNotification(activeNotificationId);
      activeNotificationId = null;
    }
  } catch (e) {
    console.error('cancelRestNotification error', e);
  }
}
