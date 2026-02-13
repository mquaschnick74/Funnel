import { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { isDesertVariant } from '@/lib/variant';

const defaultMessages = [
  'Analyzing your responses...',
  'Mapping your inner landscape...',
  'Identifying your pattern...',
  'Generating your therapeutic profile...',
];

const desertMessages = [
  'Analyzing your responses...',
  'Understanding your unique patterns...',
  'Matching you with therapeutic approaches...',
  'Building your personalized pathway...',
];

interface LoadingScreenProps {
  onComplete: () => void;
}

export default function LoadingScreen({ onComplete }: LoadingScreenProps) {
  const [messageIndex, setMessageIndex] = useState(0);
  const loadingMessages = isDesertVariant() ? desertMessages : defaultMessages;

  useEffect(() => {
    const messageInterval = setInterval(() => {
      setMessageIndex((prev) => (prev + 1) % loadingMessages.length);
    }, 800);

    const completeTimeout = setTimeout(() => {
      onComplete();
    }, 3500);

    return () => {
      clearInterval(messageInterval);
      clearTimeout(completeTimeout);
    };
  }, [onComplete]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4">
      <div className="max-w-md w-full text-center space-y-8">
        <Loader2 className="w-16 h-16 text-primary animate-spin mx-auto" data-testid="icon-loading" />
        <p className="text-xl text-muted-foreground transition-opacity duration-300" data-testid="text-loading-message">
          {loadingMessages[messageIndex]}
        </p>
      </div>
    </div>
  );
}
