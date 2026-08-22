import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ShieldCheck, Zap, Truck, RotateCcw, Award, CheckCircle2, ChevronRight, Laptop, Smartphone, Headphones, Star, Sparkles, Box, Mail } from 'lucide-react';
import { productService } from '../services/productService';
import { ProductCard } from '../components/catalog/ProductCard';
import { ProductCardSkeleton } from '../components/common/Loader';
import { Badge } from '../components/common/Badge';

// Initial fallback starter data
const STARTER_CATEGORIES = [
  { categoryId: 1, name: 'Laptops & Workstations', slug: 'laptops-computers', description: 'Engineered for power users, developers, and computational workloads.', count: '12 Models' },
  { categoryId: 2, name: 'Smartphones & Displays', slug: 'smartphones-tablets', description: 'Flagship mobile devices with 120Hz Dynamic AMOLED screens.', count: '8 Models' },
  { categoryId: 3, name: 'Studio Audio & Wearables', slug: 'audio-wearables', description: 'Reference monitors and hybrid active noise cancelling headphones.', count: '14 Models' },
];

const STARTER_PRODUCTS = [
  {
    productId: 1,
    name: 'ProBook 14X Workstation',
    slug: 'probook-14x',
    brand: 'VORTEX Tech',
    categoryName: 'Laptops & Workstations',
    description: 'Flagship engineering ultrabook featuring CNC aluminum unibody, Liquid Retina XDR display, and 18-hour battery longevity.',
    basePrice: 899.00,
    minPrice: 899.00,
    maxPrice: 1199.00,
    variantCount: 2,
    rating: 5.0,
    totalReviews: 24,
    imageUrl: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=800&q=80',
  },
  {
    productId: 2,
    name: 'AeroPulse ANC Headphones',
    slug: 'aeropulse-anc-headphones',
    brand: 'AeroAcoustics',
    categoryName: 'Studio Audio & Wearables',
    description: 'Studio-grade wireless over-ear headphones with 45dB hybrid active noise cancellation and lossless spatial audio.',
    basePrice: 199.00,
    minPrice: 199.00,
    maxPrice: 199.00,
    variantCount: 2,
    rating: 4.9,
    totalReviews: 18,
    imageUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80',
  },
  {
    productId: 3,
    name: 'Galaxy Pro S26',
    slug: 'galaxy-pro-s26',
    brand: 'NovaTech',
    categoryName: 'Smartphones & Displays',
    description: 'Flagship 5G smartphone equipped with 200MP computational camera, Snapdragon Gen 4 silicon, and Dynamic AMOLED display.',
    basePrice: 799.00,
    minPrice: 799.00,
    maxPrice: 899.00,
    variantCount: 2,
    rating: 4.8,
    totalReviews: 15,
    imageUrl: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=800&q=80',
  }
];

export const HomePage = () => {
  const [categories, setCategories] = useState(STARTER_CATEGORIES);
  const [featuredProducts, setFeaturedProducts] = useState(STARTER_PRODUCTS);
  const [loading, setLoading] = useState(false);
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [newsletterSuccess, setNewsletterSuccess] = useState(false);

  useEffect(() => {
    const loadHomeData = async () => {
      try {
        const [catRes, prodRes] = await Promise.all([
          productService.getCategories(),
          productService.getProducts({ limit: 6 }),
        ]);
        const cats = catRes.data || catRes;
        if (Array.isArray(cats) && cats.length > 0) setCategories(cats);

        const productsData = prodRes.data || prodRes.products || prodRes;
        const list = Array.isArray(productsData) ? productsData : productsData.data;
        if (Array.isArray(list) && list.length > 0) setFeaturedProducts(list);
      } catch (err) {
        console.error('Error loading dynamic home data:', err);
      }
    };
    loadHomeData();
  }, []);

  const getCategoryIcon = (slug) => {
    if (slug.includes('laptop')) return <Laptop className="w-5 h-5 text-slate-900 dark:text-emerald-400" />;
    if (slug.includes('phone')) return <Smartphone className="w-5 h-5 text-slate-900 dark:text-emerald-400" />;
    return <Headphones className="w-5 h-5 text-slate-900 dark:text-emerald-400" />;
  };

  const handleNewsletterSubmit = (e) => {
    e.preventDefault();
    if (newsletterEmail) {
      setNewsletterSuccess(true);
      setNewsletterEmail('');
      setTimeout(() => setNewsletterSuccess(false), 4000);
    }
  };

  return (
    <div className="space-y-16 pb-20 max-w-[1600px] mx-auto px-4 sm:px-8 lg:px-10">
      
      {/* 1. Hero Spotlight Section (Unique Editorial Hardware Showcase) */}
      <section className="relative overflow-hidden bg-slate-950 text-white rounded-3xl mt-6 border border-slate-800/80 shadow-2xl">
        {/* Subtle geometric lighting accents */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/4 w-[400px] h-[400px] bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative px-6 sm:px-12 lg:px-16 py-16 sm:py-24 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Left Column: Headlines & High-Conversion CTAs */}
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-900/90 border border-slate-700/80 text-emerald-400 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
              <span>THE 2026 HARDWARE COLLECTION</span>
            </div>

            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-[1.1] text-white">
              Engineered for Power. <br />
              <span className="text-slate-400 font-extrabold">
                Crafted for Creators.
              </span>
            </h1>

            <p className="text-slate-300 text-sm sm:text-base leading-relaxed max-w-xl">
              Experience precision developer ultrabooks, lossless spatial monitors, and next-gen OLED smartphones built with aerospace aluminum and zero bloatware.
            </p>

            <div className="flex flex-wrap gap-3.5 pt-2">
              <Link
                to="/catalog"
                className="px-7 py-4 rounded-2xl text-xs font-bold text-slate-950 bg-white hover:bg-slate-100 transition-all flex items-center gap-2 shadow-lg shadow-white/10 hover:scale-[1.02]"
              >
                Shop New Arrivals
                <ArrowRight className="w-4 h-4 text-slate-950" />
              </Link>
              <Link
                to="/catalog?category=laptops-computers"
                className="px-7 py-4 rounded-2xl text-xs font-bold text-slate-200 bg-slate-900/80 hover:bg-slate-800 hover:text-white border border-slate-700 transition-all hover:scale-[1.02]"
              >
                Explore Ultrabooks
              </Link>
            </div>

            {/* Quick trust metrics */}
            <div className="grid grid-cols-3 gap-6 pt-6 border-t border-slate-800/80 text-xs text-slate-400">
              <div>
                <span className="block text-white font-extrabold text-lg sm:text-xl">2 Years</span>
                <span>Official Warranty</span>
              </div>
              <div>
                <span className="block text-emerald-400 font-extrabold text-lg sm:text-xl">Free Express</span>
                <span>Shipping &gt; $1,000</span>
              </div>
              <div>
                <span className="block text-white font-extrabold text-lg sm:text-xl">30 Days</span>
                <span>Risk-Free Returns</span>
              </div>
            </div>
          </div>

          {/* Right Column: Hero Spotlight Hardware Card */}
          <div className="lg:col-span-5 bg-slate-900/90 rounded-3xl border border-slate-800 p-6 sm:p-8 space-y-5 shadow-2xl backdrop-blur-sm relative group">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Badge variant="primary" size="sm">
                  Featured Flagship
                </Badge>
              </div>
              <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-emerald-950/80 border border-emerald-800 text-emerald-400 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" />
                In Stock & Ready to Ship
              </span>
            </div>

            <div className="aspect-[4/3] rounded-2xl bg-slate-950/90 p-6 border border-slate-800/80 flex items-center justify-center relative overflow-hidden group-hover:border-slate-700 transition-colors">
              <img
                src="https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=700&q=80"
                alt="ProBook 14X Workstation"
                className="max-h-full object-contain transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute top-3 left-3">
                <span className="px-2.5 py-1 rounded-full bg-slate-900/90 border border-slate-700 text-slate-300 font-semibold text-[10px]">
                  VORTEX Tech
                </span>
              </div>
              <div className="absolute bottom-3 right-3">
                <span className="px-2.5 py-1 rounded-full bg-slate-900/90 border border-slate-700 text-emerald-400 font-mono text-[10px] font-semibold">
                  SKU: PB-14X-SG-16-512
                </span>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-baseline">
                <h3 className="font-bold text-white text-lg sm:text-xl">ProBook 14X Workstation</h3>
                <span className="text-emerald-400 font-mono font-black text-lg">$899.00</span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                Space Gray / 14-inch Liquid Retina XDR / 16GB Unified RAM / 512GB NVMe SSD
              </p>
            </div>

            <Link
              to="/product/probook-14x"
              className="w-full py-3.5 px-4 rounded-xl text-xs font-bold text-slate-950 bg-emerald-400 hover:bg-emerald-300 transition-colors flex items-center justify-center gap-2 shadow-md"
            >
              <span>View Product Details & Specifications</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* 2. Value Proposition Strip (Customer Trust & Guarantees) */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <div className="p-6 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
            <Truck className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">Free Express Delivery</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
            Free 24-48 hour insured courier delivery on all orders exceeding $1,000 nationwide.
          </p>
        </div>

        <div className="p-6 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">2-Year Full Warranty</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
            Every hardware unit includes complimentary 2-year manufacturer coverage for parts and labor.
          </p>
        </div>

        <div className="p-6 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
            <RotateCcw className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">30-Day Return Policy</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
            Try your gear with complete confidence. 100% money-back guarantee with prepaid return labels.
          </p>
        </div>

        <div className="p-6 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
            <Award className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">Factory Sealed & Inspected</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
            Certified authentic with serialized factory seals and multi-point hardware verification.
          </p>
        </div>
      </section>

      {/* 3. Hardware Categories */}
      <section className="space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-2 border-b border-slate-200/80 dark:border-slate-800 pb-4">
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              Shop by Category
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Explore curated devices built for programming, audio production, and mobile workflows.
            </p>
          </div>
          <Link
            to="/catalog"
            className="text-xs font-bold text-slate-900 dark:text-emerald-400 hover:text-slate-600 dark:hover:text-emerald-300 flex items-center gap-1 group"
          >
            View All Categories
            <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {categories.map((category) => (
            <Link
              key={category.categoryId || category.category_id || category.slug}
              to={`/catalog?category=${category.slug}`}
              className="group relative rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 hover:border-slate-400 dark:hover:border-slate-700 p-6 shadow-sm hover:shadow-xl transition-all flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center font-bold mb-4 group-hover:scale-110 transition-transform">
                  {getCategoryIcon(category.slug)}
                </div>
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-bold text-slate-900 dark:text-white group-hover:text-slate-700 dark:group-hover:text-emerald-400 transition-colors">
                    {category.name}
                  </h3>
                  <span className="text-[10px] font-semibold text-slate-400 dark:text-slate-500">
                    {category.count || 'Explore'}
                  </span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                  {category.description || 'High-performance hardware with full variant specifications.'}
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs font-bold text-slate-900 dark:text-white group-hover:text-slate-700 dark:group-hover:text-emerald-400">
                <span>Browse Products</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* 4. Featured Hardware & Best Sellers */}
      <section className="space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-2 border-b border-slate-200/80 dark:border-slate-800 pb-4">
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              Featured Flagships & Best Sellers
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Customer favorites tested and benchmarked for uncompromising daily reliability.
            </p>
          </div>
          <Link
            to="/catalog"
            className="text-xs font-bold text-slate-900 dark:text-emerald-400 hover:text-slate-600 dark:hover:text-emerald-300 flex items-center gap-1 group"
          >
            Explore Complete Catalog
            <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <ProductCardSkeleton />
            <ProductCardSkeleton />
            <ProductCardSkeleton />
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredProducts.map((product) => (
              <ProductCard
                key={product.productId || product.product_id}
                product={product}
              />
            ))}
          </div>
        )}
      </section>

      {/* 5. VORTEX Hardware Club Newsletter Banner */}
      <section className="bg-slate-950 rounded-3xl p-8 sm:p-12 text-white border border-slate-800 shadow-2xl relative overflow-hidden">
        <div className="max-w-2xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-emerald-400 text-xs font-semibold">
            <Mail className="w-3.5 h-3.5" />
            <span>JOIN THE VORTEX CREATOR CLUB</span>
          </div>

          <h2 className="text-2xl sm:text-4xl font-black tracking-tight text-white">
            Get $50 off your first hardware order.
          </h2>

          <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
            Subscribe to our weekly hardware digest for early access to limited edition drops, benchmark comparisons, and creator discounts.
          </p>

          <form onSubmit={handleNewsletterSubmit} className="pt-2 flex flex-col sm:flex-row gap-3 max-w-md">
            <input
              type="email"
              required
              value={newsletterEmail}
              onChange={(e) => setNewsletterEmail(e.target.value)}
              placeholder="Enter your email address..."
              className="flex-1 px-4 py-3 text-xs bg-slate-900 border border-slate-800 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 placeholder:text-slate-500"
            />
            <button
              type="submit"
              className="px-6 py-3 text-xs font-bold text-slate-950 bg-white hover:bg-slate-200 rounded-xl transition-colors shadow-md flex-shrink-0"
            >
              Subscribe
            </button>
          </form>

          {newsletterSuccess && (
            <p className="text-xs font-bold text-emerald-400 animate-in fade-in">
              ✓ You're in! Check your inbox for your $50 welcome voucher code.
            </p>
          )}
        </div>
      </section>
    </div>
  );
};
