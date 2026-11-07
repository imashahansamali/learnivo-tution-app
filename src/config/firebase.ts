import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import { getApp, getApps, initializeApp } from 'firebase/app';
import {
  getAuth,
  initializeAuth,
  type Persistence,
} from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Firebase's native runtime provides this function.
// Its generic TypeScript entry point may omit the export.
const { getReactNativePersistence } = require('firebase/auth') as {
  getReactNativePersistence: (
    storage: typeof AsyncStorage
  ) => Persistence;
};

const config = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
};

export const configured = Object.values(config).every(
  value =>
    !!value &&
    !value.includes('PASTE_') &&
    !value.includes('YOUR_')
);

const app = getApps().length
  ? getApp()
  : initializeApp(
      configured
        ? config
        : {
            apiKey: 'demo-key',
            projectId: 'demo-learnivo',
            appId: 'demo-app',
          }
    );

function createAuth() {
  if (Platform.OS === 'web') {
    return getAuth(app);
  }

  try {
    return initializeAuth(app, {
      persistence: getReactNativePersistence(AsyncStorage),
    });
  } catch (error) {
    if (
      (error as { code?: string }).code ===
      'auth/already-initialized'
    ) {
      return getAuth(app);
    }

    throw error;
  }
}

export const auth = createAuth();
export const db = getFirestore(app);