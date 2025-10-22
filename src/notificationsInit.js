// src/notificationsInit.js
import notifee, { AndroidImportance } from '@notifee/react-native';
import { Platform } from 'react-native';

export async function initNotifications() {
  // Notifee handles foreground display automatically via display hints
  // No need for explicit handler like expo-notifications

  // Android 8+: Create notification channel
  // Note: Vibration pattern set at channel level (Android only)
  // iOS uses system default vibration
  if (Platform.OS === 'android') {
    await notifee.createChannel({
      id: 'rest-timer',
      name: 'Rest Timer',
      importance: AndroidImportance.HIGH,
      sound: 'default',
      vibration: true,
      vibrationPattern: [300, 500],
      visibility: 1, // VISIBILITY_PUBLIC
    });
  }

  // iOS: No setup needed - Notifee handles permissions + display automatically
}
