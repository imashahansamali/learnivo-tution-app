import React, { useState } from 'react';

import { useAuth } from '../../context/AuthContext';
import { useCollection } from '../../hooks/useCollection';
import { reviewRequest } from '../../services/data';
import type { RequestItem } from '../../types';

import {
  Screen,
  Card,
  Heading,
  Body,
  Badge,
  Button,
  ErrorText,
} from '../../components/UI';

export default function RequestsScreen() {
  const { user } = useAuth();

  const requests = useCollection<RequestItem>('requests', [
    ['teacherId', user!.uid],
  ]);

  const [busy, setBusy] = useState('');
  const [error, setError] = useState('');

  async function handleReview(
    request: RequestItem,
    approved: boolean
  ) {
    setBusy(request.id);
    setError('');

    try {
      await reviewRequest(request, approved);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Could not update the request.'
      );
    } finally {
      setBusy('');
    }
  }

  return (
    <Screen
      title="Requests & waitlist"
      subtitle="Review student trial and enrollment requests."
    >
      <ErrorText message={error || requests.error} />

      {requests.loading && <Body>Loading requests...</Body>}

      {!requests.loading && requests.items.length === 0 && (
        <Body>No requests yet.</Body>
      )}

      {requests.items.map((request) => (
        <Card key={request.id}>
          <Heading>{request.studentName}</Heading>

          <Body>{request.classTitle}</Body>

          <Body>Request type: {request.kind}</Body>

          <Body>
            {request.needs || 'No learning notes provided.'}
          </Body>

          {request.sessionDate && (
            <Body>Trial date: {request.sessionDate}</Body>
          )}

          <Badge warning={request.status !== 'approved'}>
            {request.status.toUpperCase()}
          </Badge>

          {request.status === 'pending' && (
            <>
              {request.kind === 'waitlist' ? (
                <Body>
                  This student is waiting for an available seat.
                </Body>
              ) : (
                <Button
                  title={
                    request.kind === 'trial'
                      ? 'Approve trial'
                      : 'Approve enrollment'
                  }
                  busy={busy === request.id}
                  disabled={busy !== ''}
                  onPress={() => handleReview(request, true)}
                />
              )}

              <Button
                secondary
                title="Decline / close request"
                disabled={busy !== ''}
                onPress={() => handleReview(request, false)}
              />
            </>
          )}
        </Card>
      ))}
    </Screen>
  );
}