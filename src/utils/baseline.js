// utils/baseline.js
import AsyncStorage from '@react-native-async-storage/async-storage';

const DEBUG_BASELINE = false; // flip if you need traces

export async function shouldShowBaselinePopup({
  userId,
  cycleNum,
  workoutNum,
  currentMax,            // number | null | undefined
  hasOnboarded,          // boolean
}) {
  try {
    const firstWorkout = workoutNum === 1;
    const hasMax = (currentMax ?? 0) > 0;
    const alreadyOnboarded = !!hasOnboarded;

    // one-time per user per cycle
    const key = `baselinePromptShown:${userId}:${cycleNum}`;
    const alreadyPrompted = !!(await AsyncStorage.getItem(key));

    const show =
      firstWorkout &&
      !hasMax &&
      !alreadyOnboarded &&
      !alreadyPrompted;

    if (DEBUG_BASELINE) {
      // eslint-disable-next-line no-console
      console.log('BASELINE_POPUP_CHECK', {
        cycleNum, workoutNum, currentMax, hasOnboarded, alreadyPrompted, show,
      });
    }

    if (show) {
      await AsyncStorage.setItem(key, '1'); // persist so reloads don't nag
    }

    return { show };
  } catch (e) {
    if (DEBUG_BASELINE) console.warn('BASELINE_POPUP_ERROR', e);
    // Fail safe: do not block the flow; don't show popup on error
    return { show: false, error: e };
  }
}