import React from 'react';
import { ShieldCheck, Lock, ArrowRight, Loader2, Award } from 'lucide-react';

export const OrderSummary = ({
  items = [],
  subtotal = 0,
  isProcessing = false,
  onPlaceOrder,
  buttonText = 'Proceed to Checkout',
  disabled = false,
}) => {
  const formatPrice = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount || 0);
  };

  const taxAmount = Number((subtotal * 0.18).toFixed(0));
  const shippingFee = subtotal > 1000 ? 0 : (subtotal > 0 ? 50 : 0);
  const totalAmount = Number((subtotal + taxAmount + shippingFee).toFixed(0));

  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm space-y-6 sticky top-24">
      <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider border-b border-gray-100 pb-3">
        Order Summary
      </h3>

      <div className="space-y-3 max-h-48 overflow-y-auto pr-1">
        {items.map((item) => {
          const name = item.productName || item.name || 'Product';
          const variant = item.variantDetails || item.sku || '';
          const qty = item.quantity || 1;
          const price = item.unitPrice || item.price || 0;

          return (
            <div key={item.cartItemId || Math.random()} className="flex justify-between items-start text-xs">
              <div className="pr-2">
                <span className="font-semibold text-gray-800 line-clamp-1">{name}</span>
                <span className="text-[11px] text-gray-500 block">{variant} × {qty}</span>
              </div>
              <span className="font-bold text-gray-900 font-mono flex-shrink-0">{formatPrice(price * qty)}</span>
            </div>
          );
        })}
      </div>

      <div className="border-t border-gray-100 pt-4 space-y-2 text-xs">
        <div className="flex justify-between text-gray-600">
          <span>Items Subtotal</span>
          <span className="font-semibold text-gray-900 font-mono">{formatPrice(subtotal)}</span>
        </div>

        <div className="flex justify-between text-gray-600">
          <span>Estimated GST (18%)</span>
          <span className="font-semibold text-gray-900 font-mono">{formatPrice(taxAmount)}</span>
        </div>

        <div className="flex justify-between text-gray-600">
          <div className="flex items-center gap-1">
            <span>Shipping</span>
            {subtotal > 1000 && (
              <span className="text-[10px] bg-green-100 text-green-700 px-1.5 py-0.2 rounded font-bold">{"FREE > ₹1000"}</span>
            )}
          </div>
          <span className={shippingFee === 0 ? 'font-bold text-green-600 font-mono' : 'font-semibold text-gray-900 font-mono'}>
            {shippingFee === 0 ? 'FREE' : formatPrice(shippingFee)}
          </span>
        </div>

        <div className="border-t border-gray-200 pt-3 flex justify-between items-baseline">
          <div>
            <span className="text-sm font-extrabold text-gray-900 block">Total</span>
            <span className="text-[10px] text-gray-500">Includes all taxes & delivery</span>
          </div>
          <span className="text-xl font-black text-gray-900 font-mono">{formatPrice(totalAmount)}</span>
        </div>
      </div>

      <div className="p-3 bg-gray-50 border border-gray-200 rounded-xl space-y-1.5 text-[11px] text-gray-500">
        <div className="flex items-center gap-1.5 font-semibold text-gray-700">
          <Award className="w-3.5 h-3.5 text-green-600" />
          <span>Price Lock Guarantee</span>
        </div>
        <p className="text-[10px] leading-relaxed">Your order pricing is permanently guaranteed and protected upon checkout confirmation.</p>
      </div>

      {onPlaceOrder && (
        <button
          type="button"
          disabled={disabled || isProcessing || items.length === 0}
          onClick={onPlaceOrder}
          className="w-full py-3.5 px-4 rounded-xl text-sm font-bold text-white bg-gray-900 hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm transition-colors flex items-center justify-center gap-2"
        >
          {isProcessing ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Processing...</span>
            </>
          ) : (
            <>
              <Lock className="w-4 h-4" />
              <span>{buttonText}</span>
              <ArrowRight className="w-4 h-4 ml-auto" />
            </>
          )}
        </button>
      )}
    </div>
  );
};