import { getClassColor } from "../../utils/classColors";
import React, { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { useCollection } from "../../hooks/useCollection";
import { reviewRequest } from "../../services/data";
import { RequestItem } from "../../types";
import {
  Screen,
  Card,
  Heading,
  Body,
  Badge,
  Button,
  ErrorText,
} from "../../components/UI";
export default function RequestsScreen() {
  const { user } = useAuth();
  const q = useCollection<RequestItem>("requests", [["teacherId", user!.uid]]);
  const [busy, B] = useState(""),
    [error, X] = useState("");
  async function review(r: RequestItem, yes: boolean) {
    B(r.id);
    X("");
    try {
      await reviewRequest(r, yes);
    } catch (e) {
      X((e as Error).message);
    } finally {
      B("");
    }
  }
  return (
    <Screen
      title="Requests & waitlist"
      subtitle="Trial approval does not create permanent enrollment."
    >
      <ErrorText message={error || q.error} />
      {q.loading && <Body>Loading…</Body>}
      {!q.loading && !q.items.length && <Body>No requests yet.</Body>}
      {q.items.map((r) => (
        <Card key={r.id} backgroundColor={getClassColor(r.classId)}>
          <Heading>{r.studentName}</Heading>
          <Body>
            {r.classTitle} · {r.kind}
            {r.needs || "No learning notes provided."}
            {r.sessionDate
              ? `
Trial: ${r.sessionDate}`
              : ""}
          </Body>
          <Badge warning={r.status !== "approved"}>
            {r.status.toUpperCase()}
          </Badge>
          {r.status === "pending" && (
            <>
              {r.kind === "waitlist" ? (
                <Body>
                  Waiting for an opening. This version does not automatically
                  offer seats or send SMS.
                </Body>
              ) : (
                <Button
                  title={
                    r.kind === "trial" ? "Approve trial" : "Approve enrollment"
                  }
                  busy={busy === r.id}
                  disabled={!!busy}
                  onPress={() => review(r, true)}
                />
              )}
              <Button
                secondary
                title="Decline / close request"
                disabled={!!busy}
                onPress={() => review(r, false)}
              />
            </>
          )}
        </Card>
      ))}
    </Screen>
  );
}