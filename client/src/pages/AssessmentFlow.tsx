import { useState } from 'react';
import LandingPage from '@/components/LandingPage';
import QuizPage from '@/components/QuizPage';
import LoadingScreen from '@/components/LoadingScreen';
import ResultsPage from '@/components/ResultsPage';
import { computeProfile, type QuestionAnswers, type ProfileResult } from '@/lib/profileComputation';

type FlowStep = 'landing' | 'quiz' | 'loading' | 'results';

export default function AssessmentFlow() {
  const [step, setStep] = useState<FlowStep>('landing');
  const [answers, setAnswers] = useState<QuestionAnswers>({});
  const [profile, setProfile] = useState<ProfileResult | null>(null);

  const handleStart = () => {
    setStep('quiz');
  };

  const handleQuizComplete = (quizAnswers: QuestionAnswers) => {
    setAnswers(quizAnswers);
    setStep('loading');
  };

  const handleLoadingComplete = () => {
    const computedProfile = computeProfile(answers);
    setProfile(computedProfile);
    setStep('results');
  };

  return (
    <>
      {step === 'landing' && <LandingPage onStart={handleStart} />}
      {step === 'quiz' && <QuizPage onComplete={handleQuizComplete} />}
      {step === 'loading' && <LoadingScreen onComplete={handleLoadingComplete} />}
      {step === 'results' && profile && <ResultsPage profile={profile} answers={answers} />}
    </>
  );
}
