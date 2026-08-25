import React, { useEffect, useRef } from 'react';

/**
 * Scroll-triggered reveal wrapper.
 * variant: 'up' | 'left' | 'right' | 'scale'
 * delay: stagger delay in ms
 */
export function Reveal({ children, delay = 0, variant = 'up', as: Tag = 'div', className = '', once = true }) {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return undefined;

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            el.classList.add('is-visible');
            if (once) io.unobserve(el);
          } else if (!once) {
            el.classList.remove('is-visible');
          }
        });
      },
      { threshold: 0.1, rootMargin: '0px 0px -40px 0px' }
    );

    io.observe(el);
    return () => io.disconnect();
  }, [once]);

  const variantClass =
    variant === 'left' ? 'reveal-left' : variant === 'right' ? 'reveal-right' : variant === 'scale' ? 'reveal-scale' : '';

  return (
    <Tag
      ref={ref}
      className={`reveal ${variantClass} ${className}`}
      style={{ '--reveal-delay': `${delay}ms` }}
    >
      {children}
    </Tag>
  );
}

export default Reveal;
