import { useState, useEffect } from "react";
import { T, MONO } from "./tokens";
import { Nav, Panel } from "./shared";

interface AgentCardProps {
  onNext: () => void;
  onBack: () => void;
  cta: string;
}

const LINES = [
  "reading your answers so far",
  "locating the contradiction that returns",
  "measuring the wanting–doing gap",
  "drafting your pattern profile",
];

/* Interstitial 2: the drafting terminal. */
export default function AgentCard({ onNext, onBack, cta }: AgentCardProps) {
  const [shown, setShown] = useState(0);
  useEffect(() => {
    if (shown >= LINES.length) return;
    const t = setTimeout(() => setShown((s) => s + 1), 550);
    return () => clearTimeout(t);
  }, [shown]);

  return (
    <div>
      <Panel accent="emerald">
        <h3 style={{ fontSize: 22, fontWeight: 800, margin: "0 0 6px" }}>Already drafting your profile</h3>
        <p style={{ color: T.mute, fontSize: 15, margin: "0 0 16px" }}>What it looks like:</p>
        <div
          style={{
            borderRadius: 14, padding: "16px 16px 14px",
            border: `1px solid ${T.vioLine}`, background: "rgba(10, 8, 22, 0.7)",
          }}
        >
          <div className="flex items-center gap-2" style={{ marginBottom: 12 }}>
            <span aria-hidden="true" style={{ color: T.vio, fontSize: 15 }}>◉</span>
            <span style={{ fontWeight: 700, fontSize: 15 }}>Profile engine started</span>
          </div>
          <div style={{ fontFamily: MONO, fontSize: 13.5, color: T.mute, display: "grid", gap: 9 }}>
            {LINES.slice(0, shown).map((l, i) => {
              const last = i === LINES.length - 1;
              return (
                <div key={l} style={{ animation: "tick .3s ease both" }}>
                  <span style={{ color: T.vio }}>$ </span>{l}{" "}
                  {last
                    ? <span style={{ color: T.vio, animation: "pulse-soft 1.2s infinite" }}>…</span>
                    : <span style={{ color: T.vio }}>✓</span>}
                </div>
              );
            })}
          </div>
          <div style={{ borderTop: `1px solid ${T.lineSoft}`, marginTop: 14, paddingTop: 12 }}>
            <p style={{ margin: 0, fontSize: 14.5, color: T.ink, fontWeight: 600 }}>
              It keeps working while you finish the questions. Go ahead.
            </p>
          </div>
        </div>
      </Panel>
      <Nav onBack={onBack} onNext={onNext} label={`${cta} →`} />
    </div>
  );
}
