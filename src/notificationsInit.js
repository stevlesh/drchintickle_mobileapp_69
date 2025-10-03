// src/notificationsInit.js
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

export async function initNotifications() {
  // One global handler (runs once in app root)
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
    }),
  });

  // Android 8+: use a channel or sound/priority may be ignored
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('rest-timer', {
      name: 'Rest Timer',
      importance: Notifications.AndroidImportance.HIGH,
      sound: 'default', // Phase 1 = system ding; Phase 2 swaps to custom
      vibrationPattern: [0, 250, 250, 250],
      lockscreenVisibility: Notifications.AndroidNotificationVisibility.PUBLIC,
    });
  }
}
