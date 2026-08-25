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

  const formatPrice = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount || 0);
  };

  if (!isAuthenticated) {
    return (
      <div className="max-w-md mx-auto my-20 p-8 bg-white rounded-2xl border border-gray-200 shadow-sm text-center space-y-4">
        <ShoppingBag className="w-12 h-12 text-gray-300 mx-auto" />
        <h2 className="text-xl font-bold text-gray-900">Sign in to view your bag</h2>
        <p className="text-sm text-gray-500">Sign in to access your saved items.</p>
        <Link to="/login" className="inline-block px-6 py-3 text-sm font-bold text-white bg-gray-900 hover:bg-gray-700 rounded-xl shadow-md">
          Sign In
        </Link>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="max-w-lg mx-auto my-20 p-12 bg-white rounded-2xl border border-gray-200 shadow-sm text-center space-y-4">
        <ShoppingBag className="w-16 h-16 text-gray-300 mx-auto" />
        <h2 className="text-xl font-bold text-gray-900">Your Shopping Cart is Empty</h2>
        <p className="text-sm text-gray-500">Looks like you haven't added anything yet.</p>
        <Link to="/catalog" className="inline-flex items-center gap-2 px-6 py-3 text-sm font-bold text-white bg-gray-900 hover:bg-gray-700 rounded-xl shadow-md transition-colors">
          Continue Shopping
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Shopping Cart</h1>
        <p className="text-sm text-gray-500 mt-1">{itemCount} {itemCount === 1 ? 'item' : 'items'} in your cart</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        <div className="lg:col-span-8 bg-white rounded-2xl border border-gray-200 p-6 shadow-sm divide-y divide-gray-100">
          <div className="pb-4 flex items-center justify-between">
            <span className="text-xs font-bold text-gray-900 uppercase tracking-wider">Items</span>
            <span className="text-xs text-green-600 font-semibold flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" />
              Price Lock Guarantee
            </span>
          </div>

          <div className="pt-2">
            {items.map((item) => (
              <CartItemRow
                key={item.cartItemId}
                item={item}
                onUpdateQuantity={updateQuantity}
                onRemove={removeItem}
              />
            ))}
          </div>

          <div className="pt-4 flex justify-between items-center text-xs">
            <Link to="/catalog" className="text-gray-900 hover:underline font-bold flex items-center gap-1">
              ← Continue Shopping
            </Link>
          </div>
        </div>

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