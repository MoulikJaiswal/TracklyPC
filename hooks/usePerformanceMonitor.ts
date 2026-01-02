import { useState, useEffect, useRef } from 'react';

export const usePerformanceMonitor = (isEnabled: boolean = true) => {
  const [isLagging, setIsLagging] = useState(false);
  const [hasDismissed, setHasDismissed] = useState(false);
  
  const lastFrameTime = useRef(-1);
  const jankScore = useRef(0); 
  const rafId = useRef<number>();
  const timeoutId = useRef<any>();

  useEffect(() => {
    if (!isEnabled || hasDismissed || isLagging) return;

    const loop = () => {
      const now = performance.now();

      // First frame initialization
      if (lastFrameTime.current === -1) {
          lastFrameTime.current = now;
          rafId.current = requestAnimationFrame(loop);
          return;
      }

      const delta = now - lastFrameTime.current;
      
      // Only analyze if the tab is actually visible (browsers throttle background tabs)
      if (document.visibilityState === 'visible') {
          // Standard 60fps frame is ~16.6ms. 
          // We consider anything above 22ms (~45fps) as a "dropped" or "janky" frame.
          if (delta > 22) {
              // Heavy penalty for severe lag (>32ms / <30fps)
              const penalty = delta > 32 ? 1.5 : 1;
              jankScore.current += penalty;
          } else {
              // Slowly decay the score if frames are smooth. 
              // This ensures isolated hiccups don't trigger the alert, 
              // but sustained scrolling lag does.
              jankScore.current = Math.max(0, jankScore.current - 0.1);
          }

          // Trigger Threshold: 25.
          // This roughly translates to "25 bad frames recently".
          // If scrolling continuously lags, this hits in about 1-2 seconds.
          if (jankScore.current >= 25) {
              setIsLagging(true);
              return; // Stop the loop, we've detected the issue
          }
      }

      lastFrameTime.current = now;
      rafId.current = requestAnimationFrame(loop);
    };

    // Warmup: Start after 2s to ignore initial hydration/mounting lag
    timeoutId.current = setTimeout(() => {
        lastFrameTime.current = performance.now();
        rafId.current = requestAnimationFrame(loop);
    }, 2000);

    return () => {
      if (rafId.current) cancelAnimationFrame(rafId.current);
      if (timeoutId.current) clearTimeout(timeoutId.current);
    };
  }, [isEnabled, hasDismissed, isLagging]);

  const dismiss = () => {
      setIsLagging(false);
      setHasDismissed(true);
  };

  return { isLagging, dismiss };
};