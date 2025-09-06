# Server-First Architecture Guide for Dr. ChinTickle

## Philosophy: "Thin Client, Smart Server"
Your React Native app is a beautiful display that shows server data and captures input.
All business logic, calculations, and decisions happen server-side.

## Quick Reference: What Goes Where

### ✅ SERVER-SIDE (Supabase)
- Workout generation algorithm
- Progress calculations
- Cycle advancement logic
- Data validation
- Business rules
- User state management
- Email notifications
- External API calls

### ✅ CLIENT-SIDE (React Native)
- UI rendering & animations
- Touch gestures
- Local timers during workout
- Navigation between screens
- Temporary form state
- Miami Vice aesthetics
- Haptic feedback
- Sound effects

## Development Patterns

### Pattern 1: One RPC Per User Action
```javascript
// ❌ OLD WAY: Complex client logic
const handleComplete = async () => {
  const newProgress = calculateProgress(current, completed);
  const nextWorkout = generateNextWorkout(newProgress);
  await updateDatabase(newProgress, nextWorkout);
  navigation.navigate('Dashboard');
};

// ✅ NEW WAY: Server does everything
const handleComplete = async () => {
  const { data } = await supabase.rpc('complete_workout_v2');
  setAppState(data); // Server returns entire new state
  navigation.navigate('Dashboard');
};
```

### Pattern 2: Server Returns UI-Ready Data
```sql
-- Server RPC returns formatted, ready-to-display data
CREATE FUNCTION get_dashboard_display()
RETURNS json AS $$
BEGIN
  RETURN json_build_object(
    'greeting', get_time_based_greeting(),
    'progress_percent', calculate_progress_percent(),
    'motivational_quote', get_daily_quote(),
    'next_workout_display', format_workout_for_display(),
    'streak_emoji', get_streak_emoji(current_streak),
    'achievement_badges', get_unlocked_badges()
  );
END;
$$
```

### Pattern 3: Database Views for Complex Queries
```sql
-- Create a view that pre-calculates everything
CREATE VIEW dashboard_data AS
SELECT 
  user_id,
  current_max_pullups,
  ROUND((current_workout_in_cycle::numeric / 8) * 100) as cycle_progress,
  CASE 
    WHEN current_workout_in_cycle = 1 THEN 'Time for max test!'
    ELSE 'Workout ' || current_workout_in_cycle || ' of 8'
  END as workout_status,
  -- More pre-calculated fields...
FROM profiles;

-- Client just does:
const { data } = await supabase.from('dashboard_data').select('*');
```

## Migration Roadmap

### Phase 1: Move Workout Engine (Priority 1)
**Current:** 500+ lines of JavaScript in `workoutEngine.js`
**Target:** Database functions

```sql
CREATE FUNCTION generate_workout_v2()
RETURNS json 
SECURITY DEFINER
AS $$
  -- All workout logic here
  -- Returns complete workout plan
$$;
```

### Phase 2: Consolidate API Calls (Priority 2)
**Current:** Multiple calls to fetch user data
**Target:** Single "super RPC" per screen

```sql
CREATE FUNCTION get_screen_data(screen_name text)
RETURNS json AS $$
BEGIN
  CASE screen_name
    WHEN 'dashboard' THEN RETURN get_dashboard_data();
    WHEN 'workout' THEN RETURN get_workout_data();
    WHEN 'stats' THEN RETURN get_stats_data();
  END CASE;
END;
$$;
```

### Phase 3: Smart Triggers (Priority 3)
**Current:** Manual state updates after actions
**Target:** Automatic database triggers

```sql
-- Automatically advance cycle when workout completes
CREATE TRIGGER after_workout_complete
AFTER INSERT ON workout_sessions
FOR EACH ROW
EXECUTE FUNCTION advance_user_progress();
```

## Implementation Checklist

### Immediate Wins (Do Today)
- [ ] Create `get_complete_dashboard_data()` RPC
- [ ] Move max test logic to server
- [ ] Create `complete_workout_with_results()` super RPC

### Next Week
- [ ] Convert workout generation to SQL
- [ ] Create database views for common queries
- [ ] Add server-side validation for all inputs

### Future Enhancements
- [ ] A/B testing via feature flags
- [ ] Server-controlled UI themes
- [ ] Dynamic workout algorithms
- [ ] ML-based progression adjustments

## Code Examples

### Example 1: Dashboard Screen Simplified
```javascript
// OLD: 200+ lines of state management and calculations
// NEW: 
const DashboardScreen = () => {
  const [data, setData] = useState(null);
  
  useEffect(() => {
    loadDashboard();
  }, []);
  
  const loadDashboard = async () => {
    const { data } = await supabase.rpc('get_dashboard_v2');
    setData(data);
  };
  
  if (!data) return <LoadingScreen />;
  
  return (
    <View>
      <Text>{data.greeting}</Text>
      <ProgressBar percent={data.progress_percent} />
      <WorkoutCard {...data.next_workout} />
      {/* Just display what server sends */}
    </View>
  );
};
```

### Example 2: Workout Completion Simplified
```javascript
// OLD: Complex local state updates
// NEW:
const completeWorkout = async (repsCompleted) => {
  const { data, error } = await supabase.rpc('complete_workout_v2', {
    reps_completed: repsCompleted
  });
  
  if (data.show_achievement) {
    showAchievement(data.achievement);
  }
  
  navigation.navigate(data.next_screen, data.screen_props);
};
```

## Benefits of This Approach

1. **No App Store Updates Needed**
   - Fix bugs instantly
   - Add features anytime
   - A/B test without releasing

2. **Simpler Mental Model**
   - Client = Display
   - Server = Brain
   - Clear separation of concerns

3. **Better for "Vibe Coding"**
   - Less complexity to manage
   - Fewer files to understand
   - Single source of truth

4. **Enhanced Security**
   - Business logic hidden
   - Validation server-side
   - No client-side bypasses

5. **Easier Debugging**
   - All logic in SQL/PLpgSQL
   - Database logs show everything
   - Single place to check

## Server-First Mindset

When adding a feature, ask:
1. Can the server calculate this?
2. Can the server decide this?
3. Can the server validate this?

If yes → Put it on the server
If no → It's probably UI-related, keep client-side

## Resources

- Supabase RPC Docs: https://supabase.com/docs/guides/database/functions
- Database Triggers: https://supabase.com/docs/guides/database/postgres/triggers
- Edge Functions: https://supabase.com/docs/guides/functions

Remember: The client should be so simple that you could rebuild it in a different framework without losing any business logic.