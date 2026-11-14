import React from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import LearnivoIcon from "../../components/LearnivoIcon";

type Props = {
  navigation: {
    navigate: (route: "Register" | "Login") => void;
  };
};

export default function WelcomeScreen({ navigation }: Props) {
  return (
    <SafeAreaView style={styles.screen}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.brand}>
          <LearnivoIcon />
          <Text style={styles.brandName}>LEARNIVO</Text>
        </View>

        <Text accessibilityRole="header" style={styles.title}>
          Find the class that fits you.
        </Text>

        <Text style={styles.subtitle}>
          Discover tuition classes that fit your budget, language and schedule.
        </Text>

        <Pressable
          accessibilityRole="button"
          style={({ pressed }) => [
            styles.button,
            styles.primary,
            pressed && styles.pressed,
          ]}
          onPress={() => navigation.navigate("Register")}
        >
          <Text style={styles.label}>Get started</Text>
        </Pressable>

        <Pressable
          accessibilityRole="button"
          style={({ pressed }) => [styles.button, pressed && styles.pressed]}
          onPress={() => navigation.navigate("Login")}
        >
          <Text style={styles.label}>Sign in · Student or Teacher</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#09162F",
  },
  content: {
    flexGrow: 1,
    justifyContent: "center",
    padding: 24,
  },
  brand: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 24,
  },
  brandName: {
    color: "#FFD36A",
    fontSize: 16,
    fontWeight: "800",
    letterSpacing: 2,
  },
  title: {
    color: "#F4F7FF",
    fontSize: 40,
    fontWeight: "800",
    lineHeight: 46,
  },
  subtitle: {
    color: "#C9D8F3",
    fontSize: 16,
    lineHeight: 24,
    marginTop: 14,
    marginBottom: 28,
  },
  button: {
    minHeight: 52,
    justifyContent: "center",
    alignItems: "center",
    padding: 12,
    marginBottom: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#53729B",
    backgroundColor: "#23446F",
  },
  primary: {
    backgroundColor: "#125BC4",
    borderColor: "#5092ED",
  },
  pressed: {
    opacity: 0.8,
  },
  label: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
    textAlign: "center",
  },
});