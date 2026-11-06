import React, { useEffect, useRef, useState } from 'react';

interface RevealProps {
  className?: string;
  children: React.ReactNode;
}

// Fades a section in once as it scrolls into view
export const Reveal: React.FC<RevealProps> = ({ className = '', children }) => {
  const ref = useRef<HTMLElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.08 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return (
    <section ref={ref} className={`reveal ${isVisible ? 'is-visible' : ''} ${className}`}>
      {children}
    </section>
  );
};
