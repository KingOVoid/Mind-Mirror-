import React, { useEffect, useRef } from 'react';
import { animate } from 'animejs';

interface LevitatingCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  delay?: number;
  amplitude?: number; // px to float
  duration?: number; // ms for float cycle
  className?: string;
  tilt?: boolean;
}

export const LevitatingCard: React.FC<LevitatingCardProps> = ({
  children,
  delay = 0,
  amplitude = 7,
  duration = 4200,
  className = '',
  tilt = true,
  ...rest
}) => {
  const cardRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const el = cardRef.current;
    if (!el) return;

    // 1. Smooth entrance with gentle spring / elastic ease
    animate(el, {
      opacity: [0, 1],
      translateY: [24, 0],
      duration: 800,
      delay,
      ease: 'outQuad',
      onComplete: () => {
        // 2. Anti-gravity zero-g continuous levitation loop
        animate(el, {
          translateY: [-amplitude, amplitude],
          rotate: tilt ? [-0.4, 0.4] : 0,
          duration,
          alternate: true,
          loop: true,
          ease: 'inOutSine',
        });
      },
    });
  }, [amplitude, duration, delay, tilt]);

  return (
    <div
      ref={cardRef}
      className={`glass-card rounded-2xl transition-shadow duration-300 ${className}`}
      {...rest}
    >
      {children}
    </div>
  );
};
