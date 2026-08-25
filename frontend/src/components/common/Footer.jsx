import React from 'react';
import { Link } from 'react-router-dom';
import { Instagram, Twitter, Youtube, Github } from 'lucide-react';

const COLUMNS = [
  {
    heading: 'Shop',
    links: [
      { label: 'All Products', to: '/catalog' },
      { label: 'Electronics', to: '/catalog?category=1' },
      { label: 'Shoes', to: '/catalog?category=2' },
      { label: 'Books', to: '/catalog?category=3' },
      { label: 'Accessories', to: '/catalog?category=4' },
    ],
  },
  {
    heading: 'Account',
    links: [
      { label: 'Sign In', to: '/login' },
      { label: 'Create Account', to: '/register' },
      { label: 'My Orders', to: '/my-orders' },
      { label: 'Wishlist', to: '/wishlist' },
      { label: 'Cart', to: '/cart' },
    ],
  },
  {
    heading: 'Company',
    links: [
      { label: 'About Iron & Ivy', to: '/catalog' },
      { label: 'Careers', to: '/catalog' },
      { label: 'Sustainability', to: '/catalog' },
      { label: 'Press', to: '/catalog' },
    ],
  },
];

export const Footer = () => {
  return (
    <footer className="mt-auto relative overflow-hidden bg-white border-t-2 border-ink/10">
      {/* floating deco shapes */}
      <div className="pointer-events-none absolute -top-16 right-[12%] w-40 h-40 bg-lemon-300/50 rounded-full blur-2xl" />
      <div className="pointer-events-none absolute bottom-0 left-[6%] w-52 h-52 bg-mint-200/60 rounded-full blur-2xl" />
      <div className="pointer-events-none absolute top-10 left-[40%] w-24 h-24 bg-brand-200/60 rounded-full blur-xl animate-blob" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-8">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-10">
          {/* Brand */}
          <div className="col-span-2 max-w-xs">
            <Link to="/" className="font-display font-bold text-3xl tracking-tight text-ink">
              Iron <span className="text-gradient">&amp;</span> Ivy
            </Link>
            <p className="text-sm leading-relaxed mt-4 text-ink/50 font-medium">
              A fizzy little universe of tech, footwear, books and everyday essentials —
              built as a full-stack DBMS mini-project.
            </p>
            <div className="flex items-center gap-2.5 mt-6">
              {[Twitter, Instagram, Youtube, Github].map((Icon, i) => (
                <a
                  key={i}
                  href="#"
                  onClick={(e) => e.preventDefault()}
                  aria-label="Social link"
                  className="p-2.5 rounded-full border-2 border-ink/10 text-ink/50 hover:text-white hover:bg-brand-500 hover:border-brand-500 hover:-translate-y-1 transition-all duration-300"
                >
                  <Icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>

          {COLUMNS.map((col) => (
            <div key={col.heading}>
              <h4 className="font-display font-bold text-sm uppercase tracking-[0.25em] text-ink mb-4">{col.heading}</h4>
              <ul className="space-y-2.5">
                {col.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      to={link.to}
                      className="text-sm text-ink/50 hover:text-brand-600 hover:pl-1.5 transition-all duration-300 font-medium"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="select-none pointer-events-none font-display font-bold text-[18vw] md:text-[9rem] leading-none text-brand-500/[0.06] text-center -mb-6 md:-mb-12 mt-8">
          Iron & Ivy
        </div>

        <div className="border-t-2 border-dashed border-ink/10 pt-5 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-ink/40 font-medium">
          <p>© 2025 Iron & Ivy — DBMS mini-project storefront.</p>
          <div className="flex items-center gap-5">
            <span className="hover:text-brand-600 cursor-pointer transition-colors">Privacy</span>
            <span className="hover:text-brand-600 cursor-pointer transition-colors">Terms</span>
            <span className="hover:text-brand-600 cursor-pointer transition-colors">Cookies</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
