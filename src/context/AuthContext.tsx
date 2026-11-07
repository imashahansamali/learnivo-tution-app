import React, {
  createContext,
  useContext,
  useEffect,
  useState,
} from 'react';
import {
  onAuthStateChanged,
  signOut,
  type User,
} from 'firebase/auth';
import { doc, onSnapshot } from 'firebase/firestore';
import { auth, db } from '../config/firebase';
import type { Profile } from '../types';

type AuthValue = {
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  error: string;
};

const AuthContext = createContext<AuthValue>({
  user: null,
  profile: null,
  loading: true,
  error: '',
});

export function AuthProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let stopProfile = () => {};

    const stopAuth = onAuthStateChanged(auth, currentUser => {
      stopProfile();
      setUser(currentUser);
      setProfile(null);
      setError('');

      if (!currentUser) {
        setLoading(false);
        return;
      }

      setLoading(true);

      stopProfile = onSnapshot(
        doc(db, 'users', currentUser.uid),
        snapshot => {
          setProfile(
            snapshot.exists()
              ? (snapshot.data() as Profile)
              : null
          );
          setLoading(false);
        },
        err => {
          setError(err.message);
          setLoading(false);
        }
      );
    });

    return () => {
      stopAuth();
      stopProfile();
    };
  }, []);

  return (
    <AuthContext.Provider
      value={{ user, profile, loading, error }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);

export const logout = () => signOut(auth);