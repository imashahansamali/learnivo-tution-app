import React, { useState } from 'react';
import {
  Screen,
  Input,
  Button,
  ErrorText,
} from '../../components/UI';
import { savePreferences } from '../../services/data';
import {
  numberValue,
  parseClock,
} from '../../utils/matching';

export default function PreferencesScreen({
  navigation,
}: any) {
  const [values, setValues] = useState({
    subject: 'Mathematics',
    medium: 'Sinhala',
    budget: '3000',
    latitude: '5.9549',
    longitude: '80.5550',
    radiusKm: '5',
    day: '0',
    start: '14:00',
    end: '18:00',
    needs: '',
  });

  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const labels: Record<string, string> = {
    subject: 'Preferred subject',
    medium: 'Teaching language',
    budget: 'Monthly budget (LKR)',
    latitude: 'Your latitude',
    longitude: 'Your longitude',
    radiusKm: 'Maximum travel distance (km)',
    day: 'Available day (0 Sunday – 6 Saturday)',
    start: 'Available from (HH:MM)',
    end: 'Available until (HH:MM)',
    needs: 'What do you need help with?',
  };

  async function save() {
    setBusy(true);
    setError('');

    try {
      const start = parseClock(values.start);
      const end = parseClock(values.end);
      const day = numberValue(values.day, 'day', 0, 6);

      if (end <= start) {
        throw Error('End time must be after start time.');
      }

      if (!Number.isInteger(day)) {
        throw Error('Day must be a whole number 0–6.');
      }

      if (!values.subject.trim() || !values.medium.trim()) {
        throw Error('Enter subject and language.');
      }

      await savePreferences({
        subject: values.subject.trim(),
        medium: values.medium.trim(),
        budget: numberValue(values.budget, 'budget', 0),
        latitude: numberValue(
          values.latitude,
          'latitude',
          -90,
          90
        ),
        longitude: numberValue(
          values.longitude,
          'longitude',
          -180,
          180
        ),
        radiusKm: numberValue(
          values.radiusKm,
          'travel distance',
          0,
          500
        ),
        day,
        start,
        end,
        needs: values.needs.trim(),
      });

      navigation.navigate('Matches');
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <Screen
      title="Your learning profile"
      subtitle="Change the defaults to your details. Coordinates default to Matara."
    >
      {Object.entries(values).map(([key, value]) => (
        <Input
          key={key}
          label={labels[key]}
          value={value}
          onChangeText={text =>
            setValues(previous => ({
              ...previous,
              [key]: text,
            }))
          }
          multiline={key === 'needs'}
          autoCapitalize="none"
        />
      ))}

      <ErrorText message={error} />

      <Button
        title="Save and find matches"
        busy={busy}
        onPress={save}
      />
    </Screen>
  );
}