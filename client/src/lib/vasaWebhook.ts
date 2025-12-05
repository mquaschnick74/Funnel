import { QuestionAnswers, ProfileResult } from './profileComputation';

export interface VasaWebhookPayload {
  email: string;
  answers: {
    q1?: string;
    q2?: string;
    q3?: string;
    q4?: string;
    q5?: string;
    q6?: string;
    q7?: string;
  };
  cvdc_score: number;
  ibm_score: number;
  thend_detected: boolean | null;
  cvdc_pattern: string;
  ibm_pattern: string;
  synthesis: string;
  age_range: string;
}

export interface VasaWebhookResponse {
  success: boolean;
  message: string;
  userId?: string;
  pendingAssessment?: boolean;
}

/**
 * Sends assessment results to VASA backend webhook
 * @param email User's email address
 * @param answers Raw question answers (q1-q7)
 * @param profile Computed profile result
 * @returns VASA webhook response or null on error
 */
export async function sendAssessmentToVASA(
  email: string,
  answers: QuestionAnswers,
  profile: ProfileResult
): Promise<VasaWebhookResponse | null> {
  try {
    // Prepare payload with new structure
    const payload: VasaWebhookPayload = {
      email,
      answers: {
        q1: answers.q1,
        q2: answers.q2,
        q3: answers.q3,
        q4: answers.q4,
        q5: answers.q5,
        q6: answers.q6,
        q7: answers.q7,
      },
      cvdc_score: profile.cvdc_score,
      ibm_score: profile.ibm_score,
      thend_detected: profile.thend_detected,
      cvdc_pattern: profile.cvdc_pattern,
      ibm_pattern: profile.ibm_pattern,
      synthesis: profile.synthesis,
      age_range: profile.age_range,
    };

    console.log('Sending assessment to VASA:', {
      email,
      cvdc_score: profile.cvdc_score,
      ibm_score: profile.ibm_score,
      thend_detected: profile.thend_detected
    });

    // Send to VASA webhook
    const response = await fetch('https://beta.ivasa.ai/api/assessment/webhook', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      console.error('VASA webhook returned non-OK status:', response.status);
      return null;
    }

    const data: VasaWebhookResponse = await response.json();
    console.log('VASA webhook response:', data);

    // Handle pending assessment case
    if (data.pendingAssessment) {
      console.log('User not yet registered in VASA, storing assessment data in localStorage');
      localStorage.setItem(
        'pendingAssessmentData',
        JSON.stringify({
          answers: payload.answers,
          cvdc_score: profile.cvdc_score,
          ibm_score: profile.ibm_score,
          thend_detected: profile.thend_detected,
          cvdc_pattern: profile.cvdc_pattern,
          ibm_pattern: profile.ibm_pattern,
          synthesis: profile.synthesis,
          age_range: profile.age_range,
        })
      );
    }

    return data;
  } catch (error) {
    console.error('Failed to send assessment to VASA:', error);
    // Don't throw - fail gracefully to not block user experience
    return null;
  }
}
