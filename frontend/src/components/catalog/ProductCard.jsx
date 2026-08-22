import React from 'react';
import { Link } from 'react-router-dom';
import { RatingStars } from '../common/RatingStars';
import { Badge } from '../common/Badge';
import { Layers, ArrowRight } from 'lucide-react';

export const ProductCard = ({ product }) => {
  // Format price
  const formatPrice = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 2,
    }).format(amount || 0);
  };

  const minPrice = product.minPrice ?? product.min_price ?? product.basePrice ?? product.base_price;
  const maxPrice = product.maxPrice ?? product.max_price ?? product.basePrice ?? product.base_price;
  const variantCount = product.variantCount ?? product.variant_count ?? product.variants?.length ?? 1;
  const rating = product.rating ?? product.averageRating ?? product.average_rating ?? 4.8;
  const totalReviews = product.reviewCount ?? product.totalReviews ?? product.total_reviews ?? 12;

  // Placeholder images for tech products
  const defaultImage = product.imageUrl || product.image_url || product.variants?.[0]?.imageUrl || product.variants?.[0]?.image_url || 
    'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=600&q=80';

  const productSlug = product.slug || product.productId || product.product_id;

  return (
    <div className="group bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 hover:border-slate-400 dark:hover:border-slate-700 shadow-sm hover:shadow-lg transition-all duration-200 flex flex-col overflow-hidden">
      {/* Product Image Container */}
      <Link
        to={`/product/${productSlug}`}
        className="relative aspect-[4/3] bg-slate-50 dark:bg-slate-950/60 overflow-hidden flex items-center justify-center p-6 border-b border-slate-100 dark:border-slate-800"
      >
        <img
          src={defaultImage}
          alt={product.name}
          className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
          loading="lazy"
          onError={(e) => {
            e.currentTarget.src = 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?auto=format&fit=crop&w=600&q=80';
          }}
        />

        {/* Brand Tag */}
        <div className="absolute top-3 left-3">
          <Badge variant="primary" size="sm" className="bg-white/90 dark:bg-slate-800/90 shadow-sm text-slate-800 dark:text-slate-200 border-slate-200 dark:border-slate-700 backdrop-blur-sm">
            {product.brand}
          </Badge>
        </div>

        {/* Variant Count Tag */}
        <div className="absolute bottom-3 right-3">
          <span className="inline-flex items-center gap-1 text-[11px] font-mono font-semibold bg-slate-950/90 dark:bg-slate-800 text-slate-200 px-2 py-0.5 rounded-md shadow-sm border border-slate-800 dark:border-slate-700 backdrop-blur-sm">
            <Layers className="w-3 h-3 text-emerald-400" />
            {variantCount} {variantCount === 1 ? 'Variant' : 'Variants'}
          </span>
        </div>
      </Link>

      {/* Product Details */}
      <div className="p-5 flex-1 flex flex-col">
        {/* Category */}
        <p className="text-[11px] font-mono font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
          {product.categoryName || product.category_name || product.category?.name || 'Hardware'}
        </p>

        {/* Name */}
        <Link
          to={`/product/${productSlug}`}
          className="font-bold text-slate-900 dark:text-white text-base line-clamp-1 hover:text-slate-700 dark:hover:text-slate-300 transition-colors mb-1.5"
        >
          {product.name}
        </Link>

        {/* Description snippet */}
        <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 mb-3 leading-relaxed">
          {product.description}
        </p>

        {/* Rating */}
        <div className="mb-4">
          <RatingStars rating={rating} totalReviews={totalReviews} size="sm" />
        </div>

        {/* Price & Action */}
        <div className="mt-auto pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-[10px] uppercase font-semibold text-slate-400 dark:text-slate-500 block">Starting from</span>
            <div className="flex items-baseline gap-1">
              <span className="text-lg font-black text-slate-900 dark:text-white font-mono">
                {formatPrice(minPrice)}
              </span>
              {maxPrice > minPrice && (
                <span className="text-xs text-slate-400 dark:text-slate-500 font-mono">
                  - {formatPrice(maxPrice)}
                </span>
              )}
            </div>
          </div>

          <Link
            to={`/product/${productSlug}`}
            className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white bg-slate-950 dark:bg-emerald-600 hover:bg-slate-800 dark:hover:bg-emerald-500 transition-all shadow-sm"
          >
            Configure
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>
      </div>
    </div>
  );
};
