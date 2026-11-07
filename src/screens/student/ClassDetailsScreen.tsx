import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  enrolledClasses,
  loadClass,
  loadPreferences,
  requestClass,
} from '../../services/data';
import type { ClassItem, RequestItem } from '../../types';
import {
  dateValue,
  days,
  overlaps,
  time,
} from '../../utils/matching';
import {
  Badge,
  Body,
  Button,
  Card,
  ErrorText,
  Heading,
  Input,
  Loading,
  Screen,
} from '../../components/UI';

export default function ClassDetailsScreen({
  route,
  navigation,
}: any) {
  const { profile } = useAuth();

  const [item, setItem] = useState<ClassItem | null>(null);
  const [clashes, setClashes] = useState<ClassItem[]>([]);
  const [needs, setNeeds] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;

    Promise.all([
      loadClass(route.params.id),
      enrolledClasses(),
      loadPreferences(),
    ])
      .then(([selected, enrolled, preferences]) => {
        if (!active) return;

        setItem(selected);
        setNeeds(preferences?.needs || '');

        setClashes(
          enrolled.filter(
            existing =>
              existing.id !== selected.id &&
              overlaps(selected, existing)
          )
        );
      })
      .catch(err => {
        if (active) setError(err.message);
      });

    return () => {
      active = false;
    };
  }, [route.params.id]);

  async function send(kind: RequestItem['kind']) {
    if (!item || !profile) return;

    setBusy(true);
    setError('');

    try {
      if (kind === 'trial') {
        dateValue(item.trialDate);
      }

      await requestClass(item, kind, profile, needs);

      navigation.navigate('Result', {
        title:
          kind === 'waitlist'
            ? 'You are on the list'
            : 'Request submitted',
        message:
          kind === 'waitlist'
            ? 'Your waiting-list entry is saved. Check My activity for its status.'
            : 'Your teacher will review your request. Check My activity for the result.',
      });
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusy(false);
    }
  }

  if (!item) {
    return error ? (
      <Screen title="Class unavailable">
        <ErrorText message={error} />
      </Screen>
    ) : (
      <Loading />
    );
  }

  const full = item.enrolledCount >= item.capacity;

  return (
    <Screen
      title={item.title}
      subtitle={item.teacherName}
    >
      <Card>
        <Heading>
          {item.subject} · Grade {item.grade}
        </Heading>

        <Body>
          {`${item.medium} medium · ${item.mode}\n`}
          {`${item.location}\n`}
          {`${days[item.day]} ${time(item.start)}–${time(item.end)}\n`}
          {`LKR ${item.fee.toLocaleString()} / month`}
        </Body>

        <Badge warning={full}>
          {full
            ? 'Full'
            : `${item.capacity - item.enrolledCount} places available`}
        </Badge>

        <Body>
          {`Trial date: ${item.trialDate || 'Not offered'}\n`}
          Fees are arranged directly with the teacher.
        </Body>
      </Card>

      {clashes.map(existing => (
        <Card key={existing.id}>
          <Badge warning>Time clash</Badge>

          <Body>
            {existing.title}: {days[existing.day]}{' '}
            {time(existing.start)}–{time(existing.end)}
          </Body>

          <Button
            secondary
            title="Find another class"
            onPress={() => navigation.navigate('Matches')}
          />
        </Card>
      ))}

      <Input
        label="Tell your teacher what you need help with"
        value={needs}
        onChangeText={setNeeds}
        multiline
      />

      <ErrorText message={error} />

      {full ? (
        <Button
          title="Join waitlist"
          busy={busy}
          disabled={!item.active}
          onPress={() => send('waitlist')}
        />
      ) : (
        <>
          <Button
            title="Request a trial"
            busy={busy}
            disabled={!item.trialDate || !item.active}
            onPress={() => send('trial')}
          />

          <Button
            secondary
            title="Request permanent place"
            disabled={busy || !item.active}
            onPress={() => send('enrollment')}
          />
        </>
      )}

      <Button
        secondary
        title="View timetable"
        onPress={() => navigation.navigate('Timetable')}
      />
    </Screen>
  );
}