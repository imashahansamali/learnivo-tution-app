import React, { useRef, useState } from "react";
import { BackHandler, Pressable, StyleSheet, Text, View } from "react-native";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { WebView } from "react-native-webview";

const websiteUrl = process.env.EXPO_PUBLIC_LEARNIVO_WEB_URL?.trim();

export default function App() {
  const webView = useRef<WebView>(null);
  const canGoBack = useRef(false);
  const [retryKey, setRetryKey] = useState(0);

  React.useEffect(() => {
    const subscription = BackHandler.addEventListener("hardwareBackPress", () => {
      if (!canGoBack.current || !webView.current) return false;

      webView.current.goBack();
      return true;
    });

    return () => subscription.remove();
  }, []);

  return (
    <SafeAreaProvider>
      <StatusBar style="light" />
      <SafeAreaView style={styles.screen}>
        {websiteUrl ? (
          <WebView
            key={retryKey}
            ref={webView}
            source={{ uri: websiteUrl }}
            style={styles.webView}
            startInLoadingState
            onNavigationStateChange={(state) => {
              canGoBack.current = state.canGoBack;
            }}
            renderLoading={() => (
              <View style={styles.message}>
                <Text style={styles.text}>Loading Learnivo…</Text>
              </View>
            )}
            renderError={() => (
              <View style={styles.message}>
                <Text style={styles.text}>
                  Could not open Learnivo. Check the website URL and connection.
                </Text>
                <Pressable
                  accessibilityRole="button"
                  style={styles.button}
                  onPress={() => {
                    canGoBack.current = false;
                    setRetryKey((key) => key + 1);
                  }}
                >
                  <Text style={styles.text}>Try again</Text>
                </Pressable>
              </View>
            )}
          />
        ) : (
          <View style={styles.message}>
            <Text style={styles.text}>
              Set EXPO_PUBLIC_LEARNIVO_WEB_URL in your .env file and restart Expo.
            </Text>
          </View>
        )}
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "#09162F" },
  webView: { flex: 1, backgroundColor: "#09162F" },
  message: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
    backgroundColor: "#09162F",
  },
  text: { color: "#FFFFFF", fontSize: 16, textAlign: "center" },
  button: {
    marginTop: 16,
    minHeight: 48,
    justifyContent: "center",
    paddingHorizontal: 18,
    borderRadius: 10,
    backgroundColor: "#125BC4",
  },
});