import React from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import LearnivoIcon from "./LearnivoIcon";
import { colors as c } from "../theme/colors";

type ChildrenProps = { children: React.ReactNode };

export function Screen({
  title,
  subtitle,
  children,
}: ChildrenProps & { title: string; subtitle?: string }) {
  return (
    <SafeAreaView style={s.safe} edges={["bottom"]}>
      <KeyboardAvoidingView
        style={s.safe}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={s.page}
        >
          <View style={s.brandRow}>
            <LearnivoIcon />
            <Text style={s.brand}>LEARNIVO</Text>
          </View>

          <Text accessibilityRole="header" style={s.title}>
            {title}
          </Text>
          {subtitle && <Text style={s.body}>{subtitle}</Text>}
          {children}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

export function Card({
  children,
  backgroundColor,
}: ChildrenProps & { backgroundColor?: string }) {
  return (
    <View
      style={[
        s.card,
        backgroundColor
          ? { borderLeftColor: backgroundColor, borderLeftWidth: 4 }
          : undefined,
      ]}
    >
      {children}
    </View>
  );
}

export function Heading({ children }: ChildrenProps) {
  return <Text style={s.heading}>{children}</Text>;
}

export function Body({ children }: ChildrenProps) {
  return <Text style={s.body}>{children}</Text>;
}

export function Badge({
  children,
  warning = false,
}: ChildrenProps & { warning?: boolean }) {
  return (
    <Text style={[s.badge, { color: warning ? c.warning : c.success }]}>
      {children}
    </Text>
  );
}

export function Button({
  title,
  onPress,
  secondary = false,
  busy = false,
  disabled = false,
}: {
  title: string;
  onPress: () => void;
  secondary?: boolean;
  busy?: boolean;
  disabled?: boolean;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={title}
      accessibilityState={{ busy, disabled: busy || disabled }}
      disabled={busy || disabled}
      onPress={onPress}
      style={({ pressed }) => [
        s.button,
        secondary && s.secondary,
        (busy || disabled) && s.disabled,
        pressed && s.pressed,
      ]}
    >
      {busy ? (
        <ActivityIndicator color={secondary ? c.secondaryText : "#FFFFFF"} />
      ) : (
        <Text style={[s.label, secondary && s.secondaryLabel]}>{title}</Text>
      )}
    </Pressable>
  );
}

export function Input({
  label,
  ...props
}: { label: string } & React.ComponentProps<typeof TextInput>) {
  return (
    <View style={s.field}>
      <Text style={s.inputLabel}>{label}</Text>
      <TextInput
        accessibilityLabel={label}
        placeholderTextColor="#A5B8D4"
        {...props}
        style={[s.input, props.multiline && s.multiline, props.style]}
      />
    </View>
  );
}

export function ErrorText({ message }: { message: string }) {
  if (!message) return null;

  return (
    <Text accessibilityRole="alert" style={s.error}>
      {message}
    </Text>
  );
}

export function Loading() {
  return (
    <View style={[s.safe, s.loading]}>
      <ActivityIndicator size="large" color={c.primary} />
    </View>
  );
}

const s = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: c.background,
  },
  page: {
    padding: 24,
    gap: 16,
    paddingBottom: 40,
  },
  brandRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  brand: {
    color: c.warning,
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 2,
  },
  title: {
    color: c.heading,
    fontSize: 29,
    lineHeight: 36,
    fontWeight: "800",
  },
  heading: {
    color: c.heading,
    fontSize: 17,
    fontWeight: "700",
  },
  body: {
    color: c.text,
    fontSize: 14,
    lineHeight: 22,
  },
  card: {
    backgroundColor: c.card,
    borderWidth: 1,
    borderColor: c.border,
    borderRadius: 20,
    padding: 18,
    gap: 10,
  },
  badge: {
    fontSize: 12,
    fontWeight: "700",
    lineHeight: 19,
  },
  button: {
    backgroundColor: c.primary,
    minHeight: 52,
    borderRadius: 16,
    padding: 14,
    justifyContent: "center",
    alignItems: "center",
  },
  secondary: {
    backgroundColor: c.secondary,
    borderWidth: 1,
    borderColor: c.border,
  },
  disabled: { opacity: 0.45 },
  pressed: { opacity: 0.75 },
  label: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "700",
    textAlign: "center",
  },
  secondaryLabel: {
    color: c.secondaryText,
  },
  field: { gap: 7 },
  inputLabel: {
    color: c.heading,
    fontSize: 13,
    fontWeight: "600",
  },
  input: {
    backgroundColor: c.card,
    borderWidth: 1,
    borderColor: c.border,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 13,
    fontSize: 15,
    minHeight: 48,
    color: c.heading,
  },
  multiline: {
    minHeight: 90,
    textAlignVertical: "top",
  },
  error: {
    color: c.error,
    lineHeight: 22,
  },
  loading: {
    justifyContent: "center",
    alignItems: "center",
  },
});