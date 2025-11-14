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
    text: 'If you think about your inner experience - when it feels difficult or unsettled - it is like...',
    choices: [
      { value: 'storm_on_horizon', text: 'A storm on the horizon - dark clouds gathering, electricity in the air' },
      { value: 'maze_of_mirrors', text: 'A maze of mirrors - endless reflections, hard to know which way is real' },
      { value: 'fog_bank', text: "A fog bank - can't see clearly, unsure what's ahead" },
      { value: 'empty_plateau', text: 'A vast, empty plateau - quiet, still, but somehow unsettling' },
      { value: 'fractured_ground', text: 'Fractured ground - the earth itself seems unstable, constantly shifting' },
    ],
  },
  {
    id: 'q2',
    text: 'When you are caught between competing needs or contradictory feelings, you typically...',
    choices: [
      { value: 'stand_frozen', text: 'Stand frozen between them - unable to choose because both feel right and wrong' },
      {
        value: 'rush_back',
        text: 'Rush down one path, then panic and run back - keep switching, never committing',
      },
      { value: 'build_bridge', text: 'Try to build a bridge between them - maybe you can combine them somehow' },
      { value: 'sit_middle', text: "Sit down in the middle - you'll wait until you know for sure" },
      { value: 'close_eyes', text: 'Close your eyes and let your body choose - see what happens' },
      { value: 'split_yourself', text: "Split yourself in two to walk both - you'll just do everything" },
    ],
  },
  {
    id: 'q3',
    text: 'In your daily life, the difficulty your are experiencing feels...',
    choices: [
      { value: 'almost_constant', text: 'Almost constant - like perpetual storms, the weather is always turbulent' },
      { value: 'sudden_intense', text: 'Sudden and intense - calm, then BOOM, overwhelming, then calm again' },
      {
        value: 'persistent_gray',
        text: "A persistent gray cloud - not dramatic, but the sun hasn't broken through in a while",
      },
      {
        value: 'unpredictable',
        text: "Completely unpredictable - you never know what's coming, which makes it worse",
      },
      {
        value: 'occasional_intense',
        text: 'Occasional but intense - rare, but you want to understand and prevent it',
      },
    ],
  },
  {
    id: 'q4',
    text: 'The idea of truly pausing - of stopping and just being with yourself - feels...',
    choices: [
      { value: 'impossible', text: "Impossible - you can't rest until everything is handled" },
      { value: 'dangerous', text: 'Dangerous - if you stop, something bad will happen' },
      { value: 'guilty', text: 'Guilty - rest feels like failure or selfishness' },
      { value: 'confusing', text: "Confusing - you don't know how to rest anymore" },
      { value: 'uncomfortable_doable', text: 'Uncomfortable, but doable - you can sit with the discomfort' },
      { value: 'body_wont', text: "Your body won't let you - too much activation to settle" },
    ],
  },
  {
    id: 'q5',
    text: 'If things could shift - if your relationship with anxiety could change - you mostly want...',
    choices: [
      { value: 'body_calm', text: 'Your body to feel calm and settled - the ground beneath you steady' },
      { value: 'weather', text: "Emotions to pass through like weather - they come and go, but don't control you" },
      { value: 'beside_quiet', text: 'Anxiety to walk beside you quietly - still there, but not consuming' },
      { value: 'decisions_easy', text: "To make decisions without panic - paths don't feel like traps" },
      { value: 'breathe', text: 'To simply breathe - fundamental, but everything' },
      { value: 'all_different', text: 'All of these - the whole landscape feels different' },
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
