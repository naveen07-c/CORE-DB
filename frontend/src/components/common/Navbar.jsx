import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Search, ShoppingCart, Heart, Package, User, ArrowUpRight, Sparkles } from 'lucide-react';
import { useAuthStore } from '../../store/useAuthStore';
import { useCartStore } from '../../store/useCartStore';
import { Bubbles } from './Bubbles';

const MENU_LINKS = [
  { to: '/', label: 'Home', emoji: '🏠' },
  { to: '/catalog', label: 'Shop All', emoji: '🛍️' },
  { to: '/catalog?category=1', label: 'Electronics', emoji: '🎧' },
  { to: '/catalog?category=2', label: 'Shoes', emoji: '👟' },
  { to: '/catalog?category=3', label: 'Books', emoji: '📚' },
  { to: '/catalog?category=4', label: 'Accessories', emoji: '✨' },
];

const ACCOUNT_LINKS = [
  { to: '/my-orders', label: 'My Orders', icon: Package },
  { to: '/wishlist', label: 'Wishlist', icon: Heart },
];

export const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isAuthenticated, logout } = useAuthStore();
  const { itemCount, openDrawer } = useCartStore();

  const [menuOpen, setMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [scrolled, setScrolled] = useState(false);

  // Close overlay on route change
  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname, location.search]);

  // Lock body scroll while menu open
  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [menuOpen]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/catalog?search=${encodeURIComponent(searchQuery.trim())}`);
      setMenuOpen(false);
      setSearchQuery('');
    }
  };

  return (
    <>
      {/* ===== Minimal top bar ===== */}
      <header
        className={`fixed top-0 inset-x-0 z-40 transition-all duration-500 ${
          scrolled && !menuOpen ? 'bg-cream/80 backdrop-blur-xl shadow-soft' : 'bg-transparent'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-[72px] flex items-center justify-between gap-3">
          {/* Logo */}
          <Link to="/" className="font-display font-bold text-2xl tracking-tight text-ink group" aria-label="Home">
            Iron <span className="text-gradient">&amp;</span> Ivy
            <Sparkles className="inline w-4 h-4 ml-1 text-brand-400 opacity-0 group-hover:opacity-100 group-hover:rotate-12 transition-all" />
          </Link>

          {/* Right cluster */}
          <div className="flex items-center gap-1.5">
            {isAuthenticated ? (
              <span className="hidden sm:flex items-center gap-2 mr-1 px-3 py-1.5 rounded-full bg-white/70 border-2 border-ink/10 text-xs font-bold">
                <span className="w-6 h-6 rounded-full bg-gradient-to-br from-brand-400 to-lemon-400 text-white text-[10px] font-extrabold flex items-center justify-center uppercase">
                  {user?.fullName?.charAt(0) || 'U'}
                </span>
                hey, {user?.fullName?.split(' ')[0]}
              </span>
            ) : (
              <Link to="/login" className="hidden sm:flex p-2.5 text-ink/60 hover:text-brand-600 rounded-full hover:bg-white/70 transition-all" aria-label="Sign in">
                <User className="w-5 h-5" />
              </Link>
            )}

            <button
              onClick={openDrawer}
              aria-label="Shopping cart"
              className="relative p-2.5 text-ink/70 hover:text-brand-600 rounded-full hover:bg-white/70 transition-all"
            >
              <ShoppingCart className="w-5 h-5" />
              {itemCount > 0 && (
                <span className="absolute top-0 right-0 min-w-[18px] h-[18px] px-1 text-[10px] font-extrabold text-ink bg-lemon-400 rounded-full flex items-center justify-center shadow-md animate-popin">
                  {itemCount > 99 ? '99+' : itemCount}
                </span>
              )}
            </button>

            {/* Menu toggle */}
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              aria-expanded={menuOpen}
              aria-label={menuOpen ? 'Close menu' : 'Open menu'}
              className="flex items-center gap-2.5 pl-4 pr-3 py-2.5 rounded-full bg-ink text-white shadow-card hover:shadow-lift active:scale-95 transition-all"
            >
              <span className="text-sm font-semibold tracking-wide">{menuOpen ? 'Close' : 'Menu'}</span>
              <span className="relative w-5 h-3 block">
                <span className={`absolute left-0 top-0 w-full h-[2.5px] bg-current rounded transition-all duration-300 ${menuOpen ? 'top-1/2 -translate-y-1/2 rotate-45' : ''}`} />
                <span className={`absolute left-0 bottom-0 w-full h-[2.5px] bg-current rounded transition-all duration-300 ${menuOpen ? 'bottom-1/2 translate-y-1/2 -rotate-45' : ''}`} />
              </span>
            </button>
          </div>
        </div>
      </header>

      {/* ===== Full-screen menu overlay ===== */}
      <div
        className={`fixed inset-0 z-50 bg-night/95 backdrop-blur-xl transition-all duration-500 ${
          menuOpen ? 'opacity-100 visible' : 'opacity-0 invisible pointer-events-none'
        }`}
      >
        <Bubbles count={12} className="opacity-25" />

        {/* Overlay top bar: logo + close */}
        <div className="absolute top-0 inset-x-0 h-[72px] max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          <Link to="/" className="font-display font-bold text-2xl tracking-tight text-white" aria-label="Home">
            Iron <span className="text-gradient">&amp;</span> Ivy
          </Link>
          <button
            onClick={() => setMenuOpen(false)}
            aria-label="Close menu"
            className="flex items-center gap-2.5 pl-4 pr-3 py-2.5 rounded-full bg-brand-500 text-ink shadow-lift hover:bg-brand-400 active:scale-95 transition-all"
          >
            <span className="text-sm font-semibold tracking-wide">Close</span>
            <span className="relative w-4 h-4 block">
              <span className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-[2.5px] bg-current rounded rotate-45" />
              <span className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-[2.5px] bg-current rounded -rotate-45" />
            </span>
          </button>
        </div>

        <div className="relative max-w-7xl mx-auto px-6 sm:px-10 pt-28 pb-10 h-full overflow-y-auto no-scrollbar">
          <form onSubmit={handleSearch} className="relative max-w-lg mx-auto mb-12 animate-pagein">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search Iron & Ivy…"
              className="w-full pl-14 pr-6 py-4 text-base bg-white/10 border-2 border-white/15 rounded-full text-white placeholder:text-gray-500 focus:outline-none focus:border-brand-400 focus:bg-white/15 transition-all"
            />
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          </form>

          <nav className="grid lg:grid-cols-[1fr_auto] gap-10" aria-label="Menu">
            {/* Big links */}
            <ul className="space-y-1">
              {MENU_LINKS.map((link, i) => (
                <li key={link.to}>
                  <Link
                    to={link.to}
                    className="group flex items-baseline gap-4 font-display font-bold text-4xl sm:text-5xl xl:text-6xl text-white/85 hover:text-white hover:pl-4 transition-all duration-300 py-1.5 animate-pagein"
                    style={{ animationDelay: `${i * 60}ms` }}
                  >
                    <span className="text-lg opacity-40 group-hover:opacity-100 transition-opacity">{link.emoji}</span>
                    <span>{link.label}</span>
                    <ArrowUpRight className="w-7 h-7 self-center opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300 text-brand-400" />
                  </Link>
                </li>
              ))}
            </ul>

            {/* Account column */}
            <div className="lg:w-64 space-y-3 animate-pagein" style={{ animationDelay: '380ms' }}>
              <p className="text-[11px] font-extrabold uppercase tracking-[0.3em] text-gray-500 mb-4">Account</p>
              {isAuthenticated ? (
                <>
                  {ACCOUNT_LINKS.map((l) => (
                    <Link key={l.to} to={l.to} className="flex items-center gap-3 px-5 py-3.5 rounded-2xl bg-white/8 border border-white/10 text-gray-200 hover:bg-white/15 hover:text-white transition-all">
                      <l.icon className="w-4.5 h-4.5 w-[18px] h-[18px]" />
                      <span className="font-medium">{l.label}</span>
                    </Link>
                  ))}
                  <button onClick={() => { logout(); setMenuOpen(false); }} className="flex w-full items-center gap-3 px-5 py-3.5 rounded-2xl bg-brand-500/15 border border-brand-400/30 text-brand-300 hover:bg-brand-500/25 transition-all font-semibold">
                    Sign out
                  </button>
                </>
              ) : (
                <>
                  <Link to="/login" className="btn-primary btn-pop relative w-full !justify-start gap-3">
                    <span className="pop-circle tl" /><span className="pop-circle tr" />
                    <span className="pop-circle bl" /><span className="pop-circle br" />
                    Sign in
                  </Link>
                  <Link to="/register" className="btn-mint w-full !justify-start">Create account</Link>
                </>
              )}

              <div className="pt-6 mt-6 border-t border-white/10">
                <p className="text-[11px] font-extrabold uppercase tracking-[0.3em] text-gray-500 mb-3">Free delivery</p>
                <p className="text-xs text-gray-400 leading-relaxed">On orders over ₹1,000 · Easy 30-day returns · Secure checkout</p>
              </div>
            </div>
          </nav>
        </div>
      </div>
    </>
  );
};
