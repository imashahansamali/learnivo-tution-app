import LearnivoIcon from "../../components/LearnivoIcon";
import React, { useState } from "react";
import { logout, useAuth } from "../../context/AuthContext";

const styles = `
.lp-page {
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
.lp-content { max-width: 760px; margin: auto; }
.lp-brand {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #b9d6ff;
  font-size: 13px;
  font-weight: 800;
  letter-spacing: 2px;
}
.lp-page h1 {
  margin: 14px 0 24px;
  font-size: clamp(30px, 5vw, 46px);
}
.lp-card {
  padding: clamp(18px, 4vw, 32px);
  border: 1px solid #b9d8ff50;
  border-radius: 20px;
  background: linear-gradient(135deg, #b6d7ff28, #83a7f412);
  box-shadow: 0 12px 30px #0004;
}
.lp-identity { display: flex; align-items: center; gap: 16px; }
.lp-identity > div { min-width: 0; }
.lp-identity h2 { margin: 0 0 5px; overflow-wrap: anywhere; }
.lp-avatar {
  flex: 0 0 56px;
  height: 56px;
  display: grid;
  place-items: center;
  border-radius: 16px;
  background: #245592;
  font-size: 24px;
  font-weight: 800;
}
.lp-role { color: #a9e7ff; font-size: 14px; }
.lp-details {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(min(100%, 250px), 1fr));
  gap: 16px;
  margin: 24px 0 0;
  padding-top: 20px;
  border-top: 1px solid #b9d8ff40;
}
.lp-details dt {
  margin-bottom: 4px;
  color: #c5d3eb;
  font-size: 14px;
}
.lp-details dd { margin: 0; overflow-wrap: anywhere; }
.lp-button {
  margin-top: 20px;
  min-height: 44px;
  padding: 8px 16px;
  border: 1px solid #f5b7c277;
  border-radius: 10px;
  background: #742d49;
  color: #fff;
  font: inherit;
  font-weight: 650;
  cursor: pointer;
}
.lp-button:hover { background: #893858; }
.lp-button:focus-visible { outline: 2px solid #94edff; outline-offset: 3px; }
.lp-button:disabled { opacity: .65; cursor: wait; }
.lp-error { color: #ffd9e1; }

.lp-teacher {
  background:
    radial-gradient(ellipse at 90% 0%, #4e3289, transparent 55%),
    #10162f;
}
.lp-teacher .lp-content { max-width: 900px; }
.lp-teacher .lp-card {
  display: grid;
  grid-template-columns: minmax(170px, 1fr) minmax(0, 2fr);
  align-items: start;
  gap: 24px;
}
.lp-teacher .lp-avatar { background: #6043a1; }
.lp-teacher .lp-role { color: #e3ceff; }
.lp-teacher .lp-details {
  grid-template-columns: minmax(0, 1fr);
  margin: 0;
  padding: 0 0 0 24px;
  border: 0;
  border-left: 1px solid #d9c5ff55;
}

@media (max-width: 620px) {
  .lp-teacher .lp-card { grid-template-columns: minmax(0, 1fr); }
  .lp-teacher .lp-details {
    padding: 20px 0 0;
    border-left: 0;
    border-top: 1px solid #d9c5ff55;
  }
}
`;

export default function ProfileScreen() {
  const { user, profile } = useAuth();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const isTeacher = profile?.role === "teacher";
  const name = profile?.name?.trim() || "Learnivo user";

  async function signOut() {
    setBusy(true);
    setError("");

    try {
      await logout();
    } catch (cause) {
      setError(
        cause instanceof Error ? cause.message : "Unable to sign out.",
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className={isTeacher ? "lp-page lp-teacher" : "lp-page"}>
      <style>{styles}</style>

      <div className="lp-content">
        <div className="lp-brand">
          <LearnivoIcon />
          <span>LEARNIVO</span>
        </div>

        <h1>{isTeacher ? "Teacher profile" : "Student profile"}</h1>

        <section className="lp-card" aria-label="Account details">
          <div className="lp-identity">
            <span className="lp-avatar" aria-hidden="true">
              {Array.from(name)[0].toUpperCase()}
            </span>

            <div>
              <h2>{name}</h2>
              {profile && (
                <span className="lp-role">
                  {isTeacher ? "Teacher" : "Student"}
                </span>
              )}
            </div>
          </div>

          <dl className="lp-details">
            <div>
              <dt>Email</dt>
              <dd>{user?.email || "—"}</dd>
            </div>

            <div>
              <dt>Phone</dt>
              <dd>{profile?.phone || "—"}</dd>
            </div>

            <div>
              <dt>Grade</dt>
              <dd>{profile?.grade ?? "—"}</dd>
            </div>
          </dl>
        </section>

        {error && (
          <p className="lp-error" role="alert">
            {error}
          </p>
        )}

        <button
          className="lp-button"
          type="button"
          disabled={busy}
          onClick={() => void signOut()}
        >
          {busy ? "Signing out…" : "Sign out"}
        </button>
      </div>
    </main>
  );
}