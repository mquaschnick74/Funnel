import { useState, useEffect } from "react";
import { T } from "./tokens";
import { Panel } from "./shared";
import { synthesisCopy, patternName, REGISTER_LINE, PATTERN_DETAIL } from "./patternContent";
import type { ProfileResult, QuestionAnswers } from "@/lib/profileComputation";
import { encodeProfileData } from "@/lib/profileComputation";

interface ResultsViewProps {
  profile: ProfileResult;
  answers: QuestionAnswers;
  email: string;
  onRestart: () => void;
}

export default function ResultsView({ profile, answers, email: capturedEmail, onRestart }: ResultsViewProps) {
  const [isInIframe, setIsInIframe] = useState(false);
  const [showEmailForm, setShowEmailForm] = useState(false);
  const [email, setEmail] = useState(capturedEmail);

  const skipped = !answers.q3 && !answers.q4 && !answers.q5 && !answers.q6 && !answers.q7 && !answers.q8 && !answers.q9;

  useEffect(() => {
    const inIframe = window.parent !== window;
    setIsInIframe(inIframe);

    console.log('🔍 [QUIZ] iFrame detection:', {
      isInIframe: inIframe,
      parent: window.parent,
      current: window,
      origin: window.location.origin
    });

    if (inIframe) {
      console.log('📤 [QUIZ] Sending IFRAME_READY message');
      window.parent.postMessage({ type: 'IFRAME_READY' }, '*');
    }
  }, []);

  const handleSignup = () => {
    const encoded = encodeProfileData(answers, profile);

    console.log('🚀 [QUIZ] Signup button clicked');
    console.log('🚀 [QUIZ] isInIframe:', isInIframe);
    console.log('🚀 [QUIZ] Data:', { encoded, profile, answers });

    if (isInIframe) {
      console.log('📤 [QUIZ] Sending ASSESSMENT_COMPLETE message to parent');

      const message = {
        type: 'ASSESSMENT_COMPLETE',
        data: {
          encoded,
          profile,
          answers,
          action: 'signup'
        }
      };

      window.parent.postMessage(message, '*');
      console.log('✅ [QUIZ] Message sent:', message);

      alert('Assessment complete! Redirecting to signup...');
    } else {
      console.log('🔗 [QUIZ] Not in iframe, navigating directly');
      const signupUrl = `https://beta.ivasa.ai/signup?source=assessment&profile=${encoded}`;
      window.location.href = signupUrl;
    }
  };

  const submitEmailCapture = (emailToSend: string) => {
    console.log('📧 [QUIZ] Email form submitted');
    console.log('📧 [QUIZ] Email:', emailToSend);
    console.log('📧 [QUIZ] isInIframe:', isInIframe);

    if (!emailToSend) {
      alert('Please enter your email address');
      return;
    }

    if (isInIframe) {
      const encoded = encodeProfileData(answers, profile);

      console.log('📤 [QUIZ] Sending email capture message to parent');

      const message = {
        type: 'ASSESSMENT_COMPLETE',
        data: {
          encoded,
          profile,
          answers,
          email: emailToSend,
          action: 'email_capture'
        }
      };

      window.parent.postMessage(message, '*');
      console.log('✅ [QUIZ] Email message sent:', message);

      alert(`Thank you! We'll send your results to ${emailToSend}`);
      setShowEmailForm(false);
    } else {
      console.log('📧 [QUIZ] Not in iframe, handling locally');
      alert(`Thank you! We'll send your results to ${emailToSend}`);
      setShowEmailForm(false);
    }
  };

  const handleEmailInstead = () => {
    if (capturedEmail) {
      submitEmailCapture(capturedEmail);
    } else {
      setShowEmailForm(true);
    }
  };

  if (skipped) {
    return (
      <div style={{ textAlign: "center", paddingTop: 30 }}>
        <h2 style={{ fontSize: 28, fontWeight: 800, margin: "0 0 10px" }}>No answers, no problem</h2>
        <p style={{ color: T.mute, fontSize: 15, margin: "0 0 22px" }}>
          The assessment takes about 90 seconds and gives your first session a head start.
        </p>
        <button
          onClick={onRestart}
          data-testid="button-restart"
          style={{
            width: "100%", height: 56, borderRadius: 16, cursor: "pointer",
            background: `linear-gradient(180deg, ${T.btnBright}, ${T.btn})`,
            border: "none", color: "#ffffff", fontSize: 17, fontWeight: 800,
          }}
        >
          Take the assessment →
        </button>
      </div>
    );
  }

  const cvdc = profile.cvdc_score;
  const ibm = profile.ibm_score;
  const name = patternName(cvdc, ibm);
  const detail = PATTERN_DETAIL[name];
  const pullLabel = cvdc >= 4 ? "Strong" : cvdc >= 2 ? "Moderate" : "Low";
  const gapLabel = ibm >= 4 ? "Wide" : ibm >= 2 ? "Moderate" : "Narrow";

  const unlockedCards = [
    { title: "What this pattern costs you day to day", body: detail.costs },
    { title: "Why it holds — and what loosens it", body: detail.holds },
  ];
  const lockedCards = [
    "How a session would open, for you specifically",
    "Your first three moves",
  ];

  return (
    <div>
      <p style={{ color: T.vio, fontSize: 13, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", margin: "0 0 6px" }}>
        Your pattern
      </p>
      <h2
        data-testid="heading-pattern"
        style={{
          fontSize: 36, fontWeight: 800, letterSpacing: "-0.03em", lineHeight: 1.1, margin: "0 0 16px",
          background: `linear-gradient(90deg, ${T.emBright}, ${T.vio})`,
          WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent",
        }}
      >
        {name}
      </h2>

      <div className="flex gap-3" style={{ marginBottom: 16 }}>
        <Stat label="Inner pull" value={pullLabel} />
        <Stat label="Wanting–doing gap" value={gapLabel} />
      </div>

      <Panel accent="emerald">
        <p style={{ margin: 0, fontSize: 15.5, lineHeight: 1.6, color: T.ink }}>
          {synthesisCopy(cvdc, ibm)}
          {REGISTER_LINE[profile.register] ? " " + REGISTER_LINE[profile.register] : ""}
        </p>
      </Panel>

      {/* unlocked cards — real, per-pattern content */}
      <div style={{ display: "grid", gap: 12, marginTop: 16 }}>
        {unlockedCards.map((c) => (
          <div
            key={c.title}
            style={{
              borderRadius: 16, padding: "16px 18px",
              border: `1px solid ${T.emLine}`, background: T.panel,
            }}
          >
            <div className="flex items-center justify-between">
              <span style={{ fontWeight: 700, fontSize: 15 }}>{c.title}</span>
              <span
                style={{
                  padding: "2px 9px", borderRadius: 999, fontSize: 10.5, fontWeight: 800,
                  color: "#04140d", background: T.emBright,
                }}
              >
                UNLOCKED
              </span>
            </div>
            <p style={{ margin: "10px 0 0", fontSize: 14.5, color: T.ink, lineHeight: 1.6 }}>
              {c.body}
            </p>
          </div>
        ))}

        {/* still-locked cards */}
        {lockedCards.map((t) => (
          <div
            key={t}
            style={{
              borderRadius: 16, padding: "16px 18px", position: "relative", overflow: "hidden",
              border: `1px solid ${T.line}`, background: T.panel,
            }}
          >
            <div className="flex items-center justify-between">
              <span style={{ fontWeight: 700, fontSize: 15 }}>{t}</span>
              <span aria-hidden="true" style={{ color: T.vio, fontSize: 14 }}>🔒</span>
            </div>
            <p
              aria-hidden="true"
              style={{
                margin: "10px 0 0", fontSize: 13.5, color: T.mute, lineHeight: 1.55,
                filter: "blur(6px)", userSelect: "none",
              }}
            >
              The specific opening for your pattern, the first exchange, and the three moves that follow from where you actually are.
            </p>
          </div>
        ))}
      </div>

      <p style={{ fontWeight: 700, fontSize: 15, margin: "22px 0 10px" }}>Your profile is drafted. Your guide is ready.</p>
      <div style={{ display: "grid", gap: 12 }}>
        <Guide initial="S" color={T.vioDeep} name="Sarah" title="Emotional support"
          blurb="Warm and steady — a place to say the thing out loud before anything else." />
        <Guide initial="M" color={T.em} name="Mathew" title="Deep analysis"
          blurb="Follows the pattern to its root, at the pace you set." />
      </div>

      <button
        onClick={handleSignup}
        data-testid="button-create-account"
        style={{
          width: "100%", height: 58, borderRadius: 16, marginTop: 22, cursor: "pointer",
          background: `linear-gradient(180deg, ${T.btnBright}, ${T.btn})`,
          border: "none", color: "#ffffff", fontSize: 17, fontWeight: 800,
          boxShadow: `0 8px 28px ${T.btnLine}`,
        }}
      >
        Create free account — unlock the rest →
      </button>
      <p style={{ textAlign: "center", color: T.faint, fontSize: 13, margin: "8px 0 0" }}>
        Takes 30 seconds
      </p>
      {!showEmailForm ? (
        <button
          onClick={handleEmailInstead}
          data-testid="button-email-instead"
          style={{ width: "100%", marginTop: 10, background: "none", border: "none", color: T.faint, fontSize: 14, cursor: "pointer", padding: 8 }}
        >
          Email me my results instead
        </button>
      ) : (
        <form
          onSubmit={(e) => { e.preventDefault(); submitEmailCapture(email); }}
          style={{ marginTop: 10, display: "grid", gap: 10 }}
        >
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            required
            data-testid="input-email"
            style={{
              width: "100%", boxSizing: "border-box", height: 56, borderRadius: 14,
              padding: "0 16px", fontSize: 16, color: T.ink, outline: "none",
              background: "rgba(255,255,255,0.04)", border: `1px solid ${T.line}`,
            }}
          />
          <button
            type="submit"
            data-testid="button-submit-email"
            style={{
              width: "100%", height: 48, borderRadius: 14, cursor: "pointer",
              background: "transparent", border: `1px solid ${T.line}`,
              color: T.mute, fontSize: 15, fontWeight: 600,
            }}
          >
            Send My Results
          </button>
        </form>
      )}

      <p style={{ color: T.faint, fontSize: 11.5, textAlign: "center", marginTop: 18 }}>
        A reflection tool, not a diagnosis or medical care.
      </p>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div
      style={{
        flex: 1, borderRadius: 14, padding: "12px 14px",
        border: `1px solid ${T.line}`, background: "rgba(255,255,255,0.03)",
      }}
    >
      <div style={{ color: T.faint, fontSize: 12.5 }}>{label}</div>
      <div style={{ fontWeight: 800, fontSize: 20, marginTop: 2 }}>{value}</div>
    </div>
  );
}

function Guide({ initial, color, name, title, blurb }: { initial: string; color: string; name: string; title: string; blurb: string }) {
  return (
    <div
      className="flex items-start gap-3"
      style={{
        borderRadius: 16, padding: "14px 16px",
        border: `1px solid ${T.line}`, background: T.panel,
      }}
    >
      <div
        style={{
          width: 44, height: 44, borderRadius: 12, flexShrink: 0,
          display: "flex", alignItems: "center", justifyContent: "center",
          background: color, color: "#fff", fontWeight: 800, fontSize: 18,
        }}
      >
        {initial}
      </div>
      <div>
        <div style={{ fontWeight: 700, fontSize: 15 }}>
          {name} <span style={{ color: T.faint, fontWeight: 500 }}>· {title}</span>
        </div>
        <p style={{ margin: "4px 0 0", color: T.mute, fontSize: 13.5, lineHeight: 1.5 }}>{blurb}</p>
      </div>
    </div>
  );
}
