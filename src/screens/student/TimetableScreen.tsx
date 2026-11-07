import React, { useCallback, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { enrolledClasses } from '../../services/data';
import type { ClassItem } from '../../types';
import { days, time } from '../../utils/matching';
import {
  Body,
  Card,
  ErrorText,
  Heading,
  Screen,
} from '../../components/UI';

export default function TimetableScreen() {
  const [items, setItems] = useState<ClassItem[]>([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      let active = true;
      setLoading(true);

      enrolledClasses()
        .then(values => {
          if (!active) return;

          setItems(values);
          setError('');
        })
        .catch(err => {
          if (active) setError(err.message);
        })
        .finally(() => {
          if (active) setLoading(false);
        });

      return () => {
        active = false;
      };
    }, [])
  );

  const sorted = [...items].sort(
    (a, b) => a.day - b.day || a.start - b.start
  );

  return (
    <Screen
      title="My timetable"
      subtitle="Enrolled weekly classes. All times are Sri Lanka time."
    >
      <ErrorText message={error} />

      {loading && <Body>Loading…</Body>}

      {!loading && !items.length && (
        <Body>No enrolled classes yet.</Body>
      )}

      {sorted.map(item => (
        <Card key={item.id}>
          <Heading>
            {days[item.day]} · {time(item.start)}–
            {time(item.end)}
          </Heading>

          <Body>
            {`${item.title}\n`}
            {`${item.teacherName} · ${item.location}`}
          </Body>
        </Card>
      ))}
    </Screen>
  );
}