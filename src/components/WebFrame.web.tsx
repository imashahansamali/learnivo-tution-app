import React, { type ReactNode } from "react";

const frameStyles = `
  .learnivo-frame {
    position: relative;
    isolation: isolate;
    display: flex;
    justify-content: center;
    flex: 1;
    min-height: 0;
    padding: clamp(12px, 3vw, 36px);
    overflow: hidden;
    background: #07132e;
  }

  .learnivo-frame__glow {
    position: absolute;
    z-index: -1;
    inset: -25%;
    pointer-events: none;
    background:
      radial-gradient(ellipse at 29% 24%, #5447e8 0%, transparent 42%),
      radial-gradient(ellipse at 77% 76%, #0a8dc8 0%, transparent 38%);
    opacity: 0.58;
    animation: learnivo-glow 9s ease-in-out infinite alternate;
  }

  .learnivo-frame__panel {
    display: flex;
    flex-direction: column;
    width: 100%;
    max-width: 1600px;
    min-height: 0;
    min-width: 0;
    overflow: hidden;
    background: #0b1a38;
    border: 1px solid #8bb8ff66;
    border-radius: clamp(14px, 2vw, 26px);
    box-shadow: 0 0 28px #168cff45;
  }

  @keyframes learnivo-glow {
    from { transform: translateX(-6%) scale(1); }
    to { transform: translateX(6%) scale(1.09); opacity: 0.8; }
  }

  @media (prefers-reduced-motion: reduce) {
    .learnivo-frame__glow { animation: none; }
  }
`;

export default function WebFrame({ children }: { children: ReactNode }) {
  return (
    <div className="learnivo-frame">
      <style>{frameStyles}</style>
      <div className="learnivo-frame__glow" aria-hidden="true" />
      <div className="learnivo-frame__panel">{children}</div>
    </div>
  );
}