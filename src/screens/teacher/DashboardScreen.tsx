import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { useCollection } from '../../hooks/useCollection';
import type { ClassItem } from '../../types';
import { days, time } from '../../utils/matching';
import {
  Badge,
  Body,
  Button,
  Card,
  ErrorText,
  Heading,
  Screen,
} from '../../components/UI';

export default function DashboardScreen({
  navigation,
}: any) {
  const { user, profile } = useAuth();

  const { items, error, loading } =
    useCollection<ClassItem>('classes', [
      ['teacherId', user!.uid],
    ]);

  return (
    <Screen
      title="Teacher workspace"
      subtitle={`Welcome, ${profile?.name}`}
    >
      <Button
        title="Create a class"
        onPress={() => navigation.navigate('ClassEditor')}
      />

      <Button
        secondary
        title="Review requests and waitlist"
        onPress={() =>
          navigation.navigate('TeacherRequests')
        }
      />

      <Button
        secondary
        title="Students"
        onPress={() => navigation.navigate('Students')}
      />

      <Button
        secondary
        title="Profile"
        onPress={() => navigation.navigate('Profile')}
      />

      <ErrorText message={error} />

      {loading && <Body>Loading…</Body>}

      {!loading && !items.length && (
        <Body>Create your first class to get started.</Body>
      )}

      {items.map(item => (
        <Card key={item.id}>
          <Heading>{item.title}</Heading>

          <Body>
            {days[item.day]} {time(item.start)}–
            {time(item.end)}
          </Body>

          <Badge warning={!item.active}>
            {item.active ? 'Published' : 'Closed'} ·{' '}
            {item.enrolledCount}/{item.capacity} enrolled
          </Badge>

          <Button
            secondary
            title="Edit class / capacity"
            onPress={() =>
              navigation.navigate('ClassEditor', {
                id: item.id,
              })
            }
          />
        </Card>
      ))}
    </Screen>
  );
}