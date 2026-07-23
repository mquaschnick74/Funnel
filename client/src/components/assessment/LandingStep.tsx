import { T } from "./tokens";

interface LandingStepProps {
  onStart: () => void;
}

export default function LandingStep({ onStart }: LandingStepProps) {
  const signals = [
    "Takes about 90 seconds",
    "Safety-First (Non-Crisis Therapy)",
    "Based on 20+ years of clinical research",
    "Completely confidential",
  ];
  return (
    <div style={{ textAlign: "center" }}>
      <p style={{ color: T.mute, fontSize: 16, margin: "0 0 26px" }}>
        Seven questions. One honest picture of what keeps repeating — and where a session would start.
      </p>
      <button
        onClick={onStart}
        data-testid="button-start"
        style={{
          width: "100%", height: 60, borderRadius: 16, cursor: "pointer",
          background: `linear-gradient(180deg, ${T.btnBright}, ${T.btn})`,
          border: "none", color: "#ffffff", fontSize: 18, fontWeight: 800,
          boxShadow: `0 8px 28px ${T.btnLine}`,
        }}
      >
        Start the 7-question assessment →
      </button>
      <div style={{ marginTop: 30, textAlign: "left", display: "grid", gap: 12 }}>
        {signals.map((s) => (
          <div key={s} className="flex items-start gap-3">
            <span aria-hidden="true" style={{ color: T.emBright, fontWeight: 800 }}>✓</span>
            <span style={{ fontSize: 15, color: T.ink }}>{s}</span>
          </div>
        ))}
      </div>
      <p style={{ color: T.faint, fontSize: 12, marginTop: 26 }}>
        A reflection tool — not a diagnosis, and not emergency care.
      </p>
    </div>
  );
}
