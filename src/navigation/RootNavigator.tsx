import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { useAuth } from '../context/AuthContext';
import { Loading } from '../components/UI';
import { colors } from '../theme/colors';

import {
  WelcomeScreen,
  LoginScreen,
  RegisterScreen,
  CompleteProfileScreen,
} from '../screens/auth/AuthScreens';

import PreferencesScreen from '../screens/student/PreferencesScreen';
import MatchesScreen from '../screens/student/MatchesScreen';
import ClassDetailsScreen from '../screens/student/ClassDetailsScreen';
import ActivityScreen from '../screens/student/ActivityScreen';
import TimetableScreen from '../screens/student/TimetableScreen';

import DashboardScreen from '../screens/teacher/DashboardScreen';
import ClassEditorScreen from '../screens/teacher/ClassEditorScreen';
import RequestsScreen from '../screens/teacher/RequestsScreen';
import StudentsScreen from '../screens/teacher/StudentsScreen';

import {
  ResultScreen,
  ProfileScreen,
  NotificationsScreen,
} from '../screens/shared/SharedScreens';

const Stack = createNativeStackNavigator();

export default function RootNavigator() {
  const { user, profile, loading } = useAuth();

  if (loading) {
    return <Loading />;
  }

  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerTintColor: colors.heading,
          headerShadowVisible: false,
          headerStyle: {
            backgroundColor: colors.background,
          },
          contentStyle: {
            backgroundColor: colors.background,
          },
        }}
      >
        {!user ? (
          <Stack.Group navigationKey="guest">
            <Stack.Screen
              name="Welcome"
              component={WelcomeScreen}
              options={{ headerShown: false }}
            />

            <Stack.Screen
              name="Login"
              component={LoginScreen}
              options={{ title: 'Sign in' }}
            />

            <Stack.Screen
              name="Register"
              component={RegisterScreen}
              options={{ title: 'Create account' }}
            />
          </Stack.Group>
        ) : !profile ? (
          <Stack.Screen
            name="CompleteProfile"
            component={CompleteProfileScreen}
            options={{
              title: 'Your profile',
              headerBackVisible: false,
            }}
          />
        ) : profile.role === 'teacher' ? (
          <Stack.Group navigationKey="teacher">
            <Stack.Screen
              name="Dashboard"
              component={DashboardScreen}
            />

            <Stack.Screen
              name="ClassEditor"
              component={ClassEditorScreen}
              options={{ title: 'Class settings' }}
            />

            <Stack.Screen
              name="TeacherRequests"
              component={RequestsScreen}
              options={{ title: 'Requests' }}
            />

            <Stack.Screen
              name="Students"
              component={StudentsScreen}
            />

            <Stack.Screen
              name="Profile"
              component={ProfileScreen}
            />
          </Stack.Group>
        ) : (
          <Stack.Group navigationKey="student">
            <Stack.Screen
              name="Matches"
              component={MatchesScreen}
              options={{ title: 'Find classes' }}
            />

            <Stack.Screen
              name="Preferences"
              component={PreferencesScreen}
            />

            <Stack.Screen
              name="ClassDetails"
              component={ClassDetailsScreen}
              options={{ title: 'Class details' }}
            />

            <Stack.Screen
              name="Activity"
              component={ActivityScreen}
              options={{ title: 'My activity' }}
            />

            <Stack.Screen
              name="Timetable"
              component={TimetableScreen}
            />

            <Stack.Screen
              name="Notifications"
              component={NotificationsScreen}
            />

            <Stack.Screen
              name="Profile"
              component={ProfileScreen}
            />

            <Stack.Screen
              name="Result"
              component={ResultScreen}
              options={{ title: 'Request status' }}
            />
          </Stack.Group>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}