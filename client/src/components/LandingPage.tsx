import { Button } from '@/components/ui/button';
import { Check, Settings } from 'lucide-react';
import { Link } from 'wouter';
import heroImage from '@assets/generated_images/Hero_landscape_background_image_1a3148b4.png';

interface LandingPageProps {
  onStart: () => void;
}

export default function LandingPage({ onStart }: LandingPageProps) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 relative overflow-hidden">
      {/* Admin Icon */}
      <Link href="/admin">
        <button
          className="absolute top-4 right-4 z-20 p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
          title="Admin"
        >
          <Settings className="w-5 h-5 text-white/50 hover:text-white/80" />
        </button>
      </Link>

      <div
        className="absolute inset-0 z-0"
        style={{
          backgroundImage: `linear-gradient(to bottom, rgba(15, 15, 26, 0.4), rgba(15, 15, 26, 0.85)), url(${heroImage})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      />
      <div className="relative z-10 max-w-4xl mx-auto text-center space-y-12">
        <div className="space-y-6">
          <img
            src="/ivasa-logo.png"
            alt="iVASA"
            className="mx-auto w-full max-w-4xl h-auto"
            data-testid="heading-main"
          />
          <p className="text-xl md:text-2xl text-foreground max-w-3xl mx-auto" data-testid="text-subheading">
             Ai Powered Therapy: That isn't just a SCRIPT
          </p>
        </div>
        <Button
          size="lg"
          className="text-lg px-12 py-6 h-auto"
          onClick={onStart}
          data-testid="button-start-assessment"
        >
          8 Question Assessment
        </Button>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl mx-auto pt-8">
          {[
            'Takes 30 seconds',
            '1,000+ Ai sessions conducted',
            'Based on 20+ years of clinical research',
            'Completely confidential',
          ].map((item, index) => (
            <div
              key={index}
              className="flex items-start gap-3 text-foreground text-left"
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