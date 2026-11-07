import React, { useState } from 'react';
import { useAuth, logout } from '../../context/AuthContext';
import { useCollection } from '../../hooks/useCollection';
import { markRead } from '../../services/data';
import type { Notice } from '../../types';
import {
  Badge,
  Body,
  Button,
  Card,
  ErrorText,
  Heading,
  Screen,
} from '../../components/UI';

export function ResultScreen({
  route,
  navigation,
}: any) {
  return (
    <Screen title={route.params.title}>
      <Card>
        <Body>{route.params.message}</Body>
      </Card>

      <Button
        title="My activity"
        onPress={() => navigation.navigate('Activity')}
      />

      <Button
        secondary
        title="Find classes"
        onPress={() => navigation.navigate('Matches')}
      />
    </Screen>
  );
}

export function ProfileScreen() {
  const { user, profile } = useAuth();
  const [error, setError] = useState('');

  return (
    <Screen title="My profile">
      <Card>
        <Heading>{profile?.name}</Heading>

        <Body>
          {`${user?.email || ''}\n`}
          {`${profile?.phone || ''}\n`}
          Grade {profile?.grade}
        </Body>

        <Badge>{profile?.role.toUpperCase()}</Badge>
      </Card>

      <ErrorText message={error} />

      <Button
        title="Sign out"
        onPress={() => {
          logout().catch(err => setError(err.message));
        }}
      />
    </Screen>
  );
}

export function NotificationsScreen() {
  const { user } = useAuth();

  const query = useCollection<Notice>(
    'notifications',
    [['userId', user!.uid]]
  );

  const [error, setError] = useState('');

  return (
    <Screen
      title="Notifications"
      subtitle="In-app updates from your teachers."
    >
      <ErrorText message={error || query.error} />

      {query.loading && <Body>Loading…</Body>}

      {!query.loading && !query.items.length && (
        <Body>No notifications yet.</Body>
      )}

      {query.items.map(item => (
        <Card key={item.id}>
          <Body>{item.message}</Body>

          {item.read ? (
            <Badge>READ</Badge>
          ) : (
            <Button
              secondary
              title="Mark as read"
              onPress={() => {
                markRead(item.id).catch(err =>
                  setError(err.message)
                );
              }}
            />
          )}
        </Card>
      ))}
    </Screen>
  );
}