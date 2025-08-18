// API wrapper for workout generation using Supabase Edge Function
import { supabase } from '../lib/supabase';

export async function generateWorkout({ workoutNum, userMax, cycleStartMax }) {
  try {
    // First, get the current user to check for stored pattern
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('No user logged in');
    
    // Check if we have a stored workout pattern for this workout
    const { data: profile } = await supabase
      .from('profiles')
      .select('next_workout_pattern')
      .eq('id', user.id)
      .single();
    
    // If we have a stored pattern, parse and use it
    if (profile?.next_workout_pattern) {
      console.log('📦 Using stored workout pattern:', profile.next_workout_pattern);
      try {
        const storedWorkout = JSON.parse(profile.next_workout_pattern);
        return storedWorkout;
      } catch (e) {
        console.error('Failed to parse stored pattern, generating new one');
      }
    }
    
    // No stored pattern, generate a new one
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
    
    // Store the generated pattern for future use (only for volume workouts, not max test)
    if (workoutNum !== 1 && workoutNum !== 8) {
      await supabase
        .from('profiles')
        .update({ 
          next_workout_pattern: JSON.stringify(data),
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);
      console.log('💾 Stored workout pattern for next time');
    }
    
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