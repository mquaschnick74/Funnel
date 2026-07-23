import { useState } from "react";
import { T } from "./tokens";
import { Nav, Panel } from "./shared";

interface BreathPauseProps {
  onNext: () => void;
  onBack: () => void;
  cta: string;
}

/* Interstitial 3: the breath pause. Unscored — the choice is local state
   only and is never persisted into the answers object. */
export default function BreathPause({ onNext, onBack, cta }: BreathPauseProps) {
  const [chose, setChose] = useState<string | null>(null);
  const options = [
    { key: "stomach", label: "My stomach moved out",
      line: "That's the settled rhythm — the one the body returns to when nothing's gripping it." },
    { key: "chest", label: "My chest lifted",
      line: "Very common. Just information, not a grade — and it changes." },
    { key: "unsure", label: "Honestly — couldn't tell",
      line: "Most people can't at first. Noticing is the skill, and you just started it." },
  ];
  const picked = options.find((o) => o.key === chose);
  return (
    <div>
      <Panel accent="violet">
        <h3 style={{ fontSize: 22, fontWeight: 800, margin: "0 0 10px" }}>Before the last stretch — a pause</h3>
        <p style={{ color: T.mute, fontSize: 15, lineHeight: 1.55, margin: "0 0 16px" }}>
          Don't answer anything yet. Take one ordinary breath, and just notice: what moved?
        </p>
        <div style={{ display: "grid", gap: 10 }}>
          {options.map((o) => {
            const active = chose === o.key;
            return (
              <button
                key={o.key}
                onClick={() => setChose(o.key)}
                data-testid={`breath-${o.key}`}
                style={{
                  textAlign: "left", padding: "14px 16px", borderRadius: 12, cursor: "pointer",
                  fontSize: 15, color: T.ink,
                  background: active ? "rgba(139,92,246,0.12)" : "rgba(255,255,255,0.03)",
                  border: `1px solid ${active ? T.vioDeep : T.line}`,
                }}
              >
                {o.label}
              </button>
            );
          })}
        </div>
        {picked && (
          <p style={{ color: T.vio, fontSize: 14.5, lineHeight: 1.5, margin: "14px 0 0", animation: "rise .3s ease both" }}>
            {picked.line}
          </p>
        )}
        <p style={{ color: T.faint, fontSize: 11.5, margin: "12px 0 0" }}>
          Not scored. Just noticing.
        </p>
      </Panel>
      <Nav onBack={onBack} onNext={onNext} label={picked ? `${cta} →` : "Skip the pause →"} ghost={!picked} />
    </div>
  );
}
