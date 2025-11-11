import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import type { ProfileResult, QuestionAnswers } from '@/lib/profileComputation';
import { encodeProfileData } from '@/lib/profileComputation';

interface ResultsPageProps {
  profile: ProfileResult;
  answers: QuestionAnswers;
}

export default function ResultsPage({ profile, answers }: ResultsPageProps) {
  const [showEmailForm, setShowEmailForm] = useState(false);
  const [email, setEmail] = useState('');
  const [isInIframe, setIsInIframe] = useState(false);

  // Detect if we're in an iframe
  useEffect(() => {
    const inIframe = window.parent !== window;
    setIsInIframe(inIframe);

    // Log for debugging
    console.log('🔍 [QUIZ] iFrame detection:', {
      isInIframe: inIframe,
      parent: window.parent,
      current: window,
      origin: window.location.origin
    });

    // Send ready message if in iframe
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
      // Send message to parent window
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

      // Show feedback to user
      alert('Assessment complete! Redirecting to signup...');
    } else {
      // Direct navigation when not in iframe
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
      // Send message to parent window
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

      // Show feedback
      alert(`Thank you! We'll send your results to ${email}`);
      setShowEmailForm(false);
    } else {
      // Handle directly
      console.log('📧 [QUIZ] Not in iframe, handling locally');
      alert(`Thank you! We'll send your results to ${email}`);
    }
  };

  const lockedSections = [
    {
      title: 'Your Therapeutic Approach',
      teaser: "Discover why traditional 'just relax' advice doesn't work for your pattern - and what actually does.",
      cta: 'Unlock to see your personalized clinical approach',
    },
    {
      title: 'What This Means for Your Journey',
      teaser: 'Learn how your specific pattern affects decision-making, relationships, and your capacity for rest.',
      cta: 'Unlock to understand your deeper patterns',
    },
    {
      title: 'Your Personalized Path Forward',
      teaser: 'See the exact stages of therapeutic progression designed specifically for your inner landscape.',
      cta: 'Unlock your therapeutic roadmap',
    },
    {
      title: 'How iVASA Can Help You',
      teaser: 'Discover how AI-powered therapeutic support addresses your specific pattern - available 24/7 when you need it most.',
      cta: 'Start your journey today',
    },
  ];

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-12">
      <div className="max-w-3xl w-full space-y-8">
        {/* Debug info - remove in production */}
        {process.env.NODE_ENV === 'development' && (
          <div className="bg-yellow-100 text-black p-2 rounded text-xs">
            Debug: isInIframe = {String(isInIframe)}, Origin = {window.location.origin}
          </div>
        )}

        <div className="space-y-6">
          <h1 className="text-4xl font-bold text-foreground" data-testid="heading-pattern">
            Your Pattern: {profile.pattern}
          </h1>

          <Card className="p-8 space-y-4" data-testid="card-visible-profile">
            <p className="text-lg leading-relaxed">
              You experience anxiety as <span className="text-foreground font-medium">{profile.description}</span>.
            </p>
            <p className="text-lg leading-relaxed">
              When facing difficult choices, <span className="text-foreground font-medium">{profile.cvdcPattern}</span>
              . This creates a particular kind of exhaustion - the paralysis of contradictions.
            </p>
            <p className="text-lg leading-relaxed">
              {profile.chronicity}
            </p>
            <p className="text-lg leading-relaxed">
              <span className="text-foreground font-medium">{profile.restCapacity}</span>
            </p>
            <p className="text-lg leading-relaxed">
              <span className="text-foreground font-medium">{profile.goal}</span>
            </p>
          </Card>

          <div className="space-y-4">
            {lockedSections.map((section, index) => (
              <Card
                key={index}
                className="p-8 relative overflow-hidden"
                style={{
                  background: 'linear-gradient(to bottom, rgba(255, 255, 255, 0.02), rgba(255, 255, 255, 0.01))',
                }}
                data-testid={`card-locked-${index}`}
              >
                <div className="relative z-10">
                  <h3 className="text-xl font-semibold mb-3 text-muted-foreground">{section.title}</h3>
                  <p className="text-muted-foreground mb-4 opacity-70">{section.teaser}</p>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 opacity-50">🔒</div>
                    <span className="text-sm text-muted-foreground italic">{section.cta}</span>
                  </div>
                </div>
                <div
                  className="absolute inset-0 backdrop-blur-sm"
                  style={{
                    background:
                      'repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(255, 255, 255, 0.02) 10px, rgba(255, 255, 255, 0.02) 20px)',
                  }}
                />
              </Card>
            ))}
          </div>

          <div className="space-y-6 pt-8">
            <Button
              size="lg"
              className="w-full text-lg py-6"
              onClick={handleSignup}
              data-testid="button-create-account"
              type="button"
            >
              Create Free Account to See Your Complete Profile
            </Button>

            <p className="text-center text-muted-foreground text-sm">Takes 30 seconds • Start your first session today</p>

            <div className="text-center pt-4">
              {!showEmailForm ? (
                <button
                  onClick={() => setShowEmailForm(true)}
                  className="text-sm text-muted-foreground hover:text-foreground underline transition-colors"
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
                    className="w-full"
                    data-testid="input-email"
                  />
                  <Button type="submit" variant="secondary" className="w-full" data-testid="button-submit-email">
                    Send My Results
                  </Button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}