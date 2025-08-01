// Dynamic Workout Engine for Dr. ChinTickle App
// Handles workout cycle logic, rep calculation, and pattern selection

// Rep distribution patterns
const repPatterns = [
  'Equal Sets',
  'Descending',
  'Ascending',
  'Pyramid',
  'Reverse Pyramid',
  'Wave Loading',
  'Drop Sets',
  'Ladder',
];

// Multiplier progression for workouts 2-8 (linear from 2.6 to 3.0)
function getMultiplierForWorkout(workoutNum) {
  if (workoutNum === 1) return null; // Max test
  if (workoutNum < 2) return 2.6;
  if (workoutNum > 8) return 3.0;
  // Linear progression: 2.6 (w2) → 3.0 (w8)
  return 2.6 + ((workoutNum - 2) * (3.0 - 2.6) / 6);
}

// Randomly select a pattern
function pickRandomPattern() {
  const idx = Math.floor(Math.random() * repPatterns.length);
  return repPatterns[idx];
}

// Generate set breakdown for a given pattern, total reps, and user max
function generateSetBreakdown(pattern, totalReps, userMax) {
  const maxPerSet = Math.floor(userMax * 0.6);
  let sets = Array(8).fill(0);
  switch (pattern) {
    case 'Equal Sets': {
      const base = Math.floor(totalReps / 8);
      const remainder = totalReps % 8;
      sets = Array(8).fill(base);
      for (let i = 0; i < remainder; i++) sets[i] += 1;
      break;
    }
    case 'Descending': {
      // Start high, go low
      let sum = 0;
      for (let i = 0; i < 8; i++) {
        sets[i] = Math.max(1, Math.round(totalReps * (1.2 - i * 0.05) / 8));
        sets[i] = Math.min(sets[i], maxPerSet);
        sum += sets[i];
      }
      // Adjust to match totalReps
      let diff = totalReps - sum;
      for (let i = 0; diff !== 0 && i < 8; i++) {
        const idx = diff > 0 ? i : 7 - i;
        const canAdd = diff > 0 && sets[idx] < maxPerSet;
        const canSub = diff < 0 && sets[idx] > 1;
        if (canAdd) { sets[idx]++; diff--; }
        else if (canSub) { sets[idx]--; diff++; }
      }
      break;
    }
    case 'Ascending': {
      // Start low, go high - with more dramatic increase
      let sum = 0;
      // Using a wider range (0.7 to 1.3) for more dramatic ascension
      for (let i = 0; i < 8; i++) {
        sets[i] = Math.max(1, Math.round(totalReps * (0.7 + i * 0.075) / 8));
        sets[i] = Math.min(sets[i], maxPerSet);
        sum += sets[i];
      }
      let diff = totalReps - sum;
      for (let i = 0; diff !== 0 && i < 8; i++) {
        const idx = diff > 0 ? 7 - i : i;
        const canAdd = diff > 0 && sets[idx] < maxPerSet;
        const canSub = diff < 0 && sets[idx] > 1;
        if (canAdd) { sets[idx]++; diff--; }
        else if (canSub) { sets[idx]--; diff++; }
      }
      break;
    }
    case 'Pyramid': {
      // Up then down
      const mid = 4;
      let base = Math.floor(totalReps / 8);
      sets = [base, base+1, base+2, base+3, base+3, base+2, base+1, base];
      let sum = sets.reduce((a,b) => a+b, 0);
      let diff = totalReps - sum;
      for (let i = 0; diff !== 0 && i < 8; i++) {
        const idx = i < 4 ? i : 7-i;
        const canAdd = diff > 0 && sets[idx] < maxPerSet;
        const canSub = diff < 0 && sets[idx] > 1;
        if (canAdd) { sets[idx]++; diff--; }
        else if (canSub) { sets[idx]--; diff++; }
      }
      break;
    }
    case 'Reverse Pyramid': {
      // Down then up
      const mid = 4;
      let base = Math.floor(totalReps / 8);
      sets = [base+3, base+2, base+1, base, base, base+1, base+2, base+3];
      let sum = sets.reduce((a,b) => a+b, 0);
      let diff = totalReps - sum;
      for (let i = 0; diff !== 0 && i < 8; i++) {
        const idx = i < 4 ? 7-i : i;
        const canAdd = diff > 0 && sets[idx] < maxPerSet;
        const canSub = diff < 0 && sets[idx] > 1;
        if (canAdd) { sets[idx]++; diff--; }
        else if (canSub) { sets[idx]--; diff++; }
      }
      break;
    }
    case 'Wave Loading': {
      // Alternate high/low
      let high = Math.min(maxPerSet, Math.ceil(totalReps / 7));
      let low = Math.max(1, Math.floor(totalReps / 10));
      sets = Array(8).fill(0).map((_,i) => i%2===0 ? high : low);
      let sum = sets.reduce((a,b) => a+b, 0);
      let diff = totalReps - sum;
      for (let i = 0; diff !== 0 && i < 8; i++) {
        const idx = i%2===0 ? i : 7-i;
        const canAdd = diff > 0 && sets[idx] < maxPerSet;
        const canSub = diff < 0 && sets[idx] > 1;
        if (canAdd) { sets[idx]++; diff--; }
        else if (canSub) { sets[idx]--; diff++; }
      }
      break;
    }
    case 'Drop Sets': {
      // First few high, then taper
      let high = Math.min(maxPerSet, Math.ceil(totalReps / 6));
      let low = Math.max(1, Math.floor(totalReps / 12));
      sets = [high, high, high, low, low, low, low, low];
      let sum = sets.reduce((a,b) => a+b, 0);
      let diff = totalReps - sum;
      for (let i = 0; diff !== 0 && i < 8; i++) {
        const idx = i < 3 ? i : 7-i;
        const canAdd = diff > 0 && sets[idx] < maxPerSet;
        const canSub = diff < 0 && sets[idx] > 1;
        if (canAdd) { sets[idx]++; diff--; }
        else if (canSub) { sets[idx]--; diff++; }
      }
      break;
    }
    case 'Ladder': {
      // 8-10-12-14, repeat or similar
      let base = Math.floor(totalReps / 44);
      sets = [8,10,12,14,14,12,10,8].map(x => Math.max(1, Math.min(x*base, maxPerSet)));
      let sum = sets.reduce((a,b) => a+b, 0);
      let diff = totalReps - sum;
      for (let i = 0; diff !== 0 && i < 8; i++) {
        const canAdd = diff > 0 && sets[i] < maxPerSet;
        const canSub = diff < 0 && sets[i] > 1;
        if (canAdd) { sets[i]++; diff--; }
        else if (canSub) { sets[i]--; diff++; }
      }
      break;
    }
    default: {
      // Fallback to equal sets
      const base = Math.floor(totalReps / 8);
      const remainder = totalReps % 8;
      sets = Array(8).fill(base);
      for (let i = 0; i < remainder; i++) sets[i] += 1;
      break;
    }
  }
  return sets;
}

// Main function to get workout info for the current cycle
function getWorkoutForCycle({
  workoutNum, // 1-8
  userMax,    // integer
  cycleStartMax, // integer
}) {
  if (workoutNum === 1) {
    return {
      type: 'max_test',
      pattern: null,
      totalReps: null,
      setBreakdown: null,
      patternName: null,
    };
  }
  const multiplier = getMultiplierForWorkout(workoutNum);
  const totalReps = Math.round(multiplier * (cycleStartMax || userMax));
  const patternName = pickRandomPattern();
  const setBreakdown = generateSetBreakdown(patternName, totalReps, userMax);
  return {
    type: 'volume',
    pattern: patternName,
    totalReps: totalReps,
    setBreakdown,
    patternName,
  };
}

module.exports = {
  repPatterns,
  getMultiplierForWorkout,
  pickRandomPattern,
  generateSetBreakdown,
  getWorkoutForCycle,
}; 