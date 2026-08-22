import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingBag, ArrowRight, Trash2, ShieldCheck, Truck } from 'lucide-react';
import { useCartStore } from '../store/useCartStore';
import { useAuthStore } from '../store/useAuthStore';
import { CartItemRow } from '../components/cart/CartItemRow';
import { OrderSummary } from '../components/checkout/OrderSummary';

export const CartPage = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();
  const { items, itemCount, subtotal, updateQuantity, removeItem, fetchCart } = useCartStore();

  useEffect(() => {
    if (isAuthenticated) {
      fetchCart();
    }
  }, [isAuthenticated]);

  if (!isAuthenticated) {
    return (
      <div className="max-w-md mx-auto my-20 p-8 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm text-center space-y-4">
        <ShoppingBag className="w-12 h-12 text-slate-300 dark:text-slate-700 mx-auto" />
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">Sign in to view your bag</h2>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Sign in to access your saved hardware items and custom variant configurations.
        </p>
        <Link
          to="/login"
          className="inline-block px-6 py-3 text-xs font-bold text-white bg-slate-900 dark:bg-emerald-600 hover:bg-slate-800 rounded-xl shadow-md"
        >
          Sign In
        </Link>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="max-w-lg mx-auto my-20 p-12 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm text-center space-y-4">
        <ShoppingBag className="w-16 h-16 text-slate-300 dark:text-slate-700 mx-auto" />
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">Your Shopping Bag is Empty</h2>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Explore our collection of creator ultrabooks, smartphones, and reference studio audio.
        </p>
        <Link
          to="/catalog"
          className="inline-flex items-center gap-2 px-6 py-3 text-xs font-bold text-white bg-slate-900 dark:bg-emerald-600 hover:bg-slate-800 rounded-xl shadow-md transition-all"
        >
          Browse Catalog
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-[1600px] mx-auto px-4 sm:px-8 lg:px-10 py-8 space-y-8">
      {/* Title */}
      <div>
        <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Shopping Bag</h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          {itemCount} {itemCount === 1 ? 'item' : 'items'} ready for checkout.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left: Items List */}
        <div className="lg:col-span-8 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-6 shadow-sm divide-y divide-slate-100 dark:divide-slate-800">
          <div className="pb-4 flex items-center justify-between">
            <span className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              Selected Hardware Items & Variants
            </span>
            <span className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" />
              Price Lock Guarantee
            </span>
          </div>

          <div className="pt-2">
            {items.map((item) => (
              <CartItemRow
                key={item.cartItemId || item.cart_item_id}
                item={item}
                onUpdateQuantity={updateQuantity}
                onRemove={removeItem}
              />
            ))}
          </div>

          <div className="pt-4 flex justify-between items-center text-xs">
            <Link
              to="/catalog"
              className="text-slate-900 dark:text-emerald-400 hover:underline font-bold flex items-center gap-1"
            >
              ← Continue Shopping
            </Link>
          </div>
        </div>

        {/* Right: Order Summary */}
        <div className="lg:col-span-4 space-y-6">
          <OrderSummary
            items={items}
            subtotal={subtotal}
            buttonText="Proceed to Checkout"
            onPlaceOrder={() => navigate('/checkout')}
          />
        </div>
      </div>
    </div>
  );
};
