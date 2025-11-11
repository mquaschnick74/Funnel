import { useEffect, useRef } from 'react';

interface IframeMessage {
  type: string;
  data?: any;
}

export function useIframeMessaging() {
  const isInIframe = window.parent !== window;
  const lastHeight = useRef(0);

  // Send height updates when content changes
  useEffect(() => {
    if (!isInIframe) return;

    const sendHeight = () => {
      const height = document.documentElement.scrollHeight;
      // Only send if height changed significantly (more than 20px)
      if (Math.abs(height - lastHeight.current) > 20) {
        lastHeight.current = height;
        window.parent.postMessage({
          type: 'RESIZE_IFRAME',
          height
        }, '*');
      }
    };

    // Initial height
    sendHeight();

    // Watch for changes
    const observer = new ResizeObserver(sendHeight);
    observer.observe(document.body);

    // Also check on route changes
    const interval = setInterval(sendHeight, 500);

    return () => {
      observer.disconnect();
      clearInterval(interval);
    };
  }, [isInIframe]);

  // Send ready message on mount
  useEffect(() => {
    if (isInIframe) {
      window.parent.postMessage({ type: 'IFRAME_READY' }, '*');
    }
  }, [isInIframe]);

  const sendMessage = (message: IframeMessage) => {
    if (isInIframe) {
      window.parent.postMessage(message, '*');
    }
  };

  return {
    isInIframe,
    sendMessage
  };
}