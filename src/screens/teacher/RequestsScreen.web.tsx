import React, { useState } from "react";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";

import GlassPanel from "../../components/GlassPanel.web";
import { useAuth } from "../../context/AuthContext";
import { useCollection } from "../../hooks/useCollection";
import { reviewRequest } from "../../services/data";
import type { RequestItem } from "../../types";
import { getClassColor } from "../../utils/classColors";

type Routes = {
  Dashboard: undefined;
  Students: undefined;
  TeacherRequests: undefined;
  Profile: undefined;
};

const statuses = ["pending", "approved", "declined"] as const;

const statusLabels = {
  pending: "Pending",
  approved: "Approved",
  declined: "Declined",
};

const requestLabels = {
  enrollment: "Enrollment",
  trial: "Trial",
  waitlist: "Waitlist",
};

const styles = `
  .lv-requests {
    flex: 1;
    min-height: 0;
    overflow: auto;
    display: grid;
    grid-template-columns: 210px minmax(0, 1fr);
    background:
      radial-gradient(ellipse at 92% 5%, #4938b988, transparent 48%),
      radial-gradient(ellipse at 0% 95%, #0284c788, transparent 48%),
      #07162f;
    color: #f5f8ff;
    font-family: Inter, system-ui, sans-serif;
  }

  .lv-requests * { box-sizing: border-box; }

  .lv-requests nav {
    display: flex;
    flex-direction: column;
    gap: 8px;
    padding: 24px 16px;
    border-right: 1px solid #bfdcff33;
    background: #839dff16;
  }

  .lv-requests .lv-brand {
    padding: 0 8px 20px;
    font-size: 26px;
  }

  .lv-requests nav button { text-align: left; }

  .lv-requests main {
    min-width: 0;
    padding: clamp(16px, 3vw, 36px);
  }

  .lv-requests h1,
  .lv-requests h2,
  .lv-requests p { margin: 0; }

  .lv-requests h1 { font-size: clamp(28px, 4vw, 38px); }
  .lv-requests h2 { font-size: 21px; }

  .lv-requests p,
  .lv-requests small { color: #c5d8f4; }

  .lv-requests .lv-glass-panel {
    min-width: 0;
    padding: 18px;
    border: 1px solid #cee7ff46;
    border-radius: 17px;
    background: linear-gradient(135deg, #b3d8ff2d, #8ab5ff12);
    backdrop-filter: blur(16px);
  }

  .lv-request-stats {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 16px;
    margin: 22px 0;
  }

  .lv-request-stats strong {
    display: block;
    margin-top: 6px;
    font-size: 28px;
  }

  .lv-request-filters {
    display: grid;
    grid-template-columns: minmax(0, 2fr) minmax(0, 1fr);
    gap: 12px;
    margin: 16px 0;
  }

  .lv-request-filters label {
    display: grid;
    min-width: 0;
    gap: 5px;
  }

  .lv-requests button,
  .lv-requests input,
  .lv-requests select {
    min-width: 0;
    min-height: 42px;
    padding: 8px 12px;
    border: 1px solid #c4e0ff44;
    border-radius: 9px;
    background: #132b53;
    color: inherit;
    font: inherit;
  }

  .lv-requests input::placeholder { color: #a9bfdf; }
  .lv-requests button { cursor: pointer; }

  .lv-requests button:hover:not(:disabled),
  .lv-requests button[aria-current="page"] {
    background: #245297;
  }

  .lv-requests :focus-visible {
    outline: 2px solid #8fe8ff;
    outline-offset: 2px;
  }

  .lv-request-list {
    display: grid;
    gap: 10px;
    list-style: none;
    margin: 0;
    padding: 0;
  }

  .lv-request-row {
    display: flex;
    align-items: flex-start;
    flex-wrap: wrap;
    gap: 12px;
    padding: 14px;
    border: 1px solid #badbff28;
    border-radius: 11px;
    background: #bcdaff15;
    overflow-wrap: anywhere;
  }

  .lv-request-details { flex: 1 1 210px; }

  .lv-request-details small {
    display: block;
    margin-top: 4px;
    white-space: pre-wrap;
  }

  .lv-request-badge {
    border-radius: 20px;
    padding: 5px 10px;
    font-size: 13px;
    font-weight: 700;
  }

  .lv-request-badge.pending { background: #624819; color: #ffedb0; }
  .lv-request-badge.approved { background: #103f43; color: #a1f4d9; }
  .lv-request-badge.declined { background: #613448; color: #ffe0e8; }

  .lv-request-actions {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 8px;
  }

  .lv-requests .lv-approve { background: #11604e; }
  .lv-requests .lv-decline { background: #613448; }
  .lv-requests button:disabled { opacity: 0.55; cursor: default; }
  .lv-requests p[role="alert"] { color: #ffd1d8; margin-bottom: 10px; }

  @media (max-width: 700px) {
    .lv-requests { display: block; }
    .lv-requests nav {
      flex-direction: row;
      flex-wrap: wrap;
      padding: 16px;
      border-right: 0;
      border-bottom: 1px solid #bfdcff33;
    }
    .lv-requests .lv-brand { width: 100%; padding: 0; }
    .lv-request-stats { gap: 8px; }
    .lv-request-stats .lv-glass-panel { padding: 10px; }
    .lv-request-filters { grid-template-columns: 1fr; }
  }

  @media (max-width: 360px) {
    .lv-request-stats { grid-template-columns: 1fr; }
  }
`;

export default function RequestsScreen({
  navigation,
}: NativeStackScreenProps<Routes, "TeacherRequests">) {
  const { user } = useAuth();
  const { items, loading, error } = useCollection<RequestItem>("requests", [
    ["teacherId", user?.uid ?? ""],
  ]);

  const [status, setStatus] = useState("all");
  const [search, setSearch] = useState("");
  const [busy, setBusy] = useState("");
  const [actionError, setActionError] = useState("");

  const query = search.trim().toLowerCase();
  const ready = !loading && !error;

  const visible = items.filter(
    (item) =>
      (status === "all" || item.status === status) &&
      [item.studentName, item.classTitle].some((value) =>
        value.toLowerCase().includes(query),
      ),
  );

  async function review(item: RequestItem, approve: boolean) {
    setBusy(item.id);
    setActionError("");

    try {
      await reviewRequest(item, approve);
    } catch (failure) {
      setActionError(
        failure instanceof Error
          ? failure.message
          : "Could not update this request.",
      );
    } finally {
      setBusy("");
    }
  }

  return (
    <div className="lv-requests">
      <style>{styles}</style>

      <nav aria-label="Teacher navigation">
        <strong className="lv-brand">Learnivo</strong>
        <button onClick={() => navigation.navigate("Dashboard")}>
          Dashboard
        </button>
        <button onClick={() => navigation.navigate("Students")}>
          Students
        </button>
        <button aria-current="page">Requests</button>
        <button onClick={() => navigation.navigate("Profile")}>
          Profile
        </button>
      </nav>

      <main>
        <h1>Requests &amp; waitlist</h1>
        <p>Review enrollment, trial and waitlist requests.</p>

        <div className="lv-request-stats">
          {statuses.map((value) => (
            <GlassPanel key={value}>
              {statusLabels[value]}
              <strong>
                {ready
                  ? items.filter((item) => item.status === value).length
                  : "—"}
              </strong>
            </GlassPanel>
          ))}
        </div>

        <GlassPanel>
          <h2>Student requests</h2>

          <div className="lv-request-filters">
            <label>
              Search by student or class
              <input
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Student or class name"
              />
            </label>

            <label>
              Status
              <select
                value={status}
                onChange={(event) => setStatus(event.target.value)}
              >
                <option value="all">All statuses</option>
                {statuses.map((value) => (
                  <option key={value} value={value}>
                    {statusLabels[value]}
                  </option>
                ))}
              </select>
            </label>
          </div>

          {(actionError || error) && (
            <p role="alert">{actionError || error}</p>
          )}

          {loading && <p role="status">Loading requests…</p>}

          {ready && visible.length === 0 && (
            <p>
              {items.length
                ? "No requests match your filters."
                : "No requests yet."}
            </p>
          )}

          {ready && visible.length > 0 && (
            <ul className="lv-request-list">
              {visible.map((item) => (
                <li
                  key={item.id}
                  className="lv-request-row"
                  style={{
                    borderInlineStart: `4px solid ${
                      getClassColor(item.classId) ?? "#D5E8E6"
                    }`,
                  }}
                >
                  <div className="lv-request-details">
                    <strong>{item.studentName}</strong>
                    <small>
                      {item.classTitle} · {requestLabels[item.kind]}
                    </small>

                    {item.needs && <small>{item.needs}</small>}

                    {item.sessionDate && (
                      <small>Trial date · {item.sessionDate}</small>
                    )}
                  </div>

                  <span className={`lv-request-badge ${item.status}`}>
                    {statusLabels[item.status]}
                  </span>

                  {item.status === "pending" && (
                    <div className="lv-request-actions">
                      {item.kind !== "waitlist" && (
                        <button
                          className="lv-approve"
                          disabled={Boolean(busy)}
                          onClick={() => void review(item, true)}
                        >
                          {item.kind === "trial"
                            ? "Approve trial"
                            : "Approve enrollment"}
                        </button>
                      )}

                      <button
                        className="lv-decline"
                        disabled={Boolean(busy)}
                        onClick={() => void review(item, false)}
                      >
                        {item.kind === "waitlist"
                          ? "Close waitlist request"
                          : "Decline"}
                      </button>

                      {busy === item.id && (
                        <small role="status">Updating request…</small>
                      )}

                      {item.kind === "trial" && (
                        <small>Trial approval does not enroll the student.</small>
                      )}
                    </div>
                  )}
                </li>
              ))}
            </ul>
          )}
        </GlassPanel>
      </main>
    </div>
  );
}