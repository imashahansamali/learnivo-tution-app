import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { configured } from './src/config/firebase';
import { AuthProvider } from './src/context/AuthContext';
import RootNavigator from './src/navigation/RootNavigator';
import {
  Screen,
  Card,
  Heading,
  Body,
} from './src/components/UI';

export default function App() {
  return (
    <SafeAreaProvider>
      <StatusBar style="dark" />

      {configured ? (
        <AuthProvider>
          <RootNavigator />
        </AuthProvider>
      ) : (
        <Screen title="Welcome to Learnivo">
          <Card>
            <Heading>Connect your Firebase project</Heading>

            <Body>
              Enter your Firebase Web configuration in the
              .env file. Enable Email/Password Authentication
              and publish firestore.rules.
            </Body>

            <Body>
              Then restart using:
              {'\n'}npx expo start --clear
            </Body>
          </Card>
        </Screen>
      )}
    </SafeAreaProvider>
  );
}