import React, { useState } from "react";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";

import GlassPanel from "../../components/GlassPanel.web";
import LearnivoIcon from "../../components/LearnivoIcon";
import { useAuth } from "../../context/AuthContext";
import { useCollection } from "../../hooks/useCollection";
import { useRemoveEnrollment } from "../../hooks/useRemoveEnrollment";
import type { Enrollment } from "../../types";
import { getClassColor } from "../../utils/classColors";

type Routes = {
  Dashboard: undefined;
  Students: undefined;
  TeacherRequests: undefined;
  Profile: undefined;
};

const styles = `
  .lv-students {
    flex: 1;
    min-height: 0;
    overflow: auto;
    display: grid;
    grid-template-columns: 210px minmax(0, 1fr);
    color: #f5f8ff;
    background:
      radial-gradient(ellipse at 90% 0%, #4938b988, transparent 48%),
      radial-gradient(ellipse at 0% 95%, #0284c788, transparent 48%),
      #07162f;
    font-family: Inter, system-ui, sans-serif;
  }

  .lv-students * { box-sizing: border-box; }

  .lv-students nav {
    padding: 24px 16px;
    display: flex;
    flex-direction: column;
    gap: 8px;
    border-right: 1px solid #bfdcff33;
    background: #839dff16;
  }

  .lv-student-brand {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 0 8px 20px;
    font-size: 26px;
    font-weight: 800;
  }

  .lv-students nav button { text-align: left; }
  .lv-students main { min-width: 0; padding: clamp(16px, 3vw, 36px); }
  .lv-students h1, .lv-students h2, .lv-students p { margin: 0; }
  .lv-students h1 { font-size: clamp(28px, 4vw, 38px); }
  .lv-students h2 { font-size: 20px; }
  .lv-students p, .lv-students small { color: #c5d8f4; }

  .lv-students .lv-glass-panel {
    padding: 18px;
    border: 1px solid #cee7ff46;
    border-radius: 17px;
    background: linear-gradient(135deg, #b3d8ff2d, #8ab5ff12);
    backdrop-filter: blur(16px);
  }

  .lv-student-stats {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 16px;
    margin: 22px 0;
  }

  .lv-student-stats strong {
    display: block;
    margin-top: 6px;
    font-size: 28px;
  }

  .lv-student-filters {
    display: flex;
    flex-wrap: wrap;
    gap: 12px;
    margin: 16px 0;
  }

  .lv-student-filters label {
    flex: 1 1 180px;
    display: grid;
    gap: 5px;
    min-width: 0;
  }

  .lv-students button, .lv-students input, .lv-students select {
    min-height: 42px;
    padding: 8px 12px;
    border: 1px solid #c4e0ff44;
    border-radius: 9px;
    background: #132b53;
    color: inherit;
    font: inherit;
  }

  .lv-students button { cursor: pointer; }
  .lv-students button:hover, .lv-students button[aria-current] {
    background: #245297;
  }

  .lv-students :focus-visible {
    outline: 2px solid #8fe8ff;
    outline-offset: 2px;
  }

  .lv-student-list {
    list-style: none;
    padding: 0;
    margin: 0;
    display: grid;
    gap: 10px;
  }

  .lv-student-list li {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 12px;
    padding: 12px;
    border-radius: 10px;
    background: #bcdaff15;
    overflow-wrap: anywhere;
  }

  .lv-student-avatar {
    display: grid;
    place-items: center;
    flex: 0 0 42px;
    height: 42px;
    border-radius: 12px;
    color: #102444;
    font-weight: 750;
  }

  .lv-student-name { flex: 1 1 130px; min-width: 0; }
  .lv-student-name small { display: block; margin-top: 3px; }

  .lv-student-status {
    border-radius: 20px;
    padding: 4px 10px;
    background: #103f43;
    color: #a1f4d9;
    font-size: 13px;
  }

  .lv-students .lv-remove { background: #742d49; }
  .lv-students .lv-remove:hover { background: #893858; }
  .lv-students .lv-remove:disabled { opacity: 0.6; cursor: wait; }
  .lv-students p[role="alert"] { color: #ffd1d8; margin-bottom: 12px; }

  @media (max-width: 700px) {
    .lv-students { display: block; }
    .lv-students nav {
      flex-direction: row;
      flex-wrap: wrap;
      padding: 16px;
      border-right: 0;
    }
    .lv-student-brand { width: 100%; padding: 0; }
    .lv-student-stats { gap: 8px; }
    .lv-student-stats .lv-glass-panel { padding: 10px; }
  }
`;

export default function StudentsScreen({
  navigation,
}: NativeStackScreenProps<Routes, "Students">) {
  const { user } = useAuth();
  const { remove, removing, removeError } = useRemoveEnrollment();
  const { items, loading, error } = useCollection<Enrollment>("enrollments", [
    ["teacherId", user?.uid ?? ""],
  ]);

  const [search, setSearch] = useState("");
  const [classId, setClassId] = useState("");

  const classes = new Map(
    items.map((item) => [item.classId, item.classTitle]),
  );
  const uniqueStudents = new Set(items.map((item) => item.studentId)).size;
  const selectedClassId = classes.has(classId) ? classId : "";
  const query = search.trim().toLowerCase();

  const visible = items.filter(
    (item) =>
      (!selectedClassId || item.classId === selectedClassId) &&
      item.studentName.toLowerCase().includes(query),
  );

  const ready = !loading && !error;

  function confirmRemoval(item: Enrollment) {
    const confirmed = window.confirm(
      `Remove ${item.studentName} from ${item.classTitle}?`,
    );

    if (confirmed) void remove(item.id);
  }

  return (
    <div className="lv-students">
      <style>{styles}</style>

      <nav aria-label="Teacher navigation">
        <div className="lv-student-brand">
          <LearnivoIcon />
          <span>Learnivo</span>
        </div>
        <button type="button" onClick={() => navigation.navigate("Dashboard")}>
          Dashboard
        </button>
        <button type="button" aria-current="page">Students</button>
        <button type="button" onClick={() => navigation.navigate("TeacherRequests")}>
          Requests
        </button>
        <button type="button" onClick={() => navigation.navigate("Profile")}>
          Profile
        </button>
      </nav>

      <main>
        <h1>Students</h1>
        <p>Students with approved permanent places.</p>

        <div className="lv-student-stats">
          <GlassPanel>
            Students
            <strong>{ready ? uniqueStudents : "—"}</strong>
          </GlassPanel>
          <GlassPanel>
            Enrollments
            <strong>{ready ? items.length : "—"}</strong>
          </GlassPanel>
          <GlassPanel>
            Classes with enrollments
            <strong>{ready ? classes.size : "—"}</strong>
          </GlassPanel>
        </div>

        <GlassPanel>
          <h2>Enrolled students</h2>

          <div className="lv-student-filters">
            <label>
              Search by name
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Student name"
              />
            </label>

            <label>
              Class
              <select
                value={selectedClassId}
                onChange={(event) => setClassId(event.target.value)}
              >
                <option value="">All classes</option>
                {[...classes].map(([id, title]) => (
                  <option key={id} value={id}>{title}</option>
                ))}
              </select>
            </label>
          </div>

          {(removeError || error) && (
            <p role="alert">{removeError || error}</p>
          )}
          {loading && <p role="status">Loading students…</p>}

          {ready && visible.length === 0 && (
            <p>
              {items.length
                ? "No students match your filters."
                : "No enrolled students yet."}
            </p>
          )}

          {ready && visible.length > 0 && (
            <ul className="lv-student-list">
              {visible.map((item) => (
                <li key={item.id}>
                  <span
                    className="lv-student-avatar"
                    style={{
                      backgroundColor: getClassColor(item.classId) ?? "#d5e8e6",
                    }}
                    aria-hidden="true"
                  >
                    {item.studentName.trim().slice(0, 1).toUpperCase() || "?"}
                  </span>

                  <span className="lv-student-name">
                    <strong>{item.studentName}</strong>
                    <small>{item.classTitle}</small>
                  </span>

                  <span className="lv-student-status">Enrolled</span>

                  <button
                    className="lv-remove"
                    type="button"
                    disabled={removing !== null}
                    aria-label={`Remove ${item.studentName} from ${item.classTitle}`}
                    onClick={() => confirmRemoval(item)}
                  >
                    {removing === item.id ? "Removing…" : "Remove enrollment"}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </GlassPanel>
      </main>
    </div>
  );
}