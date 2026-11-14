import React from "react";
import LearnivoIcon from "../../components/LearnivoIcon";

type Props = {
  navigation: { navigate: (route: "Register" | "Login") => void };
};

const features = [
  ["Budget", "Find classes within your monthly budget."],
  ["Teaching language", "Choose the language you learn best in."],
  ["Weekly schedule", "Find classes that fit your available time."],
] as const;

const styles = `
.lw-page {
  flex: 1;
  min-height: 0;
  overflow: auto;
  padding: clamp(24px, 6vw, 80px);
  color: #f4f7ff;
  background:
    radial-gradient(ellipse at 90% 5%, #413294, transparent 48%),
    radial-gradient(ellipse at 4% 100%, #075b84, transparent 55%),
    #09162f;
  font-family: Inter, system-ui, sans-serif;
}

.lw-content {
  max-width: 1120px;
  margin: auto;
}

.lw-brand {
  display: flex;
  gap: 10px;
  align-items: center;
  font-size: 18px;
  font-weight: 800;
  letter-spacing: .14em;
}

.lw-hero {
  display: grid;
  grid-template-columns: minmax(0, 1.25fr) minmax(0, 1fr);
  gap: clamp(24px, 5vw, 64px);
  align-items: center;
  margin-top: clamp(28px, 7vw, 84px);
}

.lw-page h1 {
  max-width: 13ch;
  margin: 0 0 16px;
  font-size: clamp(36px, 5.5vw, 76px);
  line-height: 1.05;
  letter-spacing: -.045em;
}

.lw-page p {
  margin: 0;
  color: #c9d8f3;
  line-height: 1.55;
}

.lw-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-top: 26px;
}

.lw-actions button {
  min-height: 48px;
  padding: 10px 18px;
  border: 1px solid #bbd8ff60;
  border-radius: 10px;
  background: #23446f;
  color: #fff;
  font: inherit;
  font-weight: 700;
  cursor: pointer;
}

.lw-actions .lw-primary { background: #125bc4; }
.lw-actions button:hover { background: #315a91; }

.lw-actions button:focus-visible {
  outline: 2px solid #94edff;
  outline-offset: 3px;
}

.lw-card {
  padding: clamp(18px, 4vw, 32px);
  border: 1px solid #b9d8ff55;
  border-radius: 20px;
  background: linear-gradient(135deg, #b6d7ff24, #83a7f412);
  box-shadow: 0 12px 30px #0004;
}

.lw-card h2 { margin: 0 0 18px; font-size: 22px; }
.lw-card ul { margin: 0; padding: 0; list-style: none; }
.lw-card li { padding: 12px 0; border-top: 1px solid #b9d8ff40; }
.lw-card li:last-child { padding-bottom: 0; }
.lw-card strong { display: block; margin-bottom: 4px; color: #ffda82; }

@media (max-width: 720px) {
  .lw-hero { grid-template-columns: minmax(0, 1fr); }
}
`;

export default function WelcomeScreen({ navigation }: Props) {
  return (
    <main className="lw-page">
      <style>{styles}</style>

      <div className="lw-content">
        <header className="lw-brand">
          <LearnivoIcon />
          <span>LEARNIVO</span>
        </header>

        <div className="lw-hero">
          <section>
            <h1>Find the class that fits you.</h1>
            <p>Discover tuition classes that fit your budget, language and schedule.</p>

            <div className="lw-actions">
              <button
                className="lw-primary"
                type="button"
                onClick={() => navigation.navigate("Register")}
              >
                Get started
              </button>

              <button type="button" onClick={() => navigation.navigate("Login")}>
                Sign in · Student or Teacher
              </button>
            </div>
          </section>

          <section className="lw-card">
            <h2>Find classes by</h2>
            <ul>
              {features.map(([title, description]) => (
                <li key={title}>
                  <strong>{title}</strong>
                  <p>{description}</p>
                </li>
              ))}
            </ul>
          </section>
        </div>
      </div>
    </main>
  );
}