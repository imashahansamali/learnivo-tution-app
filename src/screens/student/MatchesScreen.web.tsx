import LearnivoIcon from "../../components/LearnivoIcon";
import React, { useCallback, useState } from "react";
import { useFocusEffect } from "@react-navigation/native";

import { useAuth } from "../../context/AuthContext";
import { useCollection } from "../../hooks/useCollection";
import { enrolledClasses, loadPreferences } from "../../services/data";
import type { ClassItem, Preferences } from "../../types";
import { getClassColor } from "../../utils/classColors";
import { days, match, time } from "../../utils/matching";

const links = [
  ["Preferences", "Learning preferences"],
  ["Activity", "My activity"],
  ["Timetable", "My timetable"],
  ["Notifications", "Notifications"],
  ["Profile", "Profile"],
] as const;

type Props = {
  navigation: {
    navigate(route: (typeof links)[number][0]): void;
    navigate(route: "ClassDetails", params: { id: string }): void;
  };
};

const css = `
.lm-page {
  flex: 1;
  min-height: 0;
  overflow: auto;
  color: #f4f7ff;
  background:
    radial-gradient(ellipse at 90% 0%, #43339c, transparent 48%),
    radial-gradient(ellipse at 0% 100%, #075782, transparent 56%),
    #09162f;
  font-family: Inter, system-ui, sans-serif;
}
.lm-shell {
  display: grid;
  grid-template-columns: 220px minmax(0, 1fr);
  max-width: 1440px;
  margin: auto;
  min-height: 100%;
}
.lm-sidebar {
  padding: 24px 16px;
  background: #99b8ff12;
  border-right: 1px solid #bfdcff33;
}
.lm-brand {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 20px;
  font-size: 21px;
  font-weight: 800;
}
.lm-nav { display: grid; gap: 8px; }
.lm-main { padding: clamp(20px, 4vw, 52px); }
.lm-main h1 { margin: 0 0 8px; font-size: clamp(30px, 5vw, 46px); }
.lm-main p { margin: 0; color: #c9d8f3; line-height: 1.55; }
.lm-tools {
  display: flex;
  align-items: center;
  gap: 14px;
  flex-wrap: wrap;
  margin: 22px 0;
}
.lm-grid {
  display: grid;
  gap: 16px;
  grid-template-columns: repeat(auto-fit, minmax(min(100%, 290px), 1fr));
}
.lm-card, .lm-state {
  min-width: 0;
  padding: 18px;
  border: 1px solid #b9d8ff40;
  border-radius: 16px;
  background: linear-gradient(135deg, #b6d7ff24, #83a7f412);
  box-shadow: 0 8px 24px #0003;
  overflow-wrap: anywhere;
}
.lm-card {
  display: flex;
  flex-direction: column;
  gap: 12px;
  border-top-width: 4px;
}
.lm-card h2 { font-size: 21px; margin: 0; }
.lm-card p { font-size: 14px; }
.lm-meta { display: flex; flex-wrap: wrap; gap: 8px; }
.lm-pill {
  padding: 4px 9px;
  border-radius: 999px;
  background: #152d54;
  font-size: 13px;
}
.lm-warn { background: #644413; color: #fff0bf; }
.lm-page button {
  min-height: 44px;
  padding: 8px 12px;
  border-radius: 9px;
  border: 1px solid #b9d8ff55;
  background: #244674;
  color: #fff;
  font: inherit;
  font-weight: 650;
  cursor: pointer;
}
.lm-page button:hover { background: #315788; }
.lm-page button:focus-visible {
  outline: 2px solid #94edff;
  outline-offset: 2px;
}
.lm-page button[aria-pressed="true"] { background: #1461ac; }
.lm-nav button { text-align: left; }
.lm-card button { margin-top: auto; }
.lm-state[role="alert"] { color: #ffd9e1; margin-bottom: 12px; }
@media (max-width: 720px) {
  .lm-shell { display: block; }
  .lm-sidebar { border-right: 0; border-bottom: 1px solid #bfdcff33; }
  .lm-nav { grid-template-columns: repeat(auto-fit, minmax(130px, 1fr)); }
}
`;

export default function MatchesScreen({ navigation }: Props) {
  const { profile } = useAuth();
  const all = useCollection<ClassItem>("classes");
  const [preferences, setPreferences] = useState<Preferences | null>(null);
  const [enrolled, setEnrolled] = useState<ClassItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [nearby, setNearby] = useState(false);

  useFocusEffect(
    useCallback(() => {
      let active = true;
      setLoading(true);
      setError("");

      Promise.all([loadPreferences(), enrolledClasses()])
        .then(([saved, classes]) => {
          if (active) {
            setPreferences(saved);
            setEnrolled(classes);
          }
        })
        .catch((cause: unknown) => {
          if (active) {
            setError(
              cause instanceof Error
                ? cause.message
                : "Unable to load preferences.",
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

  const nearbyOn = nearby && preferences !== null;
  const matches = all.items
    .filter(
      (item) =>
        item.active &&
        item.grade === profile?.grade &&
        (!preferences ||
          item.subject.toLowerCase() === preferences.subject.toLowerCase()),
    )
    .map((item) => ({
      item,
      result: preferences ? match(item, preferences, enrolled) : null,
    }))
    .filter(
      ({ item, result }) =>
        !nearbyOn ||
        (item.mode === "in-person" &&
          result !== null &&
          result.distance <= preferences.radiusKm),
    )
    .sort((a, b) => (b.result?.score ?? 0) - (a.result?.score ?? 0));

  const busy = loading || all.loading;
  const message = all.error || error;

  return (
    <div className="lm-page">
      <style>{css}</style>
      <div className="lm-shell">
        <aside className="lm-sidebar">
          <div className="lm-brand">
            <LearnivoIcon />
            Learnivo
          </div>

          <nav className="lm-nav" aria-label="Student navigation">
            {links.map(([route, label]) => (
              <button
                key={route}
                type="button"
                onClick={() => navigation.navigate(route)}
              >
                {label}
              </button>
            ))}
          </nav>
        </aside>

        <main className="lm-main">
          <h1>Your class matches</h1>
          <p>See how each class fits your learning preferences.</p>

          <div className="lm-tools">
            <button
              type="button"
              aria-pressed={nearbyOn}
              onClick={() => {
                if (!preferences) {
                  navigation.navigate("Preferences");
                  return;
                }
                setNearby((value) => !value);
              }}
            >
              Learnivo Nearby
            </button>
            {!busy && !all.error && (
              <p role="status">
                {matches.length} {matches.length === 1 ? "class" : "classes"}
                {nearbyOn && ` within ${preferences.radiusKm} km`}
              </p>
            )}
          </div>

          {message && (
            <div className="lm-state" role="alert">{message}</div>
          )}
          {busy && (
            <div className="lm-state" role="status">Loading classes…</div>
          )}
          {!busy && !message && matches.length === 0 && (
            <div className="lm-state">
              {nearbyOn
                ? "No in-person matches within your saved distance."
                : "No matching classes yet. Try updating your learning preferences."}
            </div>
          )}

          {!busy && (
            <div className="lm-grid">
              {matches.map(({ item, result }) => {
                const places = Math.max(0, item.capacity - item.enrolledCount);

                return (
                  <article
                    className="lm-card"
                    key={item.id}
                    style={{ borderTopColor: getClassColor(item.id) }}
                  >
                    <div className="lm-meta">
                      <span className="lm-pill">{item.subject}</span>
                      <span className="lm-pill">
                        {item.mode === "online" ? "Online" : "In person"}
                      </span>
                    </div>
                    <h2>{item.title}</h2>
                    <p>{item.teacherName} · {item.medium}</p>
                    <p>{days[item.day]} · {time(item.start)}–{time(item.end)}</p>
                    <p>LKR {item.fee.toLocaleString()} / month</p>

                    <div className="lm-meta">
                      <span className={places ? "lm-pill" : "lm-pill lm-warn"}>
                        {places
                          ? `${places} ${places === 1 ? "place" : "places"} left`
                          : "Full"}
                      </span>
                      {result && (
                        <span className="lm-pill">{result.score}/4 preferences</span>
                      )}
                      {result?.clash && (
                        <span className="lm-pill lm-warn">Timetable clash</span>
                      )}
                    </div>

                    {result && result.reasons.length > 0 && (
                      <p>{result.reasons.join(" · ")}</p>
                    )}

                    <button
                      type="button"
                      aria-label={`View class: ${item.title}`}
                      onClick={() =>
                        navigation.navigate("ClassDetails", { id: item.id })
                      }
                    >
                      View class →
                    </button>
                  </article>
                );
              })}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}