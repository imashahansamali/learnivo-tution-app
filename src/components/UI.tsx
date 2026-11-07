import React, { useState } from 'react';

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
} from 'react-native';

import { SafeAreaView } from 'react-native-safe-area-context';
import { colors as c } from '../theme/colors';

type ChildrenProps = {
  children: React.ReactNode;
};

type ButtonVariant =
  | 'primary'
  | 'success'
  | 'info'
  | 'warning'
  | 'danger'
  | 'secondary';

const buttonColors: Record<
  ButtonVariant,
  {
    background: string;
    text: string;
    border: string;
  }
> = {
  primary: {
    background: '#6C4DDB',
    text: '#FFFFFF',
    border: '#6C4DDB',
  },
  success: {
    background: '#238271',
    text: '#FFFFFF',
    border: '#238271',
  },
  info: {
    background: '#2864B4',
    text: '#FFFFFF',
    border: '#2864B4',
  },
  warning: {
    background: '#AD6A1B',
    text: '#FFFFFF',
    border: '#AD6A1B',
  },
  danger: {
    background: '#A43C53',
    text: '#FFFFFF',
    border: '#A43C53',
  },
  secondary: {
    background: '#F0EDF9',
    text: '#594B80',
    border: '#E9E6F2',
  },
};

export function Screen({
  title,
  subtitle,
  children,
}: ChildrenProps & {
  title: string;
  subtitle?: string;
}) {
  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      <KeyboardAvoidingView
        style={styles.safe}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.page}
        >
          <View style={styles.intro}>
            <Text style={styles.brand}>LEARNIVO</Text>

            <Text accessibilityRole="header" style={styles.title}>
              {title}
            </Text>

            {subtitle ? (
              <Text style={styles.body}>{subtitle}</Text>
            ) : null}
          </View>

          {children}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

export function Card({ children }: ChildrenProps) {
  return <View style={styles.card}>{children}</View>;
}

export function Heading({ children }: ChildrenProps) {
  return <Text style={styles.heading}>{children}</Text>;
}

export function Body({ children }: ChildrenProps) {
  return <Text style={styles.body}>{children}</Text>;
}

export function Badge({
  children,
  warning = false,
}: ChildrenProps & {
  warning?: boolean;
}) {
  return (
    <View
      style={[
        styles.badge,
        {
          backgroundColor: warning ? '#FFF3E2' : '#E8F5F0',
        },
      ]}
    >
      <Text
        style={[
          styles.badgeText,
          {
            color: warning ? c.warning : c.success,
          },
        ]}
      >
        {children}
      </Text>
    </View>
  );
}

type ButtonProps = {
  title: string;
  onPress: () => void;
  variant?: ButtonVariant;
  secondary?: boolean;
  busy?: boolean;
  disabled?: boolean;
};

export function Button({
  title,
  onPress,
  variant = 'primary',
  secondary = false,
  busy = false,
  disabled = false,
}: ButtonProps) {
  const unavailable = busy || disabled;
  const palette =
    buttonColors[secondary ? 'secondary' : variant];

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={title}
      accessibilityState={{
        disabled: unavailable,
        busy,
      }}
      disabled={unavailable}
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        {
          backgroundColor: palette.background,
          borderColor: palette.border,
        },
        pressed && styles.pressedButton,
        unavailable && styles.disabledButton,
      ]}
    >
      {busy ? (
        <ActivityIndicator color={palette.text} />
      ) : (
        <Text
          style={[
            styles.buttonText,
            {
              color: palette.text,
            },
          ]}
        >
          {title}
        </Text>
      )}
    </Pressable>
  );
}

type InputProps = React.ComponentProps<typeof TextInput> & {
  label: string;
};

export function Input({
  label,
  style,
  onFocus,
  onBlur,
  ...props
}: InputProps) {
  const [focused, setFocused] = useState(false);

  return (
    <View style={styles.field}>
      <Text style={styles.inputLabel}>{label}</Text>

      <TextInput
        {...props}
        accessibilityLabel={label}
        placeholderTextColor="#9299AB"
        selectionColor={c.primary}
        onFocus={(event) => {
          setFocused(true);
          onFocus?.(event);
        }}
        onBlur={(event) => {
          setFocused(false);
          onBlur?.(event);
        }}
        style={[
          styles.input,
          props.multiline && styles.multilineInput,
          focused && styles.focusedInput,
          props.editable === false && styles.readonlyInput,
          style,
        ]}
      />
    </View>
  );
}

export function ErrorText({
  message,
}: {
  message: string;
}) {
  if (!message) {
    return null;
  }

  return (
    <View style={styles.errorBox}>
      <Text accessibilityRole="alert" style={styles.errorText}>
        {message}
      </Text>
    </View>
  );
}

export function Loading() {
  return (
    <View style={styles.loading}>
      <ActivityIndicator size="large" color={c.primary} />
      <Text style={styles.body}>Loading...</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: c.background,
  },

  page: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 40,
    gap: 18,
  },

  intro: {
    gap: 12,
    marginBottom: 8,
  },

  brand: {
    color: c.primary,
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 2.5,
  },

  title: {
    color: c.heading,
    fontSize: 30,
    lineHeight: 38,
    fontWeight: '800',
  },

  heading: {
    color: c.heading,
    fontSize: 18,
    lineHeight: 26,
    fontWeight: '700',
  },

  body: {
    color: c.text,
    fontSize: 15,
    lineHeight: 24,
  },

  card: {
    backgroundColor: c.card,
    borderColor: c.border,
    borderWidth: 1,
    borderRadius: 20,
    padding: 20,
    gap: 12,
    shadowColor: c.heading,
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.04,
    shadowRadius: 10,
    elevation: 2,
  },

  button: {
    minHeight: 54,
    borderWidth: 1,
    borderRadius: 16,
    paddingHorizontal: 20,
    paddingVertical: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },

  buttonText: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '700',
    textAlign: 'center',
  },

  pressedButton: {
    opacity: 0.85,
    transform: [{ scale: 0.99 }],
  },

  disabledButton: {
    opacity: 0.5,
  },

  field: {
    gap: 8,
  },

  inputLabel: {
    color: c.heading,
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '600',
  },

  input: {
    minHeight: 54,
    backgroundColor: c.card,
    color: c.heading,
    borderColor: c.border,
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
  },

  focusedInput: {
    borderColor: c.primary,
    backgroundColor: '#FCFAFF',
  },

  multilineInput: {
    minHeight: 110,
    textAlignVertical: 'top',
  },

  readonlyInput: {
    backgroundColor: c.secondary,
  },

  badge: {
    alignSelf: 'flex-start',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },

  badgeText: {
    fontSize: 12,
    lineHeight: 18,
    fontWeight: '700',
  },

  errorBox: {
    backgroundColor: '#FCEEF2',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },

  errorText: {
    color: c.error,
    fontSize: 14,
    lineHeight: 22,
  },

  loading: {
    flex: 1,
    backgroundColor: c.background,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 14,
  },
});