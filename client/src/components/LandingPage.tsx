import { Button } from '@/components/ui/button';
import { Check } from 'lucide-react';
import heroImage from '@assets/generated_images/Hero_landscape_background_image_1a3148b4.png';

interface LandingPageProps {
  onStart: () => void;
}

export default function LandingPage({ onStart }: LandingPageProps) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 relative overflow-hidden">
      <div
        className="absolute inset-0 z-0"
        style={{
          backgroundImage: `linear-gradient(to bottom, rgba(15, 15, 26, 0.85), rgba(15, 15, 26, 0.95)), url(${heroImage})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      />

      <div className="relative z-10 max-w-4xl mx-auto text-center space-y-12">
        <div className="space-y-6">
          <h1 className="text-5xl md:text-6xl font-bold text-foreground leading-tight" data-testid="heading-main">
            Discover Your Mental Health Answer
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto" data-testid="text-subheading">
            5 Question Personalized Assessment with a clearer path to its Solution
          </p>
        </div>

        <Button
          size="lg"
          className="text-lg px-12 py-6 h-auto"
          onClick={onStart}
          data-testid="button-start-assessment"
        >
          Start Assessment
        </Button>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl mx-auto pt-8">
          {[
            'Takes 90 seconds',
            '1,000+ therapeutic sessions conducted',
            'Based on 20+ years of clinical research',
            'Completely confidential',
          ].map((item, index) => (
            <div
              key={index}
              className="flex items-start gap-3 text-muted-foreground justify-center md:justify-start"
              data-testid={`trust-signal-${index}`}
            >
              <Check className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
              <span className="text-base">{item}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
