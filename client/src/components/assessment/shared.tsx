import type { ReactNode } from "react";
import { T } from "./tokens";

interface NavProps {
  onBack?: () => void;
  onNext: () => void;
  label: string;
  ghost?: boolean;
}

export function Nav({ onBack, onNext, label, ghost }: NavProps) {
  return (
    <div className="flex items-center gap-3" style={{ marginTop: 28 }}>
      {onBack && (
        <button
          onClick={onBack}
          aria-label="Back"
          data-testid="button-back"
          style={{
            width: 56, height: 56, borderRadius: 16, flexShrink: 0, cursor: "pointer",
            background: "rgba(255,255,255,0.05)", border: `1px solid ${T.line}`,
            color: T.mute, fontSize: 20,
          }}
        >
          ←
        </button>
      )}
      <button
        onClick={onNext}
        data-testid="button-next"
        style={
          ghost
            ? {
                flex: 1, height: 56, borderRadius: 16, cursor: "pointer",
                background: "transparent", border: `1px solid ${T.line}`,
                color: T.mute, fontSize: 16, fontWeight: 600,
              }
            : {
                flex: 1, height: 56, borderRadius: 16, cursor: "pointer",
                background: `linear-gradient(180deg, ${T.btnBright}, ${T.btn})`,
                border: "none", color: "#ffffff", fontSize: 17, fontWeight: 800,
                boxShadow: `0 6px 24px ${T.btnLine}`,
              }
        }
      >
        {label}
      </button>
    </div>
  );
}

interface PanelProps {
  children: ReactNode;
  accent?: "violet" | "emerald";
}

export function Panel({ children, accent }: PanelProps) {
  return (
    <div
      style={{
        borderRadius: 20, padding: "22px 20px",
        background: T.panel,
        border: `1px solid ${accent === "violet" ? T.vioLine : accent === "emerald" ? T.emLine : T.line}`,
        backdropFilter: "blur(6px)",
      }}
    >
      {children}
    </div>
  );
}
