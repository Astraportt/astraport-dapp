'use client';

import React, { useEffect, useRef, useState } from 'react';

interface RevealProps {
  children: React.ReactNode;
  className?: string;
  /** Optional animation stagger in milliseconds, applied via inline style. */
  delay?: number;
  /** Anchor id for in-page navigation (e.g. #features). */
  id?: string;
}

/**
 * Reveals its children with a fade + rise the first time they scroll into
 * view. Falls back to always-visible when IntersectionObserver is unavailable
 * and honors `prefers-reduced-motion` via the CSS in globals.css.
 */
export function Reveal({ children, className = '', delay = 0, id }: RevealProps) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    // Older browsers without IntersectionObserver just see the content.
    if (typeof IntersectionObserver === 'undefined') {
      setRevealed(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setRevealed(true);
          observer.disconnect();
        }
      },
      { threshold: 0.15, rootMargin: '0px 0px -40px 0px' },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      id={id}
      ref={ref}
      className={`reveal ${revealed ? 'is-revealed' : ''} ${className}`.trim()}
      style={delay ? { transitionDelay: `${delay}ms` } : undefined}
    >
      {children}
    </div>
  );
}

export default Reveal;
