import React, { type ReactNode } from "react";

export default function GlassPanel({ children }: { children: ReactNode }) {
  return <section className="lv-glass-panel">{children}</section>;
}