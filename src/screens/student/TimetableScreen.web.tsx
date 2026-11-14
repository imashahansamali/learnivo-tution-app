import LearnivoIcon from "../../components/LearnivoIcon";
import React, { useCallback, useState } from "react";
import { useFocusEffect } from "@react-navigation/native";

import { enrolledClasses } from "../../services/data";
import type { ClassItem } from "../../types";
import { getClassColor } from "../../utils/classColors";
import { days, time } from "../../utils/matching";

const styles = `
.lt-page {
  flex: 1;
  min-height: 0;
  overflow: auto;
  padding: clamp(20px, 5vw, 64px);
  background:
    radial-gradient(ellipse at 92% 0%, #43339c, transparent 47%),
    radial-gradient(ellipse at 0% 100%, #075782, transparent 55%),
    #09162f;
  color: #f4f7ff;
  font-family: Inter, system-ui, sans-serif;
}
.lt-content { max-width: 1080px; margin: 0 auto; }
.lt-brand {
  display: flex; align-items: center; gap: 8px;
  color: #b9d6ff; font-size: 13px; font-weight: 800; letter-spacing: 2px;
}
.lt-page h1 { margin: 16px 0 8px; font-size: clamp(32px, 5vw, 48px); }
.lt-page p { margin: 0; color: #c5d3eb; line-height: 1.55; }
.lt-day { margin-top: 28px; }
.lt-day h2 { margin: 0 0 12px; font-size: 19px; }
.lt-list { display: grid; gap: 12px; padding: 0; margin: 0; list-style: none; }
.lt-card, .lt-message {
  padding: 18px 20px;
  border: 1px solid #b9d8ff40;
  border-radius: 18px;
  background: linear-gradient(135deg, #b6d7ff24, #83a7f412);
  box-shadow: 0 8px 24px #0003;
}
.lt-card {
  display: flex; justify-content: space-between; align-items: center;
  flex-wrap: wrap; gap: 14px; border-inline-start-width: 4px;
}
.lt-details { flex: 1 1 200px; min-width: 0; overflow-wrap: anywhere; }
.lt-details h3 { margin: 0 0 4px; font-size: 20px; }
.lt-time {
  padding: 7px 12px; border: 1px solid #a3cbff55; border-radius: 10px;
  background: #244674; color: #fff; font-weight: 700;
  font-variant-numeric: tabular-nums;
}
.lt-message { margin-top: 24px; }
.lt-message[role="alert"] { color: #ffd9e1; }
`;

export default function TimetableScreen() {
  const [items, setItems] = useState<ClassItem[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      let active = true;
      setLoading(true);
      setError("");

      enrolledClasses()
        .then((classes) => {
          if (active) setItems(classes);
        })
        .catch((cause: unknown) => {
          if (active) {
            setError(
              cause instanceof Error
                ? cause.message
                : "Unable to load your timetable.",
            );
          }
        })
        .finally(() => {
          if (active) setLoading(false);
        });

      return () => {
        active = false;
      };
    }, []),
  );

  const schedule = days
    .map((name, day) => ({
      name,
      classes: items
        .filter((item) => item.day === day)
        .sort((a, b) => a.start - b.start),
    }))
    .filter(({ classes }) => classes.length > 0);

  return (
    <main className="lt-page">
      <style>{styles}</style>
      <div className="lt-content">
        <header>
          <div className="lt-brand">
            <LearnivoIcon />
            <span>LEARNIVO</span>
          </div>
          <h1>My timetable</h1>
          <p>Your enrolled weekly classes. All times are in Sri Lanka time.</p>
        </header>

        {loading && (
          <div className="lt-message" role="status">Loading timetable…</div>
        )}
        {error && <div className="lt-message" role="alert">{error}</div>}
        {!loading && !error && items.length === 0 && (
          <div className="lt-message">No enrolled classes yet.</div>
        )}

        {!loading && !error && schedule.map(({ name, classes }) => (
          <section className="lt-day" key={name}>
            <h2>{name}</h2>
            <ul className="lt-list">
              {classes.map((item) => {
                const location = item.mode === "online" ? "Online" : item.location;
                const details = [item.teacherName, location].filter(Boolean).join(" · ");

                return (
                  <li
                    key={item.id}
                    className="lt-card"
                    style={{ borderInlineStartColor: getClassColor(item.id) }}
                  >
                    <div className="lt-details">
                      <h3>{item.title}</h3>
                      <p>{details}</p>
                    </div>
                    <span className="lt-time">
                      {time(item.start)}–{time(item.end)}
                    </span>
                  </li>
                );
              })}
            </ul>
          </section>
        ))}
      </div>
    </main>
  );
}