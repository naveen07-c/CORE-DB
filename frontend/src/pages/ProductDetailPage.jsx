import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  ShoppingBag,
  ArrowRight,
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
  Minus,
  Plus,
  Heart,
  Share2,
  Truck as TruckIcon,
  Shield,
  RotateCcw as RotateIcon,
} from 'lucide-react';
import { productService } from '../services/productService';
import { useCartStore } from '../store/useCartStore';
import { useAuthStore } from '../store/useAuthStore';
import { VariantSelector } from '../components/catalog/VariantSelector';
import { ReviewList } from '../components/catalog/ReviewList';
import { ProductCard } from '../components/catalog/ProductCard';
import { RatingStars } from '../components/common/RatingStars';
import { Badge } from '../components/common/Badge';
import { useToastStore } from '../store/useToastStore';
import { getProductImage } from '../utils/productImages';

export const ProductDetailPage = () => {
  const { productId } = useParams();
  const navigate = useNavigate();
  const { addItem, openDrawer } = useCartStore();
  const { isAuthenticated } = useAuthStore();

  const [product, setProduct] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('description');
  const [isAdding, setIsAdding] = useState(false);

  const { success: toastSuccess, error: toastError } = useToastStore();

  const formatPrice = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount || 0);
  };

  const loadProduct = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await productService.getProductById(productId);
      const prodData = res.data || res;
      setProduct(prodData);

      if (prodData.variants && prodData.variants.length > 0) {
        setSelectedVariant(prodData.variants[0]);
      }

      // Related products from the same category
      if (prodData.categoryId) {
        try {
          const relRes = await productService.getProducts({
            category: prodData.categoryId,
            limit: 8,
          });
          const relData = relRes.data || relRes.products || relRes;
          const relList = Array.isArray(relData) ? relData : relData?.data || [];
          setRelatedProducts(
            relList.filter((p) => p.productId !== prodData.productId).slice(0, 4)
          );
        } catch (relErr) {
          console.error('Error loading related products:', relErr);
        }
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
  }, [productId]);

  const handleAddToCart = async () => {
    if (!selectedVariant) return;
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    setIsAdding(true);
    try {
      await addItem(selectedVariant.variantId, quantity);
      openDrawer();
    } catch (err) {
      // Error toast handled in store
    } finally {
      setIsAdding(false);
    }
  };

  const handleBuyNow = async () => {
    if (!selectedVariant) return;
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    setIsAdding(true);
    try {
      await addItem(selectedVariant.variantId, quantity);
      navigate('/checkout');
    } catch (err) {
      // Error toast handled in store
    } finally {
      setIsAdding(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-2 gap-8">
          <div className="aspect-square bg-gray-200 animate-pulse rounded-xl" />
          <div className="space-y-6">
            <div className="h-6 bg-gray-200 animate-pulse rounded w-1/3" />
            <div className="h-8 bg-gray-200 animate-pulse rounded w-1/2" />
            <div className="h-10 bg-gray-200 animate-pulse rounded w-3/4" />
            <div className="h-12 bg-gray-200 animate-pulse rounded w-1/2" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
        <div className="text-6xl mb-4">😕</div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Product Not Found</h1>
        <p className="text-gray-500 mb-6">The product you're looking for doesn't exist or has been removed.</p>
        <Link to="/catalog" className="btn-primary">
          Back to catalog
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    );
  }

  const minPrice = product.minPrice ?? product.basePrice ?? 0;
  const maxPrice = product.maxPrice ?? product.basePrice ?? 0;
  const hasDiscount = maxPrice > minPrice;
  const discountPercent = hasDiscount ? Math.round(((maxPrice - minPrice) / maxPrice) * 100) : 0;
  const rating = product.rating ?? product.averageRating ?? 0;
  const totalReviews = product.totalReviews ?? product.reviewCount ?? 0;
  const mainImage = getProductImage(product.productId, selectedVariant?.variantId);

  const breadcrumbs = [
    { label: 'Home', href: '/' },
    { label: 'Catalog', href: '/catalog' },
    { label: product.category?.name || product.categoryName || 'Products', href: `/catalog?category=${product.categoryId}` },
    { label: product.name, href: null },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Breadcrumbs */}
      <nav className="mb-6" aria-label="Breadcrumb">
        <ol className="flex flex-wrap items-center gap-2 text-sm text-gray-500">
          {breadcrumbs.map((crumb, index) => (
            <li key={index} className="flex items-center gap-2">
              {index > 0 && <ChevronRight className="w-4 h-4 text-gray-300" />}
              {crumb.href ? (
                <Link to={crumb.href} className="hover:text-gray-900 transition-colors">
                  {crumb.label}
                </Link>
              ) : (
                <span className="text-gray-900 font-medium truncate max-w-[150px]">{crumb.label}</span>
              )}
            </li>
          ))}
        </ol>
      </nav>

      {/* Product Grid */}
      <div className="grid lg:grid-cols-2 gap-8 lg:gap-12">
        {/* Image Gallery */}
        <div className="space-y-4">
          <div className="aspect-square bg-gray-50 rounded-2xl overflow-hidden relative">
            <img
              src={mainImage}
              alt={product.name}
              className="w-full h-full object-cover"
              id="main-image"
            />
            {hasDiscount && (
              <div className="absolute top-4 left-4">
                <span className="px-3 py-1 text-sm font-bold text-white bg-red-600 rounded">
                  -{discountPercent}%
                </span>
              </div>
            )}
            <div className="absolute top-4 right-4 flex flex-col gap-2">
              <button className="w-10 h-10 bg-white/90 rounded-full flex items-center justify-center shadow-md hover:bg-white transition-colors" aria-label="Add to wishlist">
                <Heart className="w-5 h-5 text-gray-700" />
              </button>
              <button className="w-10 h-10 bg-white/90 rounded-full flex items-center justify-center shadow-md hover:bg-white transition-colors" aria-label="Share">
                <Share2 className="w-5 h-5 text-gray-700" />
              </button>
            </div>
          </div>

          {product.variants && product.variants.length > 1 && (
            <div className="flex gap-2 overflow-x-auto pb-2">
              {product.variants.map((variant) => (
                <button
                  key={variant.variantId}
                  onClick={() => setSelectedVariant(variant)}
                  className={`flex-shrink-0 w-20 h-20 rounded-lg border-2 overflow-hidden transition-all ${
                    selectedVariant?.variantId === variant.variantId
                      ? 'border-primary-600 ring-2 ring-primary-600/20'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <img
                    src={getProductImage(product.productId, variant.variantId)}
                    alt={`${product.name} - ${variant.color || variant.size || variant.storage || 'Variant'}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product Info */}
        <div className="space-y-6">
          <div>
            <p className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-1">
              {product.category?.name || product.categoryName || 'General'}
            </p>
            <h1 className="text-3xl font-bold text-gray-900 mb-3">{product.name}</h1>
            <div className="flex items-center gap-3">
              <RatingStars rating={rating} totalReviews={totalReviews} size="md" />
              {product.brand && (
                <span className="text-sm text-gray-500">by {product.brand}</span>
              )}
            </div>
          </div>

          {/* Price */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 pt-4 border-t border-gray-100">
            <div className="flex items-baseline gap-3">
              {hasDiscount && (
                <span className="text-sm text-gray-400 self-center line-through">
                  {formatPrice(maxPrice)}
                </span>
              )}
              <span className="font-display font-bold text-4xl text-ink">
                {formatPrice(selectedVariant?.price || minPrice)}
              </span>
              {hasDiscount && (
                <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-lemon-400 text-ink shadow-md">
                  −{discountPercent}%
                </span>
              )}
            </div>
          </div>

          {/* Variant Selector */}
          {product.variants && product.variants.length > 0 && (
            <VariantSelector
              variants={product.variants}
              selectedVariant={selectedVariant}
              onSelectVariant={setSelectedVariant}
              productId={product.productId}
            />
          )}

          {/* Quantity */}
          <div className="pt-4 border-t border-gray-100">
            <label className="block text-sm font-medium text-gray-700 mb-2">Quantity</label>
            <div className="flex items-center gap-3">
              <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-12 h-12 flex items-center justify-center bg-gray-50 hover:bg-gray-100 text-gray-700 transition-colors"
                  aria-label="Decrease quantity"
                >
                  <Minus className="w-5 h-5" />
                </button>
                <input
                  type="number"
                  value={quantity}
                  onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                  min="1"
                  max={selectedVariant?.stockQuantity || 99}
                  className="w-20 h-12 text-center text-lg font-semibold border-none focus:outline-none"
                />
                <button
                  onClick={() => setQuantity(Math.min(selectedVariant?.stockQuantity || 99, quantity + 1))}
                  className="w-12 h-12 flex items-center justify-center bg-gray-50 hover:bg-gray-100 text-gray-700 transition-colors"
                  aria-label="Increase quantity"
                >
                  <Plus className="w-5 h-5" />
                </button>
              </div>
              <span className="text-sm text-gray-500">
                {selectedVariant?.stockQuantity ? `Only ${selectedVariant.stockQuantity} left in stock` : 'In stock'}
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-gray-100">
            <button
              onClick={handleAddToCart}
              disabled={isAdding}
              className="btn-dark flex-1 !py-3.5 disabled:opacity-50 disabled:pointer-events-none"
            >
              <ShoppingBag className="w-5 h-5" />
              {isAdding ? 'Adding…' : 'Add to cart'}
            </button>
            <button
              onClick={handleBuyNow}
              disabled={isAdding}
              className="btn-primary flex-1 !py-3.5 disabled:opacity-50 disabled:pointer-events-none"
            >
              Buy now
            </button>
          </div>

          {/* Trust Badges */}
          <div className="grid grid-cols-4 gap-4 pt-6 border-t border-gray-100">
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <TruckIcon className="w-5 h-5 text-gray-600" />
              <div>
                <p className="text-xs font-semibold text-gray-900">Free Delivery</p>
                <p className="text-xs text-gray-500">On orders ₹1000+</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <Shield className="w-5 h-5 text-gray-600" />
              <div>
                <p className="text-xs font-semibold text-gray-900">Secure Payment</p>
                <p className="text-xs text-gray-500">100% protected</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <RotateIcon className="w-5 h-5 text-gray-600" />
              <div>
                <p className="text-xs font-semibold text-gray-900">Easy Returns</p>
                <p className="text-xs text-gray-500">30-day policy</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <Award className="w-5 h-5 text-gray-600" />
              <div>
                <p className="text-xs font-semibold text-gray-900">Quality Guaranteed</p>
                <p className="text-xs text-gray-500">Authentic products</p>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="border-t border-gray-200 pt-6">
            <div className="flex gap-6 border-b border-gray-200 mb-6">
              {['description', 'specs', 'reviews'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`py-3 px-1 text-sm font-medium border-b-2 transition-colors ${
                    activeTab === tab
                      ? 'border-brand-500 text-brand-600'
                      : 'border-transparent text-gray-400 hover:text-gray-700'
                  }`}
                >
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </button>
              ))}
            </div>

            {activeTab === 'description' && (
              <div className="prose prose-gray max-w-none">
                <p className="text-gray-600 leading-relaxed whitespace-pre-wrap">
                  {product.description || 'No description available.'}
                </p>
              </div>
            )}

            {activeTab === 'specs' && (
              <div className="space-y-3">
                <dl className="divide-y divide-gray-100">
                  {product.brand && (
                    <div className="grid grid-cols-2 gap-4 py-3">
                      <dt className="text-sm text-gray-500">Brand</dt>
                      <dd className="text-sm font-medium text-gray-900">{product.brand}</dd>
                    </div>
                  )}
                  <div className="grid grid-cols-2 gap-4 py-3">
                    <dt className="text-sm text-gray-500">Category</dt>
                    <dd className="text-sm font-medium text-gray-900">{product.category?.name || product.categoryName}</dd>
                  </div>
                  {product.variants && product.variants.length > 0 && (
                    <div className="grid grid-cols-2 gap-4 py-3">
                      <dt className="text-sm text-gray-500">Available Variants</dt>
                      <dd className="text-sm font-medium text-gray-900">{product.variants.length} variants</dd>
                    </div>
                  )}
                </dl>
              </div>
            )}

            {activeTab === 'reviews' && (
              <ReviewList productId={product.productId} />
            )}
          </div>
        </div>
      </div>

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <section className="mt-16">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-display font-bold text-2xl tracking-tight">
              More in {product.category?.name || product.categoryName || 'this category'}
            </h2>
            <Link
              to={`/catalog?category=${product.categoryId}`}
              className="text-sm font-semibold a-link"
            >
              View all
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {relatedProducts.map((rel) => (
              <ProductCard key={rel.productId} product={rel} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
};
