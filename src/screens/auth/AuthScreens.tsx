import React, { useState } from 'react';
import {
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
} from 'firebase/auth';
import { auth } from '../../config/firebase';
import { useAuth, logout } from '../../context/AuthContext';
import { saveProfile } from '../../services/data';
import {
  Screen,
  Card,
  Heading,
  Body,
  Input,
  Button,
  ErrorText,
} from '../../components/UI';

export function WelcomeScreen({ navigation }: any) {
  return (
    <Screen
      title="Find the class that fits you."
      subtitle="Learning that works with your budget, language and time."
    >
      <Card>
        <Heading>Your next chapter starts here</Heading>
        <Body>
          Discover tuition classes, try a lesson and learn
          with confidence.
        </Body>
      </Card>

      <Button
        title="Get started"
        onPress={() => navigation.navigate('Register')}
      />

      <Button
        secondary
        title="Sign in · Student or Teacher"
        onPress={() => navigation.navigate('Login')}
      />
    </Screen>
  );
}

export function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  async function submit(reset = false) {
    setBusy(true);
    setError('');

    try {
      if (reset) {
        await sendPasswordResetEmail(
          auth,
          email.trim()
        );

        setError(
          'If the account is eligible, a reset email will arrive.'
        );
      } else {
        await signInWithEmailAndPassword(
          auth,
          email.trim(),
          password
        );
      }
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <Screen
      title="Welcome back"
      subtitle="Your learning journey continues."
    >
      <Input
        label="Email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />

      <Input
        label="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />

      <ErrorText message={error} />

      <Button
        title="Sign in"
        busy={busy}
        onPress={() => submit()}
      />

      <Button
        secondary
        title="Forgot password?"
        disabled={busy || !email.trim()}
        onPress={() => submit(true)}
      />
    </Screen>
  );
}

export function RegisterScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  async function submit() {
    setBusy(true);
    setError('');

    try {
      if (password.length < 8) {
        throw Error(
          'Use at least 8 characters for your password.'
        );
      }

      await createUserWithEmailAndPassword(
        auth,
        email.trim(),
        password
      );
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <Screen
      title="Create your account"
      subtitle="Register as a student. Teacher access is assigned by the administrator."
    >
      <Input
        label="Email"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
      />

      <Input
        label="Password (8+ characters)"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />

      <ErrorText message={error} />

      <Button
        title="Create account"
        busy={busy}
        onPress={submit}
      />
    </Screen>
  );
}

export function CompleteProfileScreen() {
  const { error: authError } = useAuth();

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [grade, setGrade] = useState('10');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  async function save() {
    setBusy(true);
    setError('');

    try {
      const gradeNumber = Number(grade);

      if (
        !name.trim() ||
        !/^0\d{9}$/.test(phone) ||
        !Number.isInteger(gradeNumber) ||
        gradeNumber < 1 ||
        gradeNumber > 13
      ) {
        throw Error(
          'Enter your name, a 10-digit Sri Lankan phone number and grade 1–13.'
        );
      }

      await saveProfile({
        name: name.trim(),
        phone,
        grade: gradeNumber,
        role: 'student',
      });
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <Screen
      title="Your profile"
      subtitle="Complete your details to continue."
    >
      <Input
        label="Full name"
        value={name}
        onChangeText={setName}
      />

      <Input
        label="Phone (e.g. 0771234567)"
        value={phone}
        onChangeText={setPhone}
        keyboardType="phone-pad"
      />

      <Input
        label="Grade"
        value={grade}
        onChangeText={setGrade}
        keyboardType="number-pad"
      />

      <ErrorText message={error || authError} />

      <Button
        title="Save profile"
        busy={busy}
        onPress={save}
      />

      <Button
        secondary
        title="Sign out"
        onPress={() => {
          logout().catch(err => setError(err.message));
        }}
      />
    </Screen>
  );
}