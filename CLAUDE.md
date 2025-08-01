# Dr. ChinTickle Mobile App - Developer Context

## Project Overview
Dr. ChinTickle is a React Native/Expo mobile application for pull-up training progression. The app implements a scientific 8-cycle workout system designed to help users achieve "69 pull-ups in one set" through consistent, structured training with a Miami Vice aesthetic.

## Technology Stack
- **Framework**: React Native 0.79.5 with Expo 53.x
- **Backend**: Supabase (PostgreSQL, Auth, Edge Functions)
- **Navigation**: React Navigation 7.x
- **UI Libraries**: Expo Linear Gradient, Expo Blur, React Native Vector Icons
- **Fonts**: Custom Google Fonts (Pacifico, Righteous, Orbitron, Monoton)
- **Build System**: EAS Build with development and production profiles
- **Package Manager**: npm with package-lock.json

## Project Structure
```
src/
├── components/        # Reusable UI components (NeonButton, GlassCard, etc.)
├── screens/          # Main app screens (Dashboard, Workout, Login, etc.)
├── utils/            # Workout engine, API calls, quotes
├── theme/            # Typography and color system
├── lib/              # Supabase client configuration
└── assets/           # Icons, images, palm trees
```

## Key Commands
```bash
# Development
npx expo start --dev-client          # Start with dev client
npx expo start                       # Start with Expo Go
npm run ios                          # Run on iOS
npm run android                      # Run on Android

# Building
eas build --platform ios --profile development-simulator --local    # Local iOS dev build
eas build --platform ios --profile production                       # Production iOS build
eas build --platform android --profile production                   # Production Android build

# Database
npm run db:push                      # Apply database changes
npm run db:reset                     # Reset database
```

## Database Architecture (Supabase)
- **Main Tables**: profiles, workouts, workout_sessions
- **RPC Functions**: get_user_app_state(), complete_onboarding(), etc.
- **Edge Functions**: Located in supabase/functions/onboarding/
- **Auth**: Email/password + Google OAuth with custom email confirmation flow

## Workout Logic (Core Algorithm)
- **8 sets per workout** with 2-minute rest periods
- **Volume calculation**: `2.6 × current max pull-ups` (multiplier was adjusted from 3.2 → 3.0 → 2.6)
- **8-workout cycles** with linear progression from 2.6x to 3.0x max
- **Workout 8**: Max test to determine new baseline
- **Rep patterns**: 9 different distribution schemes (Equal, Descending, Pyramid, etc.)
- **Adaptations**: Band assistance for beginners (<7 reps), weighted for advanced (>40 reps)

## App Configuration
- **Bundle ID**: com.drchintickle.app
- **Scheme**: drchintickle://
- **EAS Project ID**: c872a76c-b7c9-47cc-8b5e-b7a44933a57b
- **Expo Updates**: Enabled for OTA updates

## User Flow
1. **Authentication**: Login/signup with email confirmation
2. **Onboarding**: Capture initial pull-up max and goals
3. **Dashboard**: View progress, current cycle, next workout
4. **Pre-Workout**: Review workout plan and motivation
5. **Workout**: Guided 8-set session with timers
6. **Progress Tracking**: Automatic cycle progression

## Design System
- **Theme**: Miami Vice/80s synthwave aesthetic
- **Colors**: Hot pink, electric cyan, neon yellow, deep purples
- **Fonts**: Pacifico (headers), Righteous (quotes), Orbitron (data), Monoton (accent)
- **Components**: Glass morphism cards, neon glows, gradient backgrounds

## Development Setup
1. Install dependencies: `npm install`
2. Set up environment variables in `.env`
3. Configure Supabase project
4. Run database migrations
5. Build dev client: `eas build --platform ios --profile development-simulator --local`
6. Start development server: `npx expo start --dev-client`

## Testing Key Scenarios
- New user signup and onboarding flow  
- Max test recording and cycle progression
- Workout completion and streak tracking
- Email confirmation process
- Database trigger functionality

## Troubleshooting
- **Git issues**: Clean repo initialization may be needed
- **EAS builds**: Requires logged-in EAS account
- **iOS simulator**: Use development-simulator build profile
- **Database**: Check RPC function permissions and triggers

## Important Files
- `app.json`: Expo configuration and build settings
- `eas.json`: Build profiles and deployment configuration  
- `src/utils/workoutEngine.js`: Core workout algorithm
- `supabase/`: Database schema and edge functions
- `src/screens/WorkoutScreen.js`: Main workout interface

## Environment Setup
- Node.js with npm
- Xcode for iOS development
- EAS CLI for builds
- Supabase CLI for database management

This context helps maintain consistency with established patterns, understand the workout algorithm, and effectively debug issues across the full-stack application.