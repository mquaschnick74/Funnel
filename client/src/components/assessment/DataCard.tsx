import { T } from "./tokens";
import { Nav, Panel } from "./shared";

interface DataCardProps {
  a9?: string;
  onNext: () => void;
  onBack: () => void;
  cta: string;
}

// TODO: replace with real distribution from assessment data
const SAMPLE_Q9_DISTRIBUTION = [
  { key: "body_focus", label: "Feel it in the body", pct: 22 },
  { key: "think_through", label: "Need words first", pct: 28 },
  { key: "imagine_scenarios", label: "Scenarios ahead", pct: 31 },
  { key: "hold_both", label: "Hold both sides", pct: 9 },
  { key: "stuck_overwhelmed", label: "Go blank / freeze", pct: 10 },
];

/* Interstitial 4: quiz results so far, you vs. everyone. */
export default function DataCard({ a9, onNext, onBack, cta }: DataCardProps) {
  return (
    <div>
      <Panel accent="emerald">
        <p
          style={{
            color: T.faint, fontSize: 12, fontWeight: 700, letterSpacing: "0.1em",
            textTransform: "uppercase", margin: "0 0 8px",
          }}
        >
          Assessment results so far
        </p>
        <h3 style={{ fontSize: 22, fontWeight: 800, margin: "0 0 8px" }}>
          {a9 ? "Your answer, next to everyone else's" : "How everyone else answered that"}
        </h3>
        <p style={{ color: T.mute, fontSize: 15, margin: "0 0 18px" }}>
          From people who've taken this assessment — what happens first:
        </p>
        <div style={{ display: "grid", gap: 11 }}>
          {SAMPLE_Q9_DISTRIBUTION.map((r) => {
            const mine = a9 === r.key;
            return (
              <div key={r.key} className="flex items-center gap-3">
                <span className="flex items-center gap-2" style={{ width: 138, fontSize: 13, fontWeight: mine ? 800 : 500, color: mine ? T.ink : T.mute }}>
                  {r.label}
                  {mine && (
                    <span
                      style={{
                        padding: "1px 7px", borderRadius: 999, fontSize: 10.5, fontWeight: 800,
                        color: "#04140d", background: T.emBright,
                      }}
                    >
                      YOU
                    </span>
                  )}
                </span>
                <div style={{ flex: 1, height: 20, borderRadius: 8, background: "rgba(255,255,255,0.05)", overflow: "hidden" }}>
                  <div
                    style={{
                      height: "100%", width: `${r.pct}%`, borderRadius: 8,
                      background: mine ? `linear-gradient(90deg, ${T.em}, ${T.emBright})` : "rgba(16,185,129,0.25)",
                      boxShadow: mine ? `0 0 12px ${T.emLine}` : "none",
                      animation: "barGrow .7s ease both",
                    }}
                  />
                </div>
                <span style={{ width: 40, textAlign: "right", fontSize: 13.5, fontWeight: mine ? 800 : 500, color: mine ? T.emBright : T.mute }}>
                  {r.pct}%
                </span>
              </div>
            );
          })}
        </div>
        <p style={{ marginTop: 14, marginBottom: 0, fontSize: 11.5, color: T.faint }}>
          Sample figures for this prototype — the live build pulls real distributions from assessment data.
        </p>
      </Panel>
      <Nav onBack={onBack} onNext={onNext} label={`${cta} →`} />
    </div>
  );
}
