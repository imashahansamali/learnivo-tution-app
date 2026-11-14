import React, { useState } from "react";
import type { Timestamp } from "firebase/firestore";

import GlassPanel from "../../components/GlassPanel.web";
import LearnivoIcon from "../../components/LearnivoIcon";
import { useAuth } from "../../context/AuthContext";
import { useCollection } from "../../hooks/useCollection";
import { deleteClass } from "../../services/data";
import type { ClassItem, Enrollment, RequestItem } from "../../types";
import { getClassColor } from "../../utils/classColors";
import { days, time } from "../../utils/matching";

type Props = {
  navigation: {
    navigate(route: "Students" | "TeacherRequests" | "Profile"): void;
    navigate(route: "ClassEditor", params?: { id: string }): void;
  };
};

const styles = `
.lv-dashboard {
  flex: 1; min-height: 0; overflow: auto; display: grid;
  grid-template-columns: 210px minmax(0, 1fr); color: #f5f8ff;
  background: radial-gradient(ellipse at 88% 0%, #4a38b9aa, transparent 48%),
    radial-gradient(ellipse at 0% 90%, #0284c7aa, transparent 46%), #07162f;
  font-family: Inter, system-ui, sans-serif;
}
.lv-dashboard * { box-sizing: border-box; }
.lv-sidebar {
  padding: 24px 16px; background: #839dff16; border-right: 1px solid #bfdcff33;
  display: flex; flex-direction: column; gap: 8px;
}
.lv-brand {
  display: flex; align-items: center; gap: 8px; font-size: 26px;
  font-weight: 800; padding: 0 8px 20px;
}
.lv-sidebar button { text-align: left; }
.lv-main { padding: clamp(16px, 3vw, 36px); min-width: 0; }
.lv-dashboard h1, .lv-dashboard h2, .lv-dashboard p { margin: 0; }
.lv-dashboard h1 { font-size: clamp(26px, 4vw, 38px); }
.lv-dashboard h2 { font-size: 19px; }
.lv-muted { color: #c5d8f4; }
.lv-summary, .lv-sections { display: grid; gap: 16px; margin-top: 20px; }
.lv-summary { grid-template-columns: repeat(4, minmax(0, 1fr)); }
.lv-sections { grid-template-columns: minmax(0, 3fr) minmax(0, 2fr); }
.lv-glass-panel {
  min-width: 0; padding: 16px; border: 1px solid #cee7ff46; border-radius: 17px;
  background: linear-gradient(135deg, #b3d8ff2d, #8ab5ff12);
  backdrop-filter: blur(16px);
  box-shadow: inset 0 1px 10px #c5e5ff16, 0 8px 24px #0003;
}
.lv-summary strong { display: block; font-size: 30px; margin-top: 5px; }
.lv-heading, .lv-row, .lv-actions {
  display: flex; align-items: center; gap: 10px; flex-wrap: wrap;
}
.lv-heading, .lv-row { justify-content: space-between; }
.lv-heading { margin-bottom: 12px; }
.lv-row {
  padding: 10px; margin-top: 8px; background: #bcdaff15;
  border-radius: 10px; overflow-wrap: anywhere;
}
.lv-dashboard button {
  padding: 8px 12px; min-height: 40px; color: inherit; background: #8dbaff22;
  border: 1px solid #c4e0ff44; border-radius: 9px; cursor: pointer; font: inherit;
}
.lv-dashboard button:hover { background: #8dbaff44; }
.lv-dashboard button:focus-visible { outline: 2px solid #8fe8ff; outline-offset: 2px; }
.lv-dashboard button:disabled { opacity: .6; cursor: default; }
.lv-dashboard .lv-primary { background: #1268bf; }
.lv-dashboard .lv-delete { background: #742d49; }
.lv-dashboard .lv-delete:hover { background: #893858; }
.lv-dashboard small { display: block; margin-top: 4px; }
.lv-chart {
  display: grid; grid-template-columns: repeat(7, minmax(0, 1fr));
  gap: 4px; text-align: center;
}
.lv-bar-track {
  display: flex; height: 86px; align-items: flex-end; justify-content: center;
  margin: 5px 0; border-bottom: 1px solid #c4e0ff44;
}
.lv-bar {
  width: 55%; background: linear-gradient(#43dcfd, #4573f4);
  border-radius: 6px 6px 0 0;
}
.lv-dashboard .lv-error { color: #ffd1d8; margin-top: 12px; }
@media (max-width: 950px) {
  .lv-summary { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  .lv-sections { grid-template-columns: 1fr; }
}
@media (max-width: 620px) {
  .lv-dashboard { display: block; }
  .lv-sidebar { flex-direction: row; flex-wrap: wrap; border-right: 0; }
  .lv-brand { width: 100%; padding: 0; }
}
`;

export default function DashboardScreen({ navigation }: Props) {
  const { user } = useAuth();
  const teacherId = user?.uid ?? "";
  const classes = useCollection<ClassItem>("classes", [["teacherId", teacherId]]);
  const students = useCollection<Enrollment>("enrollments", [["teacherId", teacherId]]);
  const requests = useCollection<RequestItem & { createdAt?: Timestamp | null }>(
    "requests",
    [["teacherId", teacherId]],
  );

  const [deleting, setDeleting] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState("");

  const visibleClasses = classes.items.filter((item) => !item.deleted);
  const activeClasses = visibleClasses.filter((item) => item.active);
  const deletedIds = new Set(classes.items.filter((item) => item.deleted).map((item) => item.id));
  const uniqueStudents = new Set(students.items.map((item) => item.studentId));
  const pending = requests.items.filter(
    (item) => item.status === "pending" && !deletedIds.has(item.classId),
  );
  const recent = [...pending]
    .sort((a, b) => (b.createdAt?.toMillis() ?? 0) - (a.createdAt?.toMillis() ?? 0))
    .slice(0, 3);
  const minutes = days.map((_, day) =>
    activeClasses.reduce(
      (total, item) => total + (item.day === day ? item.end - item.start : 0),
      0,
    ),
  );
  const weeklyHours = (minutes.reduce((total, value) => total + value, 0) / 60)
    .toLocaleString(undefined, { maximumFractionDigits: 2 });
  const maxMinutes = Math.max(1, ...minutes);
  const error = deleteError || classes.error || students.error || requests.error;

  async function remove(item: ClassItem) {
    const confirmed = window.confirm(
      `Delete "${item.title}"? It will be removed from student timetables. Request history stays available.`,
    );
    if (!confirmed) return;

    setDeleting(item.id);
    setDeleteError("");

    try {
      await deleteClass(item.id);
    } catch (cause) {
      setDeleteError(cause instanceof Error ? cause.message : "Unable to delete class.");
    } finally {
      setDeleting(null);
    }
  }

  return (
    <div className="lv-dashboard">
      <style>{styles}</style>
      <nav className="lv-sidebar" aria-label="Teacher navigation">
        <div className="lv-brand"><LearnivoIcon /><span>Learnivo</span></div>
        <button
          className="lv-primary"
          aria-current="page"
          onClick={() => document.getElementById("lv-dashboard-top")?.scrollIntoView({ block: "start" })}
        >
          Dashboard
        </button>
        <button onClick={() => document.getElementById("lv-my-classes")?.scrollIntoView({ block: "nearest" })}>
          My Classes
        </button>
        <button onClick={() => navigation.navigate("Students")}>Students</button>
        <button onClick={() => navigation.navigate("TeacherRequests")}>Requests</button>
        <button onClick={() => navigation.navigate("Profile")}>Profile</button>
      </nav>

      <main className="lv-main" id="lv-dashboard-top">
        <h1>Dashboard</h1>
        <p className="lv-muted">Manage your classes, students and requests.</p>
        {error && <p className="lv-error" role="alert">{error}</p>}

        <div className="lv-summary">
          <GlassPanel>Students<strong>{students.loading || students.error ? "—" : uniqueStudents.size}</strong></GlassPanel>
          <GlassPanel>Active classes<strong>{classes.loading || classes.error ? "—" : activeClasses.length}</strong></GlassPanel>
          <GlassPanel>Pending requests<strong>{requests.loading || requests.error ? "—" : pending.length}</strong></GlassPanel>
          <GlassPanel>Teaching hours<strong>{classes.loading || classes.error ? "—" : `${weeklyHours} h / week`}</strong></GlassPanel>
        </div>

        <div className="lv-sections" id="lv-my-classes">
          <GlassPanel>
            <div className="lv-heading">
              <h2>My Classes</h2>
              <button className="lv-primary" onClick={() => navigation.navigate("ClassEditor")}>
                + Add class
              </button>
            </div>
            {classes.loading && <p className="lv-muted">Loading classes…</p>}
            {!classes.loading && !classes.error && !visibleClasses.length && (
              <p className="lv-muted">No classes yet.</p>
            )}
            {visibleClasses.map((item) => (
              <div className="lv-row" key={item.id} style={{ borderInlineStart: `4px solid ${getClassColor(item.id)}` }}>
                <div>
                  <strong>{item.title}</strong>
                  <small className="lv-muted">
                    {item.active ? "Published" : "Closed"} · {item.enrolledCount}/{item.capacity} enrolled
                  </small>
                </div>
                <div>{days[item.day]}<br />{time(item.start)}–{time(item.end)}</div>
                <div className="lv-actions">
                  <button onClick={() => navigation.navigate("ClassEditor", { id: item.id })}>Edit class</button>
                  <button
                    className="lv-delete"
                    type="button"
                    disabled={deleting !== null}
                    onClick={() => void remove(item)}
                  >
                    {deleting === item.id ? "Deleting…" : "Delete class"}
                  </button>
                </div>
              </div>
            ))}
          </GlassPanel>

          <GlassPanel>
            <div className="lv-heading">
              <h2>Students</h2>
              <button onClick={() => navigation.navigate("Students")}>View all</button>
            </div>
            {students.loading && <p className="lv-muted">Loading students…</p>}
            {visibleClasses.map((item) => (
              <div className="lv-row" key={item.id}>
                <span>{item.title}</span><strong>{item.enrolledCount}</strong>
              </div>
            ))}
          </GlassPanel>

          <GlassPanel>
            <div className="lv-heading"><h2>Weekly Classes</h2></div>
            {classes.loading || classes.error ? (
              <p className="lv-muted">{classes.loading ? "Loading schedule…" : "Schedule unavailable."}</p>
            ) : (
              <div className="lv-chart" aria-label="Weekly teaching hours by day">
                {[1, 2, 3, 4, 5, 6, 0].map((day) => (
                  <div key={day}>
                    <small>{(minutes[day] / 60).toLocaleString(undefined, { maximumFractionDigits: 2 })} h</small>
                    <div className="lv-bar-track" aria-hidden="true">
                      <div className="lv-bar" style={{ height: `${(minutes[day] / maxMinutes) * 100}%` }} />
                    </div>
                    <small>{days[day].slice(0, 3)}</small>
                  </div>
                ))}
              </div>
            )}
          </GlassPanel>

          <GlassPanel>
            <div className="lv-heading">
              <h2>Requests</h2>
              <button onClick={() => navigation.navigate("TeacherRequests")}>View all</button>
            </div>
            {requests.loading && <p className="lv-muted">Loading requests…</p>}
            {!requests.loading && !requests.error && !recent.length && (
              <p className="lv-muted">No pending requests.</p>
            )}
            {recent.map((item) => (
              <div className="lv-row" key={item.id} style={{ borderInlineStart: `4px solid ${getClassColor(item.classId)}` }}>
                <div>
                  <strong>{item.studentName}</strong>
                  <small className="lv-muted">{item.classTitle} · {item.kind}</small>
                </div>
                <button onClick={() => navigation.navigate("TeacherRequests")}>Review</button>
              </div>
            ))}
          </GlassPanel>
        </div>
      </main>
    </div>
  );
}