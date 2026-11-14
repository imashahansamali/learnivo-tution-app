import React from "react";
import { Platform } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import { Loading } from "../components/UI";
import { useAuth } from "../context/AuthContext";
import { colors } from "../theme/colors";

import {
  CompleteProfileScreen,
  LoginScreen,
  RegisterScreen,
} from "../screens/auth/AuthScreens";
import WelcomeScreen from "../screens/auth/WelcomeScreen";

import ActivityScreen from "../screens/student/ActivityScreen";
import ClassDetailsScreen from "../screens/student/ClassDetailsScreen";
import MatchesScreen from "../screens/student/MatchesScreen";
import PreferencesScreen from "../screens/student/PreferencesScreen";
import TimetableScreen from "../screens/student/TimetableScreen";

import ClassEditorScreen from "../screens/teacher/ClassEditorScreen";
import DashboardScreen from "../screens/teacher/DashboardScreen";
import RequestsScreen from "../screens/teacher/RequestsScreen";
import StudentsScreen from "../screens/teacher/StudentsScreen";

import NotificationsScreen from "../screens/shared/NotificationsScreen";
import ProfileScreen from "../screens/shared/ProfileScreen";
import { ResultScreen } from "../screens/shared/SharedScreens";

const Stack = createNativeStackNavigator();

export default function RootNavigator() {
  const { user, profile, loading } = useAuth();

  if (loading) return <Loading />;

  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerTintColor: colors.heading,
          headerShadowVisible: false,
          headerStyle: { backgroundColor: colors.background },
          contentStyle: { backgroundColor: colors.background },
        }}
      >
        {!user ? (
          <Stack.Group navigationKey="guest">
            <Stack.Screen
              name="Welcome"
              component={WelcomeScreen}
              options={{ headerShown: false }}
            />
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Register" component={RegisterScreen} />
          </Stack.Group>
        ) : !profile ? (
          <Stack.Screen
            name="CompleteProfile"
            component={CompleteProfileScreen}
            options={{ headerBackVisible: false }}
          />
        ) : profile.role === "teacher" ? (
          <Stack.Group navigationKey="teacher">
            <Stack.Screen
              name="Dashboard"
              component={DashboardScreen}
              options={{
                headerShown: Platform.OS !== "web",
                contentStyle: {
                  backgroundColor:
                    Platform.OS === "web" ? "transparent" : colors.background,
                },
              }}
            />
            <Stack.Screen name="ClassEditor" component={ClassEditorScreen} />
            <Stack.Screen
              name="TeacherRequests"
              component={RequestsScreen}
              options={{ headerShown: Platform.OS !== "web" }}
            />
            <Stack.Screen
              name="Students"
              component={StudentsScreen}
              options={{ headerShown: Platform.OS !== "web" }}
            />
            <Stack.Screen name="Profile" component={ProfileScreen} />
          </Stack.Group>
        ) : (
          <Stack.Group navigationKey="student">
            <Stack.Screen name="Matches" component={MatchesScreen} />
            <Stack.Screen name="Preferences" component={PreferencesScreen} />
            <Stack.Screen name="ClassDetails" component={ClassDetailsScreen} />
            <Stack.Screen name="Activity" component={ActivityScreen} />
            <Stack.Screen name="Timetable" component={TimetableScreen} />
            <Stack.Screen name="Notifications" component={NotificationsScreen} />
            <Stack.Screen name="Profile" component={ProfileScreen} />
            <Stack.Screen name="Result" component={ResultScreen} />
          </Stack.Group>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}