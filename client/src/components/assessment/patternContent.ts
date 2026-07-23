/* Result-screen copy for the v9 assessment funnel — ported verbatim from
   design/ivasa-assessment-v9.jsx. This is display copy only: the webhook
   payload keeps using ProfileResult from profileComputation.ts, whose
   scoring thresholds these helpers mirror (cvdc_score 0–6, ibm_score 0–6). */

export function synthesisCopy(cvdc: number, ibm: number): string {
  const hiC = cvdc >= 4, loC = cvdc <= 2, hiI = ibm >= 3, loI = ibm <= 2;
  if (hiC && hiI)
    return "You feel a strong pull between opposing wants, and that inner conflict shows up as inconsistency in daily life. The push-pull creates stress across several areas, which makes steady routines hard to hold.";
  if (hiC && loI)
    return "You feel pulled in opposite directions about what you want — but you can hold that complexity without falling apart. That's a strength: you can sit with tension instead of forcing a quick answer.";
  if (loC && hiI)
    return "There's a gap between your intentions and your actions. The struggle isn't conflicting desires — it's following through on what you already know you want.";
  if (loC && loI)
    return "You're clear about what you want and you generally follow through. The challenges you face may be more situational than pattern-based.";
  return "You carry some inner tension about direction, and consistency sometimes slips. Seeing the shape of that pattern is the first step to working with it.";
}

export function patternName(cvdc: number, ibm: number): string {
  const hiC = cvdc >= 4, loC = cvdc <= 2, hiI = ibm >= 3, loI = ibm <= 2;
  if (hiC && hiI) return "The Storm Watcher";
  if (hiC && loI) return "The Deep Current";
  if (loC && hiI) return "The Stalled Start";
  if (loC && loI) return "The Steady Course";
  return "The Crossroads";
}

export const REGISTER_LINE: Record<string, string> = {
  real: "Your body usually answers first — the reaction arrives before a single thought does.",
  symbolic: "Nothing quite lands for you until it has words. The name has to come first.",
  imaginary: "You live scenarios ahead — the imagined version often arrives before the actual one.",
  integrated: "You can hold both sides of a conflict without forcing an answer. That's rarer than you think.",
  fragmented: "When both sides pull at once, everything stops. That freeze is information, not failure.",
  unknown: "",
};

/* per-pattern content for the UNLOCKED result cards */
export const PATTERN_DETAIL: Record<string, { costs: string; holds: string }> = {
  "The Storm Watcher": {
    costs: "Decisions take twice the energy they should, because every choice is really two fights — the choice itself, and the pull underneath it. By evening the tank is empty, and the routines that would help are the first thing to go.",
    holds: "The pull holds because both wants are genuine — you can't starve one side without losing something real. It loosens when both sides get named and held at the same time, instead of taking turns winning. That's precise work, not willpower.",
  },
  "The Deep Current": {
    costs: "From the outside, you function. Inside, holding two directions at once is quiet, constant work — and because nobody sees the effort, nobody spells you. The cost isn't chaos. It's a tiredness that doesn't match your circumstances.",
    holds: "It holds because holding is what you're good at — the tension never gets loud enough to force the question. It loosens when the two wants are put in the same frame on purpose, where each can finally say what it's protecting.",
  },
  "The Stalled Start": {
    costs: "You pay in mornings. The thing you want sits there — real, and unstarted — and every day it doesn't begin costs a little more belief that it will. It reads as a discipline problem. It isn't one.",
    holds: "It holds because the block isn't where you've been looking. The wanting is settled, so pushing the wanting harder changes nothing. It loosens when the moment of starting itself gets slowed down and looked at — what actually happens in the second before the beginning doesn't happen.",
  },
  "The Steady Course": {
    costs: "Not much, day to day — which is exactly why the situational stuff, when it hits, can feel so disorienting. You're used to the machine working.",
    holds: "What you have holds because it's real. The work here isn't repair — it's range: knowing your own pattern well enough to keep it when the ground shifts.",
  },
  "The Crossroads": {
    costs: "Some days run clean, some days drag — and the inconsistency itself becomes a second problem, because you can't predict which day you're getting.",
    holds: "It holds because it's intermittent — a pattern that only shows up sometimes is the hardest kind to catch. It loosens when the showing-up gets mapped: where, when, around what.",
  },
};
