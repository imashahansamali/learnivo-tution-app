import LearnivoIcon from "../../components/LearnivoIcon";
import React from "react";

import { useAuth } from "../../context/AuthContext";
import { useCollection } from "../../hooks/useCollection";
import type { RequestItem } from "../../types";
import { getClassColor } from "../../utils/classColors";

type Props = {
  navigation: {
    navigate: (route: "ClassDetails", params: { id: string }) => void;
  };
};

const requestNames = {
  trial: "Trial request",
  enrollment: "Enrollment request",
  waitlist: "Waitlist request",
};

const statusNames = {
  approved: "Approved",
  pending: "Pending",
  declined: "Declined",
};

const styles = `
.la-page {
  flex: 1;
  min-height: 0;
  overflow: auto;
  padding: clamp(20px, 5vw, 64px);
  box-sizing: border-box;
  color: #f4f7ff;
  background:
    radial-gradient(ellipse at 92% 0%, #43339c 0%, transparent 47%),
    radial-gradient(ellipse at 0% 100%, #075782 0%, transparent 55%),
    #09162f;
  font-family: Inter, system-ui, sans-serif;
}
.la-content { max-width: 1080px; margin: 0 auto; }
.la-brand {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #b9d6ff;
  font-size: 13px;
  font-weight: 800;
  letter-spacing: 2px;
}
.la-page h1 {
  margin: 16px 0 8px;
  font-size: clamp(32px, 5vw, 48px);
  letter-spacing: -0.03em;
}
.la-page p { margin: 0; color: #c5d3eb; line-height: 1.55; }
.la-list {
  display: grid;
  gap: 14px;
  list-style: none;
  padding: 0;
  margin: 28px 0 0;
}
.la-card, .la-message {
  border: 1px solid #b9d8ff40;
  border-radius: 18px;
  background: linear-gradient(135deg, #b6d7ff24, #83a7f412);
  box-shadow: 0 8px 24px #0003;
  padding: 20px;
}
.la-card {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 18px;
  border-inline-start-width: 4px;
}
.la-details { flex: 1 1 220px; min-width: 0; overflow-wrap: anywhere; }
.la-details h2 { margin: 0 0 5px; font-size: 20px; }
.la-status {
  display: inline-block;
  padding: 5px 10px;
  border-radius: 999px;
  font-size: 13px;
  font-weight: 700;
}
.la-approved { background: #11604b; color: #dafff1; }
.la-pending { background: #694810; color: #fff0bf; }
.la-declined { background: #762d49; color: #ffe6ee; }
.la-button {
  border: 1px solid #b9d8ff55;
  border-radius: 10px;
  padding: 10px 16px;
  min-height: 44px;
  background: #244674;
  color: #fff;
  font: inherit;
  font-weight: 650;
  cursor: pointer;
}
.la-button:hover { background: #315788; }
.la-button:focus-visible { outline: 2px solid #94edff; outline-offset: 3px; }
.la-message { margin-top: 24px; }
.la-message[role="alert"] { color: #ffd9e1; }
@media (max-width: 520px) {
  .la-card { gap: 12px; }
  .la-button { flex-basis: 100%; }
}
`;

export default function ActivityScreen({ navigation }: Props) {
  const { user } = useAuth();
  const { items, error, loading } = useCollection<RequestItem>("requests", [
    ["studentId", user?.uid ?? ""],
  ]);

  return (
    <main className="la-page">
      <style>{styles}</style>
      <div className="la-content">
        <header>
          <div className="la-brand">
            <LearnivoIcon />
            <span>LEARNIVO</span>
          </div>
          <h1>My activity</h1>
          <p>Track your trial, enrollment and waitlist requests.</p>
        </header>

        {loading && (
          <div className="la-message" role="status">Loading requests…</div>
        )}
        {error && <div className="la-message" role="alert">{error}</div>}
        {!loading && !error && items.length === 0 && (
          <div className="la-message">
            <p>No requests yet. Requests you send from a class page will appear here.</p>
          </div>
        )}

        {items.length > 0 && (
          <ul className="la-list" aria-label="Class requests">
            {items.map((request) => (
              <li
                className="la-card"
                key={request.id}
                style={{ borderInlineStartColor: getClassColor(request.classId) }}
              >
                <div className="la-details">
                  <h2>{request.classTitle}</h2>
                  <p>
                    {requestNames[request.kind]}
                    {request.sessionDate ? ` · ${request.sessionDate}` : ""}
                  </p>
                </div>
                <span className={`la-status la-${request.status}`}>
                  {statusNames[request.status]}
                </span>
                <button
                  type="button"
                  className="la-button"
                  aria-label={`View class: ${request.classTitle}`}
                  onClick={() =>
                    navigation.navigate("ClassDetails", { id: request.classId })
                  }
                >
                  View class <span aria-hidden="true">→</span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </main>
  );
}