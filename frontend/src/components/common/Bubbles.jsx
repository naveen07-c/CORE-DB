import React, { useMemo } from 'react';

/**
 * Fizzy rising bubbles (particles.js-style ambience, pure CSS).
 * Renders absolutely-positioned circles that drift upward forever.
 */
export function Bubbles({ count = 18, colors = ['rgba(255,255,255,0.9)', 'rgba(255,222,107,0.85)', 'rgba(143,239,201,0.85)', 'rgba(255,163,188,0.9)'], className = '' }) {
  const bubbles = useMemo(
    () =>
      Array.from({ length: count }).map((_, i) => ({
        id: i,
        left: Math.random() * 100,
        size: 6 + Math.random() * 22,
        duration: 9 + Math.random() * 14,
        delay: -Math.random() * 20,
        color: colors[i % colors.length],
      })),
    [count, colors]
  );

  return (
    <div className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`} aria-hidden="true">
      {bubbles.map((b) => (
        <span
          key={b.id}
          className="absolute bottom-[-40px] rounded-full animate-rise"
          style={{
            left: `${b.left}%`,
            width: b.size,
            height: b.size,
            background: b.color,
            animationDuration: `${b.duration}s`,
            animationDelay: `${b.delay}s`,
          }}
        />
      ))}
    </div>
  );
}

export default Bubbles;
