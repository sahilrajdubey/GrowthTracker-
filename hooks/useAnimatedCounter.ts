'use client';

import { useEffect, useRef, useState } from 'react';

export function useAnimatedCounter(
  target: number,
  duration = 800,
  enabled = true
): number {
  const [current, setCurrent] = useState(0);
  const startRef = useRef<number | null>(null);
  const startValueRef = useRef(0);
  const animRef = useRef<number | null>(null);

  useEffect(() => {
    if (!enabled) {
      setCurrent(target);
      return;
    }

    if (animRef.current) {
      cancelAnimationFrame(animRef.current);
    }

    startValueRef.current = current;
    startRef.current = null;

    const animate = (timestamp: number) => {
      if (!startRef.current) startRef.current = timestamp;
      const elapsed = timestamp - startRef.current;
      const progress = Math.min(elapsed / duration, 1);

      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      const value = Math.round(
        startValueRef.current + (target - startValueRef.current) * eased
      );
      setCurrent(value);

      if (progress < 1) {
        animRef.current = requestAnimationFrame(animate);
      }
    };

    animRef.current = requestAnimationFrame(animate);
    return () => {
      if (animRef.current) cancelAnimationFrame(animRef.current);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [target, duration, enabled]);

  return current;
}
