import React, { useEffect, useState, useCallback } from 'react';
import { ArrowUp } from 'lucide-react';

export function SmartImage({ src, alt = '', className = '', fallback, ...rest }) {
  const [err, setErr] = useState(false);
  const finalSrc = err ? fallback || FALLBACK : src;
  return (
    <img
      src={finalSrc}
      alt={alt}
      className={className}
      loading="lazy"
      onError={() => setErr(true)}
      {...rest}
    />
  );
}

const FALLBACK = 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=800&q=80&auto=format&fit=crop';

/** Animated number counter that starts when scrolled into view. */
export function useCountUp(target, duration = 1600) {
  const [value, setValue] = useState(0);
  const [node, setNode] = useState(null);

  const start = useCallback(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setValue(target);
      return;
    }
    let raf;
    const t0 = performance.now();
    const tick = (t) => {
      const p = Math.min((t - t0) / duration, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      setValue(Math.round(target * eased));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, duration]);

  useEffect(() => {
    if (!node) return undefined;
    const io = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          const cleanup = start();
          io.disconnect();
          return cleanup;
        }
        return undefined;
      },
      { threshold: 0.4 }
    );
    io.observe(node);
    return () => io.disconnect();
  }, [node, start]);

  return [setNode, value];
}

export function CountUp({ to, suffix = '', className = '' }) {
  const [ref, val] = useCountUp(to);
  return (
    <span ref={ref} className={className}>
      {val}
      {suffix}
    </span>
  );
}

export function ScrollToTopButton() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 600);
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <button
      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      aria-label="Back to top"
      className={`fixed bottom-6 right-6 z-40 p-3 rounded-full text-white bg-brand-500 hover:bg-brand-400 shadow-lift hover:brightness-110 transition-all duration-300 ${
        visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'
      }`}
    >
      <ArrowUp className="w-5 h-5" />
    </button>
  );
}

