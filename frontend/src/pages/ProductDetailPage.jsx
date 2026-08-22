import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  ShoppingBag,
  Zap,
  ShieldCheck,
  Truck,
  RotateCcw,
  Layers,
  CheckCircle2,
  ChevronRight,
  Star,
  Info,
  Package,
  Award,
  Clock,
  Sparkles,
} from 'lucide-react';
import { productService } from '../services/productService';
import { useCartStore } from '../store/useCartStore';
import { useAuthStore } from '../store/useAuthStore';
import { VariantSelector } from '../components/catalog/VariantSelector';
import { ReviewList } from '../components/catalog/ReviewList';
import { RatingStars } from '../components/common/RatingStars';
import { Badge } from '../components/common/Badge';
import { Loader } from '../components/common/Loader';

export const ProductDetailPage = () => {
  const { slugOrId } = useParams();
  const navigate = useNavigate();

  const { isAuthenticated } = useAuthStore();
  const { addItem } = useCartStore();

  const [product, setProduct] = useState(null);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('specs');
  const [isAdding, setIsAdding] = useState(false);
  const [actionSuccess, setActionSuccess] = useState('');

  // Load product details
  const loadProduct = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await productService.getProductBySlugOrId(slugOrId);
      const prodData = res.data || res;
      setProduct(prodData);

      // Default select the first active variant
      if (prodData.variants && prodData.variants.length > 0) {
        setSelectedVariant(prodData.variants[0]);
      }
    } catch (err) {
      console.error('Error loading product:', err);
      setError(err.message || 'Product not found');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProduct();
  }, [slugOrId]);

  if (loading) {
    return (
      <div className="max-w-[1600px] mx-auto px-4 py-20">
        <Loader size="lg" text="Loading product specifications & variant options..." />
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center space-y-4">
        <h2 className="text-xl font-bold text-slate-800 dark:text-slate-200">Product Not Found</h2>
        <p className="text-xs text-slate-500 dark:text-slate-400">{error || 'The requested product is currently unavailable.'}</p>
        <Link
          to="/catalog"
          className="inline-block px-5 py-2.5 text-xs font-bold text-white bg-slate-900 dark:bg-emerald-600 hover:bg-slate-800 rounded-xl"
        >
          Return to Catalog
        </Link>
      </div>
    );
  }

  const formatPrice = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 2,
    }).format(amount || 0);
  };

  // Pricing & Stock calculations
  const currentPrice = selectedVariant ? Number(selectedVariant.price) : Number(product.basePrice || product.base_price || 0);
  const stock = selectedVariant ? (selectedVariant.stockQuantity ?? selectedVariant.stock_quantity ?? 0) : 0;
  const isOutOfStock = stock === 0;

  // Selected image
  const displayImage = selectedVariant?.imageUrl || selectedVariant?.image_url || product.imageUrl || product.image_url ||
    'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=800&q=80';

  // Add to cart handler
  const handleAddToCart = async () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    if (!selectedVariant) return;

    setIsAdding(true);
    setActionSuccess('');
    try {
      const vId = selectedVariant.variantId || selectedVariant.variant_id;
      await addItem(vId, quantity);
      setActionSuccess('Added to cart!');
      setTimeout(() => setActionSuccess(''), 2500);
    } catch (err) {
      alert(err.message || 'Failed to add item to cart');
    } finally {
      setIsAdding(false);
    }
  };

  // Buy Now handler
  const handleBuyNow = async () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    if (!selectedVariant) return;

    try {
      const vId = selectedVariant.variantId || selectedVariant.variant_id;
      await addItem(vId, quantity);
      navigate('/checkout');
    } catch (err) {
      alert(err.message || 'Failed to initiate checkout');
    }
  };

  return (
    <div className="max-w-[1600px] mx-auto px-4 sm:px-8 lg:px-10 py-6 sm:py-8 space-y-8 sm:space-y-12">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 sm:gap-2 text-[11px] sm:text-xs font-medium text-slate-500 dark:text-slate-400 overflow-x-auto whitespace-nowrap pb-1">
        <Link to="/" className="hover:text-slate-900 dark:hover:text-white">Home</Link>
        <ChevronRight className="w-3 h-3 flex-shrink-0" />
        <Link to="/catalog" className="hover:text-slate-900 dark:hover:text-white">Catalog</Link>
        <ChevronRight className="w-3 h-3 flex-shrink-0" />
        <Link
          to={`/catalog?category=${product.category?.slug || product.category_slug}`}
          className="hover:text-slate-900 dark:hover:text-white"
        >
          {product.category?.name || product.category_name || 'Hardware'}
        </Link>
        <ChevronRight className="w-3 h-3 flex-shrink-0" />
        <span className="text-slate-900 dark:text-white font-bold truncate max-w-[150px] sm:max-w-xs">{product.name}</span>
      </nav>

      {/* Product View Top Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-start">
        
        {/* Left: Gallery View */}
        <div className="lg:col-span-6 space-y-4">
          <div className="aspect-[4/3] bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-4 sm:p-8 flex items-center justify-center shadow-sm relative overflow-hidden">
            <img
              src={displayImage}
              alt={product.name}
              className="max-h-full max-w-full object-contain transition-all duration-300 hover:scale-105"
              onError={(e) => {
                e.currentTarget.src = 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?auto=format&fit=crop&w=800&q=80';
              }}
            />

            <div className="absolute top-4 left-4">
              <Badge variant="primary" size="md">
                {product.brand}
              </Badge>
            </div>

            {selectedVariant && (
              <div className="absolute bottom-3 right-3 sm:bottom-4 sm:right-4">
                <span className="px-2.5 py-1 rounded-full bg-slate-950/90 text-white font-mono text-[10px] sm:text-[11px] font-semibold backdrop-blur-sm border border-slate-800">
                  SKU: {selectedVariant.sku}
                </span>
              </div>
            )}
          </div>

          {/* Guarantees Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-3">
            <div className="p-3 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl flex items-center gap-2.5 text-xs text-slate-700 dark:text-slate-300">
              <Truck className="w-4 h-4 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
              <span className="font-medium">Free Delivery &gt; $1000</span>
            </div>
            <div className="p-3 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl flex items-center gap-2.5 text-xs text-slate-700 dark:text-slate-300">
              <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
              <span className="font-medium">2-Year Full Warranty</span>
            </div>
            <div className="p-3 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl flex items-center gap-2.5 text-xs text-slate-700 dark:text-slate-300">
              <RotateCcw className="w-4 h-4 text-slate-600 dark:text-slate-400 flex-shrink-0" />
              <span className="font-medium">30-Day Returns</span>
            </div>
          </div>
        </div>

        {/* Right: Variant Selection & Purchasing Engine */}
        <div className="lg:col-span-6 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-5 sm:p-8 shadow-sm space-y-6">
          
          {/* Header & Title */}
          <div>
            <p className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider mb-1">
              {product.category?.name || product.category_name}
            </p>
            <h1 className="text-xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              {product.name}
            </h1>

            <div className="flex flex-wrap items-center gap-3 sm:gap-4 mt-3">
              <RatingStars
                rating={product.reviews?.averageRating || product.averageRating || 4.9}
                totalReviews={product.reviews?.totalReviews || product.totalReviews || 18}
                size="sm"
              />
              <span className="text-xs text-slate-300 dark:text-slate-700 hidden sm:inline">|</span>
              <span className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                In Stock & Factory Sealed
              </span>
            </div>
          </div>

          {/* Dynamic Variant Price Display */}
          <div className="py-3.5 px-4 bg-slate-50 dark:bg-slate-950/80 rounded-2xl border border-slate-200/80 dark:border-slate-800 flex items-baseline justify-between">
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500 block">Unit Price</span>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white font-mono">
                  {formatPrice(currentPrice)}
                </span>
                <span className="text-xs text-slate-400 dark:text-slate-500 font-semibold">+ Free Shipping</span>
              </div>
            </div>

            {selectedVariant && (
              <span className="text-xs text-slate-500 dark:text-slate-400 text-right">
                {selectedVariant.color ? `${selectedVariant.color} ` : ''}
                <span className="block sm:inline">{selectedVariant.storage || selectedVariant.size || ''}</span>
              </span>
            )}
          </div>

          {/* Description */}
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
            {product.description}
          </p>

          {/* Interactive Multi-Attribute Variant Selector */}
          <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
            <VariantSelector
              variants={product.variants || []}
              selectedVariant={selectedVariant}
              onSelectVariant={(v) => setSelectedVariant(v)}
            />
          </div>

          {/* Quantity and Actions */}
          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <span className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">Quantity:</span>
                <div className="flex items-center border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden bg-slate-50 dark:bg-slate-800">
                  <button
                    type="button"
                    disabled={quantity <= 1 || isOutOfStock}
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    className="px-3 py-2 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 disabled:opacity-30"
                  >
                    -
                  </button>
                  <span className="w-9 text-center text-xs font-bold text-slate-900 dark:text-white">{quantity}</span>
                  <button
                    type="button"
                    disabled={quantity >= stock || isOutOfStock}
                    onClick={() => setQuantity((q) => q + 1)}
                    className="px-3 py-2 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 disabled:opacity-30"
                  >
                    +
                  </button>
                </div>
              </div>

              <span className="text-xs text-slate-500 dark:text-slate-400">
                Total: <strong className="text-slate-900 dark:text-white font-black font-mono">{formatPrice(currentPrice * quantity)}</strong>
              </span>
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <button
                type="button"
                disabled={isOutOfStock || isAdding}
                onClick={handleAddToCart}
                className="py-3.5 px-4 rounded-xl text-xs font-bold text-slate-900 dark:text-white bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 border border-slate-200 dark:border-slate-700"
              >
                <ShoppingBag className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                {actionSuccess || (isAdding ? 'Adding...' : 'Add to Cart')}
              </button>

              <button
                type="button"
                disabled={isOutOfStock}
                onClick={handleBuyNow}
                className="py-3.5 px-4 rounded-xl text-xs font-bold text-white bg-slate-900 dark:bg-emerald-600 hover:bg-slate-800 dark:hover:bg-emerald-500 disabled:opacity-40 disabled:cursor-not-allowed shadow-md transition-all flex items-center justify-center gap-2"
              >
                <Zap className="w-4 h-4" />
                Buy Now (Instant Checkout)
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs: Specifications / Box Contents & Warranty / Customer Reviews */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm overflow-hidden">
        {/* Tab Headers with Horizontal Scroll on Mobile */}
        <div className="flex border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40 px-4 sm:px-6 overflow-x-auto whitespace-nowrap scrollbar-none">
          <button
            onClick={() => setActiveTab('specs')}
            className={`py-3.5 sm:py-4 px-4 sm:px-6 text-xs font-bold uppercase tracking-wider border-b-2 transition-all flex-shrink-0 ${
              activeTab === 'specs'
                ? 'border-slate-900 dark:border-emerald-400 text-slate-900 dark:text-emerald-400 bg-white dark:bg-slate-900'
                : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Technical Specifications
          </button>
          <button
            onClick={() => setActiveTab('box')}
            className={`py-3.5 sm:py-4 px-4 sm:px-6 text-xs font-bold uppercase tracking-wider border-b-2 transition-all flex-shrink-0 ${
              activeTab === 'box'
                ? 'border-slate-900 dark:border-emerald-400 text-slate-900 dark:text-emerald-400 bg-white dark:bg-slate-900'
                : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            In The Box & Warranty
          </button>
          <button
            onClick={() => setActiveTab('reviews')}
            className={`py-3.5 sm:py-4 px-4 sm:px-6 text-xs font-bold uppercase tracking-wider border-b-2 transition-all flex-shrink-0 ${
              activeTab === 'reviews'
                ? 'border-slate-900 dark:border-emerald-400 text-slate-900 dark:text-emerald-400 bg-white dark:bg-slate-900'
                : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Customer Reviews ({product.reviews?.totalReviews || product.reviews?.items?.length || 0})
          </button>
        </div>

        {/* Tab Body */}
        <div className="p-5 sm:p-8">
          {activeTab === 'specs' && (
            <div className="space-y-6">
              <h3 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                Hardware Architecture & Technical Specifications
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/80 border border-slate-200/80 dark:border-slate-800">
                  <span className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500 block">Finish / Color</span>
                  <span className="text-sm font-semibold text-slate-800 dark:text-slate-200">{selectedVariant?.color || 'Standard Silver'}</span>
                </div>
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/80 border border-slate-200/80 dark:border-slate-800">
                  <span className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500 block">Display & Form Factor</span>
                  <span className="text-sm font-semibold text-slate-800 dark:text-slate-200">{selectedVariant?.size || 'Standard'}</span>
                </div>
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/80 border border-slate-200/80 dark:border-slate-800">
                  <span className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500 block">Unified Memory / Storage</span>
                  <span className="text-sm font-semibold text-slate-800 dark:text-slate-200">{selectedVariant?.storage || 'High Capacity'}</span>
                </div>
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/80 border border-slate-200/80 dark:border-slate-800">
                  <span className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500 block">Manufacturer Part Number</span>
                  <span className="text-sm font-mono font-semibold text-emerald-600 dark:text-emerald-400">{selectedVariant?.sku || 'N/A'}</span>
                </div>
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/80 border border-slate-200/80 dark:border-slate-800">
                  <span className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500 block">Warehouse Availability</span>
                  <span className="text-sm font-semibold text-slate-800 dark:text-slate-200">{stock} Units in Warehouse</span>
                </div>
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/80 border border-slate-200/80 dark:border-slate-800">
                  <span className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500 block">Base MSRP</span>
                  <span className="text-sm font-semibold text-slate-800 dark:text-slate-200 font-mono">{formatPrice(product.basePrice || product.base_price)}</span>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'box' && (
            <div className="space-y-6 text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-800 space-y-3">
                  <div className="flex items-center gap-2 font-bold text-slate-900 dark:text-white uppercase text-xs">
                    <Package className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    <span>Package Contents</span>
                  </div>
                  <ul className="space-y-2 text-slate-600 dark:text-slate-300 list-disc list-inside">
                    <li>1x {product.name} ({selectedVariant?.color || 'Selected Finish'})</li>
                    <li>1x Braided USB-C to USB-C Fast Charging Cable (2m)</li>
                    <li>1x High-Efficiency GaN Power Adapter</li>
                    <li>1x Quick Start Guide & Safety Regulatory Documentation</li>
                  </ul>
                </div>

                <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-800 space-y-3">
                  <div className="flex items-center gap-2 font-bold text-slate-900 dark:text-white uppercase text-xs">
                    <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    <span>2-Year Comprehensive Warranty</span>
                  </div>
                  <p className="text-slate-600 dark:text-slate-300">
                    Includes direct manufacturer protection against defects in materials and workmanship. 24/7 dedicated creator support and priority repair replacement.
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'reviews' && (
            <ReviewList
              productId={product.productId || product.product_id}
              reviews={product.reviews || {}}
              onReviewAdded={loadProduct}
            />
          )}
        </div>
      </div>
    </div>
  );
};
