import { getClassColor } from "../../utils/classColors";
import React, { useState, useCallback } from "react";
import { useFocusEffect } from "@react-navigation/native";
import { ClassItem, enrolledClasses } from "../../services/data";
import { days, time } from "../../utils/matching";
import { Screen, Card, Heading, Body, ErrorText } from "../../components/UI";
export default function TimetableScreen() {
  const [items, I] = useState<ClassItem[]>([]),
    [error, X] = useState(""),
    [loading, L] = useState(true);
  useFocusEffect(
    useCallback(() => {
      let active = true;
      L(true);
      enrolledClasses()
        .then((x) => {
          if (active) {
            I(x);
            X("");
          }
        })
        .catch((e) => {
          if (active) X(e.message);
        })
        .finally(() => {
          if (active) L(false);
        });
      return () => {
        active = false;
      };
    }, []),
  );
  return (
    <Screen
      title="My timetable"
      subtitle="Your permanently enrolled weekly classes. All times are Sri Lanka time."
    >
      <ErrorText message={error} />
      {loading ? (
        <Body>Loading…</Body>
      ) : (
        !items.length && <Body>No enrolled classes yet.</Body>
      )}
      {items
        .sort((a, b) => a.day - b.day || a.start - b.start)
        .map((c) => (
          <Card key={c.id} backgroundColor={getClassColor(c.id)}>
            <Heading>
              {days[c.day]} · {time(c.start)}–{time(c.end)}
            </Heading>
            <Body>
              {c.title}
              {c.teacherName} · {c.location}
            </Body>
          </Card>
        ))}
    </Screen>
  );
}