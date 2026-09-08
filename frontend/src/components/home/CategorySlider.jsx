import React, { useEffect, useState, useCallback, useRef } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { Bubbles } from '../common/Bubbles';
import { getCategoryImage } from '../../utils/productImages';

const SCENES = [
  {
    id: 1,
    name: 'Electronics',
    tagline: 'Headphones, wearables & gadgets that spark joy.',
    bg: 'bg-sky-300',
    blob: 'bg-white/50',
    btn: 'btn-lemon',
  },
  {
    id: 2,
    name: 'Shoes',
    tagline: 'Kicks for the track, the office & everywhere between.',
    bg: 'bg-mint-400',
    blob: 'bg-white/60',
    btn: 'btn-primary',
  },
  {
    id: 3,
    name: 'Books',
    tagline: 'Page-turners, big ideas & collector editions.',
    bg: 'bg-lemon-400',
    blob: 'bg-white/55',
    btn: 'btn-primary',
  },
  {
    id: 4,
    name: 'Accessories',
    tagline: 'Wallets, watches & everyday carry, sorted.',
    bg: 'bg-brand-400',
    blob: 'bg-white/45',
    btn: 'btn-mint',
  },
];

// Clone edge slides to create an infinite seamless loop track
const EXTENDED_SCENES = [
  SCENES[SCENES.length - 1], // Clone of last scene (index 0)
  ...SCENES,                 // Real scenes (indices 1 to 4)
  SCENES[0],                 // Clone of first scene (index 5)
];

// Snappy & responsive slide interval: 3.2 seconds (3200ms)
const SLIDE_DURATION = 3200;

export function CategorySlider() {
  const count = SCENES.length;
  // Start at track index 1 (corresponding to real scene 0: Electronics)
  const [trackIndex, setTrackIndex] = useState(1);
  const [withTransition, setWithTransition] = useState(true);
  const [progressKey, setProgressKey] = useState(0);
  const isTransitioning = useRef(false);
  const touchStartX = useRef(0);
  const touchEndX = useRef(0);

  // Active real slide index (0 to 3) for counter and dots
  const realIndex = (trackIndex - 1 + count) % count;

  const next = useCallback(() => {
    if (isTransitioning.current) return;
    isTransitioning.current = true;
    setWithTransition(true);
    setTrackIndex((prev) => prev + 1);
    setProgressKey((k) => k + 1);
  }, []);

  const prev = useCallback(() => {
    if (isTransitioning.current) return;
    isTransitioning.current = true;
    setWithTransition(true);
    setTrackIndex((prev) => prev - 1);
    setProgressKey((k) => k + 1);
  }, []);

  const goTo = useCallback((targetRealIndex) => {
    if (isTransitioning.current) return;
    isTransitioning.current = true;
    setWithTransition(true);
    setTrackIndex(targetRealIndex + 1);
    setProgressKey((k) => k + 1);
  }, []);

  // When CSS transition finishes, seamlessly teleport without animation if at clone boundaries
  const handleTransitionEnd = () => {
    isTransitioning.current = false;
    if (trackIndex === 0) {
      // Cloned last slide -> silently snap to real last slide
      setWithTransition(false);
      setTrackIndex(count);
    } else if (trackIndex === count + 1) {
      // Cloned first slide -> silently snap to real first slide
      setWithTransition(false);
      setTrackIndex(1);
    }
  };

  // Re-enable smooth transition on next frame after silent teleportation
  useEffect(() => {
    if (!withTransition) {
      const raf1 = requestAnimationFrame(() => {
        const raf2 = requestAnimationFrame(() => {
          setWithTransition(true);
        });
        return () => cancelAnimationFrame(raf2);
      });
      return () => cancelAnimationFrame(raf1);
    }
  }, [withTransition]);

  // Dynamic automatic slide transition (3.2s interval)
  useEffect(() => {
    const interval = setInterval(() => {
      next();
    }, SLIDE_DURATION);

    return () => clearInterval(interval);
  }, [next, trackIndex]);

  // Touch swipe handlers
  const handleTouchStart = (e) => {
    touchStartX.current = e.targetTouches[0].clientX;
  };

  const handleTouchMove = (e) => {
    touchEndX.current = e.targetTouches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (!touchStartX.current || !touchEndX.current) return;
    const diff = touchStartX.current - touchEndX.current;
    if (diff > 50) {
      next();
    } else if (diff < -50) {
      prev();
    }
    touchStartX.current = 0;
    touchEndX.current = 0;
  };

  // Keyboard navigation
  const handleKeyDown = (e) => {
    if (e.key === 'ArrowLeft') {
      prev();
    } else if (e.key === 'ArrowRight') {
      next();
    }
  };

  return (
    <section
      aria-label="Shop by category"
      className="relative select-none focus:outline-none overflow-hidden"
      tabIndex={0}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onKeyDown={handleKeyDown}
    >
      <style>{`
        @keyframes slideProgressAnim {
          from { width: 0%; }
          to { width: 100%; }
        }
        .slide-progress-fill {
          animation: slideProgressAnim ${SLIDE_DURATION}ms linear 1 forwards;
        }
      `}</style>

      {/* Infinite Seamless Horizontal Sliding Track */}
      <div className="relative h-[88vh] min-h-[580px] w-full overflow-hidden">
        <div
          className={`flex h-full w-full ${
            withTransition
              ? 'transition-transform duration-700 ease-[cubic-bezier(0.25,1,0.5,1)]'
              : ''
          }`}
          style={{ transform: `translateX(-${trackIndex * 100}%)` }}
          onTransitionEnd={handleTransitionEnd}
        >
          {EXTENDED_SCENES.map((scene, idx) => (
            <div
              key={`${scene.id}-${idx}`}
              className={`w-full min-w-full h-full flex-shrink-0 relative overflow-hidden flex items-center ${scene.bg}`}
            >
              <Bubbles count={14} className="opacity-70" />
              {/* soft blob behind product */}
              <div className={`absolute right-[8%] top-1/2 -translate-y-1/2 w-[46vmin] h-[46vmin] rounded-full ${scene.blob} blur-[2px] animate-blob`} />

              {/* Slide content container */}
              <div className="relative z-10 max-w-7xl mx-auto px-6 w-full grid lg:grid-cols-2 gap-10 items-center">
                {/* Copy */}
                <div>
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-ink animate-pulse" />
                    <p className="text-xs font-extrabold uppercase tracking-[0.3em] text-ink/60">Pick your lane</p>
                  </div>
                  <h2 className="font-display font-bold text-5xl sm:text-6xl xl:text-7xl tracking-tight text-ink mt-3 leading-[0.95]">
                    {scene.name}
                    <span className="text-gradient">.</span>
                  </h2>
                  <p className="text-ink/70 text-lg mt-5 max-w-sm font-medium">{scene.tagline}</p>

                  <div className="flex items-center gap-4 mt-8">
                    <Link to={`/catalog?category=${scene.id}`} className={`${scene.btn} btn-pop`}>
                      <span className="pop-circle tl" /><span className="pop-circle tr" />
                      <span className="pop-circle bl" /><span className="pop-circle br" />
                      Shop {scene.name}
                    </Link>
                    <Link to="/catalog" className="font-semibold text-ink/75 hover:text-ink underline decoration-ink/20 hover:decoration-ink underline-offset-4 transition-all">
                      or browse everything
                    </Link>
                  </div>
                </div>

                {/* Category image */}
                <div className="hidden lg:flex justify-center relative">
                  <Link
                    to={`/catalog?category=${scene.id}`}
                    className="group relative block animate-floaty"
                    style={{ textDecoration: 'none' }}
                  >
                    <img
                      src={getCategoryImage(scene.id)}
                      alt={scene.name}
                      className="w-72 h-72 xl:w-96 xl:h-96 object-cover rounded-full border-[10px] border-white shadow-lift group-hover:scale-105 transition-transform duration-500"
                    />
                    <span className="absolute -bottom-3 left-1/2 -translate-x-1/2 px-5 py-2 bg-white rounded-full font-display font-bold text-lg shadow-card group-hover:bg-ink group-hover:text-white transition-colors duration-300 whitespace-nowrap">
                      Shop now →
                    </span>
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Floating Controls Overlay (Counter + Progress Dots on Left, Arrows on Right) */}
        <div className="absolute bottom-8 left-0 right-0 z-20 pointer-events-none">
          <div className="max-w-7xl mx-auto px-6 flex justify-between items-center">
            {/* Counter + Dynamic Progress Indicator */}
            <div className="pointer-events-auto flex items-center gap-5">
              <span className="font-display font-bold text-xl text-ink/50 tabular-nums">
                {String(realIndex + 1).padStart(2, '0')}
                <span className="text-ink/30"> / {String(count).padStart(2, '0')}</span>
              </span>
              <div className="flex items-center gap-2.5">
                {SCENES.map((s, i) => {
                  const isActive = i === realIndex;
                  return (
                    <button
                      key={s.id}
                      onClick={() => goTo(i)}
                      aria-label={`Go to ${s.name}`}
                      className={`relative h-2.5 rounded-full transition-all duration-300 overflow-hidden cursor-pointer ${
                        isActive ? 'w-12 bg-ink/25' : 'w-2.5 bg-ink/35 hover:bg-ink/70'
                      }`}
                    >
                      {isActive && (
                        <span
                          key={`${realIndex}-${progressKey}`}
                          className="slide-progress-fill absolute top-0 left-0 bottom-0 bg-ink rounded-full"
                        />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Navigation Arrows */}
            <div className="pointer-events-auto flex gap-3">
              <button
                onClick={prev}
                aria-label="Previous category"
                className="p-3.5 rounded-full bg-white text-ink shadow-card hover:-translate-x-0.5 hover:shadow-lift active:scale-90 transition-all cursor-pointer"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <button
                onClick={next}
                aria-label="Next category"
                className="p-3.5 rounded-full bg-ink text-white shadow-card hover:translate-x-0.5 hover:shadow-lift active:scale-90 transition-all cursor-pointer"
              >
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default CategorySlider;
