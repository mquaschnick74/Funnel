import { T } from "./tokens";
import type { Question } from "./steps";

interface QuestionStepProps {
  q: Question;
  number: number;
  total: number;
  selected: string | null;
  onPick: (qid: string, value: string) => void;
  onSkip: () => void;
  onBack: () => void;
}

export default function QuestionStep({ q, number, total, selected, onPick, onSkip, onBack }: QuestionStepProps) {
  return (
    <div>
      <div className="flex items-center justify-between" style={{ color: T.faint, fontSize: 13, marginBottom: 10 }}>
        <span>iVASA Assessment</span>
        <span>Question {number} of {total}</span>
      </div>
      <h2 style={{ fontSize: 23, fontWeight: 700, lineHeight: 1.35, margin: "0 0 6px", letterSpacing: "-0.01em" }}>
        {q.text}
      </h2>
      {q.sub && (
        <p style={{ color: T.mute, fontSize: 15, margin: "0 0 16px" }}>{q.sub}</p>
      )}
      <div style={{ display: "grid", gap: 10, marginTop: q.sub ? 0 : 16 }}>
        {q.choices.map((c) => {
          const active = selected === c.value;
          return (
            <button
              key={c.value}
              onClick={() => onPick(q.id, c.value)}
              data-testid={`choice-${q.id}-${c.value}`}
              style={{
                width: "100%", textAlign: "left", padding: "16px 18px", borderRadius: 14, cursor: "pointer",
                fontSize: 16, color: T.ink,
                background: active ? T.emSoft : "rgba(255,255,255,0.03)",
                border: `1px solid ${active ? T.em : T.line}`,
                boxShadow: active ? `0 0 0 3px ${T.emSoft}` : "none",
                transition: "border-color .15s ease, background .15s ease",
              }}
            >
              {c.text}
            </button>
          );
        })}
      </div>
      <div className="flex items-center gap-3" style={{ marginTop: 22 }}>
        <button
          onClick={onBack}
          aria-label="Back"
          data-testid="button-back"
          style={{
            width: 48, height: 44, borderRadius: 12, cursor: "pointer",
            background: "rgba(255,255,255,0.05)", border: `1px solid ${T.line}`, color: T.mute,
          }}
        >
          ←
        </button>
        <button
          onClick={onSkip}
          data-testid="button-skip"
          style={{ flex: 1, height: 44, borderRadius: 12, cursor: "pointer", background: "transparent", border: "none", color: T.faint, fontSize: 14 }}
        >
          Skip this question
        </button>
      </div>
    </div>
  );
}
