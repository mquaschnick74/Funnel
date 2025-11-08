export interface QuestionAnswers {
  q1?: string;
  q2?: string;
  q3?: string;
  q4?: string;
  q5?: string;
}

export interface ProfileResult {
  pattern: string;
  metaphor: string;
  description: string;
  register: string;
  cvdcPattern: string;
  chronicity: string;
  restCapacity: string;
  goal: string;
}

const q1Mapping: Record<string, { metaphor: string; register: string; description: string }> = {
  storm_on_horizon: {
    metaphor: 'Storm Watcher',
    register: 'imaginary',
    description: 'constant anticipation - always scanning the horizon for what might go wrong',
  },
  maze_of_mirrors: {
    metaphor: 'Mirror Maze',
    register: 'symbolic',
    description: 'endless self-reflection and questioning, analyzing every angle',
  },
  fog_bank: {
    metaphor: 'Fog Walker',
    register: 'imaginary',
    description: 'uncertainty and the need to see clearly before moving forward',
  },
  empty_plateau: {
    metaphor: 'Empty Plateau',
    register: 'real',
    description: 'disconnection and numbness, a quiet unsettling stillness',
  },
  fractured_ground: {
    metaphor: 'Fractured Ground',
    register: 'symbolic',
    description: 'instability and contradiction, the ground itself feels unreliable',
  },
};

const q2Mapping: Record<string, string> = {
  stand_frozen:
    'you freeze between options, unable to move forward because both paths feel simultaneously right and impossible',
  rush_back:
    'you rush between options frantically, never able to commit because each choice collapses when you choose it',
  build_bridge: 'you try to combine contradictory options, which often creates a new layer of complexity',
  sit_middle: 'you avoid choosing altogether, waiting for certainty that may never come',
  close_eyes: 'you let your body decide, trusting sensation over thought',
  split_yourself: 'you attempt to do everything, trying to walk both paths simultaneously',
};

const q3Mapping: Record<string, string> = {
  almost_constant:
    "For you, anxiety isn't occasional. It's the weather you live in - perpetual storms that shape how you move through your days.",
  sudden_intense:
    'Your anxiety comes in sudden, intense waves - calm one moment, overwhelming the next. The unpredictability itself becomes part of the challenge.',
  persistent_gray:
    'Anxiety for you is a persistent gray overcast - not dramatic, but always there, dulling the color of daily life.',
  unpredictable:
    "The unpredictability of when anxiety will strike creates its own anxiety - you're always braced for what might come.",
  occasional_intense:
    "While not constant, when anxiety does emerge, it's powerful enough that you want to understand and prevent it.",
};

const q4Mapping: Record<string, string> = {
  impossible: 'Rest feels impossible until every task is complete - but the tasks are never truly done.',
  dangerous: "You've learned that stopping means something might go wrong - vigilance feels like safety.",
  guilty: 'Resting carries guilt, as if stillness is somehow selfish or irresponsible.',
  confusing: "You've forgotten how to rest - the skill has atrophied from lack of practice.",
  uncomfortable_doable: 'While uncomfortable, you can sit with stillness - this is actually a strength.',
  body_wont: "Your nervous system won't allow rest - there's too much activation for settling.",
};

const q5Mapping: Record<string, string> = {
  body_calm: 'What you long for most is somatic peace - a body that feels calm and settled.',
  weather: "You want anxiety to become like weather - it comes and passes, but doesn't control you.",
  beside_quiet:
    "You're seeking a different relationship with anxiety - where it walks beside you quietly instead of consuming you.",
  decisions_easy: 'You want to make decisions without the paralysis of panic - where choices feel navigable.',
  breathe: 'Your deepest wish is simple but profound - to breathe freely.',
  all_different: 'You envision comprehensive transformation - where the entire inner landscape feels different.',
};

export function computeProfile(answers: QuestionAnswers): ProfileResult {
  const q1Data = q1Mapping[answers.q1 || 'storm_on_horizon'];
  const pattern = `The ${q1Data.metaphor}`;

  return {
    pattern,
    metaphor: q1Data.metaphor,
    description: q1Data.description,
    register: q1Data.register,
    cvdcPattern: q2Mapping[answers.q2 || 'stand_frozen'],
    chronicity: q3Mapping[answers.q3 || 'almost_constant'],
    restCapacity: q4Mapping[answers.q4 || 'impossible'],
    goal: q5Mapping[answers.q5 || 'body_calm'],
  };
}

export function encodeProfileData(answers: QuestionAnswers, profile: ProfileResult): string {
  const profileData = {
    q1: answers.q1,
    q2: answers.q2,
    q3: answers.q3,
    q4: answers.q4,
    q5: answers.q5,
    pattern: profile.pattern,
    metaphor: profile.metaphor,
    timestamp: Date.now(),
  };

  return btoa(JSON.stringify(profileData));
}
