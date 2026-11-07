import React, { useCallback, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { useAuth } from '../../context/AuthContext';
import { useCollection } from '../../hooks/useCollection';
import {
  enrolledClasses,
  loadPreferences,
} from '../../services/data';
import type {
  ClassItem,
  Preferences,
} from '../../types';
import {
  days,
  match,
  time,
} from '../../utils/matching';
import {
  Badge,
  Body,
  Button,
  Card,
  ErrorText,
  Heading,
  Loading,
  Screen,
} from '../../components/UI';

export default function MatchesScreen({
  navigation,
}: any) {
  const { profile } = useAuth();
  const classesQuery = useCollection<ClassItem>('classes');

  const [preferences, setPreferences] =
    useState<Preferences | null>(null);
  const [enrolled, setEnrolled] = useState<ClassItem[]>([]);
  const [error, setError] = useState('');
  const [loaded, setLoaded] = useState(false);

  useFocusEffect(
    useCallback(() => {
      let active = true;
      setLoaded(false);

      Promise.all([
        loadPreferences(),
        enrolledClasses(),
      ])
        .then(([savedPreferences, enrolledItems]) => {
          if (!active) return;

          setPreferences(savedPreferences);
          setEnrolled(enrolledItems);
          setError('');
        })
        .catch(err => {
          if (active) setError(err.message);
        })
        .finally(() => {
          if (active) setLoaded(true);
        });

      return () => {
        active = false;
      };
    }, [])
  );

  if (classesQuery.loading || !loaded) {
    return <Loading />;
  }

  const results = classesQuery.items
    .filter(
      item =>
        item.active &&
        item.grade === profile?.grade &&
        (!preferences ||
          item.subject.toLowerCase() ===
            preferences.subject.toLowerCase())
    )
    .map(item => ({
      item,
      matching: preferences
        ? match(item, preferences, enrolled)
        : null,
    }))
    .sort(
      (a, b) =>
        (b.matching?.score ?? 0) -
        (a.matching?.score ?? 0)
    );

  return (
    <Screen
      title="Your class matches"
      subtitle="Discover classes that fit your learning needs."
    >
      <Button
        title="Set learning preferences"
        onPress={() => navigation.navigate('Preferences')}
      />

      <Button
        secondary
        title="My activity"
        onPress={() => navigation.navigate('Activity')}
      />

      <Button
        secondary
        title="My timetable"
        onPress={() => navigation.navigate('Timetable')}
      />

      <Button
        secondary
        title="Notifications"
        onPress={() => navigation.navigate('Notifications')}
      />

      <Button
        secondary
        title="Profile"
        onPress={() => navigation.navigate('Profile')}
      />

      <ErrorText message={classesQuery.error || error} />

      {!results.length && (
        <Card>
          <Body>
            No matching classes yet. Adjust your preferences
            or ask a teacher to publish a class.
          </Body>
        </Card>
      )}

      {results.map(({ item, matching }) => (
        <Card key={item.id}>
          <Heading>{item.title}</Heading>

          <Body>
            {`${item.teacherName} · ${item.medium}\n`}
            {`${days[item.day]} ${time(item.start)}–${time(item.end)}\n`}
            {`LKR ${item.fee.toLocaleString()} / month · ${item.mode}`}
          </Body>

          <Badge
            warning={item.enrolledCount >= item.capacity}
          >
            {item.enrolledCount >= item.capacity
              ? 'FULL'
              : `${item.capacity - item.enrolledCount} places left`}
          </Badge>

          {matching && (
            <>
              <Badge>
                {matching.score}/4 preferences ·{' '}
                {matching.reasons.join(' · ') ||
                  'Consider other options'}
              </Badge>

              {matching.clash && (
                <Badge warning>
                  Timetable clash with an enrolled class
                </Badge>
              )}
            </>
          )}

          <Button
            title="View class"
            onPress={() =>
              navigation.navigate('ClassDetails', {
                id: item.id,
              })
            }
          />
        </Card>
      ))}
    </Screen>
  );
}