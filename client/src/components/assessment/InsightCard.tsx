import { T } from "./tokens";
import { Nav, Panel } from "./shared";
import type { QuestionAnswers } from "@/lib/profileComputation";

interface InsightCardProps {
  answers: QuestionAnswers;
  onNext: () => void;
  onBack: () => void;
  cta: string;
}

/* Interstitial 1: echoes the user's own q3/q6/q7 answers, then lands the line. */
export default function InsightCard({ answers, onNext, onBack, cta }: InsightCardProps) {
  const a3 = answers.q3, a6 = answers.q6, a7 = answers.q7;

  const echoes: string[] = [];
  if (a3 === "always") echoes.push("The pull is there most days.");
  if (a3 === "sometimes") echoes.push("The pull comes and goes.");
  if (a3 === "rarely") echoes.push("You're usually clear on what you want.");
  if (a6 === "strongly_agree") echoes.push("When you reach for it, something stops you cold.");
  if (a6 === "agree") echoes.push("When you reach for it, something pulls back.");
  if (a6 === "neutral") echoes.push("Some reaches are clean. Some aren't.");
  if (a6 === "strongly_disagree") echoes.push("When you reach, you move.");
  if (a7 === "always") echoes.push("And you're living against something you believe.");
  if (a7 === "sometimes") echoes.push("Sometimes you live against what you believe.");
  if (a7 === "rarely") echoes.push("You mostly live by what you believe.");

  const pullPresent =
    a3 === "always" || a3 === "sometimes" ||
    a6 === "strongly_agree" || a6 === "agree" ||
    a7 === "always" || a7 === "sometimes";

  const c = pullPresent
    ? {
        head: "Feels random. It isn't.",
        body: a3 === "always"
          ? "A pull this constant isn't chaos — it's a structure: real wants, real forces, none of them giving. And it runs on a schedule: specific places, specific people, specific hours. The next questions find where it lives."
          : "A pull that comes and goes isn't chaos — it shows up around specific things, at specific times. That's a pattern with a schedule. The next questions find where it lives.",
        stat: "It has a schedule,",
        statSub: "and schedules can be found.",
      }
    : {
        head: "Clarity — noted",
        body: "You're clear on the wanting, and the reaching is mostly clean. So we look where patterns actually hide for people like you: the space between wanting and doing.",
        stat: "Wanting is settled,",
        statSub: "doing is the interesting part.",
      };

  return (
    <div>
      <Panel accent="emerald">
        {echoes.length > 0 && (
          <div style={{ marginBottom: 16 }}>
            <p
              style={{
                color: T.faint, fontSize: 12, fontWeight: 700, letterSpacing: "0.1em",
                textTransform: "uppercase", margin: "0 0 8px",
              }}
            >
              What you just told us
            </p>
            <div style={{ display: "grid", gap: 6 }}>
              {echoes.map((e) => (
                <div key={e} className="flex items-start gap-2">
                  <span style={{ width: 3, alignSelf: "stretch", borderRadius: 2, background: T.emLine, flexShrink: 0 }} />
                  <span style={{ color: T.ink, fontSize: 14.5, lineHeight: 1.45 }}>{e}</span>
                </div>
              ))}
            </div>
          </div>
        )}
        <h3 style={{ fontSize: 22, fontWeight: 800, margin: "0 0 10px" }}>{c.head}</h3>
        <p style={{ color: T.mute, fontSize: 15, lineHeight: 1.55, margin: "0 0 16px" }}>{c.body}</p>
        <div className="flex items-baseline gap-2" style={{ flexWrap: "wrap" }}>
          <span style={{ color: T.emBright, fontSize: 24, fontWeight: 800, letterSpacing: "-0.02em" }}>{c.stat}</span>
          <span style={{ color: T.mute, fontSize: 14 }}>{c.statSub}</span>
        </div>
      </Panel>
      <Nav onBack={onBack} onNext={onNext} label={`${cta} →`} />
    </div>
  );
}
