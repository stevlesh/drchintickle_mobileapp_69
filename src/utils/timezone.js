import * as Localization from 'expo-localization';

/**
 * Get the user's device timezone for server-side calculations.
 * Falls back to NYC timezone if detection fails.
 *
 * @returns {string} IANA timezone identifier (e.g., 'Asia/Singapore', 'America/New_York')
 */
export const getTimezone = () => {
  try {
    // Try to get timezone from device calendars (most reliable)
    const timezone = Localization.getCalendars?.()?.[0]?.timeZone;

    if (timezone) {
      return timezone;
    }

    // Fallback to locale timezone
    return Localization.getLocales()?.[0]?.regionCode || 'America/New_York';
  } catch (error) {
    console.warn('Failed to detect device timezone, falling back to NYC:', error);
    return 'America/New_York';
  }
};