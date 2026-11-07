import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { useCollection } from '../../hooks/useCollection';
import type { RequestItem } from '../../types';
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

export default function ActivityScreen({
  navigation,
}: any) {
  const { user } = useAuth();

  const { items, error, loading } =
    useCollection<RequestItem>('requests', [
      ['studentId', user!.uid],
    ]);

  if (loading) return <Loading />;

  return (
    <Screen
      title="My activity"
      subtitle="Trial approval and permanent enrollment are separate."
    >
      <ErrorText message={error} />

      {!items.length && <Body>No requests yet.</Body>}

      {items.map(item => (
        <Card key={item.id}>
          <Heading>{item.classTitle}</Heading>

          <Body>
            {item.kind}
            {item.sessionDate
              ? ` · ${item.sessionDate}`
              : ''}
          </Body>

          <Badge warning={item.status !== 'approved'}>
            {item.status.toUpperCase()}
          </Badge>

          <Button
            secondary
            title="View class"
            onPress={() =>
              navigation.navigate('ClassDetails', {
                id: item.classId,
              })
            }
          />
        </Card>
      ))}
    </Screen>
  );
}