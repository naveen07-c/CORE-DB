import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ArrowLeft, ChevronRight, Sparkles } from 'lucide-react';
import { productService } from '../services/productService';
import { ProductCard, ProductCardSkeleton } from '../components/catalog/ProductCard';
import { Reveal } from '../components/common/Reveal';
import { SmartImage, CountUp } from '../components/common/SmartImage';
import { Bubbles } from '../components/common/Bubbles';
import { CategorySlider } from '../components/home/CategorySlider';
import { getProductImage, FALLBACK_IMAGE } from '../utils/productImages';

const HERO_FLOAT = [
  { productId: 1, className: 'top-[10%] left-[4%] w-28 sm:w-36 animate-floaty', delay: '0s' },
  { productId: 3, className: 'bottom-[16%] right-[6%] w-32 sm:w-44 animate-floaty-slow', delay: '0.8s' },
  { productId: 30, className: 'top-[34%] right-[24%] w-20 sm:w-28 animate-floaty', delay: '1.4s' },
  { productId: 25, className: 'bottom-[8%] left-[26%] w-24 sm:w-32 animate-floaty-slow', delay: '2s' },
];

export const HomePage = () => {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const dealsRef = useRef(null);
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const load = async () => {
      try {
        const prodRes = await productService.getProducts({ limit: 12, sort: 'newest' });
        const productsData = prodRes.data || prodRes.products || prodRes;
        const list = Array.isArray(productsData) ? productsData : productsData.data;
        if (Array.isArray(list)) setFeaturedProducts(list);
      } catch (err) {
        console.error('Error loading home data:', err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  useEffect(() => {
    const onScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const scrollDeals = (dir) => {
    const el = dealsRef.current;
    if (!el) return;
    el.scrollBy({ left: dir * Math.max(el.clientWidth * 0.8, 280), behavior: 'smooth' });
  };

  return (
    <div className="overflow-x-clip">
      {/* ================= HERO ================= */}
      <section className="relative min-h-[100svh] flex items-center">
        {/* ambient blobs */}
        <div className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute -top-24 -left-24 w-[420px] h-[420px] bg-lemon-300/40 rounded-full blur-3xl animate-blob" />
          <div className="absolute bottom-[-120px] right-[-80px] w-[480px] h-[480px] bg-mint-300/40 rounded-full blur-3xl animate-blob [animation-delay:5s]" />
          <div className="absolute top-1/3 left-1/3 w-[320px] h-[320px] bg-brand-200/50 rounded-full blur-3xl animate-blob [animation-delay:9s]" />
        </div>
        {/* fizzy bubbles */}
        <Bubbles count={22} />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-24 grid lg:grid-cols-2 gap-10 items-center w-full">
          {/* Copy */}
          <div>
            <Reveal>
              <span className="chip rotate-[-2deg]">
                <Sparkles className="w-3.5 h-3.5 text-brand-500" />
                new drops every week
              </span>
            </Reveal>
            <Reveal delay={90}>
              <h1 className="font-display font-bold text-[13vw] sm:text-6xl xl:text-8xl leading-[0.95] tracking-tight mt-6">
                Shop
                <br />
                <span className="text-gradient">Iron &amp; Ivy.</span>
              </h1>
            </Reveal>
            <Reveal delay={180}>
              <p className="text-ink/60 text-lg mt-7 max-w-md leading-relaxed font-medium">
                Tech, kicks, page-turners & everyday carry.
                <br />
                One happy little universe of things.
              </p>
            </Reveal>
            <Reveal delay={270}>
              <div className="flex flex-wrap items-center gap-5 mt-9">
                <Link to="/catalog" className="btn-primary btn-pop !px-9 !py-4 text-base animate-wiggle hover:animate-none">
                  <span className="pop-circle tl" /><span className="pop-circle tr" />
                  <span className="pop-circle bl" /><span className="pop-circle br" />
                  SHOP NOW
                </Link>
                <a href="#categories" className="font-semibold text-ink/70 underline decoration-wavy decoration-mint-500 decoration-2 underline-offset-8 hover:text-brand-600 transition-colors">
                  see categories
                </a>
              </div>
            </Reveal>

            <Reveal delay={360}>
              <div className="flex items-center gap-8 sm:gap-12 mt-14 pt-8 border-t-2 border-dashed border-ink/15">
                {[
                  { value: 56, suffix: '+', label: 'products' },
                  { value: 15, suffix: '+', label: 'brands' },
                  { value: 98, suffix: '%', label: 'happy folks' },
                ].map((s) => (
                  <div key={s.label}>
                    <p className="font-display font-bold text-3xl text-ink">
                      <CountUp to={s.value} suffix={s.suffix} />
                    </p>
                    <p className="text-[11px] uppercase tracking-[0.2em] text-ink/40 mt-1 font-bold">{s.label}</p>
                  </div>
                ))}
              </div>
            </Reveal>
          </div>

          {/* Floating product collage w/ scroll parallax */}
          <div className="relative hidden md:block min-h-[440px] lg:min-h-[520px]">
            <div
              className="absolute inset-6 bg-gradient-to-br from-peach via-white to-mint-100 rounded-[3rem] rotate-3 shadow-card"
              style={{ transform: `rotate(3deg) translateY(${scrollY * -0.06}px)` }}
            />
            {HERO_FLOAT.map((item, i) => (
              <Link
                key={i}
                to={`/product/${item.productId}`}
                className={`absolute ${item.className} p-2 bg-white rounded-3xl shadow-lift hover:shadow-glow hover:scale-110 hover:z-10 transition-all duration-500`}
                style={{ animationDelay: item.delay, transform: `translateY(${scrollY * (i % 2 === 0 ? 0.08 : -0.05)}px)` }}
              >
                <img
                  src={getProductImage(item.productId)}
                  alt="Featured product"
                  className="w-full aspect-square object-contain"
                />
              </Link>
            ))}
            {/* spinning badge */}
            <div className="absolute -top-4 right-[18%] w-24 h-24 hidden lg:flex items-center justify-center">
              <svg viewBox="0 0 100 100" className="w-full h-full animate-spinny">
                <defs>
                  <path id="circlePath" d="M 50,50 m -37,0 a 37,37 0 1,1 74,0 a 37,37 0 1,1 -74,0" />
                </defs>
                <text className="fill-ink font-display font-bold" style={{ fontSize: 11.5, letterSpacing: 2.5 }}>
                  <textPath href="#circlePath">FREE DELIVERY • EASY RETURNS • </textPath>
                </text>
              </svg>
              <span className="absolute w-9 h-9 rounded-full bg-brand-500 shadow-glow" />
            </div>
          </div>
        </div>

        {/* scroll hint */}
        <div className="absolute bottom-7 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1.5 text-ink/40">
          <span className="text-[10px] font-extrabold uppercase tracking-[0.3em]">scroll</span>
          <span className="w-8 h-1.5 rounded-full bg-ink/15 overflow-hidden">
            <span className="block w-3 h-full bg-brand-500 rounded-full animate-[marquee_1.6s_ease-in-out_infinite_alternate]" />
          </span>
        </div>
      </section>

      {/* ================= ZERO MEH SPLIT (Aprch section-2 style) ================= */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-32">
        <div className="grid lg:grid-cols-2 gap-14 items-center">
          {/* Floating image cluster */}
          <Reveal variant="left" className="relative order-2 lg:order-1">
            <div className="relative min-h-[380px] sm:min-h-[440px]">
              <div className="absolute inset-x-8 inset-y-4 bg-sky-200 rounded-[3rem] -rotate-2" />
              <Link to="/product/13" className="absolute left-[6%] top-[8%] w-48 sm:w-64 p-3 bg-white rounded-[2rem] shadow-lift animate-floaty block hover:scale-105 transition-transform duration-500">
                <img src={getProductImage(13)} alt="Tablet" className="w-full aspect-square object-contain" />
              </Link>
              <Link to="/product/21" className="absolute right-[4%] bottom-[4%] w-40 sm:w-52 p-3 bg-white rounded-[2rem] shadow-lift animate-floaty-slow block hover:scale-105 transition-transform duration-500">
                <img src={getProductImage(21)} alt="High-top sneakers" className="w-full aspect-square object-contain" />
              </Link>
              <span className="chip absolute top-[46%] left-[38%] rotate-[-6deg] !bg-lemon-400 !border-ink/10 font-bold">hot pick 🔥</span>
            </div>
          </Reveal>

          {/* Copy + NO list */}
          <div className="order-1 lg:order-2">
            <Reveal>
              <p className="text-xs font-extrabold uppercase tracking-[0.3em] text-brand-600">Why Iron &amp; Ivy.</p>
            </Reveal>
            <Reveal delay={90}>
              <h2 className="font-display font-bold text-4xl sm:text-5xl xl:text-6xl tracking-tight leading-[1.02] mt-4">
                One store.
                <br />
                Zero <span className="text-gradient">meh.</span>
              </h2>
            </Reveal>
            <Reveal delay={180}>
              <p className="text-ink/55 text-lg mt-6 max-w-md leading-relaxed">
                We curate hard, price fair and deliver fast — so every click ends in a little happy dance.
              </p>
            </Reveal>
            <Reveal delay={260}>
              <ul className="mt-8 space-y-2.5 font-display font-bold text-2xl sm:text-3xl text-ink">
                {['NO hidden fees.', 'NO boring browsing.', 'NO ouch delivery charges.'].map((line, i) => (
                  <li key={line} className="flex items-center gap-4 reveal is-visible" style={{ '--reveal-delay': `${i * 90}ms`, opacity: 1, transform: 'none' }}>
                    <span className={`w-3.5 h-3.5 rounded-full shrink-0 ${['bg-brand-500', 'bg-mint-500', 'bg-lemon-500'][i]}`} />
                    {line}
                  </li>
                ))}
              </ul>
            </Reveal>
            <Reveal delay={340}>
              <Link to="/catalog" className="btn-dark btn-pop mt-9 relative inline-flex">
                <span className="pop-circle tl" /><span className="pop-circle tr" />
                <span className="pop-circle bl" /><span className="pop-circle br" />
                Start exploring <ArrowRight className="w-4 h-4" />
              </Link>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ================= CATEGORY FLAVOR-SLIDER ================= */}
      <div id="categories">
        <CategorySlider />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-24 pb-24">
        {/* ================= DEALS RAIL ================= */}
        <section className="pt-20">
          <Reveal>
            <div className="flex items-end justify-between mb-8">
              <div>
                <p className="text-xs font-extrabold uppercase tracking-[0.3em] text-brand-600">Limited time</p>
                <h2 className="font-display font-bold text-4xl sm:text-5xl tracking-tight mt-2">Trending deals</h2>
              </div>
              <div className="flex gap-2.5">
                <button onClick={() => scrollDeals(-1)} aria-label="Scroll deals left" className="p-3 rounded-full bg-white border-2 border-ink/10 shadow-sm hover:border-brand-400 hover:text-brand-600 hover:-translate-y-0.5 active:scale-90 transition-all">
                  <ArrowLeft className="w-4 h-4" />
                </button>
                <button onClick={() => scrollDeals(1)} aria-label="Scroll deals right" className="p-3 rounded-full bg-ink text-white shadow-sm hover:-translate-y-0.5 active:scale-90 transition-all">
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </Reveal>

          <div ref={dealsRef} className="flex gap-5 overflow-x-auto no-scrollbar snap-x snap-mandatory pb-2 -mx-4 px-4 sm:mx-0 sm:px-0">
            {(loading ? Array.from({ length: 6 }) : featuredProducts.slice(0, 10)).map((product, i) => (
              <div key={(product?.productId) ?? i} className="w-64 shrink-0 snap-start">
                {!loading && product ? <DealsCard product={product} /> : <SkeletonCard />}
              </div>
            ))}
          </div>
        </section>

        {/* ================= FEATURED GRID ================= */}
        <section>
          <Reveal>
            <div className="flex items-end justify-between mb-8">
              <div>
                <p className="text-xs font-extrabold uppercase tracking-[0.3em] text-brand-600">Fresh arrivals</p>
                <h2 className="font-display font-bold text-4xl sm:text-5xl tracking-tight mt-2">New this week</h2>
              </div>
              <Link to="/catalog?sort=newest" className="hidden sm:flex items-center gap-1 font-semibold text-ink/60 hover:text-brand-600 transition-colors">
                see everything <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
          </Reveal>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {Array.from({ length: 8 }).map((_, i) => <ProductCardSkeleton key={i} />)}
            </div>
          ) : featuredProducts.length === 0 ? (
            <div className="text-center py-12 text-gray-500">No products available</div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {featuredProducts.map((product, i) => (
                <Reveal key={product.productId} delay={(i % 4) * 80}>
                  <ProductCard product={product} />
                </Reveal>
              ))}
            </div>
          )}
        </section>

        {/* ================= PERKS ================= */}
        <section className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          {[
            { emoji: '🚚', title: 'Free express delivery', desc: 'On all orders over ₹1,000 — always on time.', bg: 'bg-sky-200' },
            { emoji: '🔄', title: '30-day easy returns', desc: 'Changed your mind? No questions asked.', bg: 'bg-mint-200' },
            { emoji: '🔒', title: 'Secure checkout', desc: 'Encrypted payments & price-lock guarantee.', bg: 'bg-lemon-300' },
          ].map((perk, i) => (
            <Reveal key={perk.title} delay={i * 100} variant="scale">
              <div className={`${perk.bg} rounded-[2rem] p-7 h-full hover:-translate-y-1.5 hover:shadow-lift hover:-rotate-1 transition-all duration-500`}>
                <span className="text-4xl block mb-4">{perk.emoji}</span>
                <h3 className="font-display font-bold text-xl">{perk.title}</h3>
                <p className="text-sm text-ink/60 mt-1.5 font-medium">{perk.desc}</p>
              </div>
            </Reveal>
          ))}
        </section>

        {/* ================= NEWSLETTER ================= */}
        <Reveal variant="scale">
          <section className="relative overflow-hidden rounded-[3rem] bg-night text-white p-10 sm:p-16 text-center">
            <Bubbles count={14} className="opacity-30" colors={['rgba(255,92,138,0.5)', 'rgba(255,222,107,0.45)', 'rgba(143,239,201,0.4)', 'rgba(255,255,255,0.35)']} />
            <div className="pointer-events-none absolute -top-24 -right-16 w-72 h-72 bg-brand-500/30 rounded-full blur-3xl animate-blob" />
            <div className="relative max-w-lg mx-auto">
              <p className="text-xs font-extrabold uppercase tracking-[0.3em] text-brand-300">the Iron &amp; Ivy list</p>
              <h2 className="font-display font-bold text-4xl sm:text-5xl tracking-tight mt-3">
                Get <span className="text-gradient">10% off</span> your first order
              </h2>
              <p className="text-gray-400 mt-3 font-medium">Early drops, secret sales, zero spam.</p>
              <form className="mt-8 flex flex-col sm:flex-row gap-3" onSubmit={(e) => e.preventDefault()}>
                <input
                  type="email"
                  placeholder="your@email.com"
                  className="flex-1 px-6 py-4 text-sm bg-white/10 border-2 border-white/15 rounded-full text-white placeholder:text-gray-500 focus:outline-none focus:border-brand-400 focus:bg-white/15 transition-all"
                />
                <button type="submit" className="btn-primary btn-pop shrink-0">
                  <span className="pop-circle tl" /><span className="pop-circle tr" />
                  <span className="pop-circle bl" /><span className="pop-circle br" />
                  Subscribe
                </button>
              </form>
            </div>
          </section>
        </Reveal>
      </div>
    </div>
  );
};

function DealsCard({ product }) {
  const minPrice = product.minPrice ?? product.basePrice ?? 0;
  const maxPrice = product.maxPrice ?? product.basePrice ?? 0;
  const discount = maxPrice > minPrice ? Math.round(((maxPrice - minPrice) / maxPrice) * 100) : 0;
  return (
    <Link
      to={`/product/${product.productId}`}
      className="group block bg-white rounded-[2rem] p-4 shadow-card hover:shadow-lift hover:-translate-y-1.5 hover:-rotate-1 transition-all duration-500"
      style={{ textDecoration: 'none', color: 'inherit' }}
    >
      <div className="relative h-44 flex items-center justify-center overflow-hidden rounded-3xl bg-peach">
        <SmartImage
          src={getProductImage(product.productId)}
          fallback={FALLBACK_IMAGE}
          alt={product.name}
          className="max-h-full max-w-full object-contain group-hover:scale-110 group-hover:rotate-3 transition-transform duration-500"
        />
        {discount > 0 && (
          <span className="absolute top-3 left-3 px-2.5 py-1 rounded-full text-[11px] font-extrabold text-ink bg-lemon-400 shadow-md rotate-[-3deg]">
            −{discount}%
          </span>
        )}
      </div>
      <p className="mt-3 text-sm font-semibold text-ink line-clamp-2 min-h-[2.5rem] group-hover:text-brand-600 transition-colors">
        {product.name}
      </p>
      <p className="mt-1 font-display font-bold text-lg">₹{Number(minPrice).toLocaleString('en-IN')}</p>
    </Link>
  );
}

function SkeletonCard() {
  return (
    <div className="bg-white rounded-[2rem] p-4 shadow-card">
      <div className="skeleton h-44 rounded-3xl" />
      <div className="skeleton h-4 rounded-full mt-3 w-3/4" />
      <div className="skeleton h-5 rounded-full mt-2 w-1/3" />
    </div>
  );
}

export default HomePage;
