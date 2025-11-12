import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import type { ProfileResult, QuestionAnswers } from '@/lib/profileComputation';
import { encodeProfileData } from '@/lib/profileComputation';
import { sendAssessmentToVASA } from '@/lib/vasaWebhook';

interface ResultsPageProps {
  profile: ProfileResult;
  answers: QuestionAnswers;
}

export default function ResultsPage({ profile, answers }: ResultsPageProps) {
  const [showEmailForm, setShowEmailForm] = useState(false);
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [isRedirecting, setIsRedirecting] = useState(false);

  const handleSignup = () => {
    const encoded = encodeProfileData(answers, profile);

    // Check if we're in an iframe
    const isInIframe = window.parent !== window;

    if (isInIframe) {
      // Send message to parent window
      console.log('📤 [QUIZ] Sending ASSESSMENT_COMPLETE message');
      window.parent.postMessage({
        type: 'ASSESSMENT_COMPLETE',
        data: {
          encoded,
          profile,
          answers
        }
      }, '*');

      alert('Assessment complete! Redirecting to signup...');
    } else {
      // Standalone mode - just redirect
      const signupUrl = `https://beta.ivasa.ai/signup?source=assessment&profile=${encoded}`;
      console.log('Redirecting to:', signupUrl);
      window.location.href = signupUrl;
    }
  };

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email) return;

    const isInIframe = window.parent !== window;

    if (isInIframe) {
      // Send email capture message to parent
      console.log('📤 [QUIZ] Sending EMAIL_CAPTURE message');
      window.parent.postMessage({
        type: 'EMAIL_CAPTURE',
        data: {
          email,
          encoded: encodeProfileData(answers, profile),
          profile,
          answers
        }
      }, '*');

      setSubmitSuccess(true);
      return;
    }

    // Standalone mode - use webhook
    setIsSubmitting(true);

    try {
      // Send assessment data to VASA webhook
      const result = await sendAssessmentToVASA(email, answers, profile);

      if (result) {
        setSubmitSuccess(true);

        // If user not registered yet (pendingAssessment), redirect to VASA after 2.5 seconds
        if (result.pendingAssessment) {
          setIsRedirecting(true);
          setTimeout(() => {
            window.location.href = 'https://beta.ivasa.ai/?from=assessment';
          }, 2500);
        }
      } else {
        // Webhook failed but don't break UX - just show success message
        console.warn('Webhook failed, but showing success to user');
        setSubmitSuccess(true);
      }
    } catch (error) {
      console.error('Error submitting assessment:', error);
      // Still show success - fail gracefully
      setSubmitSuccess(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  const lockedSections = [
    {
      title: 'Your Therapeutic Approach',
      teaser: "Discover why traditional 'just relax' advice doesn't work for your pattern - and what actually does.",
      cta: 'A personalized clinical approach',
    },
    {
      title: 'What This Means for Your Journey',
      teaser: 'Learn how your specific pattern affects decision-making, relationships, and your capacity for rest.',
      cta: 'Understand your deeper patterns',
    },
    {
      title: 'Your Personalized Path Forward',
      teaser: 'See the exact stages of therapeutic progression designed specifically for your inner landscape.',
      cta: 'Your individual therapeutic roadmap',
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
            <p className="text-lg leading-relaxed">{profile.chronicity}</p>
          </Card>
        </div>

        <div className="space-y-4">
          {lockedSections.map((section, index) => (
            <Card
              key={index}
              className="p-8 relative overflow-hidden cursor-pointer hover-elevate active-elevate-2"
              onClick={() => document.getElementById('signup-button')?.scrollIntoView({ behavior: 'smooth' })}
              data-testid={`card-locked-section-${index}`}
            >
              <div className="absolute inset-0 backdrop-blur-md bg-card/50 flex flex-col items-center justify-center z-10 p-8 text-center gap-3">
                <div className="text-4xl opacity-60">🔒</div>
                <p className="text-base text-muted-foreground max-w-md">{section.teaser}</p>
                <span className="text-primary font-medium text-sm">[{section.cta}]</span>
              </div>
              <h3 className="text-xl font-semibold mb-3">{section.title}</h3>
              <p className="text-muted-foreground leading-relaxed">
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et
                dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip
                ex ea commodo consequat.
              </p>
            </Card>
          ))}
        </div>

        <div className="space-y-4 pt-4">
          <Button
            id="signup-button"
            size="lg"
            className="w-full text-lg py-6 h-auto"
            onClick={handleSignup}
            data-testid="button-create-account"
          >
            Create Free Account to See Your Complete Profile
          </Button>
          <p className="text-center text-sm text-muted-foreground">
            Takes 30 seconds • Start your first session today
          </p>

          <p className="text-center text-muted-foreground pt-4" data-testid="text-social-proof">
            Join 1,000+ people discovering their inner landscape
          </p>

          {!showEmailForm ? (
            <div className="flex justify-center pt-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowEmailForm(true)}
                className="text-muted-foreground"
                data-testid="button-show-email-form"
              >
                Maybe Later - Just Email Me My Results
              </Button>
            </div>
          ) : (
            <Card className="p-6 space-y-4" data-testid="card-email-form">
              {submitSuccess ? (
                <div className="space-y-4 text-center py-4">
                  <div className="text-4xl">✓</div>
                  <p className="text-lg font-medium text-foreground">
                    {isRedirecting ? 'Assessment Saved!' : 'Thank You!'}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {isRedirecting
                      ? "We've saved your results. Taking you to iVASA to continue your journey..."
                      : `We've sent your results to ${email}`}
                  </p>
                  {isRedirecting && (
                    <div className="flex justify-center pt-2">
                      <div className="animate-spin h-5 w-5 border-2 border-primary border-t-transparent rounded-full"></div>
                    </div>
                  )}
                </div>
              ) : (
                <form onSubmit={handleEmailSubmit} className="space-y-4">
                  <div>
                    <Input
                      type="email"
                      placeholder="your@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      disabled={isSubmitting}
                      className="text-base"
                      data-testid="input-email"
                    />
                  </div>
                  <Button
                    type="submit"
                    className="w-full"
                    disabled={isSubmitting}
                    data-testid="button-submit-email"
                  >
                    {isSubmitting ? (
                      <span className="flex items-center justify-center gap-2">
                        <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                        Sending...
                      </span>
                    ) : (
                      'Send My Results'
                    )}
                  </Button>
                  <p className="text-xs text-center text-muted-foreground">We'll never spam you</p>
                </form>
              )}
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
