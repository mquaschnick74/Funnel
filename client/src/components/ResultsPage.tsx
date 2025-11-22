import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import type { ProfileResult, QuestionAnswers } from '@/lib/profileComputation';
import { encodeProfileData } from '@/lib/profileComputation';
import { ChevronRight, Sparkles } from 'lucide-react';

interface ResultsPageProps {
  profile: ProfileResult;
  answers: QuestionAnswers;
}

export default function ResultsPage({ profile, answers }: ResultsPageProps) {
  const [showEmailForm, setShowEmailForm] = useState(false);
  const [email, setEmail] = useState('');
  const [isInIframe, setIsInIframe] = useState(false);

  // Check if quiz was entirely skipped (no answers provided)
  const isQuizSkipped = !answers.q1 && !answers.q2 && !answers.q3 && !answers.q4 && !answers.q5;

  // Detect if we're in an iframe
  useEffect(() => {
    const inIframe = window.parent !== window;
    setIsInIframe(inIframe);

    console.log('🔍 [QUIZ] iFrame detection:', {
      isInIframe: inIframe,
      parent: window.parent,
      current: window,
      origin: window.location.origin
    });

    if (inIframe) {
      console.log('📤 [QUIZ] Sending IFRAME_READY message');
      window.parent.postMessage({ type: 'IFRAME_READY' }, '*');
    }
  }, []);

  const handleSignup = () => {
    const encoded = encodeProfileData(answers, profile);

    console.log('🚀 [QUIZ] Signup button clicked');
    console.log('🚀 [QUIZ] isInIframe:', isInIframe);
    console.log('🚀 [QUIZ] Data:', { encoded, profile, answers });

    if (isInIframe) {
      console.log('📤 [QUIZ] Sending ASSESSMENT_COMPLETE message to parent');

      const message = {
        type: 'ASSESSMENT_COMPLETE',
        data: {
          encoded,
          profile,
          answers,
          action: 'signup'
        }
      };

      window.parent.postMessage(message, '*');
      console.log('✅ [QUIZ] Message sent:', message);

      alert('Assessment complete! Redirecting to signup...');
    } else {
      console.log('🔗 [QUIZ] Not in iframe, navigating directly');
      const signupUrl = `https://beta.ivasa.ai/signup?source=assessment&profile=${encoded}`;
      window.location.href = signupUrl;
    }
  };

  const handleEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    console.log('📧 [QUIZ] Email form submitted');
    console.log('📧 [QUIZ] Email:', email);
    console.log('📧 [QUIZ] isInIframe:', isInIframe);

    if (!email) {
      alert('Please enter your email address');
      return;
    }

    if (isInIframe) {
      const encoded = encodeProfileData(answers, profile);

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

      alert(`Thank you! We'll send your results to ${email}`);
      setShowEmailForm(false);
    } else {
      console.log('📧 [QUIZ] Not in iframe, handling locally');
      alert(`Thank you! We'll send your results to ${email}`);
    }
  };

  const guidePreviews = [
    {
      name: 'Sarah',
      title: 'Your Emotional Support Guide',
      description: "Discover how Sarah's warm, nurturing approach helps you explore feelings without judgment, building trust through compassionate listening.",
      image: '/agents/sarah.jpg',
      gradient: 'from-purple-900/20 via-purple-800/10 to-transparent'
    },
    {
      name: 'Mathew',
      title: 'Your Deep Analysis Guide',
      description: "Learn how Mathew's analytical approach uncovers root causes and unconscious patterns, facilitating profound insights that lead to lasting transformation.",
      image: '/agents/mathew.jpg',
      gradient: 'from-emerald-900/20 via-emerald-800/10 to-transparent'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-emerald-950/10 flex flex-col items-center justify-center px-4 py-12">
      <div className="max-w-4xl w-full space-y-12">
        {/* Debug info - remove in production */}
        {process.env.NODE_ENV === 'development' && (
          <div className="bg-yellow-100 text-black p-2 rounded text-xs">
            Debug: isInIframe = {String(isInIframe)}, Origin = {window.location.origin}
          </div>
        )}

        {isQuizSkipped ? (
          /* Simplified view when quiz is skipped */
          <>
            {/* Header Section for Skipped Quiz */}
            <div className="text-center space-y-4">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-sm font-medium mb-4">
                <Sparkles className="w-4 h-4" />
                Your Journey Awaits
              </div>
              <h1
                className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-emerald-400 via-emerald-300 to-emerald-500 bg-clip-text text-transparent leading-tight"
                data-testid="heading-pattern"
              >
                Begin Your Journey
              </h1>
            </div>

            {/* Simple Message Card for Skipped Quiz */}
            <Card
              className="relative overflow-hidden border-emerald-500/20 bg-gradient-to-br from-card via-card to-emerald-950/10"
              data-testid="card-visible-profile"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 via-transparent to-transparent pointer-events-none" />
              <div className="relative p-8 md:p-10">
                <p className="text-lg md:text-xl leading-relaxed text-center">
                  Your journey is unique, and so is your path forward. Let our AI therapeutic guides help you discover your inner landscape through deeply meaningful conversation.
                </p>
              </div>
            </Card>
          </>
        ) : (
          /* Full enhanced view when quiz is completed */
          <>
            {/* Header Section - More Prominent */}
            <div className="text-center space-y-4">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-sm font-medium mb-4">
                <Sparkles className="w-4 h-4" />
                Assessment Complete
              </div>
              <h1
                className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-emerald-400 via-emerald-300 to-emerald-500 bg-clip-text text-transparent leading-tight"
                data-testid="heading-pattern"
              >
                Your Pattern: {profile.pattern}
              </h1>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Here's what we discovered about your inner landscape
              </p>
            </div>

            {/* Main Profile Card - Enhanced with gradient */}
            <Card
              className="relative overflow-hidden border-emerald-500/20 bg-gradient-to-br from-card via-card to-emerald-950/10"
              data-testid="card-visible-profile"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 via-transparent to-transparent pointer-events-none" />

              <div className="relative p-8 md:p-10 space-y-6">
                <div className="flex items-start gap-3 group">
                  <ChevronRight className="w-6 h-6 text-emerald-400 flex-shrink-0 mt-1 group-hover:translate-x-1 transition-transform" />
                  <p className="text-lg md:text-xl leading-relaxed">
                    You experience anxiety as <span className="text-emerald-400 font-semibold">{profile.description}</span>.
                  </p>
                </div>

                <div className="flex items-start gap-3 group">
                  <ChevronRight className="w-6 h-6 text-emerald-400 flex-shrink-0 mt-1 group-hover:translate-x-1 transition-transform" />
                  <p className="text-lg md:text-xl leading-relaxed">
                    When facing difficult choices, <span className="text-emerald-400 font-semibold">{profile.cvdcPattern}</span>. This creates a particular kind of exhaustion - the paralysis of contradictions.
                  </p>
                </div>

                <div className="flex items-start gap-3 group">
                  <ChevronRight className="w-6 h-6 text-emerald-400 flex-shrink-0 mt-1 group-hover:translate-x-1 transition-transform" />
                  <p className="text-lg md:text-xl leading-relaxed">
                    {profile.chronicity}
                  </p>
                </div>

                <div className="flex items-start gap-3 group">
                  <ChevronRight className="w-6 h-6 text-emerald-400 flex-shrink-0 mt-1 group-hover:translate-x-1 transition-transform" />
                  <p className="text-lg md:text-xl leading-relaxed">
                    <span className="text-emerald-400 font-semibold">{profile.restCapacity}</span>
                  </p>
                </div>

                <div className="flex items-start gap-3 group">
                  <ChevronRight className="w-6 h-6 text-emerald-400 flex-shrink-0 mt-1 group-hover:translate-x-1 transition-transform" />
                  <p className="text-lg md:text-xl leading-relaxed">
                    <span className="text-emerald-400 font-semibold">{profile.goal}</span>
                  </p>
                </div>
              </div>
            </Card>
          </>
        )}

        {/* Guide Preview Section - Shown for both skipped and completed */}
        <div className="space-y-6">
          <div className="text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-3">
              Meet Your AI Therapeutic Guides
            </h2>
            <p className="text-lg text-muted-foreground">
              Create a free account to start your first session with either guide
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {guidePreviews.map((guide, index) => (
              <Card
                key={index}
                className="group relative overflow-hidden border-emerald-500/20 hover:border-emerald-500/40 transition-all duration-300 cursor-pointer hover:scale-[1.02]"
                data-testid={`card-guide-${index}`}
              >
                {/* Background Image */}
                <div className="absolute inset-0">
                  <img
                    src={guide.image}
                    alt={guide.name}
                    className="w-full h-full object-cover opacity-40 group-hover:opacity-50 transition-opacity duration-300"
                  />
                  <div className={`absolute inset-0 bg-gradient-to-t ${guide.gradient}`} />
                  <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-transparent" />
                </div>

                {/* Content */}
                <div className="relative p-8 min-h-[280px] flex flex-col justify-end">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-medium mb-3 w-fit">
                    AI Guide
                  </div>

                  <h3 className="text-2xl font-bold text-foreground mb-2 flex items-center gap-2">
                    {guide.name}
                    <ChevronRight className="w-5 h-5 text-emerald-400 group-hover:translate-x-1 transition-transform" />
                  </h3>

                  <p className="text-emerald-400 font-semibold mb-3">
                    {guide.title}
                  </p>

                  <p className="text-muted-foreground leading-relaxed">
                    {guide.description}
                  </p>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* CTA Section - More Prominent */}
        <div className="space-y-6 pt-4">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/20 via-emerald-400/20 to-emerald-500/20 blur-3xl opacity-30" />
            <Button
              size="lg"
              className="relative w-full text-sm md:text-lg py-7 bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 shadow-lg shadow-emerald-500/25 border border-emerald-400/30 whitespace-normal md:whitespace-nowrap"
              onClick={handleSignup}
              data-testid="button-create-account"
              type="button"
            >
              <span className="flex items-center gap-2">
                Create Free Account to See Your Complete Profile
                <ChevronRight className="w-5 h-5" />
              </span>
            </Button>
          </div>

          <div className="flex items-center justify-center gap-6 text-sm text-muted-foreground">
            <span className="flex items-center gap-2">
              <svg className="w-4 h-4 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Takes 30 seconds
            </span>
            <span className="flex items-center gap-2">
              <svg className="w-4 h-4 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Start your first session today
            </span>
          </div>

          <div className="text-center pt-4">
            {!showEmailForm ? (
              <button
                onClick={() => setShowEmailForm(true)}
                className="text-sm text-muted-foreground hover:text-emerald-400 underline transition-colors"
                data-testid="button-email-instead"
                type="button"
              >
                Maybe Later - Just Email Me My Results
              </button>
            ) : (
              <form onSubmit={handleEmailSubmit} className="max-w-md mx-auto space-y-3">
                <Input
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full border-emerald-500/30 focus:border-emerald-500"
                  data-testid="input-email"
                />
                <Button
                  type="submit"
                  variant="secondary"
                  className="w-full border-emerald-500/30 hover:border-emerald-500"
                  data-testid="button-submit-email"
                >
                  Send My Results
                </Button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
