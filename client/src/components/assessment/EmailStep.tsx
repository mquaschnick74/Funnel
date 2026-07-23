import { T } from "./tokens";
import { Nav } from "./shared";

interface EmailStepProps {
  email: string;
  setEmail: (e: string) => void;
  onSubmit: () => void;
  onSkip: () => void;
  onBack: () => void;
}

export default function EmailStep({ email, setEmail, onSubmit, onSkip, onBack }: EmailStepProps) {
  return (
    <div>
      <h2 style={{ fontSize: 26, fontWeight: 800, margin: "0 0 6px", letterSpacing: "-0.02em" }}>
        Your profile is ready
      </h2>
      <p style={{ color: T.mute, fontSize: 15, margin: "0 0 18px" }}>
        Enter your email and your full pattern profile is on the next page — plus we'll send you a copy to keep. No sequence, no spam.
      </p>
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="you@example.com"
        data-testid="input-email"
        style={{
          width: "100%", boxSizing: "border-box", height: 56, borderRadius: 14,
          padding: "0 16px", fontSize: 16, color: T.ink, outline: "none",
          background: "rgba(255,255,255,0.04)", border: `1px solid ${T.line}`,
        }}
      />
      <Nav onBack={onBack} onNext={onSubmit} label="Show me my profile →" />
      <button
        onClick={onSkip}
        data-testid="button-skip-email"
        style={{ width: "100%", marginTop: 10, background: "none", border: "none", color: T.faint, fontSize: 14, cursor: "pointer", padding: 8 }}
      >
        Continue without email
      </button>
    </div>
  );
}
