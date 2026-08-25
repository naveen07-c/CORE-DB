import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart, Trash2, ArrowLeft, ShoppingBag } from 'lucide-react';
import { useWishlistStore } from '../store/useWishlistStore';
import { useCartStore } from '../store/useCartStore';
import { useAuthStore } from '../store/useAuthStore';
import { ProductCard } from '../components/catalog/ProductCard';
import { getProductImage } from '../utils/productImages';

export const WishlistPage = () => {
  const { items, removeFromWishlist, clearWishlist } = useWishlistStore();
  const { addItem, openDrawer } = useCartStore();
  const { isAuthenticated } = useAuthStore();
  const [productDetails, setProductDetails] = useState({});

  const formatPrice = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount || 0);
  };

  const handleAddToCart = async (product) => {
    if (!isAuthenticated) return;
    if (!product.variants || product.variants.length === 0) return;
    const firstVariant = product.variants[0];
    try {
      await addItem(firstVariant.variantId, 1);
      openDrawer();
    } catch (err) {
      console.error('Failed to add to cart:', err);
    }
  };

  const handleRemove = (productId) => {
    removeFromWishlist(productId);
  };

  if (!isAuthenticated) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center space-y-6">
        <Heart className="w-16 h-16 text-gray-300 mx-auto" />
        <h1 className="text-2xl font-bold text-gray-900">Sign in to view your wishlist</h1>
        <p className="text-gray-500">Your saved items will be synced across devices.</p>
        <Link to="/login" className="inline-flex items-center gap-2 px-6 py-3 text-sm font-bold text-white bg-gray-900 hover:bg-gray-700 rounded-xl">
          Sign In
        </Link>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center space-y-6">
        <Heart className="w-16 h-16 text-gray-300 mx-auto" />
        <h1 className="text-2xl font-bold text-gray-900">Your wishlist is empty</h1>
        <p className="text-gray-500">Save items you love for later.</p>
        <Link to="/catalog" className="inline-flex items-center gap-2 px-6 py-3 text-sm font-bold text-white bg-gray-900 hover:bg-gray-700 rounded-xl">
          <ArrowLeft className="w-4 h-4" />
          Continue Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <Link to="/" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 mb-4">
            <ArrowLeft className="w-4 h-4" />
            Continue Shopping
          </Link>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Heart className="w-6 h-6 text-red-600" />
            My Wishlist
          </h1>
          <p className="text-sm text-gray-500 mt-1">{items.length} {items.length === 1 ? 'item' : 'items'} saved</p>
        </div>
        {items.length > 0 && (
          <button
            onClick={clearWishlist}
            className="text-sm font-medium text-gray-500 hover:text-red-600 flex items-center gap-1"
          >
            <Trash2 className="w-4 h-4" />
            Clear All
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {items.map((item) => (
          <ProductCard
            key={item.productId}
            product={{
              ...item,
              productId: item.productId,
              name: item.name,
              minPrice: item.price,
              maxPrice: item.price,
              basePrice: item.price,
              rating: item.rating || 0,
              totalReviews: item.reviewCount || 0,
              categoryName: item.categoryName,
              variants: item.variants || [],
            }}
          />
        ))}
      </div>
    </div>
  );
};