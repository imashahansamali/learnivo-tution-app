import LearnivoIcon from "../../components/LearnivoIcon";
import React, { useState } from "react";

import { useAuth } from "../../context/AuthContext";
import { useCollection } from "../../hooks/useCollection";
import { markRead } from "../../services/data";
import type { Notice } from "../../types";
import { getClassColor } from "../../utils/classColors";

const css = `
.ln-page {
  flex: 1;
  min-height: 0;
  overflow: auto;
  padding: clamp(20px, 5vw, 60px);
  color: #f4f7ff;
  background:
    radial-gradient(ellipse at 92% 0%, #43339c, transparent 49%),
    radial-gradient(ellipse at 0% 100%, #075782, transparent 55%),
    #09162f;
  font-family: Inter, system-ui, sans-serif;
}
.ln-content { max-width: 960px; margin: auto; }
.ln-brand {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #b9d6ff;
  letter-spacing: 2px;
  font-size: 13px;
  font-weight: 800;
}
.ln-page h1 { margin: 14px 0 6px; font-size: clamp(30px, 5vw, 46px); }
.ln-page p { margin: 0; line-height: 1.55; overflow-wrap: anywhere; }
.ln-muted { color: #c5d3eb; }
.ln-tools {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
  margin: 24px 0 16px;
}
.ln-tools .ln-count { margin-inline-start: auto; }
.ln-page button {
  min-height: 44px;
  padding: 8px 14px;
  border: 1px solid #b9d8ff60;
  border-radius: 10px;
  background: #244674;
  color: white;
  font: inherit;
  font-weight: 650;
  cursor: pointer;
}
.ln-page button:hover { background: #315788; }
.ln-page button[aria-pressed="true"] { background: #1461ac; }
.ln-page button:focus-visible { outline: 2px solid #94edff; outline-offset: 2px; }
.ln-page button:disabled { opacity: .6; cursor: wait; }
.ln-list { list-style: none; padding: 0; margin: 0; display: grid; gap: 12px; }
.ln-card, .ln-state {
  padding: 16px;
  border: 1px solid #b9d8ff40;
  border-radius: 16px;
  background: linear-gradient(135deg, #b6d7ff24, #83a7f412);
}
.ln-card {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
  border-inline-start-width: 4px;
}
.ln-card p { flex: 1 1 220px; min-width: 0; }
.ln-badge {
  padding: 4px 9px;
  border-radius: 999px;
  background: #263951;
  color: #d6e3f9;
  font-size: 13px;
}
.ln-unread { background: #124b68; color: #c9f4ff; font-weight: 700; }
.ln-state[role="alert"] { color: #ffd9e1; margin-bottom: 12px; }
`;

export default function NotificationsScreen() {
  const { user } = useAuth();
  const notices = useCollection<Notice>("notifications", [
    ["userId", user?.uid ?? ""],
  ]);
  const [unreadOnly, setUnreadOnly] = useState(false);
  const [saving, setSaving] = useState<string | null>(null);
  const [error, setError] = useState("");

  const unreadCount = notices.items.filter((notice) => !notice.read).length;
  const visible = notices.items.filter((notice) => !unreadOnly || !notice.read);

  async function readNotice(id: string) {
    setSaving(id);
    setError("");

    try {
      await markRead(id);
    } catch (cause) {
      setError(
        cause instanceof Error
          ? cause.message
          : "Unable to mark notification as read.",
      );
    } finally {
      setSaving(null);
    }
  }

  return (
    <main className="ln-page">
      <style>{css}</style>
      <div className="ln-content">
        <header>
          <div className="ln-brand">
            <LearnivoIcon />
            <span>LEARNIVO</span>
          </div>
          <h1>Notifications</h1>
          <p className="ln-muted">In-app updates about your class requests.</p>
        </header>

        <div className="ln-tools" aria-label="Notification filters" role="group">
          <button
            type="button"
            aria-pressed={!unreadOnly}
            onClick={() => setUnreadOnly(false)}
          >
            All
          </button>
          <button
            type="button"
            aria-pressed={unreadOnly}
            onClick={() => setUnreadOnly(true)}
          >
            Unread
          </button>

          {!notices.loading && !notices.error && (
            <p className="ln-muted ln-count" role="status">
              {unreadCount} unread
            </p>
          )}
        </div>

        {(error || notices.error) && (
          <div className="ln-state" role="alert">
            {error || notices.error}
          </div>
        )}

        {notices.loading && (
          <div className="ln-state" role="status">Loading notifications…</div>
        )}

        {!notices.loading && !notices.error && visible.length === 0 && (
          <p className="ln-state">
            {unreadOnly ? "You’re all caught up." : "No notifications yet."}
          </p>
        )}

        {!notices.loading && visible.length > 0 && (
          <ul className="ln-list">
            {visible.map((notice) => (
              <li
                key={notice.id}
                className="ln-card"
                style={{ borderInlineStartColor: getClassColor(notice.classId) }}
              >
                <p>{notice.message}</p>
                <span className={notice.read ? "ln-badge" : "ln-badge ln-unread"}>
                  {notice.read ? "Read" : "Unread"}
                </span>

                {!notice.read && (
                  <button
                    type="button"
                    disabled={saving !== null}
                    onClick={() => void readNotice(notice.id)}
                  >
                    {saving === notice.id ? "Saving…" : "Mark as read"}
                  </button>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </main>
  );
}