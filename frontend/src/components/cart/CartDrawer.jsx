import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { X, ShoppingBag, ArrowRight, ShieldAlert, Sparkles, Truck } from 'lucide-react';
import { useCartStore } from '../../store/useCartStore';
import { useAuthStore } from '../../store/useAuthStore';
import { CartItemRow } from './CartItemRow';

export const CartDrawer = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();
  const { isDrawerOpen, closeDrawer, items, itemCount, subtotal, updateQuantity, removeItem, fetchCart } = useCartStore();

  useEffect(() => {
    if (isAuthenticated) {
      fetchCart();
    }
  }, [isAuthenticated]);

  if (!isDrawerOpen) return null;

  const formatPrice = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 2,
    }).format(amount || 0);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm transition-opacity"
        onClick={closeDrawer}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-0 sm:pl-10">
        <div className="w-screen max-w-md bg-white dark:bg-slate-900 shadow-2xl flex flex-col border-l border-slate-200 dark:border-slate-800">
          {/* Header */}
          <div className="p-4 sm:p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-emerald-400 flex items-center justify-center flex-shrink-0">
                <ShoppingBag className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white truncate">Shopping Bag</h3>
                <p className="text-[11px] text-slate-400 dark:text-slate-500 truncate">{itemCount} {itemCount === 1 ? 'item' : 'items'} selected</p>
              </div>
            </div>

            <button
              onClick={closeDrawer}
              className="p-1.5 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Cart Items List */}
          <div className="flex-1 overflow-y-auto px-4 sm:px-6 divide-y divide-slate-100 dark:divide-slate-800">
            {!isAuthenticated ? (
              <div className="py-16 text-center space-y-4">
                <ShoppingBag className="w-12 h-12 text-slate-300 dark:text-slate-700 mx-auto" />
                <h4 className="text-base font-bold text-slate-800 dark:text-slate-200">Sign in to view your bag</h4>
                <p className="text-xs text-slate-400 dark:text-slate-500 max-w-xs mx-auto">
                  Sign in to save items across devices and access verified customer pricing.
                </p>
                <Link
                  to="/login"
                  onClick={closeDrawer}
                  className="inline-block px-5 py-2.5 text-xs font-bold text-white bg-slate-900 dark:bg-emerald-600 hover:bg-slate-800 rounded-xl shadow-md"
                >
                  Sign In
                </Link>
              </div>
            ) : items.length === 0 ? (
              <div className="py-16 text-center space-y-4">
                <ShoppingBag className="w-12 h-12 text-slate-300 dark:text-slate-700 mx-auto" />
                <h4 className="text-base font-bold text-slate-800 dark:text-slate-200">Your shopping bag is empty</h4>
                <p className="text-xs text-slate-400 dark:text-slate-500 max-w-xs mx-auto">
                  Explore our collection to add precision hardware and customized variants.
                </p>
                <Link
                  to="/catalog"
                  onClick={closeDrawer}
                  className="inline-block px-5 py-2.5 text-xs font-bold text-white bg-slate-900 dark:bg-emerald-600 hover:bg-slate-800 rounded-xl shadow-md"
                >
                  Browse Catalog
                </Link>
              </div>
            ) : (
              items.map((item) => (
                <CartItemRow
                  key={item.cartItemId || item.cart_item_id}
                  item={item}
                  onUpdateQuantity={updateQuantity}
                  onRemove={removeItem}
                />
              ))
            )}
          </div>

          {/* Footer Subtotal & Checkout */}
          {isAuthenticated && items.length > 0 && (
            <div className="p-4 sm:p-6 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/80 space-y-4">
              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between text-slate-500 dark:text-slate-400">
                  <span>Subtotal</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200 font-mono">{formatPrice(subtotal)}</span>
                </div>
                <div className="flex justify-between text-slate-500 dark:text-slate-400">
                  <span>Standard Tax (18% GST)</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200 font-mono">{formatPrice(subtotal * 0.18)}</span>
                </div>
                <div className="flex justify-between text-slate-500 dark:text-slate-400">
                  <span>Insured Courier Shipping</span>
                  <span className="font-semibold text-emerald-600 dark:text-emerald-400 font-mono">
                    {subtotal > 1000 ? 'FREE' : '$50.00'}
                  </span>
                </div>
                <div className="pt-2 border-t border-slate-200 dark:border-slate-800 flex justify-between text-sm font-bold text-slate-900 dark:text-white">
                  <span>Total Amount</span>
                  <span className="text-base text-slate-900 dark:text-emerald-400 font-black font-mono">
                    {formatPrice(subtotal + (subtotal * 0.18) + (subtotal > 1000 ? 0 : 50))}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <Link
                  to="/cart"
                  onClick={closeDrawer}
                  className="w-full text-center py-2.5 px-3 rounded-xl border border-slate-300 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                >
                  View Bag
                </Link>
                <button
                  type="button"
                  onClick={() => {
                    closeDrawer();
                    navigate('/checkout');
                  }}
                  className="w-full py-2.5 px-3 rounded-xl text-xs font-bold text-white bg-slate-900 dark:bg-emerald-600 hover:bg-slate-800 dark:hover:bg-emerald-500 shadow-md transition-all flex items-center justify-center gap-1.5"
                >
                  Checkout
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
