import LearnivoIcon from "../../components/LearnivoIcon";
import React, { useEffect, useState } from "react";
import type { FormEvent } from "react";

import { loadPreferences, savePreferences } from "../../services/data";
import { days, numberValue, parseClock, time } from "../../utils/matching";

const defaults = {
  subject: "Mathematics",
  medium: "Sinhala",
  budget: "3000",
  latitude: "5.9549",
  longitude: "80.5550",
  radiusKm: "5",
  day: "0",
  start: "14:00",
  end: "18:00",
  needs: "",
};

type Props = {
  navigation: { navigate: (route: "Matches") => void };
};

const styles = `
.lpref-page {
  flex: 1;
  min-height: 0;
  overflow: auto;
  padding: clamp(16px, 3vw, 36px);
  color: #f5f8ff;
  color-scheme: dark;
  font-family: Inter, system-ui, sans-serif;
  background:
    radial-gradient(ellipse at 0% 0%, #403193, transparent 48%),
    radial-gradient(ellipse at 100% 0%, #075477, transparent 48%),
    #09162f;
}
.lpref-page * { box-sizing: border-box; }
.lpref-content { max-width: 1080px; margin: auto; }
.lpref-head { text-align: center; margin: 8px 0 22px; }
.lpref-brand {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 8px;
  font-weight: 800;
  letter-spacing: 2px;
}
.lpref-head h1 {
  margin: 8px 0 4px;
  font-size: clamp(28px, 4vw, 44px);
}
.lpref-head p { margin: 0; color: #c5d3eb; }
.lpref-grid, .lpref-pair {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 14px;
}
.lpref-grid fieldset {
  min-width: 0;
  margin: 0;
  padding: 14px 18px 18px;
  border: 1px solid #a9cdff66;
  border-radius: 16px;
  background: linear-gradient(135deg, #a4bdff25, #7eaaff12);
}
.lpref-grid legend {
  padding: 0 5px;
  font-size: 18px;
  font-weight: 700;
}
.lpref-grid label {
  display: grid;
  gap: 5px;
  margin-bottom: 10px;
  font-size: 14px;
}
.lpref-grid label:last-child { margin-bottom: 0; }
.lpref-grid :is(input, select, textarea) {
  width: 100%;
  min-height: 42px;
  padding: 8px 10px;
  border: 1px solid #a9cdff80;
  border-radius: 8px;
  background: #13284a;
  color: #fff;
  font: inherit;
}
.lpref-grid textarea { min-height: 92px; resize: vertical; }
.lpref-page button {
  min-height: 44px;
  padding: 8px 14px;
  border: 1px solid transparent;
  border-radius: 10px;
  color: #fff;
  font: inherit;
  cursor: pointer;
}
.lpref-back { background: transparent; }
.lpref-save { background: #075dd8; font-weight: 700 !important; }
.lpref-page :focus-visible {
  outline: 2px solid #94edff;
  outline-offset: 2px;
}
.lpref-page button:disabled { opacity: .6; cursor: wait; }
.lpref-actions {
  display: flex;
  justify-content: flex-end;
  margin-top: 16px;
}
.lpref-error { color: #ffd9e1; }
@media (max-width: 690px) {
  .lpref-grid { grid-template-columns: 1fr; }
  .lpref-save { width: 100%; }
}
@media (max-width: 360px) {
  .lpref-pair { grid-template-columns: 1fr; }
}
`;

export default function PreferencesScreen({ navigation }: Props) {
  const [values, setValues] = useState(defaults);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    loadPreferences()
      .then((saved) => {
        if (!active || !saved) return;

        setValues({
          subject: saved.subject,
          medium: saved.medium,
          budget: String(saved.budget),
          latitude: String(saved.latitude),
          longitude: String(saved.longitude),
          radiusKm: String(saved.radiusKm),
          day: String(saved.day),
          start: time(saved.start),
          end: time(saved.end),
          needs: saved.needs ?? "",
        });
      })
      .catch(() => {
        if (active) {
          setError("Could not load saved preferences. Check the values before saving.");
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  function change(key: keyof typeof defaults, value: string) {
    setValues((current) => ({ ...current, [key]: value }));
  }

  function field(key: keyof typeof defaults, label: string, type = "text") {
    return (
      <label>
        {label}
        <input
          type={type}
          value={values[key]}
          required
          onChange={(event) => change(key, event.target.value)}
        />
      </label>
    );
  }

  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (loading || saving) return;

    setSaving(true);
    setError("");

    try {
      const start = parseClock(values.start);
      const end = parseClock(values.end);
      if (end <= start) throw new Error("End time must be after start time.");

      const subject = values.subject.trim();
      const medium = values.medium.trim();
      if (!subject || !medium) {
        throw new Error("Enter a subject and teaching language.");
      }

      await savePreferences({
        subject,
        medium,
        start,
        end,
        budget: numberValue(values.budget, "budget", 0),
        latitude: numberValue(values.latitude, "latitude", -90, 90),
        longitude: numberValue(values.longitude, "longitude", -180, 180),
        radiusKm: numberValue(values.radiusKm, "travel distance", 0, 500),
        day: Number(values.day),
        needs: values.needs.trim(),
      });

      navigation.navigate("Matches");
    } catch (cause) {
      setError(
        cause instanceof Error ? cause.message : "Could not save preferences.",
      );
    } finally {
      setSaving(false);
    }
  }

  const disabled = loading || saving;

  return (
    <main className="lpref-page">
      <style>{styles}</style>
      <div className="lpref-content">
        <button
          className="lpref-back"
          type="button"
          disabled={saving}
          onClick={() => navigation.navigate("Matches")}
        >
          ← Back to matches
        </button>

        <header className="lpref-head">
          <div className="lpref-brand">
            <LearnivoIcon />
            <span>LEARNIVO</span>
          </div>
          <h1>Your learning profile</h1>
          <p>Set your preferences to find matching classes.</p>
        </header>

        {loading && <p role="status">Loading saved preferences…</p>}

        <form onSubmit={save}>
          <div className="lpref-grid">
            <fieldset disabled={disabled}>
              <legend>Subject &amp; budget</legend>
              {field("subject", "Preferred subject")}
              {field("medium", "Teaching language")}
              {field("budget", "Monthly budget (LKR)")}
            </fieldset>

            <fieldset disabled={disabled}>
              <legend>Location &amp; travel</legend>
              <div className="lpref-pair">
                {field("latitude", "Latitude")}
                {field("longitude", "Longitude")}
              </div>
              {field("radiusKm", "Maximum travel distance (km)")}
            </fieldset>

            <fieldset disabled={disabled}>
              <legend>Weekly availability</legend>
              <label>
                Available day
                <select
                  value={values.day}
                  onChange={(event) => change("day", event.target.value)}
                >
                  {days.map((day, index) => (
                    <option key={day} value={index}>
                      {day}
                    </option>
                  ))}
                </select>
              </label>
              <div className="lpref-pair">
                {field("start", "Available from", "time")}
                {field("end", "Available until", "time")}
              </div>
            </fieldset>

            <fieldset disabled={disabled}>
              <legend>Learning support</legend>
              <label>
                What do you need help with? (optional)
                <textarea
                  value={values.needs}
                  onChange={(event) => change("needs", event.target.value)}
                />
              </label>
            </fieldset>
          </div>

          {error && <p className="lpref-error" role="alert">{error}</p>}

          <div className="lpref-actions">
            <button className="lpref-save" type="submit" disabled={disabled}>
              {saving ? "Saving…" : "Save and find matches →"}
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}