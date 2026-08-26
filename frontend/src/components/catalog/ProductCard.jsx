import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { RatingStars } from '../common/RatingStars';
import { Heart, Plus, Check, Loader2 } from 'lucide-react';
import { getProductImage, FALLBACK_IMAGE } from '../../utils/productImages';
import { SmartImage } from '../common/SmartImage';
import { useWishlistStore } from '../../store/useWishlistStore';
import { useCartStore } from '../../store/useCartStore';
import { useAuthStore } from '../../store/useAuthStore';
import { useToastStore } from '../../store/useToastStore';
import { productService } from '../../services/productService';

const formatPrice = (amount) =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount || 0);

/* Rotating pastel backdrops so the grid feels playful, not sterile */
const PASTELS = ['bg-peach', 'bg-mint-100', 'bg-sky-200', 'bg-lemon-300/50'];

export const ProductCard = ({ product }) => {
  const navigate = useNavigate();
  const { toggleWishlist, isInWishlist } = useWishlistStore();
  const { addItem } = useCartStore();
  const { isAuthenticated } = useAuthStore();
  const inWishlist = isInWishlist(product.productId);

  const [adding, setAdding] = useState(false);
  const [added, setAdded] = useState(false);

  const minPrice = product.minPrice ?? product.basePrice ?? 0;
  const maxPrice = product.maxPrice ?? product.basePrice ?? 0;
  const rating = product.rating ?? product.averageRating ?? 0;
  const totalReviews = product.totalReviews ?? product.reviewCount ?? 0;

  const hasDiscount = maxPrice > minPrice;
  const discountPercent = hasDiscount ? Math.round(((maxPrice - minPrice) / maxPrice) * 100) : 0;
  const pastel = PASTELS[product.productId % PASTELS.length];

  const handleWishlistToggle = (e) => {
    e.preventDefault();
    e.stopPropagation();
    toggleWishlist(product);
  };

  const handleQuickAdd = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isAuthenticated) {
      useToastStore.getState().error('Please sign in to add items to your cart.');
      navigate('/login');
      return;
    }

    if (adding) return;
    setAdding(true);

    try {
      let targetVariantId = product.defaultVariantId || product.default_variant_id || product.variantId;

      if (!targetVariantId) {
        const detailsRes = await productService.getProductById(product.productId);
        const details = detailsRes.data || detailsRes;
        const variants = details.variants || [];
        const activeVariant = variants.find((v) => v.stockQuantity > 0) || variants[0];
        if (activeVariant) {
          targetVariantId = activeVariant.variantId || activeVariant.variant_id;
        }
      }

      if (!targetVariantId) {
        navigate(`/product/${product.productId}`);
        return;
      }

      await addItem(targetVariantId, 1);
      setAdded(true);
      setTimeout(() => setAdded(false), 1500);
    } catch (err) {
      console.error('Quick add error:', err);
    } finally {
      setAdding(false);
    }
  };

  return (
    <div className="group relative bg-white rounded-[2rem] p-3.5 shadow-card hover:shadow-lift hover:-translate-y-2 hover:-rotate-1 transition-all duration-500 flex flex-col h-full">
      {/* Image tile */}
      <Link
        to={`/product/${product.productId}`}
        className={`relative block h-52 sm:h-56 rounded-[1.4rem] overflow-hidden ${pastel}`}
        style={{ textDecoration: 'none' }}
      >
        <SmartImage
          src={getProductImage(product.productId)}
          fallback={FALLBACK_IMAGE}
          alt={product.name}
          className="w-full h-full object-contain p-5 drop-shadow-md group-hover:scale-110 group-hover:-rotate-2 transition-transform duration-500 ease-out"
        />
        {/* sticker discount chip */}
        {discountPercent > 0 && (
          <span className="absolute -top-1 -left-1 px-3 py-1.5 rounded-2xl rounded-tl-[1.4rem] text-[11px] font-extrabold text-ink bg-lemon-400 shadow-md rotate-[-4deg]">
            −{discountPercent}%
          </span>
        )}
        {(product.variantCount ?? 0) > 1 && (
          <span className="absolute bottom-3 left-3 chip !py-1 !px-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            {(product.variantCount)} variants
          </span>
        )}
      </Link>

      {/* wishlist */}
      <button
        onClick={handleWishlistToggle}
        aria-label={inWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
        className={`absolute top-6 right-6 z-10 p-2 rounded-full bg-white border-2 border-ink/10 shadow-sm transition-all duration-300 ${
          inWishlist
            ? 'text-brand-600 scale-110 border-brand-300'
            : 'text-ink/30 hover:text-brand-600 hover:scale-110'
        }`}
      >
        <Heart className={`w-4 h-4 ${inWishlist ? 'fill-current' : ''}`} />
      </button>

      {/* Body */}
      <div className="flex flex-col flex-1 px-2 pt-4 pb-1">
        <p className="text-[10px] font-extrabold uppercase tracking-[0.22em] text-brand-600">
          {product.brand || product.categoryName || 'Iron & Ivy'}
        </p>

        <Link
          to={`/product/${product.productId}`}
          style={{ textDecoration: 'none', color: 'inherit' }}
        >
          <h3 className="mt-1.5 font-display font-semibold text-[15px] text-ink line-clamp-2 leading-snug min-h-[2.6rem] group-hover:text-brand-600 transition-colors">
            {product.name}
          </h3>
        </Link>

        <div className="mt-2">
          <RatingStars rating={rating} totalReviews={totalReviews} size="sm" />
        </div>

        <div className="mt-auto flex items-end justify-between pt-3.5 gap-2">
          <div className="flex flex-col">
            <span className="font-display font-bold text-xl text-ink leading-none">
              {formatPrice(minPrice)}
            </span>
            {hasDiscount && (
              <span className="text-xs text-ink/35 line-through mt-1">{formatPrice(maxPrice)}</span>
            )}
          </div>
          <button
            onClick={handleQuickAdd}
            disabled={adding}
            aria-label={`Quick add ${product.name}`}
            className={`btn-pop relative shrink-0 w-11 h-11 rounded-full text-ink flex items-center justify-center shadow-md transition-all duration-300 cursor-pointer ${
              added
                ? 'bg-mint-400 text-ink scale-105 shadow-glow'
                : 'bg-brand-500 hover:bg-brand-400 hover:shadow-glow active:scale-90'
            }`}
          >
            <span className="pop-circle tl" /><span className="pop-circle tr" />
            <span className="pop-circle bl" /><span className="pop-circle br" />
            {adding ? (
              <Loader2 className="w-5 h-5 animate-spin text-ink" />
            ) : added ? (
              <Check className="w-5 h-5 stroke-[2.75]" />
            ) : (
              <Plus className="w-5 h-5" strokeWidth={2.75} />
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export const ProductCardSkeleton = () => (
  <div className="bg-white rounded-[2rem] p-3.5 shadow-card">
    <div className="skeleton h-52 sm:h-56 rounded-[1.4rem]" />
    <div className="px-2 pt-4 pb-1 space-y-2.5">
      <div className="skeleton h-2.5 rounded-full w-1/4" />
      <div className="skeleton h-4 rounded-lg w-3/4" />
      <div className="skeleton h-3 rounded-full w-1/3" />
      <div className="flex justify-between items-end pt-2">
        <div className="skeleton h-6 w-24 rounded-lg" />
        <div className="skeleton h-11 w-11 rounded-full" />
      </div>
    </div>
  </div>
);
