import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { X, ShoppingBag, Gift } from 'lucide-react';
import { useCartStore } from '../../store/useCartStore';
import { useAuthStore } from '../../store/useAuthStore';
import { CartItemRow } from './CartItemRow';

export const CartDrawer = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();
  const { isDrawerOpen, closeDrawer, items, itemCount, subtotal, updateQuantity, removeItem, fetchCart } = useCartStore();

  useEffect(() => {
    if (isAuthenticated && isDrawerOpen) {
      fetchCart();
    }
  }, [isAuthenticated, isDrawerOpen]);

  if (!isDrawerOpen) return null;

  const formatPrice = (amount) =>
    new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount || 0);

  const taxAmount = Number((subtotal * 0.18).toFixed(0));
  const shippingFee = subtotal > 1000 ? 0 : subtotal > 0 ? 50 : 0;
  const totalAmount = Number((subtotal + taxAmount + shippingFee).toFixed(0));
  const freeShipProgress = Math.min((subtotal / 1000) * 100, 100);

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      <div className="fixed inset-0 bg-ink/40 backdrop-blur-sm animate-popin" onClick={closeDrawer} />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-0 sm:pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col rounded-l-[2rem] overflow-hidden">
          {/* Header */}
          <div className="px-5 sm:px-7 py-5 bg-night text-white flex items-center justify-between relative overflow-hidden">
            <div className="pointer-events-none absolute -top-10 -right-8 w-36 h-36 bg-brand-500/30 rounded-full blur-2xl" />
            <h3 className="font-display font-bold text-lg flex items-center gap-2.5 relative">
              <span className="w-9 h-9 rounded-2xl bg-brand-500 flex items-center justify-center shadow-glow">
                <ShoppingBag className="w-4.5 h-4.5 w-[18px] h-[18px]" />
              </span>
              Your cart
            </h3>
            <div className="flex items-center gap-3 relative">
              <span className="text-xs text-gray-400">{itemCount} {itemCount === 1 ? 'item' : 'items'}</span>
              <button
                onClick={closeDrawer}
                className="p-2 rounded-full text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
                aria-label="Close cart"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Free shipping progress */}
          {isAuthenticated && items.length > 0 && (
            <div className="px-5 sm:px-7 py-3.5 bg-brand-50/60 border-b border-gray-100 text-xs text-gray-600">
              <p>
                {subtotal >= 1000 ? (
                  <>You've unlocked <span className="font-bold text-brand-700">FREE delivery</span> 🎉</>
                ) : (
                  <>Add <span className="font-bold">{formatPrice(1000 - subtotal)}</span> more to unlock FREE delivery</>
                )}
              </p>
              <div className="mt-2 h-1.5 rounded-full bg-gray-200 overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-brand-500 to-mint-500 transition-all duration-700"
                  style={{ width: `${freeShipProgress}%` }}
                />
              </div>
            </div>
          )}

          {/* Items */}
          <div className="flex-1 overflow-y-auto px-5 sm:px-7 divide-y divide-gray-100">
            {!isAuthenticated ? (
              <div className="py-20 text-center space-y-4">
                <div className="w-16 h-16 mx-auto rounded-full bg-peach flex items-center justify-center">
                  <ShoppingBag className="w-7 h-7 text-brand-500" />
                </div>
                <h4 className="font-display font-bold text-lg">Sign in to view your cart</h4>
                <p className="text-sm text-gray-500 max-w-xs mx-auto">Your items sync across devices when you're signed in.</p>
                <Link to="/login" onClick={closeDrawer} className="btn-primary mx-auto">Sign in</Link>
              </div>
            ) : items.length === 0 ? (
              <div className="py-20 text-center space-y-4">
                <div className="w-16 h-16 mx-auto rounded-full bg-peach flex items-center justify-center">
                  <ShoppingBag className="w-7 h-7 text-brand-500" />
                </div>
                <h4 className="font-display font-bold text-lg">Your cart is feeling light</h4>
                <p className="text-sm text-gray-500 max-w-xs mx-auto">Discover trending picks and fresh drops.</p>
                <Link to="/catalog" onClick={closeDrawer} className="btn-primary mx-auto">Start shopping</Link>
              </div>
            ) : (
              items.map((item) => (
                <CartItemRow
                  key={item.cartItemId}
                  item={item}
                  onUpdateQuantity={updateQuantity}
                  onRemove={removeItem}
                />
              ))
            )}
          </div>

          {/* Footer */}
          {isAuthenticated && items.length > 0 && (
            <div className="p-5 sm:p-6 border-t border-gray-100 space-y-3.5 bg-cream/60">
              <label className="flex items-center gap-2.5 text-xs text-gray-600 cursor-pointer">
                <input type="checkbox" className="accent-brand-500 w-3.5 h-3.5" />
                <Gift className="w-3.5 h-3.5 text-brand-600" /> This order contains a gift
              </label>

              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between text-gray-500">
                  <span>GST (18%)</span><span>{formatPrice(taxAmount)}</span>
                </div>
                <div className="flex justify-between text-gray-500">
                  <span>Delivery</span>
                  <span className={shippingFee === 0 ? 'font-bold text-emerald-600' : ''}>
                    {shippingFee === 0 ? 'FREE' : formatPrice(shippingFee)}
                  </span>
                </div>
                <div className="pt-2 border-t border-dashed border-gray-300 flex justify-between items-baseline">
                  <span className="text-sm font-semibold text-gray-800">Total</span>
                  <span className="font-display font-bold text-xl text-ink">{formatPrice(totalAmount)}</span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => { closeDrawer(); navigate('/checkout'); }}
                className="btn-primary w-full !py-3.5"
              >
                Checkout securely
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};


