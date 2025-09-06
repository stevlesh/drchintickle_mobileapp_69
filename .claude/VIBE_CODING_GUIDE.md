# Vibe Coding Guide for Dr. ChinTickle

## Philosophy: Build What's Possible, Not Just What's Perfect

You're vibe coding - meaning you code by feel, learn as you go, and prefer simplicity over complexity. This guide helps Claude understand your constraints and find the right balance between "technically optimal" and "actually doable for you."

## Your Strengths & Preferences

### ✅ What You're Comfortable With
- **React/React Native components** - Visual, immediate feedback
- **JSON data structures** - Easy to understand and debug
- **Copy-paste solutions** - Modify existing patterns rather than create from scratch
- **Database queries** - Simple SELECT/INSERT/UPDATE operations
- **UI/UX decisions** - You have great design instincts
- **High-level architecture** - You understand the big picture

### ⚠️ What's Challenging for Vibe Coding
- **Complex SQL functions** with loops, cursors, advanced PL/pgSQL
- **Error handling** edge cases and validation logic
- **Performance optimization** without clear feedback
- **Security considerations** beyond basic auth
- **Complex database schema changes** with migrations

## Development Philosophy

### The "Vibe Coding" Approach
1. **Start with working examples** - Modify existing patterns
2. **Prefer simple solutions** - Even if less "optimal"
3. **Get immediate feedback** - Can you see the result quickly?
4. **Fail fast and iterate** - Small changes, test, repeat
5. **Document as you go** - Future you will thank present you

### When to Choose Each Approach

#### ✅ **Client-Side (Vibe-Friendly)**
```javascript
// Easy to debug, immediate visual feedback
const [loading, setLoading] = useState(false);
const handlePress = () => {
  setLoading(true);
  // Call server, show result
};
```
**Use for**: UI state, animations, user interactions, formatting display data

#### ⚠️ **Server-Side (Needs Claude's Help)**  
```sql
-- Harder to debug, requires database knowledge
CREATE FUNCTION complex_business_logic()
RETURNS jsonb AS $$
  -- Complex logic here
$$;
```
**Use for**: Data validation, business rules, calculations, security

#### 🎯 **The Sweet Spot: Simple Server Calls**
```javascript
// Client: Simple call
const result = await supabase.rpc('do_something_simple');

// Server: Claude writes this for you
CREATE FUNCTION do_something_simple()
RETURNS jsonb AS $$ 
  -- Claude handles the complexity
$$;
```

## Complete RPC Documentation - For Vibe Coding

*All RPCs are secure (use auth.uid() internally) - no need to pass user IDs*

### 📱 **App Navigation & Routing** 

#### `get_user_app_state()` - The Master Navigation Function
**What it does**: Tells you exactly which screen the user should see
**When to use**: App startup, after login, after major state changes

```javascript
const { data } = await supabase.rpc('get_user_app_state');

// Returns:
{
  email_confirmed: true,           // Has user confirmed email?
  has_profile: true,               // Profile row exists?
  needs_onboarding: false,         // Should show onboarding screen?
  can_do_eight_pullups: true,      // User's ability level
  current_workout_in_cycle: 3      // Which workout they're on (1-8)
}

// Vibe Coding Pattern:
const navigateBasedOnState = async () => {
  const { data } = await supabase.rpc('get_user_app_state');
  
  if (!data.email_confirmed) {
    navigation.navigate('EmailConfirmation');
  } else if (data.needs_onboarding) {
    navigation.navigate('Onboarding');
  } else if (data.can_do_eight_pullups) {
    navigation.navigate('PreWorkout');
  } else {
    navigation.navigate('Dashboard');
  }
};
```

### 🏁 **Onboarding Flow**

#### `get_user_onboarding_status()` - Check Onboarding Status
**What it does**: Returns detailed onboarding info (more specific than get_user_app_state)
**When to use**: When you need onboarding details, not just navigation

```javascript
const { data } = await supabase.rpc('get_user_onboarding_status');

// Returns array with single object:
[{
  needs_onboarding: false,
  can_do_eight_pullups: true,
  onboarding_completed_at: "2025-01-15T10:30:00Z"
}]

// Vibe Coding Pattern:
const checkOnboardingDetails = async () => {
  const { data } = await supabase.rpc('get_user_onboarding_status');
  const status = data[0]; // Always use [0] - returns array
  
  if (status.needs_onboarding) {
    showOnboardingModal();
  } else {
    showWelcomeBack(status.onboarding_completed_at);
  }
};
```

#### `complete_onboarding(can_do_eight_pullups)` - Finish Onboarding
**What it does**: Saves onboarding preferences and tells you next screen
**When to use**: When user submits onboarding form

```javascript
const { data } = await supabase.rpc('complete_onboarding', {
  user_can_do_eight_pullups: true  // or false
});

// Returns array:
[{
  success: true,
  completed_at: "2025-01-15T10:30:00Z"
}]

// Vibe Coding Pattern:
const handleOnboardingSubmit = async (canDoPullups) => {
  const { data } = await supabase.rpc('complete_onboarding', {
    user_can_do_eight_pullups: canDoPullups
  });
  
  if (data[0].success) {
    // Refresh app state to get next screen
    const appState = await supabase.rpc('get_user_app_state');
    // Navigate based on updated state
  }
};
```

### 💪 **Workout Management**

#### `complete_workout()` - Advance to Next Workout
**What it does**: Marks current workout complete, advances to next workout/cycle
**When to use**: After user finishes a workout session

```javascript
const { data } = await supabase.rpc('complete_workout');

// Returns array:
[{
  cycle_num: 2,      // Which cycle user is now on
  workout_num: 1     // Which workout is next (1-8)
}]

// Vibe Coding Pattern:
const handleWorkoutComplete = async () => {
  const { data } = await supabase.rpc('complete_workout');
  const { cycle_num, workout_num } = data[0];
  
  if (workout_num === 1) {
    showMessage(`Cycle ${cycle_num} - Time for max test!`);
  } else {
    showMessage(`Cycle ${cycle_num}, Workout ${workout_num} ready!`);
  }
  
  navigation.navigate('Dashboard'); // Show updated progress
};
```

### 🏋️ **Workout Generation (Edge Functions)**

#### Generate Workout - `/functions/v1/generate-workout`
**What it does**: Creates workout plan based on user's current state
**When to use**: When user wants to see their next workout

```javascript
const generateWorkout = async () => {
  const { data: { session } } = await supabase.auth.getSession();
  
  const response = await fetch(`${supabaseUrl}/functions/v1/generate-workout`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${session.access_token}`,
      'Content-Type': 'application/json'
    }
  });
  
  const workout = await response.json();
  return workout;
};

// Returns:
{
  type: "volume",              // "max_test", "volume", or "intensity"  
  pattern: "Pyramid",          // Rep distribution pattern
  patternName: "Pyramid",      // Display name
  setBreakdown: [3,4,5,6,6,5,4,3], // Reps per set (8 sets)
  totalReps: 36,               // Sum of all reps
  workoutNum: 3,               // Current workout (1-8)
  cycleNum: 1,                 // Current cycle
  requiresMaxTest: false,      // Is this a max test?
  isNewUser: false             // First time user?
}

// Vibe Coding Pattern:
const loadTodaysWorkout = async () => {
  setLoading(true);
  try {
    const workout = await generateWorkout();
    
    if (workout.requiresMaxTest) {
      showMaxTestInstructions();
    } else {
      setWorkoutPlan(workout.setBreakdown);
      setPattern(workout.pattern);
    }
  } catch (error) {
    showError('Could not load workout');
  } finally {
    setLoading(false);
  }
};
```

### 🔧 **Internal Functions (Don't Call Directly)**

#### `save_workout_once()` - Used by Edge Function
**What it does**: Saves generated workout with conflict resolution
**When to use**: Never - Edge Function calls this automatically
**Note**: This prevents duplicate workouts if Edge Function runs twice

### 🚨 **Common Vibe Coding Patterns**

#### Loading States
```javascript
const [loading, setLoading] = useState(false);

const callRPC = async (rpcName, params = {}) => {
  setLoading(true);
  try {
    const { data, error } = await supabase.rpc(rpcName, params);
    if (error) throw error;
    return data;
  } catch (err) {
    console.error(`RPC ${rpcName} failed:`, err);
    // Show user-friendly error
  } finally {
    setLoading(false);
  }
};
```

#### Error Handling
```javascript
const safeRPCCall = async (rpcName, params, fallback = null) => {
  try {
    const { data, error } = await supabase.rpc(rpcName, params);
    if (error) throw error;
    return data;
  } catch (error) {
    console.error(`${rpcName} error:`, error);
    return fallback; // Graceful degradation
  }
};
```

#### Combining RPC Calls
```javascript
const loadDashboardData = async () => {
  const [appState, onboardingStatus] = await Promise.all([
    supabase.rpc('get_user_app_state'),
    supabase.rpc('get_user_onboarding_status')
  ]);
  
  return {
    appState: appState.data,
    onboarding: onboardingStatus.data[0]
  };
};
```

## Vibe Coding Guidelines for Server-Side

### ✅ **When to Add Server Logic (Good Fit)**
- **Copy existing patterns** - Modify `complete_workout()` for similar functions
- **Simple data transformations** - Format dates, calculate percentages
- **Database lookups** - Get user stats, check flags
- **Basic validation** - Check if user exists, validate input ranges

### ⚠️ **When to Ask Claude for Help (Complex)**
- **New business logic** - Workout algorithms, progression rules
- **Security considerations** - Auth, data access, validation
- **Performance issues** - Slow queries, optimization
- **Error handling** - What happens when things go wrong
- **Database schema changes** - Adding tables, columns, indexes

### 🎯 **The Vibe Coding Server Pattern**
1. **Describe what you want** - "I need a function that does X"
2. **Claude writes the SQL** - Handles complexity, security, edge cases
3. **You call it from client** - Simple `supabase.rpc()` call
4. **Test and iterate** - Make small changes to the inputs/outputs

## Example Collaboration Flow

### You Want: "Show user's workout history"

#### ❌ Don't Do This (Too Complex for Vibe Coding)
```sql
-- You write complex SQL with joins, date formatting, etc.
CREATE FUNCTION get_workout_history()...
```

#### ✅ Do This Instead (Vibe Coding Approach)
**You**: "I want to show the user's last 10 workouts with dates and reps completed"

**Claude**: 
```sql
-- I'll write this for you
CREATE FUNCTION get_workout_history()
RETURNS jsonb AS $$
  -- Complex logic here with proper formatting
$$;
```

**You**: 
```javascript
// You just call it
const { data } = await supabase.rpc('get_workout_history');
setWorkouts(data.workouts); // Display in your beautiful UI
```

## Development Workflow

### For New Features
1. **Start with UI mockup** - Design how it should look/feel
2. **Identify data needs** - What information do you need?
3. **Check existing RPCs** - Can you reuse something?
4. **Ask Claude to extend server** - "I need RPC that returns X"
5. **Wire up client** - Simple RPC call + display
6. **Iterate on UI** - Polish the vibe

### For Bug Fixes
1. **Reproduce in UI** - Can you see the problem?
2. **Check server logs** - Is it a server issue?
3. **Ask Claude to debug** - Share error messages
4. **Test fix in UI** - Verify it works
5. **Document the fix** - Update this guide

## Red Flags: When to Pause and Ask for Help

- **Touching auth or security** - Always get Claude's review
- **Database migrations** - Schema changes need careful planning  
- **Performance problems** - Don't guess, measure and optimize
- **Complex business logic** - Multi-step algorithms, edge cases
- **Integration with external APIs** - Error handling, rate limits

## Green Flags: Vibe Code Away!

- **UI components and styling** - You're great at this
- **Simple state management** - useState, useEffect patterns
- **Calling existing RPCs** - Just follow the patterns above
- **Data display and formatting** - Transform server data for display
- **User interactions** - Buttons, forms, navigation

## Memory Aid for Claude

When working with this user:
1. **Assume vibe coding approach** - Prefer simple over optimal
2. **Write server code for them** - Don't expect them to write complex SQL
3. **Provide complete client examples** - Show exactly how to call RPCs  
4. **Explain the "why"** - Help them understand the approach
5. **Suggest iterative improvements** - Small steps, not big rewrites

## Success Metrics

You'll know this is working when:
- ✅ You can add features without feeling stuck
- ✅ Server logic "just works" without you understanding every detail
- ✅ You spend time on UI/UX instead of debugging database issues
- ✅ New features ship quickly with Claude's help
- ✅ You feel confident making changes

Remember: Perfect code doesn't exist. **Shipped code that works is better than perfect code that never ships.** 🚀

---

## 📋 Keeping Documentation Updated (The Vibe Coder Way)

### The Problem
Documentation gets outdated fast, and vibe coders won't remember to update it manually.

### The Solution: Automated + Event-Driven Updates

#### ✅ **What Updates Automatically**
- **Schema snapshots** - Already handled by your migration system
- **Memory MCP** - Claude stores insights across sessions
- **Git history** - Tracks when things change

#### ⚠️ **What Needs Manual Updates** (Rare Events)
- **New RPC functions** - Only when you add server functions
- **Changed RPC signatures** - Only when parameters change
- **New Edge Functions** - Only when adding new endpoints

#### 🎯 **The Update Trigger System**

**When to update docs:**
1. **New RPC added** → Ask Claude to update this guide
2. **RPC signature changes** → Ask Claude to update examples  
3. **New Edge Function** → Add to the documentation
4. **Major architecture changes** → Update `.claude/` files

**How to update (copy-paste this):**
```
Claude, I added/changed [describe what changed]. Please update the .claude/VIBE_CODING_GUIDE.md file with the new information.
```

#### 🤖 **Auto-Update Helper Script** (Future Enhancement)

```javascript
// .claude/update-docs.js - Run this when you make server changes
const updateDocs = async () => {
  // Check for new RPCs in database
  // Compare with documented RPCs  
  // Flag differences for Claude to update
  console.log('Run this script, share output with Claude');
};
```

### 🚨 **Red Flag: Docs Are Stale When...**
- **RPC calls fail** with "function not found" 
- **Return data doesn't match** documented structure
- **New functions exist** that aren't documented
- **Examples don't work** when copy-pasted

### 🟢 **Green Flag: Docs Are Current When...**
- **All examples work** when copy-pasted
- **Return data matches** what's documented  
- **No mystery functions** in your Supabase dashboard
- **Claude gives accurate help** based on the docs

### 📅 **Maintenance Schedule for Vibe Coders**

**Monthly** (when you remember):
```
Claude, please check if my .claude/ docs are still accurate by comparing them to my actual Supabase RPCs.
```

**After major changes**:
```  
Claude, I just [added/changed something server-side]. Please update the relevant documentation.
```

**Before starting new features**:
```
Claude, get up to speed on my project and let me know if any docs seem outdated.
```

### 💡 **The Lazy Documentation Philosophy**

1. **Document when it matters** - Not everything needs docs
2. **Examples over explanations** - Show don't tell
3. **Update when it breaks** - If docs work, don't fix them
4. **Automate what you can** - Let tools handle the boring stuff
5. **Ask Claude to help** - Don't do it alone

**Bottom line**: These docs will get stale. That's normal. The key is catching it quickly and fixing it with Claude's help, not preventing it entirely.