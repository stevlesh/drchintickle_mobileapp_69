// API wrapper for workout generation using Supabase Edge Function
import { supabase } from '../lib/supabase';

export async function generateWorkout({ workoutNum, userMax, cycleStartMax }) {
  try {
    console.log('🚀 Calling Supabase Edge Function for workout generation...');
    
    const { data, error } = await supabase.functions.invoke('generate-workout', {
      body: {
        workoutNum,
        userMax,
        cycleStartMax,
      },
    });

    if (error) {
      console.error('❌ Edge Function error:', error);
      throw error;
    }

    console.log('✅ Edge Function success! Generated workout:', data);
    return data;
  } catch (error) {
    console.error('⚠️ Falling back to local workout generation:', error);
    // Fallback to local generation if edge function fails
    // This ensures the app continues working even if the edge function is down
    const { getWorkoutForCycle } = require('./workoutEngine');
    const localResult = getWorkoutForCycle({ workoutNum, userMax, cycleStartMax });
    console.log('📱 Local generation result:', localResult);
    return localResult;
  }
}