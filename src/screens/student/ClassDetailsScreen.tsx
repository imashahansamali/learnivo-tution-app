import { getClassColor } from "../../utils/classColors";
import React, { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import {
  ClassItem,
  loadClass,
  enrolledClasses,
  loadPreferences,
  requestClass,
} from "../../services/data";
import { days, time, overlaps, dateValue } from "../../utils/matching";
import {
  Screen,
  Card,
  Heading,
  Body,
  Badge,
  Input,
  Button,
  ErrorText,
  Loading,
} from "../../components/UI";
export default function ClassDetailsScreen({ route, navigation: n }: any) {
  const { profile } = useAuth();
  const [c, C] = useState<ClassItem | null>(null),
    [clashes, K] = useState<ClassItem[]>([]),
    [needs, N] = useState(""),
    [busy, B] = useState(false),
    [error, X] = useState("");
  useEffect(() => {
    let active = true;
    Promise.all([
      loadClass(route.params.id),
      enrolledClasses(),
      loadPreferences(),
    ])
      .then(([x, es, p]) => {
        if (active) {
          C(x);
          K(es.filter((e) => e.id !== x.id && overlaps(x, e)));
          N(p?.needs || "");
        }
      })
      .catch((e) => X(e.message));
    return () => {
      active = false;
    };
  }, [route.params.id]);
  async function send(kind: "trial" | "enrollment" | "waitlist") {
    if (!c || !profile) return;
    B(true);
    X("");
    try {
      if (kind === "trial") dateValue(c.trialDate);
      await requestClass(c, kind, profile, needs);
      n.navigate("Result", {
        classId: c.id,
        title:
          kind === "waitlist" ? "You are on the list" : "Request submitted",
        message:
          kind === "waitlist"
            ? "Your waiting-list entry is saved. Watch in-app notifications for updates."
            : "Your teacher will review the request. Check My activity for the result.",
      });
    } catch (e) {
      X((e as Error).message);
    } finally {
      B(false);
    }
  }
  if (!c)
    return error ? (
      <Screen title="Class unavailable">
        <ErrorText message={error} />
      </Screen>
    ) : (
      <Loading />
    );
  const full = c.enrolledCount >= c.capacity;
  return (
    <Screen title={c.title} subtitle={c.teacherName}>
      <Card backgroundColor={getClassColor(c.id)}>
        <Heading>
          {c.subject} · Grade {c.grade}
        </Heading>
        <Body>
          {c.medium} medium · {c.mode}
          {c.location}
          {days[c.day]} {time(c.start)}–{time(c.end)}
          LKR {c.fee.toLocaleString()} / month
        </Body>
        <Badge warning={full}>
          {full ? "Full" : `${c.capacity - c.enrolledCount} places available`}
        </Badge>
        <Body>
          Trial date: {c.trialDate || "Not offered"}
          Fees are arranged directly with the teacher.
        </Body>
      </Card>
      {clashes.map((x) => (
        <Card key={x.id} backgroundColor={getClassColor(x.id)}>
          <Badge warning>Time clash</Badge>
          <Body>
            {x.title}: {days[x.day]} {time(x.start)}–{time(x.end)}
          </Body>
          <Button
            secondary
            title="Find another class"
            onPress={() => n.navigate("Matches")}
          />
        </Card>
      ))}
      <Input
        label="Tell your teacher what you need help with"
        value={needs}
        onChangeText={N}
        multiline
      />
      <ErrorText message={error} />
      {full ? (
        <Button
          title="Join waitlist"
          busy={busy}
          onPress={() => send("waitlist")}
        />
      ) : (
        <>
          <Button
            title="Request a trial"
            busy={busy}
            disabled={!c.trialDate || !c.active}
            onPress={() => send("trial")}
          />
          <Button
            secondary
            title="Request permanent place"
            disabled={busy || !c.active}
            onPress={() => send("enrollment")}
          />
        </>
      )}
      <Button
        secondary
        title="View timetable"
        onPress={() => n.navigate("Timetable")}
      />
    </Screen>
  );
}