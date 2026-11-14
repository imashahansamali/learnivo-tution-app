import React, { useCallback, useState } from "react";
import { Pressable, StyleSheet, Text } from "react-native";
import { useFocusEffect } from "@react-navigation/native";

import { useAuth } from "../../context/AuthContext";
import { useCollection } from "../../hooks/useCollection";
import {
  ClassItem,
  Preferences,
  loadPreferences,
  enrolledClasses,
} from "../../services/data";
import { colors } from "../../theme/colors";
import { getClassColor } from "../../utils/classColors";
import { match, days, time } from "../../utils/matching";
import {
  Screen,
  Card,
  Heading,
  Body,
  Badge,
  Button,
  ErrorText,
  Loading,
} from "../../components/UI";

export default function MatchesScreen({ navigation }: any) {
  const { profile } = useAuth();
  const all = useCollection<ClassItem>("classes");
  const [preferences, setPreferences] = useState<Preferences | null>(null);
  const [existingClasses, setExistingClasses] = useState<ClassItem[]>([]);
  const [error, setError] = useState("");
  const [loaded, setLoaded] = useState(false);
  const [nearbyOnly, setNearbyOnly] = useState(false);

  useFocusEffect(
    useCallback(() => {
      let active = true;
      setLoaded(false);

      Promise.all([loadPreferences(), enrolledClasses()])
        .then(([savedPreferences, enrolled]) => {
          if (active) {
            setPreferences(savedPreferences);
            setExistingClasses(enrolled);
            setError("");
          }
        })
        .catch((error) => {
          if (active) setError(error.message);
        })
        .finally(() => {
          if (active) setLoaded(true);
        });

      return () => {
        active = false;
      };
    }, []),
  );

  if (all.loading || !loaded) return <Loading />;

  const classes = all.items
    .filter(
      (item) =>
        item.active &&
        item.grade === profile?.grade &&
        (!preferences ||
          item.subject.toLowerCase() === preferences.subject.toLowerCase()),
    )
    .map((item) => ({
      item,
      result: preferences ? match(item, preferences, existingClasses) : null,
    }))
    .filter(({ item, result }) => {
      if (!nearbyOnly || !preferences) return true;

      return (
        item.mode === "in-person" &&
        result !== null &&
        result.distance <= preferences.radiusKm
      );
    })
    .sort((a, b) => (b.result?.score ?? 0) - (a.result?.score ?? 0));

  return (
    <Screen
      title="Your class matches"
      subtitle="Matches explain how each class fits your preferences."
    >
      <Button
        secondary
        title="Set learning preferences"
        onPress={() => navigation.navigate("Preferences")}
      />
      <Button
        secondary
        title="My activity"
        onPress={() => navigation.navigate("Activity")}
      />
      <Button
        secondary
        title="My timetable"
        onPress={() => navigation.navigate("Timetable")}
      />
      <Button
        secondary
        title="Notifications"
        onPress={() => navigation.navigate("Notifications")}
      />
      <Button
        secondary
        title="Profile"
        onPress={() => navigation.navigate("Profile")}
      />

      <Pressable
        accessibilityRole="button"
        accessibilityState={{ selected: nearbyOnly && !!preferences }}
        onPress={() => {
          if (!preferences) {
            navigation.navigate("Preferences");
            return;
          }

          setNearbyOnly((current) => !current);
        }}
        style={({ pressed }) => [
          styles.nearbyButton,
          nearbyOnly && preferences && styles.nearbySelected,
          pressed && styles.pressed,
        ]}
      >
        <Text style={styles.nearbyLabel}>
          {nearbyOnly && preferences ? "Show all matches" : "Learnivo Nearby"}
        </Text>
      </Pressable>

      <ErrorText message={all.error || error} />

      {classes.length === 0 && (
        <Card>
          <Body>
            {nearbyOnly && preferences
              ? `No in-person matches within ${preferences.radiusKm} km of your saved location.`
              : "No matching classes yet. Ask a teacher to publish a class or adjust your preferences."}
          </Body>
        </Card>
      )}

      {classes.map(({ item, result }) => (
        <Card key={item.id} backgroundColor={getClassColor(item.id)}>
          <Heading>{item.title}</Heading>
          <Body>
            {item.teacherName} · {item.medium}
            {"\n"}
            {days[item.day]} {time(item.start)}–{time(item.end)}
            {"\n"}
            LKR {item.fee.toLocaleString()} / month · {item.mode}
          </Body>
          <Badge warning={item.enrolledCount >= item.capacity}>
            {item.enrolledCount >= item.capacity
              ? "FULL"
              : `${item.capacity - item.enrolledCount} places left`}
          </Badge>
          {result && (
            <>
              <Badge>
                {result.score}/4 preferences ·{" "}
                {result.reasons.join(" · ") || "Consider other options"}
              </Badge>
              {result.clash && (
                <Badge warning>Timetable clash with an enrolled class</Badge>
              )}
            </>
          )}
          <Button
            title="View class"
            onPress={() => navigation.navigate("ClassDetails", { id: item.id })}
          />
        </Card>
      ))}
    </Screen>
  );
}

const styles = StyleSheet.create({
  nearbyButton: {
    minHeight: 52,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingHorizontal: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.secondary,
  },
  nearbySelected: {
    borderColor: colors.primary,
  },
  pressed: {
    opacity: 0.75,
  },
  nearbyLabel: {
    color: colors.secondaryText,
    fontSize: 16,
    fontWeight: "700",
  },
});