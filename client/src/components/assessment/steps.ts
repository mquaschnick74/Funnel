/* Step order, questions, and copy for the v9 assessment funnel —
   ported verbatim from design/ivasa-assessment-v9.jsx.
   Answer VALUES are unchanged from the previous build, so
   profileComputation.ts and the VASA webhook payload stay intact
   (gender/age simply arrive as 'not_provided'). */

export interface Choice {
  value: string;
  text: string;
}

export interface Question {
  id: string;
  text: string;
  sub?: string;
  choices: Choice[];
}

export type StepType =
  | "landing"
  | "q"
  | "insight"
  | "agent"
  | "breath"
  | "data"
  | "draw"
  | "email"
  | "loading"
  | "results";

export interface Step {
  type: StepType;
  pct: number;
  id?: string;
  cta?: string;
}

function likert(): Choice[] {
  return [
    { value: "strongly_disagree", text: "Strongly disagree" },
    { value: "disagree", text: "Disagree" },
    { value: "neutral", text: "Neutral" },
    { value: "agree", text: "Agree" },
    { value: "strongly_agree", text: "Strongly agree" },
  ];
}

export const QUESTIONS: Question[] = [
  {
    id: "q3",
    text: "Do you feel randomly pulled in two or more directions — desires, other people, vices, ADHD, whatever form it takes?",
    choices: [
      { value: "always", text: "Most days — it's the weather" },
      { value: "sometimes", text: "It comes and goes" },
      { value: "rarely", text: "Rarely — I'm usually clear" },
    ],
  },
  {
    id: "q6",
    text: "In the actual moment you reach for what you want — what happens?",
    choices: [
      { value: "strongly_agree", text: "An equal pull stops me cold" },
      { value: "agree", text: "I move, but something pulls back" },
      { value: "neutral", text: "Depends on the day" },
      { value: "strongly_disagree", text: "Nothing pulls — I reach and I go" },
    ],
  },
  {
    id: "q7",
    text: "Do you live directly in contradiction to something you genuinely believe?",
    choices: [
      { value: "always", text: "Yes — often, and I watch it happen" },
      { value: "sometimes", text: "Sometimes" },
      { value: "rarely", text: "Rarely" },
    ],
  },
  {
    id: "q4",
    text: "There's something you keep doing that you don't want to do. When do you notice?",
    choices: [
      { value: "strongly_agree", text: "After it's already happened. Again." },
      { value: "agree", text: "Before — and I do it anyway" },
      { value: "neutral", text: "It varies" },
      { value: "disagree", text: "Early enough that I can usually stop it" },
      { value: "strongly_disagree", text: "Never — there isn't a thing like that for me" },
    ],
  },
  {
    id: "q5",
    text: "There's something I genuinely want to start. The starting doesn't happen — and I can't locate why.",
    sub: "How true is this for you?",
    choices: likert(),
  },
  {
    id: "q8",
    text: "The same problem keeps finding me — different people, different places, different years. The faces change. The pattern doesn't.",
    sub: "How true is this for you?",
    choices: likert(),
  },
  {
    id: "q9",
    text: "When something happens that you don't want — what happens first?",
    choices: [
      { value: "body_focus", text: "I feel it in my body" },
      { value: "think_through", text: "I need to put it into words before it feels real" },
      { value: "imagine_scenarios", text: "I'm already scenarios ahead — how it plays out, how it looks" },
      { value: "hold_both", text: "I can hold both sides without forcing an answer" },
      { value: "stuck_overwhelmed", text: "Everything stops — I go blank or freeze" },
    ],
  },
];

export const STEPS: Step[] = [
  { type: "landing", pct: 0 },
  { type: "q", id: "q3", pct: 10 },
  { type: "q", id: "q6", pct: 18 },
  { type: "q", id: "q7", pct: 26 },
  { type: "insight", pct: 33, cta: "Keep going" },
  { type: "q", id: "q4", pct: 41 },
  { type: "q", id: "q5", pct: 48 },
  { type: "agent", pct: 54, cta: "Continue, it's got this" },
  { type: "q", id: "q8", pct: 61 },
  { type: "breath", pct: 67, cta: "Keep going" },
  { type: "q", id: "q9", pct: 74 },
  { type: "data", pct: 80, cta: "Makes sense" },
  { type: "draw", pct: 87, cta: "That's where it's headed" },
  { type: "email", pct: 93 },
  { type: "loading", pct: 97 },
  { type: "results", pct: 100 },
];

export const Q_ORDER = STEPS.filter((s) => s.type === "q").map((s) => s.id!);

export function questionOf(id: string): Question {
  return QUESTIONS.find((q) => q.id === id)!;
}
