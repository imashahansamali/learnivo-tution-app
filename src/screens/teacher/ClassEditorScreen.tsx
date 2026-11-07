import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  loadClass,
  saveClass,
} from '../../services/data';
import {
  dateValue,
  numberValue,
  parseClock,
  time,
} from '../../utils/matching';
import {
  Body,
  Button,
  ErrorText,
  Input,
  Screen,
} from '../../components/UI';

export default function ClassEditorScreen({
  route,
  navigation,
}: any) {
  const { user, profile } = useAuth();
  const id = route.params?.id;

  const [values, setValues] = useState({
    title: '',
    subject: 'Mathematics',
    grade: '10',
    medium: 'Sinhala',
    fee: '2500',
    mode: 'in-person',
    location: 'Matara',
    latitude: '5.9549',
    longitude: '80.5550',
    day: '0',
    start: '14:00',
    end: '16:00',
    capacity: '40',
    trialDate: '',
  });

  const [active, setActive] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [ready, setReady] = useState(!id);

  const labels: Record<string, string> = {
    title: 'Class title',
    subject: 'Subject',
    grade: 'Grade',
    medium: 'Teaching language',
    fee: 'Monthly fee (LKR)',
    mode: 'Mode: online or in-person',
    location: 'Location / online platform',
    latitude: 'Class latitude',
    longitude: 'Class longitude',
    day: 'Day (0 Sunday – 6 Saturday)',
    start: 'Start (HH:MM)',
    end: 'End (HH:MM)',
    capacity: 'Maximum students',
    trialDate: 'Trial date (YYYY-MM-DD, optional)',
  };

  useEffect(() => {
    if (!id) return;

    let mounted = true;

    loadClass(id)
      .then(item => {
        if (!mounted) return;

        setValues({
          title: item.title,
          subject: item.subject,
          grade: String(item.grade),
          medium: item.medium,
          fee: String(item.fee),
          mode: item.mode,
          location: item.location,
          latitude: String(item.latitude),
          longitude: String(item.longitude),
          day: String(item.day),
          start: time(item.start),
          end: time(item.end),
          capacity: String(item.capacity),
          trialDate: item.trialDate,
        });

        setActive(item.active);
        setReady(true);
      })
      .catch(err => {
        if (mounted) setError(err.message);
      });

    return () => {
      mounted = false;
    };
  }, [id]);

  async function save() {
    setBusy(true);
    setError('');

    try {
      const start = parseClock(values.start);
      const end = parseClock(values.end);
      const grade = numberValue(values.grade, 'grade', 1, 13);
      const day = numberValue(values.day, 'day', 0, 6);
      const capacity = numberValue(
        values.capacity,
        'capacity',
        1,
        500
      );

      if (end <= start) {
        throw Error('End must be after start.');
      }

      if (
        !Number.isInteger(grade) ||
        !Number.isInteger(day) ||
        !Number.isInteger(capacity)
      ) {
        throw Error(
          'Grade, day and capacity must be whole numbers.'
        );
      }

      if (
        !values.title.trim() ||
        !values.subject.trim() ||
        !values.medium.trim() ||
        !values.location.trim()
      ) {
        throw Error('Complete all class details.');
      }

      if (
        values.mode !== 'online' &&
        values.mode !== 'in-person'
      ) {
        throw Error('Mode must be online or in-person.');
      }

      if (values.trialDate) {
        dateValue(values.trialDate);
      }

      await saveClass(
        {
          teacherId: user!.uid,
          teacherName: profile!.name,
          title: values.title.trim(),
          subject: values.subject.trim(),
          grade,
          medium: values.medium.trim(),
          fee: numberValue(values.fee, 'fee', 0),
          mode: values.mode,
          location: values.location.trim(),
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
          day,
          start,
          end,
          capacity,
          trialDate: values.trialDate,
          active,
        },
        id
      );

      navigation.goBack();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <Screen
      title={id ? 'Edit your class' : 'Create a class'}
      subtitle="Times use Asia/Colombo. Enter coordinates for distance matching."
    >
      {!ready && <Body>Loading class…</Body>}

      {ready && (
        <>
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
            />
          ))}

          <Button
            secondary
            title={
              active
                ? 'Published · tap to close'
                : 'Closed · tap to publish'
            }
            onPress={() => setActive(!active)}
          />

          <Button
            title="Save class"
            busy={busy}
            onPress={save}
          />
        </>
      )}

      <ErrorText message={error} />
    </Screen>
  );
}