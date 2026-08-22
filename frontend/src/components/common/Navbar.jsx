import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { ShoppingBag, Search, User, Menu, X, LogOut, Package, ChevronDown, Sparkles, Shield, ArrowRight } from 'lucide-react';
import { useAuthStore } from '../../store/useAuthStore';
import { useCartStore } from '../../store/useCartStore';
import { ThemeToggle } from './ThemeToggle';

export const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isAuthenticated, logout } = useAuthStore();
  const { itemCount, openDrawer } = useCartStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/catalog?search=${encodeURIComponent(searchQuery.trim())}`);
      setIsMobileMenuOpen(false);
    }
  };

  const isActiveLink = (path) => {
    return location.pathname === path;
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 dark:bg-slate-950/95 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800/80 shadow-[0_1px_3px_rgba(0,0,0,0.02)] transition-all">
      {/* 1. Top Global Announcement Bar */}
      <div className="bg-slate-950 text-slate-300 text-[11px] font-medium py-2 px-4 sm:px-8 border-b border-slate-800/80">
        <div className="max-w-[1600px] mx-auto flex flex-wrap justify-between items-center gap-2">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="font-semibold text-white tracking-wide">SPRING HARDWARE EVENT</span>
            <span className="hidden md:inline text-slate-400">| Free Express Courier Delivery on Orders &gt; $1,000</span>
          </div>

          <div className="flex items-center gap-4 text-slate-300 text-[11px]">
            <span className="hidden sm:inline flex items-center gap-1.5 text-slate-400">
              <Shield className="w-3.5 h-3.5 text-emerald-400" />
              2-Year Global Hardware Warranty Included
            </span>
            <span className="hidden lg:inline text-slate-400">30-Day Risk-Free Returns</span>
            <Link to="/catalog" className="text-emerald-400 font-bold hover:underline">
              Shop Now &rarr;
            </Link>
          </div>
        </div>
      </div>

      {/* 2. Main Navigation Bar with Spacious & High-End Aesthetic */}
      <div className="max-w-[1600px] mx-auto px-4 sm:px-8 lg:px-10">
        <div className="flex items-center justify-between h-20 gap-6 lg:gap-10">
          
          {/* Left: Brand Identity */}
          <Link to="/" className="flex items-center gap-3 flex-shrink-0 group">
            <div className="w-10 h-10 rounded-2xl bg-slate-950 dark:bg-white text-white dark:text-slate-950 flex items-center justify-center font-black text-lg tracking-tighter shadow-md group-hover:scale-105 transition-all">
              V
            </div>
            <div>
              <span className="font-black text-xl tracking-tight text-slate-900 dark:text-white">VORTEX</span>
              <span className="text-[10px] uppercase font-bold tracking-widest text-emerald-600 dark:text-emerald-400 block -mt-1">
                HARDWARE LABS
              </span>
            </div>
          </Link>

          {/* Center Left: Modern Search Bar */}
          <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-md lg:max-w-lg relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search laptops, headphones, flagship phones, accessories..."
              className="w-full pl-11 pr-24 py-2.5 text-xs bg-slate-100/90 dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-800 rounded-full text-slate-900 dark:text-slate-100 focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900 dark:focus:ring-emerald-500/50 transition-all placeholder:text-slate-400 dark:placeholder:text-slate-500"
            />
            <Search className="absolute left-4 top-3 w-4 h-4 text-slate-400 dark:text-slate-500" />
            <button
              type="submit"
              className="absolute right-1.5 top-1.5 px-3.5 py-1.5 text-xs font-bold rounded-full bg-slate-900 dark:bg-emerald-600 hover:bg-slate-800 dark:hover:bg-emerald-500 text-white transition-colors shadow-sm"
            >
              Search
            </button>
          </form>

          {/* Center Right: Categorical Navigation Links */}
          <nav className="hidden xl:flex items-center gap-1.5 text-xs font-bold text-slate-600 dark:text-slate-300">
            <Link
              to="/catalog"
              className={`px-4 py-2 rounded-xl transition-all ${
                isActiveLink('/catalog')
                  ? 'bg-slate-100 dark:bg-slate-900 text-slate-900 dark:text-white font-extrabold'
                  : 'hover:bg-slate-50 dark:hover:bg-slate-900/60 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              All Products
            </Link>
            <Link
              to="/catalog?category=laptops-computers"
              className="px-4 py-2 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-900/60 hover:text-slate-900 dark:hover:text-white transition-all"
            >
              Laptops & PCs
            </Link>
            <Link
              to="/catalog?category=smartphones-tablets"
              className="px-4 py-2 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-900/60 hover:text-slate-900 dark:hover:text-white transition-all"
            >
              Smartphones
            </Link>
            <Link
              to="/catalog?category=audio-wearables"
              className="px-4 py-2 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-900/60 hover:text-slate-900 dark:hover:text-white transition-all"
            >
              Studio Audio
            </Link>
          </nav>

          {/* Right: Actions, Theme Toggle & User Controls */}
          <div className="flex items-center gap-3 sm:gap-4 flex-shrink-0">
            
            {/* Animated Light/Dark Mode Switcher */}
            <ThemeToggle />

            {/* Cart Button */}
            <button
              onClick={openDrawer}
              aria-label="View Shopping Cart"
              className="relative p-2.5 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-900 rounded-2xl transition-all flex items-center justify-center border border-slate-200/80 dark:border-slate-800"
            >
              <ShoppingBag className="w-5 h-5" />
              {itemCount > 0 && (
                <span className="absolute -top-1 -right-1 flex items-center justify-center min-w-[20px] h-5 px-1.5 text-[10px] font-black text-white bg-emerald-600 rounded-full ring-2 ring-white dark:ring-slate-950 shadow-sm">
                  {itemCount > 99 ? '99+' : itemCount}
                </span>
              )}
            </button>

            <div className="h-6 w-[1px] bg-slate-200 dark:bg-slate-800 hidden sm:block" />

            {/* Auth / Profile Area */}
            {isAuthenticated ? (
              <div className="relative">
                <button
                  onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)}
                  className="flex items-center gap-2.5 pl-2 pr-3.5 py-1.5 bg-slate-100 dark:bg-slate-900 hover:bg-slate-200/80 dark:hover:bg-slate-800 rounded-full text-slate-800 dark:text-slate-100 text-xs font-bold border border-slate-200 dark:border-slate-800 transition-all"
                >
                  <div className="w-6 h-6 rounded-full bg-slate-900 dark:bg-emerald-600 text-white flex items-center justify-center text-xs font-bold uppercase">
                    {user?.fullName?.charAt(0) || 'U'}
                  </div>
                  <span className="max-w-[120px] truncate hidden sm:inline">{user?.fullName?.split(' ')[0] || 'User'}</span>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
                </button>

                {/* Dropdown menu */}
                {isUserDropdownOpen && (
                  <>
                    <div className="fixed inset-0 z-10" onClick={() => setIsUserDropdownOpen(false)} />
                    <div className="absolute right-0 mt-2 w-60 bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-100 dark:border-slate-800 py-2.5 z-20 animate-in fade-in zoom-in-95 duration-100">
                      <div className="px-4 py-2.5 border-b border-slate-100 dark:border-slate-800">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Signed In Account</p>
                        <p className="text-xs font-bold text-slate-900 dark:text-white truncate mt-0.5">{user?.fullName}</p>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">{user?.email}</p>
                      </div>

                      <Link
                        to="/my-orders"
                        onClick={() => setIsUserDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2.5 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white transition-colors"
                      >
                        <Package className="w-4 h-4 text-slate-400" />
                        My Orders & Tracking
                      </Link>

                      <button
                        onClick={() => {
                          setIsUserDropdownOpen(false);
                          logout();
                          navigate('/login');
                        }}
                        className="w-full flex items-center gap-2.5 px-4 py-2.5 text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors text-left border-t border-slate-100 dark:border-slate-800 mt-1"
                      >
                        <LogOut className="w-4 h-4" />
                        Sign Out
                      </button>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="px-4 py-2 text-xs font-bold text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-900 rounded-xl transition-all"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 text-xs font-bold text-white bg-slate-900 dark:bg-emerald-600 hover:bg-slate-800 dark:hover:bg-emerald-500 rounded-xl shadow-sm hover:shadow transition-all"
                >
                  Get Started
                </Link>
              </div>
            )}

            {/* Mobile menu toggle */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="xl:hidden p-2 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-900 rounded-xl transition-colors"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {isMobileMenuOpen && (
        <div className="xl:hidden border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 px-5 pt-4 pb-6 space-y-4 shadow-lg">
          <form onSubmit={handleSearch} className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search products..."
              className="w-full pl-10 pr-20 py-2.5 text-xs bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-slate-100 focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900"
            />
            <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
            <button
              type="submit"
              className="absolute right-1.5 top-1.5 px-3 py-1.5 text-xs font-bold rounded-lg bg-slate-900 dark:bg-emerald-600 text-white"
            >
              Search
            </button>
          </form>

          <div className="flex flex-col space-y-1 pt-2 border-t border-slate-100 dark:border-slate-800">
            <Link
              to="/catalog"
              onClick={() => setIsMobileMenuOpen(false)}
              className="px-3.5 py-2.5 rounded-xl text-xs font-bold text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-900"
            >
              All Hardware Catalog
            </Link>
            <Link
              to="/catalog?category=laptops-computers"
              onClick={() => setIsMobileMenuOpen(false)}
              className="px-3.5 py-2.5 rounded-xl text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-900"
            >
              Laptops & Workstations
            </Link>
            <Link
              to="/catalog?category=smartphones-tablets"
              onClick={() => setIsMobileMenuOpen(false)}
              className="px-3.5 py-2.5 rounded-xl text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-900"
            >
              Smartphones & Tablets
            </Link>
            <Link
              to="/catalog?category=audio-wearables"
              onClick={() => setIsMobileMenuOpen(false)}
              className="px-3.5 py-2.5 rounded-xl text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-900"
            >
              Studio Audio & Headphones
            </Link>
            {isAuthenticated && (
              <Link
                to="/my-orders"
                onClick={() => setIsMobileMenuOpen(false)}
                className="px-3.5 py-2.5 rounded-xl text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-900"
              >
                My Orders & Tracking
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
