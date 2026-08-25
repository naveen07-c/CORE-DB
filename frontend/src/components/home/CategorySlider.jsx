import React, { useEffect, useState, useCallback } from 'react';
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

export function CategorySlider() {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const count = SCENES.length;

  const go = useCallback((dir) => setIndex((i) => (i + dir + count) % count), [count]);

  useEffect(() => {
    if (paused) return undefined;
    const t = setInterval(() => setIndex((i) => (i + 1) % count), 6000);
    return () => clearInterval(t);
  }, [paused, count]);

  return (
    <section
      aria-label="Shop by category"
      className="relative"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {/* Stacked color scenes */}
      <div className="relative h-[88vh] min-h-[580px] overflow-hidden">
        {SCENES.map((scene, i) => (
          <div
            key={scene.id}
            className={`absolute inset-0 transition-all duration-[900ms] ease-[cubic-bezier(0.65,0,0.35,1)] ${
              i === index ? 'opacity-100' : 'opacity-0 pointer-events-none scale-[1.04]'
            } ${scene.bg}`}
          >
            <Bubbles count={14} className="opacity-70" />
            {/* soft blob behind product */}
            <div className={`absolute right-[8%] top-1/2 -translate-y-1/2 w-[46vmin] h-[46vmin] rounded-full ${scene.blob} blur-[2px] animate-blob`} />
          </div>
        ))}

        {/* Slide content */}
        <div className="relative z-10 max-w-7xl mx-auto px-6 h-full grid lg:grid-cols-2 gap-10 items-center">
          {/* Copy */}
          <div key={index} className="animate-pagein">
            <p className="text-xs font-extrabold uppercase tracking-[0.3em] text-ink/50">Pick your lane</p>
            <h2 className="font-display font-bold text-5xl sm:text-6xl xl:text-7xl tracking-tight text-ink mt-3 leading-[0.95]">
              {SCENES[index].name}
              <span className="text-gradient">.</span>
            </h2>
            <p className="text-ink/60 text-lg mt-5 max-w-sm">{SCENES[index].tagline}</p>

            <div className="flex items-center gap-4 mt-8">
              <Link to={`/catalog?category=${SCENES[index].id}`} className={`${SCENES[index].btn} btn-pop`}>
                <span className="pop-circle tl" /><span className="pop-circle tr" />
                <span className="pop-circle bl" /><span className="pop-circle br" />
                Shop {SCENES[index].name}
              </Link>
              <Link to="/catalog" className="font-semibold text-ink/70 underline decoration-wavy decoration-brand-500 underline-offset-4 hover:text-brand-600 transition-colors">
                or browse everything
              </Link>
            </div>

            {/* counter + dots */}
            <div className="flex items-center gap-5 mt-12">
              <span className="font-display font-bold text-xl text-ink/40 tabular-nums">
                {String(index + 1).padStart(2, '0')}
                <span className="text-ink/25"> / {String(count).padStart(2, '0')}</span>
              </span>
              <div className="flex gap-2.5">
                {SCENES.map((s, i) => (
                  <button
                    key={s.id}
                    onClick={() => setIndex(i)}
                    aria-label={`Go to ${s.name}`}
                    className={`h-2.5 rounded-full transition-all duration-500 ${
                      i === index ? 'w-9 bg-ink' : 'w-2.5 bg-ink/25 hover:bg-ink/50'
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Category image */}
          <div className="hidden lg:flex justify-center relative" key={`img-${index}`}>
            <Link
              to={`/catalog?category=${SCENES[index].id}`}
              className="group relative block animate-floaty"
              style={{ textDecoration: 'none' }}
            >
              <img
                src={getCategoryImage(SCENES[index].id)}
                alt={SCENES[index].name}
                className="w-72 h-72 xl:w-96 xl:h-96 object-cover rounded-full border-[10px] border-white shadow-lift group-hover:scale-105 transition-transform duration-500"
              />
              <span className="absolute -bottom-3 left-1/2 -translate-x-1/2 px-5 py-2 bg-white rounded-full font-display font-bold text-lg shadow-card group-hover:bg-ink group-hover:text-white transition-colors duration-300 whitespace-nowrap">
                Shop now →
              </span>
            </Link>
          </div>
        </div>

        {/* Arrows */}
        <div className="absolute bottom-8 right-8 z-20 flex gap-3">
          <button
            onClick={() => go(-1)}
            aria-label="Previous category"
            className="p-3.5 rounded-full bg-white text-ink shadow-card hover:-translate-x-0.5 hover:shadow-lift active:scale-90 transition-all"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <button
            onClick={() => go(1)}
            aria-label="Next category"
            className="p-3.5 rounded-full bg-ink text-white shadow-card hover:translate-x-0.5 hover:shadow-lift active:scale-90 transition-all"
          >
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </section>
  );
}

export default CategorySlider;
