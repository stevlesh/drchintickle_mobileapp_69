import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { getFocusedRouteNameFromRoute } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Platform } from 'react-native';
import * as Haptics from 'expo-haptics';
import { Island, BeachBall, Martini } from 'phosphor-react-native';

// Import screens
import DashboardScreen from '../screens/DashboardScreen';
import PreWorkoutScreen from '../screens/PreWorkoutScreen';
import WorkoutScreen from '../screens/WorkoutScreen';
import StatsScreen from '../screens/StatsScreen';

import { colors } from '../theme/typography';
import { useGateMain } from '../hooks/useGateMain';

const Tab = createBottomTabNavigator();
const WorkoutStack = createNativeStackNavigator();

// Workout Stack Navigator
const WorkoutStackNavigator = () => {
  return (
    <WorkoutStack.Navigator screenOptions={{ headerShown: false }}>
      <WorkoutStack.Screen name="PreWorkout" component={PreWorkoutScreen} />
      <WorkoutStack.Screen name="Workout" component={WorkoutScreen} />
    </WorkoutStack.Navigator>
  );
};

// Custom tab bar background component with stable gradient effect
const TabBarBackground = () => (
  <LinearGradient
    colors={['rgba(20, 20, 45, 0.95)', 'rgba(10, 10, 25, 0.98)']}
    style={{
      position: 'absolute',
      left: 0,
      right: 0,
      top: 0,
      bottom: 0,
      borderTopWidth: 2,
      borderTopColor: '#FF0AA6', // Hot pink border
    }}
  />
);

// Tab Navigator
const TabNavigator = () => {
  const insets = useSafeAreaInsets();
  
  // Guard to ensure user is authorized to be in Main
  useGateMain();

  // Handle tab press with haptics
  const handleTabPress = () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarHideOnKeyboard: true,
        tabBarBackground: TabBarBackground,
        tabBarStyle: {
          height: 52 + (insets.bottom || 0),
          paddingBottom: insets.bottom || 4,
          paddingTop: 6,
          borderTopWidth: 2,
          borderTopColor: '#FF0AA6',
          position: 'absolute',
          marginHorizontal: 0,
          marginTop: 0,
          marginBottom: 0,
          backgroundColor: 'transparent',
          // Add hot pink glow effect
          shadowColor: '#FF0AA6',
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.6,
          shadowRadius: 8,
          elevation: 20,
        },
        tabBarActiveTintColor: colors.electricCyan,
        tabBarInactiveTintColor: '#8A8FA6',
        tabBarLabelStyle: {
          fontFamily: 'IBMPlexMono_400Regular',
          fontSize: 11,
          textTransform: 'uppercase',
          letterSpacing: 0.4,
          marginTop: 2,
        },
        tabBarIconStyle: {
          marginBottom: 0,
        },
      }}
      screenListeners={{
        tabPress: handleTabPress,
      }}
    >
      <Tab.Screen
        name="Home"
        component={DashboardScreen}
        options={{
          tabBarLabel: 'HOME',
          tabBarIcon: ({ color, focused }) => (
            <Island size={24} color={color} weight={focused ? 'fill' : 'regular'} />
          ),
          tabBarAccessibilityLabel: 'Home',
        }}
      />
      
      <Tab.Screen
        name="WorkoutStack"
        component={WorkoutStackNavigator}
        options={({ route }) => {
          const routeName = getFocusedRouteNameFromRoute(route) ?? 'PreWorkout';
          const hidden = routeName === 'Workout';
          
          return {
            tabBarLabel: 'WORKOUT',
            tabBarIcon: ({ color, focused }) => (
              <BeachBall size={24} color={color} weight={focused ? 'fill' : 'regular'} />
            ),
            tabBarAccessibilityLabel: 'Start workout',
            tabBarStyle: hidden ? { display: 'none' } : {
              height: 52 + (insets.bottom || 0),
              paddingBottom: insets.bottom || 4,
              paddingTop: 6,
              borderTopWidth: 2,
              borderTopColor: '#FF0AA6',
              position: 'absolute',
              marginHorizontal: 0,
              marginTop: 0,
              marginBottom: 0,
              backgroundColor: 'transparent',
              // Add hot pink glow effect
              shadowColor: '#FF0AA6',
              shadowOffset: { width: 0, height: -2 },
              shadowOpacity: 0.6,
              shadowRadius: 8,
              elevation: 20,
            },
          };
        }}
      />
      
      <Tab.Screen
        name="Stats"
        component={StatsScreen}
        options={{
          tabBarLabel: 'STATS',
          tabBarIcon: ({ color, focused }) => (
            <Martini size={24} color={color} weight={focused ? 'fill' : 'regular'} />
          ),
          tabBarAccessibilityLabel: 'Stats',
        }}
      />
    </Tab.Navigator>
  );
};

export default TabNavigator;