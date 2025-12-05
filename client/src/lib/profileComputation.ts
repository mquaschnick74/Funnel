export interface QuestionAnswers {
  q1?: string;  // Always/Sometimes/Rarely (CVDC - Contradictory Desires)
  q2?: string;  // 5-point Likert (IBM - Emotional Expression)
  q3?: string;  // 5-point Likert (IBM - Overwhelm)
  q4?: string;  // 5-point Likert (CVDC - Fear vs Ambition)
  q5?: string;  // Always/Sometimes/Rarely (IBM - Values Alignment)
  q6?: string;  // 5-point Likert (IBM - Consistency)
  q7?: string;  // Age range (Demographic)
}

export interface ProfileResult {
  cvdc_score: number;
  ibm_score: number;
  thend_detected: boolean | null;
  cvdc_pattern: string;
  ibm_pattern: string;
  synthesis: string;
  age_range: string;
}

// Q1 scoring: Always/Sometimes/Rarely
function scoreQ1(answer: string | undefined): number {
  switch (answer) {
    case 'always': return 2;
    case 'sometimes': return 1;
    case 'rarely': return 0;
    default: return 0;
  }
}

// Q4 scoring: 5-point Likert for CVDC
function scoreQ4(answer: string | undefined): number {
  switch (answer) {
    case 'strongly_agree':
    case 'agree': return 2;
    case 'neutral': return 1;
    case 'disagree':
    case 'strongly_disagree': return 0;
    default: return 0;
  }
}

// Q5 scoring: Always/Sometimes/Rarely
function scoreQ5(answer: string | undefined): number {
  switch (answer) {
    case 'always': return 2;
    case 'sometimes': return 1;
    case 'rarely': return 0;
    default: return 0;
  }
}

// IBM scoring: 5-point Likert (Q2, Q3, Q6)
// Raw: Strongly agree=2, Agree=1, Neutral=0, Disagree=-1, Strongly disagree=-2
function scoreIBMQuestion(answer: string | undefined): number {
  switch (answer) {
    case 'strongly_agree': return 2;
    case 'agree': return 1;
    case 'neutral': return 0;
    case 'disagree': return -1;
    case 'strongly_disagree': return -2;
    default: return 0;
  }
}

// Calculate CVDC score (0-6)
function calculateCVDC(answers: QuestionAnswers): number {
  const q1Score = scoreQ1(answers.q1);
  const q4Score = scoreQ4(answers.q4);
  const q5Score = scoreQ5(answers.q5);
  return q1Score + q4Score + q5Score;
}

// Calculate IBM score (normalized 0-6)
// Raw range: -6 to 6, normalized to 0-6
function calculateIBM(answers: QuestionAnswers): number {
  const q2Score = scoreIBMQuestion(answers.q2);
  const q3Score = scoreIBMQuestion(answers.q3);
  const q6Score = scoreIBMQuestion(answers.q6);
  const rawScore = q2Score + q3Score + q6Score; // -6 to 6
  // Normalize: add 6 to shift range from -6..6 to 0..12, then divide by 2
  return Math.round((rawScore + 6) / 2);
}

// Detect Thend pattern
function detectThend(cvdc: number, ibm: number): boolean | null {
  if (cvdc >= 4 && ibm >= 3) {
    // Thend Absent - contradiction with behavioral collapse
    return false;
  } else if (cvdc >= 4 && ibm < 3) {
    // Thend Present - can hold contradiction without behavioral collapse
    return true;
  }
  // No clear indicator
  return null;
}

// Generate CVDC pattern description
function getCVDCPattern(score: number): string {
  if (score >= 4) {
    return 'Strong pull between opposing desires';
  } else if (score >= 2) {
    return 'Moderate internal conflict about direction';
  } else {
    return 'Clear sense of what you want';
  }
}

// Generate IBM pattern description
function getIBMPattern(score: number): string {
  if (score >= 4) {
    return 'Gap between intentions and actions';
  } else if (score >= 2) {
    return 'Some inconsistency in following through';
  } else {
    return 'Generally consistent follow-through';
  }
}

// Generate synthesis based on CVDC and IBM scores
function generateSynthesis(cvdc: number, ibm: number): string {
  const highCVDC = cvdc >= 4;
  const lowCVDC = cvdc <= 2;
  const highIBM = ibm >= 3;
  const lowIBM = ibm <= 2;

  if (highCVDC && highIBM) {
    return "You experience a strong pull between opposing desires, and this inner conflict shows up as inconsistency in your daily life. The push-pull creates stress that affects multiple areas, making it hard to maintain steady routines.";
  } else if (highCVDC && lowIBM) {
    return "You feel pulled in opposite directions about what you want, but you have capacity to hold this complexity without falling apart. This is actually a strength - you can sit with tension rather than forcing quick resolution.";
  } else if (lowCVDC && highIBM) {
    return "There's a gap between your intentions and actions that makes it hard to maintain consistency. The struggle isn't about conflicting desires - it's about following through on what you already know you want.";
  } else if (lowCVDC && lowIBM) {
    return "You have clarity about what you want and generally follow through on your intentions. The challenges you face may be more situational than pattern-based.";
  } else {
    // Middle ground - moderate on both
    return "You experience some internal tension about direction, and sometimes find it challenging to stay consistent. Understanding these patterns can help you work with them more effectively.";
  }
}

export function computeProfile(answers: QuestionAnswers): ProfileResult {
  const cvdc_score = calculateCVDC(answers);
  const ibm_score = calculateIBM(answers);
  const thend_detected = detectThend(cvdc_score, ibm_score);

  return {
    cvdc_score,
    ibm_score,
    thend_detected,
    cvdc_pattern: getCVDCPattern(cvdc_score),
    ibm_pattern: getIBMPattern(ibm_score),
    synthesis: generateSynthesis(cvdc_score, ibm_score),
    age_range: answers.q7 || 'not_provided',
  };
}

export function encodeProfileData(answers: QuestionAnswers, profile: ProfileResult): string {
  const profileData = {
    q1: answers.q1,
    q2: answers.q2,
    q3: answers.q3,
    q4: answers.q4,
    q5: answers.q5,
    q6: answers.q6,
    q7: answers.q7,
    cvdc_score: profile.cvdc_score,
    ibm_score: profile.ibm_score,
    thend_detected: profile.thend_detected,
    timestamp: Date.now(),
  };

  return btoa(JSON.stringify(profileData));
}
