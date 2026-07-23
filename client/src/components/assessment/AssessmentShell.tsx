import type { ReactNode } from "react";
import { T, FONT } from "./tokens";
import type { Step } from "./steps";

interface AssessmentShellProps {
  step: Step;
  stepIndex: number;
  onSkipAll: () => void;
  children: ReactNode;
}

/* Persistent chrome for every step: background, header (icon + wordmark,
   ✕ skip-to-results while in the flow), hero, and the labeled progress bar. */
export default function AssessmentShell({ step, stepIndex, onSkipAll, children }: AssessmentShellProps) {
  const showHero = step.type !== "results";
  const showProgress = step.type !== "landing" && step.type !== "results";
  const inFlow = showProgress && step.type !== "loading";

  return (
    <div
      className="assessment-v9"
      style={{
        minHeight: "100vh",
        background:
          `radial-gradient(1100px 520px at 80% -10%, ${T.glowA}, transparent 60%),` +
          `radial-gradient(900px 500px at 10% 110%, ${T.glowB}, transparent 55%),` +
          T.bg,
        color: T.ink,
        fontFamily: FONT,
      }}
    >
      <div className="mx-auto flex flex-col" style={{ maxWidth: 480, minHeight: "100vh", padding: "20px 18px 28px" }}>
        {/* header */}
        <div className="flex items-center justify-between" style={{ marginBottom: 26 }}>
          <div className="flex items-center" style={{ gap: 8 }}>
            <img src="/vasa-icon.png" alt="" style={{ height: 22, width: 22, display: "block" }} />
            <span style={{ fontWeight: 700, fontSize: 23, letterSpacing: "-0.02em", color: T.ink }}>
              ivasa.ai
            </span>
          </div>
          {inFlow ? (
            <button
              onClick={onSkipAll}
              aria-label="Skip to results"
              data-testid="button-skip-all"
              style={{ color: T.faint, fontSize: 22, lineHeight: 1, background: "none", border: "none", cursor: "pointer", padding: 6 }}
            >
              ✕
            </button>
          ) : (
            <span style={{ color: T.faint, fontSize: 20, letterSpacing: 2 }}>≡</span>
          )}
        </div>

        {/* persistent hero */}
        {showHero && (
          <div style={{ textAlign: "center", marginBottom: 22 }}>
            <h1 style={{ fontSize: 28, lineHeight: 1.18, fontWeight: 800, letterSpacing: "-0.03em", margin: 0 }}>
              See beneath the <span style={{ color: T.emBright }}>pattern</span> you've been running
            </h1>
            <div
              style={{
                display: "inline-flex", alignItems: "center", gap: 8, marginTop: 14,
                padding: "8px 16px", borderRadius: 999, fontSize: 14, color: T.ink,
                border: `1px solid ${T.line}`, background: "rgba(255,255,255,0.03)",
              }}
            >
              <span aria-hidden="true" style={{ color: T.emBright }}>✦</span> Free pattern profile
            </div>
          </div>
        )}

        {/* labeled progress */}
        {showProgress && (
          <div style={{ marginBottom: 24 }}>
            <div className="flex items-center justify-between" style={{ marginBottom: 8 }}>
              <span style={{ fontWeight: 700, fontSize: 15 }}>Your pattern profile</span>
              <span style={{ color: T.emBright, fontWeight: 700, fontSize: 15 }}>{step.pct}%</span>
            </div>
            <div style={{ height: 8, borderRadius: 999, background: "rgba(148,163,184,0.15)" }}>
              <div
                style={{
                  height: 8, borderRadius: 999, width: `${step.pct}%`,
                  background: `linear-gradient(90deg, ${T.em}, ${T.emBright})`,
                  boxShadow: `0 0 14px ${T.emLine}`,
                  transition: "width .5s ease",
                }}
              />
            </div>
          </div>
        )}

        {/* step body */}
        <div key={stepIndex} style={{ animation: "rise .35s ease both", flex: 1, display: "flex", flexDirection: "column" }}>
          {children}
        </div>
      </div>
    </div>
  );
}
