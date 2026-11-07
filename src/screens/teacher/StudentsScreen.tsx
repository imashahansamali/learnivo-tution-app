import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { useCollection } from '../../hooks/useCollection';
import type { Enrollment } from '../../types';
import {
  Badge,
  Body,
  Card,
  ErrorText,
  Heading,
  Screen,
} from '../../components/UI';

export default function StudentsScreen() {
  const { user } = useAuth();

  const query = useCollection<Enrollment>(
    'enrollments',
    [['teacherId', user!.uid]]
  );

  return (
    <Screen
      title="Enrolled students"
      subtitle="Students with approved permanent places."
    >
      <ErrorText message={query.error} />

      {query.loading && <Body>Loading…</Body>}

      {!query.loading && !query.items.length && (
        <Body>No enrolled students yet.</Body>
      )}

      {query.items.map(item => (
        <Card key={item.id}>
          <Heading>{item.studentName}</Heading>
          <Body>{item.classTitle}</Body>
          <Badge>ENROLLED</Badge>
        </Card>
      ))}
    </Screen>
  );
}