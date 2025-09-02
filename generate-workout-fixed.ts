// Supabase Edge Function for server-side workout generation with idempotency
// Moves core business logic to server to enable rapid iteration without app store approval
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS, PUT, DELETE',
  'Access-Control-Max-Age': '86400'
};
// Response version for contract consistency
const RESPONSE_VERSION = 1;
// Rep distribution patterns - can be moved to database table later
const repPatterns = [
  'Equal Sets',
  'Descending',
  'Ascending',
  'Pyramid',
  'Reverse Pyramid',
  'Wave Loading',
  'Drop Sets',
  'Ladder'
];
// Multiplier progression for workouts 2-8 (linear from 2.6 to 3.0)
function getMultiplierForWorkout(workoutNum) {
  if (workoutNum === 1) return null; // Max test
  if (workoutNum < 2) return 2.6;
  if (workoutNum > 8) return 3.0;
  // Linear progression: 2.6 (w2) → 3.0 (w8)
  return 2.6 + (workoutNum - 2) * (3.0 - 2.6) / 6;
}
// Cryptographically secure random pattern selection
function pickRandomPattern() {
  const randomBytes = new Uint32Array(1);
  crypto.getRandomValues(randomBytes);
  const randomIndex = randomBytes[0] % repPatterns.length;
  return repPatterns[randomIndex];
}
// Generate cryptographic seed for audit trail
function generateSeed() {
  const randomBytes = new BigUint64Array(1);
  crypto.getRandomValues(randomBytes);
  return randomBytes[0];
}
// Generate set breakdown for a given pattern, total reps, and user max
function generateSetBreakdown(pattern, totalReps, userMax) {
  const maxPerSet = Math.floor(userMax * 0.6);
  let sets = Array(8).fill(0);
  switch(pattern){
    case 'Equal Sets':
      {
        const base = Math.floor(totalReps / 8);
        const remainder = totalReps % 8;
        sets = Array(8).fill(base);
        for(let i = 0; i < remainder; i++)sets[i] += 1;
        break;
      }
    case 'Descending':
      {
        // Start high, go low
        let sum = 0;
        for(let i = 0; i < 8; i++){
          sets[i] = Math.max(1, Math.round(totalReps * (1.2 - i * 0.05) / 8));
          sets[i] = Math.min(sets[i], maxPerSet);
          sum += sets[i];
        }
        // Adjust to match totalReps
        let diff = totalReps - sum;
        for(let i = 0; diff !== 0 && i < 8; i++){
          const idx = diff > 0 ? i : 7 - i;
          const canAdd = diff > 0 && sets[idx] < maxPerSet;
          const canSub = diff < 0 && sets[idx] > 1;
          if (canAdd) {
            sets[idx]++;
            diff--;
          } else if (canSub) {
            sets[idx]--;
            diff++;
          }
        }
        break;
      }
    case 'Ascending':
      {
        // Start low, go high - with more dramatic increase
        let sum = 0;
        for(let i = 0; i < 8; i++){
          sets[i] = Math.max(1, Math.round(totalReps * (0.7 + i * 0.075) / 8));
          sets[i] = Math.min(sets[i], maxPerSet);
          sum += sets[i];
        }
        let diff = totalReps - sum;
        for(let i = 0; diff !== 0 && i < 8; i++){
          const idx = diff > 0 ? 7 - i : i;
          const canAdd = diff > 0 && sets[idx] < maxPerSet;
          const canSub = diff < 0 && sets[idx] > 1;
          if (canAdd) {
            sets[idx]++;
            diff--;
          } else if (canSub) {
            sets[idx]--;
            diff++;
          }
        }
        break;
      }
    case 'Pyramid':
      {
        // Up then down
        let base = Math.floor(totalReps / 8);
        sets = [
          base,
          base + 1,
          base + 2,
          base + 3,
          base + 3,
          base + 2,
          base + 1,
          base
        ];
        let sum = sets.reduce((a, b)=>a + b, 0);
        let diff = totalReps - sum;
        for(let i = 0; diff !== 0 && i < 8; i++){
          const idx = i < 4 ? i : 7 - i;
          const canAdd = diff > 0 && sets[idx] < maxPerSet;
          const canSub = diff < 0 && sets[idx] > 1;
          if (canAdd) {
            sets[idx]++;
            diff--;
          } else if (canSub) {
            sets[idx]--;
            diff++;
          }
        }
        break;
      }
    case 'Reverse Pyramid':
      {
        // Down then up
        let base = Math.floor(totalReps / 8);
        sets = [
          base + 3,
          base + 2,
          base + 1,
          base,
          base,
          base + 1,
          base + 2,
          base + 3
        ];
        let sum = sets.reduce((a, b)=>a + b, 0);
        let diff = totalReps - sum;
        for(let i = 0; diff !== 0 && i < 8; i++){
          const idx = i < 4 ? 7 - i : i;
          const canAdd = diff > 0 && sets[idx] < maxPerSet;
          const canSub = diff < 0 && sets[idx] > 1;
          if (canAdd) {
            sets[idx]++;
            diff--;
          } else if (canSub) {
            sets[idx]--;
            diff++;
          }
        }
        break;
      }
    case 'Wave Loading':
      {
        // Alternate high/low
        let high = Math.min(maxPerSet, Math.ceil(totalReps / 7));
        let low = Math.max(1, Math.floor(totalReps / 10));
        sets = Array(8).fill(0).map((_, i)=>i % 2 === 0 ? high : low);
        let sum = sets.reduce((a, b)=>a + b, 0);
        let diff = totalReps - sum;
        for(let i = 0; diff !== 0 && i < 8; i++){
          const idx = i % 2 === 0 ? i : 7 - i;
          const canAdd = diff > 0 && sets[idx] < maxPerSet;
          const canSub = diff < 0 && sets[idx] > 1;
          if (canAdd) {
            sets[idx]++;
            diff--;
          } else if (canSub) {
            sets[idx]--;
            diff++;
          }
        }
        break;
      }
    case 'Drop Sets':
      {
        // First few high, then taper
        let high = Math.min(maxPerSet, Math.ceil(totalReps / 6));
        let low = Math.max(1, Math.floor(totalReps / 12));
        sets = [
          high,
          high,
          high,
          low,
          low,
          low,
          low,
          low
        ];
        let sum = sets.reduce((a, b)=>a + b, 0);
        let diff = totalReps - sum;
        for(let i = 0; diff !== 0 && i < 8; i++){
          const idx = i < 3 ? i : 7 - i;
          const canAdd = diff > 0 && sets[idx] < maxPerSet;
          const canSub = diff < 0 && sets[idx] > 1;
          if (canAdd) {
            sets[idx]++;
            diff--;
          } else if (canSub) {
            sets[idx]--;
            diff++;
          }
        }
        break;
      }
    case 'Ladder':
      {
        // 8-10-12-14, repeat or similar
        let base = Math.floor(totalReps / 44);
        sets = [
          8,
          10,
          12,
          14,
          14,
          12,
          10,
          8
        ].map((x)=>Math.max(1, Math.min(x * base, maxPerSet)));
        let sum = sets.reduce((a, b)=>a + b, 0);
        let diff = totalReps - sum;
        for(let i = 0; diff !== 0 && i < 8; i++){
          const canAdd = diff > 0 && sets[i] < maxPerSet;
          const canSub = diff < 0 && sets[i] > 1;
          if (canAdd) {
            sets[i]++;
            diff--;
          } else if (canSub) {
            sets[i]--;
            diff++;
          }
        }
        break;
      }
    default:
      {
        // Fallback to equal sets
        const base = Math.floor(totalReps / 8);
        const remainder = totalReps % 8;
        sets = Array(8).fill(base);
        for(let i = 0; i < remainder; i++)sets[i] += 1;
        break;
      }
  }
  return sets;
}

// Helper function to apply contract guarantee
function applyContractGuarantee(response, workoutNum, cycleNum, userMax) {
  const isFirstWorkout = workoutNum === 1;
  
  // Deep clone the response to avoid mutations
  let finalResponse = JSON.parse(JSON.stringify(response));
  
  if (isFirstWorkout) {
    // Workout 1 MUST be max test
    finalResponse.type = 'max_test';
    finalResponse.requiresMaxTest = true;
    finalResponse.pattern = 'Baseline';
    finalResponse.patternName = 'Baseline Max Test';
    finalResponse.setBreakdown = [];
    finalResponse.totalReps = 0;
  } else {
    // Workouts 2-8 MUST be volume (never max test)
    finalResponse.type = workoutNum === 8 ? 'intensity' : 'volume';
    finalResponse.requiresMaxTest = false;
    
    // If pattern is baseline or missing, generate a proper volume pattern
    if (!finalResponse.setBreakdown?.length || 
        /baseline/i.test(finalResponse.pattern ?? '') ||
        !finalResponse.pattern) {
      const pattern = pickRandomPattern();
      const multiplier = getMultiplierForWorkout(workoutNum) || 2.6;
      const totalReps = Math.round(multiplier * (userMax || 10)); // fallback to 10 if no max
      const setBreakdown = generateSetBreakdown(pattern, totalReps, userMax || 10);
      
      finalResponse.pattern = pattern;
      finalResponse.patternName = pattern;
      finalResponse.setBreakdown = setBreakdown;
      finalResponse.totalReps = setBreakdown.reduce((a, b) => a + b, 0);
    }
  }
  
  // Ensure workoutNum and cycleNum are always present
  finalResponse.workoutNum = workoutNum;
  finalResponse.cycleNum = cycleNum;
  
  return finalResponse;
}

serve(async (req)=>{
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', {
      headers: corsHeaders,
      status: 200
    });
  }
  
  let workoutNum = 1;
  let cycleNum = 1;
  let userMax = 0;
  
  try {
    const supabaseClient = createClient(Deno.env.get('SUPABASE_URL') ?? '', Deno.env.get('SUPABASE_ANON_KEY') ?? '', {
      global: {
        headers: {
          Authorization: req.headers.get('Authorization') ?? ''
        }
      }
    });
    // Get the user
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser();
    if (authError || !user) {
      console.log('❌ No authenticated user found');
      const response = {
        version: RESPONSE_VERSION,
        type: 'max_test',
        pattern: 'Baseline',
        patternName: 'Baseline Max Test',
        totalReps: 0,
        setBreakdown: [],
        requiresMaxTest: true,
        workoutNum: 1,
        isNewUser: true,
        reason: 'no_user'
      };
      
      // Apply contract guarantee even for no-user case
      const finalResponse = applyContractGuarantee(response, 1, 1, 0);
      
      return new Response(JSON.stringify(finalResponse), {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        },
        status: 200
      });
    }
    // Get profile data including cycle_num
    const { data: profile, error: profileError } = await supabaseClient.from('profiles').select('current_max_pullups, current_workout_in_cycle, cycle_start_max, cycle_num').eq('id', user.id).maybeSingle();
    if (profileError) {
      console.error('❌ Profile error:', profileError);
    }
    
    workoutNum = profile?.current_workout_in_cycle ?? 1;
    cycleNum = profile?.cycle_num ?? 1;
    const max = profile?.current_max_pullups ?? 0;
    userMax = max;
    const isNewUser = !max;
    
    // Handle missing profile or zero max (new users)
    if (!profile || !profile.current_max_pullups || profile.current_max_pullups === 0) {
      console.log(`🎯 User ${user.id} needs max test: profile=${!!profile}, max=${profile?.current_max_pullups}`);
      const response = {
        version: RESPONSE_VERSION,
        type: 'max_test',
        pattern: 'Baseline',
        patternName: 'Baseline Max Test',
        totalReps: 0,
        setBreakdown: [],
        requiresMaxTest: true,
        workoutNum: 1,
        cycleNum,
        isNewUser: true,
        reason: !profile ? 'no_profile' : 'no_stats'
      };
      
      const finalResponse = applyContractGuarantee(response, workoutNum, cycleNum, userMax);
      
      return new Response(JSON.stringify(finalResponse), {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        },
        status: 200
      });
    }
    
    // Handle workout 1 (max test)
    if (workoutNum === 1) {
      const response = {
        version: RESPONSE_VERSION,
        type: 'max_test',
        pattern: 'Baseline',
        patternName: 'Baseline Max Test',
        totalReps: 0,
        setBreakdown: [],
        requiresMaxTest: true,
        workoutNum,
        cycleNum,
        isNewUser,
        reason: isNewUser ? 'no_stats' : 'cycle_start'
      };
      
      const finalResponse = applyContractGuarantee(response, workoutNum, cycleNum, userMax);
      
      return new Response(JSON.stringify(finalResponse), {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        },
        status: 200
      });
    }
    
    // Check if workout already exists (idempotency)
    const { data: existingWorkout, error: existingError } = await supabaseClient.from('workouts').select('*').eq('user_id', user.id).eq('cycle_num', cycleNum).eq('workout_num', workoutNum).maybeSingle();
    if (existingWorkout) {
      console.log(`🔄 Returning existing workout for user ${user.id}, cycle ${cycleNum}, workout ${workoutNum}`);
      const response = {
        version: RESPONSE_VERSION,
        type: workoutNum === 8 ? 'intensity' : 'volume',
        pattern: existingWorkout.pattern,
        patternName: existingWorkout.pattern,
        totalReps: existingWorkout.total_reps,
        setBreakdown: existingWorkout.set_breakdown,
        requiresMaxTest: false,
        workoutNum,
        cycleNum,
        isNewUser: false,
        reason: 'existing'
      };
      
      const finalResponse = applyContractGuarantee(response, workoutNum, cycleNum, userMax);
      
      return new Response(JSON.stringify(finalResponse), {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        },
        status: 200
      });
    }
    
    // Generate new workout with random pattern
    const multiplier = getMultiplierForWorkout(workoutNum);
    if (!multiplier) {
      throw new Error(`Invalid workout number: ${workoutNum}`);
    }
    const cycleStartMax = profile.cycle_start_max || profile.current_max_pullups;
    const totalReps = Math.round(multiplier * cycleStartMax);
    const pattern = pickRandomPattern();
    const setBreakdown = generateSetBreakdown(pattern, totalReps, max);
    const actualTotalReps = setBreakdown.reduce((a, b)=>a + b, 0);
    const seed = generateSeed();
    console.log(`🎲 Generated random workout for user ${user.id}: ${pattern}, total=${actualTotalReps}, seed=${seed}`);
    
    // Save workout with first-write-wins idempotency
    const { data: savedWorkout, error: saveError } = await supabaseClient.rpc('save_workout_once', {
      _user_id: user.id,
      _cycle_num: cycleNum,
      _workout_num: workoutNum,
      _pattern: pattern,
      _set_breakdown: setBreakdown,
      _total_reps: actualTotalReps,
      _seed: seed.toString()
    });
    if (saveError) {
      console.error('❌ Error saving workout:', saveError);
      throw saveError;
    }
    console.log(`✅ Saved workout for user ${user.id}: ${pattern}`);
    
    const response = {
      version: RESPONSE_VERSION,
      type: workoutNum === 8 ? 'intensity' : 'volume',
      pattern: savedWorkout.pattern,
      patternName: savedWorkout.pattern,
      totalReps: savedWorkout.total_reps,
      setBreakdown: savedWorkout.set_breakdown,
      requiresMaxTest: false,
      workoutNum,
      cycleNum,
      isNewUser: false,
      reason: 'generated'
    };
    
    const finalResponse = applyContractGuarantee(response, workoutNum, cycleNum, userMax);
    
    return new Response(JSON.stringify(finalResponse), {
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json'
      },
      status: 200
    });
  } catch (error) {
    console.error('❌ Error generating workout:', error);
    
    // On error, generate a safe fallback based on the actual workout number
    // This prevents max test from appearing for workouts 2-8 even on error
    const fallbackResponse = {
      version: RESPONSE_VERSION,
      type: 'volume',
      pattern: 'Equal Sets',
      patternName: 'Equal Sets',
      totalReps: 26, // Safe default (10 max * 2.6 multiplier)
      setBreakdown: [4, 3, 3, 3, 3, 3, 3, 4], // Distributes 26 reps
      requiresMaxTest: false,
      workoutNum: workoutNum,
      cycleNum: cycleNum,
      isNewUser: false,
      reason: 'error_fallback'
    };
    
    // Apply contract guarantee to ensure correct type based on workoutNum
    const finalResponse = applyContractGuarantee(fallbackResponse, workoutNum, cycleNum, userMax || 10);
    
    return new Response(JSON.stringify(finalResponse), {
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json'
      },
      status: 200
    });
  }
});