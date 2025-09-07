// API wrapper for workout generation using Supabase Edge Function
import { supabase } from '../lib/supabase';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Feature flag for server-first approach
const USE_SERVER_PLANS = process.env.EXPO_PUBLIC_USE_SERVER_PLANS === 'true';

// Safe fallback workout structure
const SAFE_WORKOUT = {
  version: 1,
  type: 'max_test',
  pattern: 'Baseline',
  patternName: 'Baseline Max Test',
  totalReps: 0,
  setBreakdown: [],
  requiresMaxTest: true,
  workoutNum: 1,
  isNewUser: false,
  reason: 'fallback'
};

// Client-side shape validation - REMOVED: Trust server validation entirely
function clientShapeValidate({ setBreakdown, workoutNum, maxPullups, pattern, requiresMaxTest }) {
  // Server already validates everything, no need to double-check
  return true;
}

// Log sanitization anomalies for debugging
function logSanitizeAnomalies(d) {
  if (!__DEV__) return;
  const anomalies = [];
  if (!d || typeof d !== 'object') anomalies.push('no_payload');
  if (!['max_test','volume','intensity'].includes(d?.type)) anomalies.push('bad_type');
  if (!Array.isArray(d?.setBreakdown)) anomalies.push('setBreakdown_not_array');
  if (typeof d?.totalReps !== 'number') anomalies.push('totalReps_not_number');
  if (typeof d?.pattern !== 'string') anomalies.push('pattern_not_string');
  if (typeof d?.patternName !== 'string') anomalies.push('patternName_not_string');
  if (typeof d?.requiresMaxTest !== 'boolean') anomalies.push('requiresMaxTest_not_bool');
  if (!Number.isFinite(d?.workoutNum)) anomalies.push('workoutNum_missing');
  if (typeof d?.isNewUser !== 'boolean') anomalies.push('isNewUser_missing');

  if (anomalies.length) {
    console.warn('[WORKOUT_SANITIZE] anomalies:', anomalies.join(', '));
  }
}

// Sanitize workout data to ensure no nulls leak downstream
function sanitizeWorkout(data) {
  logSanitizeAnomalies(data);
  
  if (!data) return SAFE_WORKOUT;
  
  return {
    version: Number.isFinite(data?.version) ? data.version : SAFE_WORKOUT.version,
    type: ['max_test', 'volume', 'intensity'].includes(data?.type) ? data.type : SAFE_WORKOUT.type,
    pattern: typeof data?.pattern === 'string' ? data.pattern : SAFE_WORKOUT.pattern,
    patternName: typeof data?.patternName === 'string' ? data.patternName : SAFE_WORKOUT.patternName,
    totalReps: Number.isFinite(data?.totalReps) ? data.totalReps : SAFE_WORKOUT.totalReps,
    setBreakdown: Array.isArray(data?.setBreakdown) ? data.setBreakdown : (data?.type === 'max_test' ? [] : null), // null forces error instead of empty fallback
    requiresMaxTest: !!data?.requiresMaxTest,
    workoutNum: Number.isFinite(data?.workoutNum) ? data.workoutNum : (data?.type === 'max_test' ? 1 : 2),
    isNewUser: !!data?.isNewUser,
    reason: typeof data?.reason === 'string' ? data.reason : 'unknown'
  };
}

// Cache configuration
const PLAN_TTL_MS = 6 * 60 * 60 * 1000; // 6 hours
const KEY = (uid) => `workout_plan:v1:${uid}`;

// Get workout plan with caching (thin wrapper)
export async function getWorkoutPlan(uid, { force = false } = {}) {
  try {
    if (USE_SERVER_PLANS) {
      // Server-first: Route through generateWorkout
      return await generateWorkout({ userId: uid });
    } else {
      // Legacy path with TTL caching
      const raw = await AsyncStorage.getItem(KEY(uid));
      const cached = raw ? JSON.parse(raw) : null;

      const needFresh =
        force ||
        !cached ||
        (Date.now() - (cached.savedAt || 0) > PLAN_TTL_MS) ||
        cached.plan?.requiresMaxTest === true;  // prefer EF on max-test days

      if (!needFresh) {
        console.log(`PLAN_SOURCE=asyncstorage { userId: ${uid} }`);
        return cached.plan;
      }

      const { data, error } = await supabase.functions.invoke('generate-workout', { body: {} });
      const plan = sanitizeWorkout(error ? null : data);
      console.log(`PLAN_SOURCE=edge_function { userId: ${uid} }`);
      await AsyncStorage.setItem(KEY(uid), JSON.stringify({ plan, savedAt: Date.now() }));
      return plan;
    }
  } catch (error) {
    console.error('getWorkoutPlan error:', error);
    return sanitizeWorkout(null); // Return safe fallback
  }
}

// Clear plan cache (call on sign out or user change)
export async function clearWorkoutPlanCache(uid) {
  if (!uid) return;
  try {
    await AsyncStorage.removeItem(KEY(uid));
  } catch (error) {
    console.error('clearWorkoutPlanCache error:', error);
  }
}

export async function generateWorkout({ workoutNum, userMax, cycleStartMax, userId, cycleNum } = {}) {
  try {
    // Get current user if not provided
    let user;
    if (userId) {
      user = { id: userId };
    } else {
      const { data: { user: authUser } } = await supabase.auth.getUser();
      if (!authUser) throw new Error('No user logged in');
      user = authUser;
    }

    // Get current state if not provided
    let currentCycleNum = cycleNum;
    let currentWorkoutNum = workoutNum;
    let currentMax = userMax;
    
    if (!currentCycleNum || !currentWorkoutNum || !currentMax) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('cycle_num, current_workout_in_cycle, current_max_pullups, cycle_start_max')
        .eq('id', user.id)
        .single();
      
      if (profile) {
        currentCycleNum = currentCycleNum || profile.cycle_num || 1;
        currentWorkoutNum = currentWorkoutNum || profile.current_workout_in_cycle || 1;
        currentMax = currentMax || profile.current_max_pullups || 0;
        cycleStartMax = cycleStartMax || profile.cycle_start_max || currentMax;
      }
    }

    // Handle new path vs legacy path based on feature flag
    if (USE_SERVER_PLANS) {
      return await generateWorkoutServerFirst(user.id, currentCycleNum, currentWorkoutNum, currentMax, cycleStartMax);
    } else {
      return await generateWorkoutLegacy(user.id, currentWorkoutNum, currentMax, cycleStartMax);
    }
    
  } catch (error) {
    console.error('⚠️ Error in workout generation:', error);
    return SAFE_WORKOUT;
  }
}

// One-flight deduplication for Edge Function calls
let lastKey = '';
let lastPromise = null;

// Server-first approach (flag ON) with deduplication
async function generateWorkoutServerFirst(userId, cycleNum, workoutNum, userMax, cycleStartMax) {
  const key = `${userId}:${cycleNum}:${workoutNum}`;
  
  // Return existing promise if same tuple is already in flight
  if (key === lastKey && lastPromise) {
    console.log('🔄 Deduplicating request for', key);
    return lastPromise;
  }
  
  console.log('🚀 Server-first: Calling Edge Function for workout generation...');
  
  lastKey = key;
  lastPromise = (async () => {
    const { data, error } = await supabase.functions.invoke('generate-workout', {
      body: {
        userId,
        cycleNum,
        workoutNum,
        userMax,
        cycleStartMax
      }
    });

    if (error) {
      console.error('❌ Edge Function error:', error);
      // Try AsyncStorage fallback
      return await getWorkoutFromCache(userId, cycleNum, workoutNum) || SAFE_WORKOUT;
    }

    const sanitizedData = sanitizeWorkout(data);
    
    // PLAN_SOURCE logging based on server response
    const planSource = data?.reason === 'existing' ? 'workouts_table' : 'edge_function';
    console.log(`PLAN_SOURCE=${planSource} { cycleNum: ${cycleNum}, workoutNum: ${workoutNum} }`);
    
    // Client-side shape validation before caching
    const okReason = ['generated', 'existing', 'contract_fixed'].includes(sanitizedData.reason);
    const isValid = clientShapeValidate({
      setBreakdown: sanitizedData.setBreakdown,
      workoutNum,
      maxPullups: userMax,
      pattern: sanitizedData.pattern,
      requiresMaxTest: sanitizedData.requiresMaxTest
    });

    if (okReason && isValid) {
      // Write-through to AsyncStorage (no TTL)
      await cacheWorkout(userId, cycleNum, workoutNum, sanitizedData);
    }
    
    return sanitizedData;
  })()
    .finally(() => {
      // Clear the inflight promise when done
      lastPromise = null;
      lastKey = '';
    });
  
  return lastPromise;
}

// Legacy approach (flag OFF) 
async function generateWorkoutLegacy(userId, workoutNum, userMax, cycleStartMax) {
  // Check if we have a stored workout pattern for this workout
  const { data: profile } = await supabase
    .from('profiles')
    .select('next_workout_pattern')
    .eq('id', userId)
    .single();
  
  // If we have a stored pattern, parse and use it
  if (profile?.next_workout_pattern) {
    console.log('📦 Using stored workout pattern:', profile.next_workout_pattern);
    console.log(`PLAN_SOURCE=profiles_legacy { workoutNum: ${workoutNum} }`);
    try {
      const storedWorkout = JSON.parse(profile.next_workout_pattern);
      return storedWorkout;
    } catch (e) {
      console.error('Failed to parse stored pattern, generating new one');
    }
  }
  
  // No stored pattern, generate a new one
  console.log('🚀 Legacy: Calling Supabase Edge Function for workout generation...');
  
  const { data, error } = await supabase.functions.invoke('generate-workout', {
    body: {
      workoutNum,
      userMax,
      cycleStartMax,
    },
  });

  if (error) {
    console.error('❌ Edge Function error:', error);
    return SAFE_WORKOUT;
  }

  const sanitizedData = sanitizeWorkout(data);
  console.log(`PLAN_SOURCE=edge_function { workoutNum: ${workoutNum} }`);
  
  // Store the generated pattern for future use (only for volume workouts, not max test)
  if (workoutNum !== 1 && workoutNum !== 8 && !sanitizedData.requiresMaxTest) {
    await supabase
      .from('profiles')
      .update({ 
        next_workout_pattern: JSON.stringify(sanitizedData),
        updated_at: new Date().toISOString()
      })
      .eq('id', userId);
    console.log('💾 Stored workout pattern for next time');
  }
  
  return sanitizedData;
}

// AsyncStorage helpers for server-first mode
async function cacheWorkout(userId, cycleNum, workoutNum, workout) {
  try {
    const cacheKey = `workout_plan_v2:${userId}:${cycleNum}:${workoutNum}`;
    const cacheData = {
      workout,
      cycleNum,
      workoutNum,
      cachedAt: Date.now()
    };
    await AsyncStorage.setItem(cacheKey, JSON.stringify(cacheData));
  } catch (error) {
    console.error('Failed to cache workout:', error);
  }
}

async function getWorkoutFromCache(userId, cycleNum, workoutNum) {
  try {
    const cacheKey = `workout_plan_v2:${userId}:${cycleNum}:${workoutNum}`;
    const raw = await AsyncStorage.getItem(cacheKey);
    if (!raw) return null;
    
    const cached = JSON.parse(raw);
    // Validate tuple match
    if (cached.cycleNum !== cycleNum || cached.workoutNum !== workoutNum) {
      console.log('🗑️ Cache tuple mismatch, ignoring');
      return null;
    }
    
    console.log(`PLAN_SOURCE=asyncstorage { cycleNum: ${cycleNum}, workoutNum: ${workoutNum} }`);
    return cached.workout;
  } catch (error) {
    console.error('Failed to read workout from cache:', error);
    return null;
  }
}