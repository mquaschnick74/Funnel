import { QuestionAnswers, ProfileResult } from './profileComputation';

export interface VasaWebhookPayload {
  email: string;
  responses: {
    question1: string;
    question2: string;
    question3: string;
    question4: string;
    question5: string;
  };
  landscapeType?: string;
  insights?: string;
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
 * @param answers Raw question answers (q1-q5)
 * @param profile Computed profile result
 * @returns VASA webhook response or null on error
 */
export async function sendAssessmentToVASA(
  email: string,
  answers: QuestionAnswers,
  profile: ProfileResult
): Promise<VasaWebhookResponse | null> {
  try {
    // Convert answers to webhook format
    const responses = {
      question1: answers.q1 || '',
      question2: answers.q2 || '',
      question3: answers.q3 || '',
      question4: answers.q4 || '',
      question5: answers.q5 || '',
    };

    // Prepare payload
    const payload: VasaWebhookPayload = {
      email,
      responses,
      landscapeType: profile.pattern, // e.g., "The Storm Watcher"
      insights: `${profile.description}\n\nCVDC Pattern: ${profile.cvdcPattern}\nChronicity: ${profile.chronicity}\nRest Capacity: ${profile.restCapacity}\nGoal: ${profile.goal}`,
    };

    console.log('Sending assessment to VASA:', { email, landscapeType: profile.pattern });

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
          responses,
          landscapeType: profile.pattern,
          insights: payload.insights,
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
