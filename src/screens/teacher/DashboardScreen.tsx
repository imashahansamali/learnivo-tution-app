import React from "react";
import { Text } from "react-native";
import { useAuth } from "../../context/AuthContext";
import { useCollection } from "../../hooks/useCollection";
import type { ClassItem } from "../../types";
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

export default function DashboardScreen({ navigation: n }: any) {
  const { user, profile } = useAuth();
  const { items, error, loading } = useCollection<ClassItem>("classes", [
    ["teacherId", user!.uid],
  ]);

  return (
    <Screen title="Teacher workspace" subtitle={`Welcome, ${profile?.name}`}>
      <Button
        title="Create a class"
        onPress={() => n.navigate("ClassEditor")}
      />
      <Button
        secondary
        title="Review requests and waitlist"
        onPress={() => n.navigate("TeacherRequests")}
      />
      <Button
        secondary
        title="Students"
        onPress={() => n.navigate("Students")}
      />
      <Button
        secondary
        title="Profile"
        onPress={() => n.navigate("Profile")}
      />

      <ErrorText message={error} />

      {loading && <Body>Loading…</Body>}

      {!loading && !items.length && (
        <Body>Create your first class to get started.</Body>
      )}

      {items.map((c) => (
        <Card key={c.id} backgroundColor="#D5E8E6">
          <Heading>{c.title}</Heading>

          <Body>
            <Text style={{ color: "#B91C1C", fontWeight: "700" }}>
              {days[c.day]}
            </Text>{" "}
            {time(c.start)}–{time(c.end)}
          </Body>

          <Badge warning={!c.active}>
            {c.active ? "Published" : "Closed"} · {c.enrolledCount}/{c.capacity}{" "}
            enrolled
          </Badge>

          <Button
            secondary
            title="Edit class / capacity"
            onPress={() => n.navigate("ClassEditor", { id: c.id })}
          />
        </Card>
      ))}
    </Screen>
  );
}