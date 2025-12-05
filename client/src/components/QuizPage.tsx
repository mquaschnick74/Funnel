import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { X } from 'lucide-react';
import type { QuestionAnswers } from '@/lib/profileComputation';
import heroImage from '@assets/generated_images/Hero_landscape_background_image_1a3148b4.png';

interface Question {
  id: string;
  text: string;
  choices: { value: string; text: string }[];
}

const questions: Question[] = [
  {
    id: 'q1',
    text: 'What is your gender?',
    choices: [
      { value: 'male', text: 'Male' },
      { value: 'female', text: 'Female' },
    ],
  },
  {
    id: 'q2',
    text: "What's your age?",
    choices: [
      { value: '18-24', text: '18-24' },
      { value: '25-34', text: '25-34' },
      { value: '35-44', text: '35-44' },
      { value: '45-54', text: '45-54' },
      { value: '55-64', text: '55-64' },
      { value: '65+', text: '65+' },
    ],
  },
  {
    id: 'q3',
    text: 'Do you often feel pulled in opposite directions about what you want?',
    choices: [
      { value: 'always', text: 'Always' },
      { value: 'sometimes', text: 'Sometimes' },
      { value: 'rarely', text: 'Rarely' },
    ],
  },
  {
    id: 'q4',
    text: "I find it difficult to express what I'm really feeling",
    choices: [
      { value: 'strongly_disagree', text: 'Strongly disagree' },
      { value: 'disagree', text: 'Disagree' },
      { value: 'neutral', text: 'Neutral' },
      { value: 'agree', text: 'Agree' },
      { value: 'strongly_agree', text: 'Strongly agree' },
    ],
  },
  {
    id: 'q5',
    text: 'I feel overwhelmed by my daily responsibilities',
    choices: [
      { value: 'strongly_disagree', text: 'Strongly disagree' },
      { value: 'disagree', text: 'Disagree' },
      { value: 'neutral', text: 'Neutral' },
      { value: 'agree', text: 'Agree' },
      { value: 'strongly_agree', text: 'Strongly agree' },
    ],
  },
  {
    id: 'q6',
    text: 'I want to pursue my goals but fear holds me back',
    choices: [
      { value: 'strongly_disagree', text: 'Strongly disagree' },
      { value: 'disagree', text: 'Disagree' },
      { value: 'neutral', text: 'Neutral' },
      { value: 'agree', text: 'Agree' },
      { value: 'strongly_agree', text: 'Strongly agree' },
    ],
  },
  {
    id: 'q7',
    text: "My actions don't always match my values",
    choices: [
      { value: 'always', text: 'Always' },
      { value: 'sometimes', text: 'Sometimes' },
      { value: 'rarely', text: 'Rarely' },
    ],
  },
  {
    id: 'q8',
    text: 'I struggle to maintain consistency in my habits and routines',
    choices: [
      { value: 'strongly_disagree', text: 'Strongly disagree' },
      { value: 'disagree', text: 'Disagree' },
      { value: 'neutral', text: 'Neutral' },
      { value: 'agree', text: 'Agree' },
      { value: 'strongly_agree', text: 'Strongly agree' },
    ],
  },
];

interface QuizPageProps {
  onComplete: (answers: QuestionAnswers) => void;
}

export default function QuizPage({ onComplete }: QuizPageProps) {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<QuestionAnswers>({});
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);

  const question = questions[currentQuestion];
  const progress = ((currentQuestion + 1) / questions.length) * 100;

  const handleAnswerSelect = (value: string) => {
    setSelectedAnswer(value);

    setTimeout(() => {
      const newAnswers = { ...answers, [question.id]: value };
      setAnswers(newAnswers);

      if (currentQuestion < questions.length - 1) {
        setCurrentQuestion(currentQuestion + 1);
        setSelectedAnswer(null);
      } else {
        onComplete(newAnswers);
      }
    }, 300);
  };

  const handleSkip = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setSelectedAnswer(null);
    } else {
      onComplete(answers);
    }
  };

  const handleSkipEntireQuiz = () => {
    // Complete with empty answers - all questions skipped
    onComplete({});
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-12 relative overflow-hidden">
      <div
        className="absolute inset-0 z-0"
        style={{
          backgroundImage: `linear-gradient(to bottom, rgba(15, 15, 26, 0.4), rgba(15, 15, 26, 0.85)), url(${heroImage})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      />

      {/* Skip entire quiz button */}
      <button
        onClick={handleSkipEntireQuiz}
        className="absolute top-4 right-4 z-20 p-2 rounded-full hover:bg-white/10 transition-colors"
        aria-label="Skip entire quiz"
        data-testid="button-skip-quiz"
      >
        <X className="w-6 h-6 text-white" strokeWidth={2} />
      </button>

      <div className="max-w-3xl w-full space-y-8 relative z-10">
        <div className="space-y-4">
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span data-testid="text-brand">iVASA Assessment</span>
            <span data-testid="text-progress">
              Question {currentQuestion + 1} of {questions.length}
            </span>
          </div>
          <Progress value={progress} className="h-1" data-testid="progress-bar" />
        </div>

        <div className="space-y-6 transition-opacity duration-300">
          <h2 className="text-3xl font-semibold text-foreground leading-relaxed" data-testid="text-question">
            {question.text}
          </h2>

          <div className="space-y-3">
            {question.choices.map((choice) => (
              <Card
                key={choice.value}
                className={`p-6 cursor-pointer transition-all hover-elevate active-elevate-2 ${
                  selectedAnswer === choice.value ? 'border-primary' : ''
                }`}
                onClick={() => handleAnswerSelect(choice.value)}
                data-testid={`button-choice-${choice.value}`}
              >
                <p className="text-base leading-relaxed">{choice.text}</p>
              </Card>
            ))}
          </div>

          <div className="flex justify-center pt-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleSkip}
              className="text-muted-foreground"
              data-testid="button-skip"
            >
              Skip this question
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
