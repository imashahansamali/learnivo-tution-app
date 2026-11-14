import LearnivoIcon from "../../components/LearnivoIcon";
import React, { useEffect, useState } from "react";

import { useAuth } from "../../context/AuthContext";
import {
  enrolledClasses,
  loadClass,
  loadPreferences,
  requestClass,
} from "../../services/data";
import type { ClassItem, RequestItem } from "../../types";
import { getClassColor } from "../../utils/classColors";
import { dateValue, days, overlaps, time } from "../../utils/matching";

type Props = {
  route: { params: { id: string } };
  navigation: {
    navigate(screen: "Matches" | "Timetable"): void;
    navigate(
      screen: "Result",
      params: { classId: string; title: string; message: string },
    ): void;
  };
};

const styles = `
.lcd-page {
  flex: 1;
  min-height: 0;
  overflow: auto;
  padding: clamp(20px, 4vw, 52px);
  color: #f4f7ff;
  font-family: Inter, system-ui, sans-serif;
  background:
    radial-gradient(ellipse at 90% 0%, #43339c, transparent 48%),
    radial-gradient(ellipse at 0% 100%, #075782, transparent 56%),
    #09162f;
}
.lcd-wrap { max-width: 1080px; margin: auto; }
.lcd-brand {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 800;
  letter-spacing: 2px;
}
.lcd-page h1 {
  margin: 14px 0 6px;
  font-size: clamp(30px, 5vw, 48px);
  overflow-wrap: anywhere;
}
.lcd-page h2 { margin: 0 0 14px; font-size: 21px; }
.lcd-page p { color: #c9d8f3; line-height: 1.55; margin: 6px 0; }
.lcd-grid {
  margin-top: 24px;
  display: grid;
  grid-template-columns: 1.2fr 1fr;
  gap: 16px;
  align-items: start;
}
.lcd-panel {
  min-width: 0;
  padding: 20px;
  border: 1px solid #b9d8ff55;
  border-radius: 16px;
  background: linear-gradient(135deg, #b6d7ff24, #83a7f412);
  overflow-wrap: anywhere;
}
.lcd-details { border-top-width: 4px; }
.lcd-info {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16px;
}
.lcd-info dt { color: #c9d8f3; font-size: 13px; margin-bottom: 4px; }
.lcd-info dd { margin: 0; }
.lcd-actions { display: grid; gap: 10px; }
.lcd-page button, .lcd-page textarea {
  color: inherit;
  font: inherit;
  border: 1px solid #b9d8ff66;
  border-radius: 10px;
}
.lcd-page button {
  min-height: 44px;
  padding: 8px 14px;
  background: #244674;
  font-weight: 700;
  cursor: pointer;
}
.lcd-page .lcd-primary { background: #1259bc; }
.lcd-page button:disabled { opacity: .55; cursor: default; }
.lcd-page :focus-visible { outline: 2px solid #94edff; outline-offset: 2px; }
.lcd-page textarea {
  display: block;
  box-sizing: border-box;
  width: 100%;
  min-height: 106px;
  margin: 8px 0 14px;
  padding: 10px;
  background: #13284a;
  resize: vertical;
}
.lcd-alert { color: #ffdca0; margin-top: 14px; }
.lcd-alert ul { padding-left: 22px; }
@media (max-width: 700px) {
  .lcd-grid { grid-template-columns: minmax(0, 1fr); }
}
`;

export default function ClassDetailsScreen({ route, navigation }: Props) {
  const { profile } = useAuth();
  const id = route.params.id;
  const [details, setDetails] = useState<{
    item: ClassItem;
    clashes: ClassItem[];
  } | null>(null);
  const [needs, setNeeds] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    setDetails(null);
    setError("");

    Promise.all([loadClass(id), enrolledClasses(), loadPreferences()])
      .then(([item, enrolled, preferences]) => {
        if (!active) return;

        setDetails({
          item,
          clashes: enrolled.filter(
            (other) => other.id !== item.id && overlaps(item, other),
          ),
        });
        setNeeds(preferences?.needs ?? "");
      })
      .catch((cause: unknown) => {
        if (active) {
          setError(
            cause instanceof Error
              ? cause.message
              : "Unable to load class details.",
          );
        }
      });

    return () => {
      active = false;
    };
  }, [id]);

  async function send(kind: RequestItem["kind"]) {
    if (busy || !details || !profile || !details.item.active) return;

    const { item } = details;
    setBusy(true);
    setError("");

    try {
      if (kind === "trial") dateValue(item.trialDate);

      await requestClass(item, kind, profile, needs);
      navigation.navigate("Result", {
        classId: item.id,
        title: kind === "waitlist" ? "You are on the list" : "Request submitted",
        message:
          kind === "waitlist"
            ? "Your waiting-list entry is saved. Watch in-app notifications for updates."
            : "Your teacher will review the request. Check My activity for the result.",
      });
    } catch (cause) {
      setError(
        cause instanceof Error ? cause.message : "Unable to submit your request.",
      );
    } finally {
      setBusy(false);
    }
  }

  const item = details?.item;
  const places = item ? Math.max(0, item.capacity - item.enrolledCount) : 0;

  return (
    <main className="lcd-page">
      <style>{styles}</style>
      <div className="lcd-wrap">
        <header>
          <div className="lcd-brand">
            <LearnivoIcon />
            <span>LEARNIVO</span>
          </div>

          <h1>{item?.title ?? "Class details"}</h1>
          {item && (
            <p>{item.teacherName} · {item.subject} · Grade {item.grade}</p>
          )}
        </header>

        {!item && !error && <p role="status">Loading class details…</p>}
        {error && <div className="lcd-alert" role="alert">{error}</div>}

        {item && details && (
          <div className="lcd-grid">
            <section
              className="lcd-panel lcd-details"
              style={{ borderTopColor: getClassColor(item.id) }}
            >
              <h2>Class information</h2>

              <dl className="lcd-info">
                <div>
                  <dt>Teaching language</dt>
                  <dd>{item.medium}</dd>
                </div>
                <div>
                  <dt>Format</dt>
                  <dd>{item.mode === "online" ? "Online" : "In person"}</dd>
                </div>
                {item.location && (
                  <div>
                    <dt>Location</dt>
                    <dd>{item.location}</dd>
                  </div>
                )}
                <div>
                  <dt>Weekly schedule</dt>
                  <dd>{days[item.day]} · {time(item.start)}–{time(item.end)}</dd>
                </div>
                <div>
                  <dt>Monthly fee</dt>
                  <dd>LKR {item.fee.toLocaleString()}</dd>
                </div>
                <div>
                  <dt>Availability</dt>
                  <dd>{places ? `${places} available` : "Full"}</dd>
                </div>
                <div>
                  <dt>Trial date</dt>
                  <dd>{item.trialDate || "Not offered"}</dd>
                </div>
              </dl>

              <p>Fees are arranged directly with the teacher.</p>

              {details.clashes.length > 0 && (
                <div className="lcd-alert">
                  <strong>Timetable clash</strong>
                  <ul>
                    {details.clashes.map((other) => (
                      <li key={other.id}>
                        {other.title} · {days[other.day]}{" "}
                        {time(other.start)}–{time(other.end)}
                      </li>
                    ))}
                  </ul>
                  <button type="button" onClick={() => navigation.navigate("Matches")}>
                    Find another class
                  </button>
                </div>
              )}
            </section>

            <section className="lcd-panel">
              <h2>Class requests</h2>

              <label>
                Tell your teacher what you need help with (optional)
                <textarea
                  value={needs}
                  disabled={busy}
                  onChange={(event) => setNeeds(event.target.value)}
                />
              </label>

              <div className="lcd-actions">
                {!item.active && <p>This class is closed to requests.</p>}
                {busy && <p role="status">Submitting request…</p>}

                {places === 0 ? (
                  <button
                    className="lcd-primary"
                    type="button"
                    disabled={busy || !item.active}
                    onClick={() => void send("waitlist")}
                  >
                    Join waitlist
                  </button>
                ) : (
                  <>
                    <button
                      className="lcd-primary"
                      type="button"
                      disabled={busy || !item.active}
                      onClick={() => void send("enrollment")}
                    >
                      Request permanent place
                    </button>
                    <button
                      type="button"
                      disabled={busy || !item.active || !item.trialDate}
                      onClick={() => void send("trial")}
                    >
                      Request a trial
                    </button>
                  </>
                )}

                <button type="button" onClick={() => navigation.navigate("Timetable")}>
                  View timetable
                </button>
              </div>
            </section>
          </div>
        )}
      </div>
    </main>
  );
}