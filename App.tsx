import React from "react";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { configured } from "./src/config/firebase";
import { AuthProvider } from "./src/context/AuthContext";
import RootNavigator from "./src/navigation/RootNavigator";
import { Screen, Card, Heading, Body } from "./src/components/UI";
import WebFrame from "./src/components/WebFrame";
export default function App() {
  return (
    <SafeAreaProvider>
      <StatusBar style="dark" />
      {configured ? (
        <AuthProvider>
          <WebFrame>
            <RootNavigator />
          </WebFrame>
        </AuthProvider>
      ) : (
        <Screen title="Welcome to Learnivo">
          <Card>
            <Heading>Connect your Firebase project</Heading>
            <Body>
              Copy .env.example to .env, enter your Firebase Web configuration,
              then restart with npx expo start --clear. Follow README.md before
              signing in.
            </Body>
          </Card>
        </Screen>
      )}
    </SafeAreaProvider>
  );
}