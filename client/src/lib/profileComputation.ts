export interface QuestionAnswers {
  q1?: string;  // Gender (male/female/non_binary)
  q2?: string;  // Age range
  q3?: string;  // Always/Sometimes/Rarely (CVDC - Contradictory Desires)
  q4?: string;  // 5-point Likert (IBM - Emotional Expression)
  q5?: string;  // 5-point Likert (IBM - Overwhelm)
  q6?: string;  // 5-point Likert (CVDC - Fear vs Ambition)
  q7?: string;  // Always/Sometimes/Rarely (IBM - Values Alignment)
  q8?: string;  // 5-point Likert (IBM - Consistency)
  q9?: string;  // Register Detection / Thend Enhancement
}

export interface ProfileResult {
  cvdc_score: number;
  ibm_score: number;
  thend_detected: boolean | null;
  register: string;  // 'real', 'symbolic', 'imaginary', 'integrated', 'fragmented', 'unknown'
  cvdc_pattern: string;
  ibm_pattern: string;
  synthesis: string;
  gender: string;
  age_range: string;
}

// Q3 scoring: Always/Sometimes/Rarely (CVDC - Contradictory Desires)
function scoreQ3(answer: string | undefined): number {
  switch (answer) {
    case 'always': return 2;
    case 'sometimes': return 1;
    case 'rarely': return 0;
    default: return 0;
  }
}

// Q6 scoring: 5-point Likert for CVDC (Fear vs Ambition)
function scoreQ6(answer: string | undefined): number {
  switch (answer) {
    case 'strongly_agree':
    case 'agree': return 2;
    case 'neutral': return 1;
    case 'disagree':
    case 'strongly_disagree': return 0;
    default: return 0;
  }
}

// Q7 scoring: Always/Sometimes/Rarely (Values Alignment - contributes to CVDC)
function scoreQ7(answer: string | undefined): number {
  switch (answer) {
    case 'always': return 2;
    case 'sometimes': return 1;
    case 'rarely': return 0;
    default: return 0;
  }
}

// IBM scoring: 5-point Likert (Q4, Q5, Q8)
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

// Calculate CVDC score (0-6) from Q3, Q6, Q7
function calculateCVDC(answers: QuestionAnswers): number {
  const q3Score = scoreQ3(answers.q3);
  const q6Score = scoreQ6(answers.q6);
  const q7Score = scoreQ7(answers.q7);
  return q3Score + q6Score + q7Score;
}

// Calculate IBM score (normalized 0-6) from Q4, Q5, Q8
// Raw range: -6 to 6, normalized to 0-6
function calculateIBM(answers: QuestionAnswers): number {
  const q4Score = scoreIBMQuestion(answers.q4);
  const q5Score = scoreIBMQuestion(answers.q5);
  const q8Score = scoreIBMQuestion(answers.q8);
  const rawScore = q4Score + q5Score + q8Score; // -6 to 6
  // Normalize: add 6 to shift range from -6..6 to 0..12, then divide by 2
  return Math.round((rawScore + 6) / 2);
}

// Detect register from Q9 answer
function detectRegister(q9Answer?: string): string {
  if (!q9Answer) return 'unknown';

  const registerMap: Record<string, string> = {
    'body_focus': 'real',
    'think_through': 'symbolic',
    'imagine_scenarios': 'imaginary',
    'hold_both': 'integrated',
    'stuck_overwhelmed': 'fragmented'
  };

  return registerMap[q9Answer] || 'unknown';
}

// Detect Thend pattern with Q9 contribution
function detectThend(cvdc: number, ibm: number, q9Answer?: string): boolean | null {
  let thendScore = 0;

  // Original CVDC/IBM logic
  if (cvdc >= 4 && ibm < 3) {
    thendScore += 1;  // High CVDC, low IBM = potential Thend
  }
  if (cvdc >= 4 && ibm >= 3) {
    thendScore -= 1;  // High CVDC, high IBM = collapse
  }

  // Q9 contribution (register-based Thend indicator)
  if (q9Answer) {
    const q9Weights: Record<string, number> = {
      'body_focus': 0.5,           // Real register awareness
      'think_through': 0,          // Neutral
      'imagine_scenarios': -0.5,   // Imaginary avoidance
      'hold_both': 1.5,            // Direct Thend indicator
      'stuck_overwhelmed': -1      // Collapse
    };

    thendScore += q9Weights[q9Answer] || 0;
  }

  // Final determination
  if (thendScore >= 1) return true;   // Thend present
  if (thendScore <= -1) return false; // Thend absent
  return null; // Unclear
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
  const register = detectRegister(answers.q9);
  const thend_detected = detectThend(cvdc_score, ibm_score, answers.q9);

  return {
    cvdc_score,
    ibm_score,
    thend_detected,
    register,
    cvdc_pattern: getCVDCPattern(cvdc_score),
    ibm_pattern: getIBMPattern(ibm_score),
    synthesis: generateSynthesis(cvdc_score, ibm_score),
    gender: answers.q1 || 'not_provided',
    age_range: answers.q2 || 'not_provided',
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
    q8: answers.q8,
    q9: answers.q9,
    cvdc_score: profile.cvdc_score,
    ibm_score: profile.ibm_score,
    thend_detected: profile.thend_detected,
    register: profile.register,
    cvdc_pattern: profile.cvdc_pattern,
    ibm_pattern: profile.ibm_pattern,
    synthesis: profile.synthesis,
    gender: profile.gender,
    age_range: profile.age_range,
    timestamp: Date.now(),
  };

  return btoa(JSON.stringify(profileData));
}
