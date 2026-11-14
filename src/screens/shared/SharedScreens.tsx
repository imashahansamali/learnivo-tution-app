import { getClassColor } from "../../utils/classColors";
import React, { useState } from "react";
import { useAuth, logout } from "../../context/AuthContext";
import { useCollection } from "../../hooks/useCollection";
import { markRead } from "../../services/data";
import { Notice } from "../../types";
import {
  Screen,
  Card,
  Heading,
  Body,
  Badge,
  Button,
  ErrorText,
} from "../../components/UI";
export function ResultScreen({ route, navigation: n }: any) {
  return (
    <Screen title={route.params.title}>
      <Card backgroundColor={getClassColor(route.params.classId)}>
        <Body>{route.params.message}</Body>
      </Card>
      <Button title="My activity" onPress={() => n.navigate("Activity")} />
      <Button
        secondary
        title="Find classes"
        onPress={() => n.navigate("Matches")}
      />
    </Screen>
  );
}
export function ProfileScreen() {
  const { user, profile } = useAuth();
  const [error, X] = useState("");
  return (
    <Screen title="My profile">
      <Card>
        <Heading>{profile?.name}</Heading>
        <Body>
          {user?.email}
          {profile?.phone}
          Grade {profile?.grade}
        </Body>
        <Badge>{profile?.role.toUpperCase()}</Badge>
      </Card>
      <ErrorText message={error} />
      <Button
        title="Sign out"
        onPress={() => {
          logout().catch((e) => X(e.message));
        }}
      />
    </Screen>
  );
}
export function NotificationsScreen() {
  const { user } = useAuth();
  const q = useCollection<Notice>("notifications", [["userId", user!.uid]]);
  const [error, X] = useState("");
  return (
    <Screen
      title="Notifications"
      subtitle="In-app updates. No SMS or external emails are sent."
    >
      <ErrorText message={error || q.error} />
      {q.loading && <Body>Loading…</Body>}
      {!q.loading && !q.items.length && <Body>No notifications yet.</Body>}
      {q.items.map((v) => (
        <Card key={v.id} backgroundColor={getClassColor(v.classId)}>
          <Body>{v.message}</Body>
          {v.read ? (
            <Badge>READ</Badge>
          ) : (
            <Button
              secondary
              title="Mark as read"
              onPress={() => {
                markRead(v.id).catch((e) => X(e.message));
              }}
            />
          )}
        </Card>
      ))}
    </Screen>
  );
}