import React from "react";
import { Alert } from "react-native";

import {
  Badge,
  Body,
  Button,
  Card,
  ErrorText,
  Heading,
  Screen,
} from "../../components/UI";
import { useAuth } from "../../context/AuthContext";
import { useCollection } from "../../hooks/useCollection";
import { useRemoveEnrollment } from "../../hooks/useRemoveEnrollment";
import type { Enrollment } from "../../types";
import { getClassColor } from "../../utils/classColors";

export default function StudentsScreen() {
  const { user } = useAuth();
  const { remove, removing, removeError } = useRemoveEnrollment();
  const { items, loading, error } = useCollection<Enrollment>("enrollments", [
    ["teacherId", user?.uid ?? ""],
  ]);

  return (
    <Screen
      title="Enrolled students"
      subtitle="Students with approved permanent places."
    >
      <ErrorText message={removeError || error} />

      {loading && <Body>Loading…</Body>}
      {!loading && !error && items.length === 0 && (
        <Body>No enrolled students yet.</Body>
      )}

      {items.map((item) => (
        <Card key={item.id} backgroundColor={getClassColor(item.classId)}>
          <Heading>{item.studentName}</Heading>
          <Body>{item.classTitle}</Body>
          <Badge>ENROLLED</Badge>

          <Button
            secondary
            title="Remove enrollment"
            busy={removing === item.id}
            disabled={removing !== null}
            onPress={() =>
              Alert.alert(
                "Remove enrollment?",
                `Remove ${item.studentName} from ${item.classTitle}?`,
                [
                  { text: "Cancel", style: "cancel" },
                  {
                    text: "Remove",
                    style: "destructive",
                    onPress: () => void remove(item.id),
                  },
                ],
              )
            }
          />
        </Card>
      ))}
    </Screen>
  );
}