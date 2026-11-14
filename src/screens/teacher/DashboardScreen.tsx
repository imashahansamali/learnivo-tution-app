import React, { useState } from "react";
import { Alert, Text } from "react-native";

import { useAuth } from "../../context/AuthContext";
import { useCollection } from "../../hooks/useCollection";
import { deleteClass } from "../../services/data";
import type { ClassItem } from "../../types";
import { getClassColor } from "../../utils/classColors";
import { days, time } from "../../utils/matching";
import {
  Screen,
  Card,
  Heading,
  Body,
  Badge,
  Button,
  ErrorText,
} from "../../components/UI";

type Props = {
  navigation: {
    navigate(route: "TeacherRequests" | "Students" | "Profile"): void;
    navigate(route: "ClassEditor", params?: { id: string }): void;
  };
};

export default function DashboardScreen({ navigation }: Props) {
  const { user, profile } = useAuth();
  const { items, error, loading } = useCollection<ClassItem>("classes", [
    ["teacherId", user?.uid ?? ""],
  ]);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState("");
  const classes = items.filter((item) => !item.deleted);

  async function remove(id: string) {
    setDeleting(id);
    setDeleteError("");

    try {
      await deleteClass(id);
    } catch (cause) {
      setDeleteError(cause instanceof Error ? cause.message : "Unable to delete class.");
    } finally {
      setDeleting(null);
    }
  }

  function confirmDelete(item: ClassItem) {
    Alert.alert(
      `Delete ${item.title}?`,
      "The class will be removed from student timetables. Request history stays available.",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Delete", style: "destructive", onPress: () => void remove(item.id) },
      ],
    );
  }

  return (
    <Screen title="Teacher workspace" subtitle={`Welcome, ${profile?.name ?? ""}`}>
      <Button title="Create a class" onPress={() => navigation.navigate("ClassEditor")} />
      <Button
        secondary
        title="Review requests and waitlist"
        onPress={() => navigation.navigate("TeacherRequests")}
      />
      <Button secondary title="Students" onPress={() => navigation.navigate("Students")} />
      <Button secondary title="Profile" onPress={() => navigation.navigate("Profile")} />

      <ErrorText message={deleteError || error} />
      {loading && <Body>Loading…</Body>}
      {!loading && !classes.length && <Body>Create your first class to get started.</Body>}

      {classes.map((item) => (
        <Card key={item.id} backgroundColor={getClassColor(item.id)}>
          <Heading>{item.title}</Heading>
          <Body>
            <Text style={{ color: "#B91C1C", fontWeight: "700" }}>{days[item.day]}</Text>
            {" "}{time(item.start)}–{time(item.end)}
          </Body>
          <Badge warning={!item.active}>
            {item.active ? "Published" : "Closed"} · {item.enrolledCount}/{item.capacity} enrolled
          </Badge>
          <Button
            secondary
            title="Edit class / capacity"
            onPress={() => navigation.navigate("ClassEditor", { id: item.id })}
          />
          <Button
            secondary
            title="Delete class"
            busy={deleting === item.id}
            disabled={deleting !== null}
            onPress={() => confirmDelete(item)}
          />
        </Card>
      ))}
    </Screen>
  );
}