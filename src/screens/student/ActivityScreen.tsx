import { getClassColor } from "../../utils/classColors";
import React from "react";
import { useAuth } from "../../context/AuthContext";
import { useCollection } from "../../hooks/useCollection";
import { RequestItem } from "../../types";
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
export default function ActivityScreen({ navigation: n }: any) {
  const { user } = useAuth();
  const { items, error, loading } = useCollection<RequestItem>("requests", [
    ["studentId", user!.uid],
  ]);
  if (loading) return <Loading />;
  return (
    <Screen
      title="My activity"
      subtitle="Trials and permanent enrollments are separate requests."
    >
      <ErrorText message={error} />
      {!items.length && <Body>No requests yet.</Body>}
      {items.map((r) => (
        <Card key={r.id} backgroundColor={getClassColor(r.classId)}>
          <Heading>{r.classTitle}</Heading>
          <Body>
            {r.kind}
            {r.sessionDate ? ` · ${r.sessionDate}` : ""}
          </Body>
          <Badge warning={r.status !== "approved"}>
            {r.status.toUpperCase()}
          </Badge>
          <Button
            secondary
            title="View class"
            onPress={() => n.navigate("ClassDetails", { id: r.classId })}
          />
        </Card>
      ))}
    </Screen>
  );
}