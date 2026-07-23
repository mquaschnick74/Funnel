import { useState, useEffect } from 'react';
import { computeProfile, encodeProfileData, type QuestionAnswers } from '@/lib/profileComputation';
import { STEPS, Q_ORDER, questionOf } from '@/components/assessment/steps';
import AssessmentShell from '@/components/assessment/AssessmentShell';
import LandingStep from '@/components/assessment/LandingStep';
import QuestionStep from '@/components/assessment/QuestionStep';
import InsightCard from '@/components/assessment/InsightCard';
import AgentCard from '@/components/assessment/AgentCard';
import BreathPause from '@/components/assessment/BreathPause';
import DataCard from '@/components/assessment/DataCard';
import DrawGoal from '@/components/assessment/DrawGoal';
import EmailStep from '@/components/assessment/EmailStep';
import LoadingStep from '@/components/assessment/LoadingStep';
import ResultsView from '@/components/assessment/ResultsView';

export default function AssessmentFlow() {
  const [idx, setIdx] = useState(0);
  const [answers, setAnswers] = useState<QuestionAnswers>({});
  const [selected, setSelected] = useState<string | null>(null);
  const [drawn, setDrawn] = useState(false);
  const [email, setEmail] = useState('');

  // Signal parent window when app is ready (for iframe embedding)
  useEffect(() => {
    if (window.parent !== window) {
      console.log('[iVASA] App loaded in iframe, signaling parent...');
      window.parent.postMessage({ type: 'IVASA_READY', timestamp: Date.now() }, '*');
    }
  }, []);

  const step = STEPS[idx];
  const next = () => setIdx((i) => Math.min(i + 1, STEPS.length - 1));
  const back = () => setIdx((i) => Math.max(i - 1, 0));

  const pick = (qid: string, value: string) => {
    setSelected(value);
    setTimeout(() => {
      setAnswers((a) => ({ ...a, [qid]: value }));
      setSelected(null);
      next();
    }, 300);
  };
  const skipQuestion = () => { setSelected(null); next(); };
  const skipAll = () => setIdx(STEPS.length - 1);

  // The email collected here feeds the same path as the results page's
  // "email me my results" flow: an ASSESSMENT_COMPLETE / email_capture
  // postMessage to the parent when embedded.
  const handleEmailSubmit = () => {
    if (email && window.parent !== window) {
      const profile = computeProfile(answers);
      const encoded = encodeProfileData(answers, profile);

      console.log('📧 [QUIZ] Email captured at email step:', email);
      console.log('📤 [QUIZ] Sending email capture message to parent');

      const message = {
        type: 'ASSESSMENT_COMPLETE',
        data: {
          encoded,
          profile,
          answers,
          email,
          action: 'email_capture'
        }
      };

      window.parent.postMessage(message, '*');
      console.log('✅ [QUIZ] Email message sent:', message);
    }
    next();
  };

  const restart = () => {
    setAnswers({});
    setDrawn(false);
    setEmail('');
    setIdx(0);
  };

  return (
    <AssessmentShell step={step} stepIndex={idx} onSkipAll={skipAll}>
      {step.type === 'landing' && <LandingStep onStart={next} />}
      {step.type === 'q' && (
        <QuestionStep
          q={questionOf(step.id!)}
          number={Q_ORDER.indexOf(step.id!) + 1}
          total={Q_ORDER.length}
          selected={selected}
          onPick={pick}
          onSkip={skipQuestion}
          onBack={back}
        />
      )}
      {step.type === 'insight' && <InsightCard answers={answers} onNext={next} onBack={back} cta={step.cta!} />}
      {step.type === 'agent' && <AgentCard onNext={next} onBack={back} cta={step.cta!} />}
      {step.type === 'breath' && <BreathPause onNext={next} onBack={back} cta={step.cta!} />}
      {step.type === 'data' && <DataCard a9={answers.q9} onNext={next} onBack={back} cta={step.cta!} />}
      {step.type === 'draw' && <DrawGoal drawn={drawn} setDrawn={setDrawn} onNext={next} onBack={back} cta={step.cta!} />}
      {step.type === 'email' && (
        <EmailStep email={email} setEmail={setEmail} onSubmit={handleEmailSubmit} onSkip={next} onBack={back} />
      )}
      {step.type === 'loading' && <LoadingStep onDone={next} />}
      {step.type === 'results' && (
        <ResultsView profile={computeProfile(answers)} answers={answers} email={email} onRestart={restart} />
      )}
    </AssessmentShell>
  );
}
