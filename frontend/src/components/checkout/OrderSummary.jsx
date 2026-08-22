import React from 'react';
import { ShieldCheck, Lock, ArrowRight, Loader2, Award } from 'lucide-react';

export const OrderSummary = ({
  items = [],
  subtotal = 0,
  isProcessing = false,
  onPlaceOrder,
  buttonText = 'Place Order & Pay',
  disabled = false,
}) => {
  const formatPrice = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 2,
    }).format(amount || 0);
  };

  const taxAmount = Number((subtotal * 0.18).toFixed(2));
  const shippingFee = subtotal > 1000 ? 0.00 : (subtotal > 0 ? 50.00 : 0.00);
  const totalAmount = Number((subtotal + taxAmount + shippingFee).toFixed(2));

  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-6 shadow-sm space-y-6">
      <h3 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider border-b border-slate-100 dark:border-slate-800 pb-3">
        Order Summary
      </h3>

      {/* Item summary preview */}
      <div className="space-y-3 max-h-48 overflow-y-auto pr-1">
        {items.map((item) => {
          const name = item.productName || item.product_name || item.name || 'Product';
          const variant = item.variantDetails || item.variant_details || item.sku || '';
          const qty = item.quantity || 1;
          const price = item.unitPrice || item.unit_price || item.price || 0;

          return (
            <div key={item.cartItemId || item.cart_item_id || Math.random()} className="flex justify-between items-start text-xs">
              <div className="pr-2">
                <span className="font-semibold text-slate-800 dark:text-slate-200 line-clamp-1">{name}</span>
                <span className="text-[11px] text-slate-400 dark:text-slate-500 block">{variant} × {qty}</span>
              </div>
              <span className="font-bold text-slate-900 dark:text-white font-mono flex-shrink-0">{formatPrice(price * qty)}</span>
            </div>
          );
        })}
      </div>

      {/* Financial Calculations */}
      <div className="border-t border-slate-100 dark:border-slate-800 pt-4 space-y-2 text-xs">
        <div className="flex justify-between text-slate-600 dark:text-slate-400">
          <span>Items Subtotal</span>
          <span className="font-semibold text-slate-900 dark:text-slate-200 font-mono">{formatPrice(subtotal)}</span>
        </div>

        <div className="flex justify-between text-slate-600 dark:text-slate-400">
          <div className="flex items-center gap-1">
            <span>Estimated GST (18%)</span>
          </div>
          <span className="font-semibold text-slate-900 dark:text-slate-200 font-mono">{formatPrice(taxAmount)}</span>
        </div>

        <div className="flex justify-between text-slate-600 dark:text-slate-400">
          <div className="flex items-center gap-1">
            <span>Insured Courier Shipping</span>
            {subtotal > 1000 && (
              <span className="text-[10px] bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 px-1.5 py-0.2 rounded font-bold">
                FREE &gt; $1000
              </span>
            )}
          </div>
          <span className={shippingFee === 0 ? 'font-bold text-emerald-600 dark:text-emerald-400 font-mono' : 'font-semibold text-slate-900 dark:text-slate-200 font-mono'}>
            {shippingFee === 0 ? 'FREE' : formatPrice(shippingFee)}
          </span>
        </div>

        <div className="border-t border-slate-200 dark:border-slate-800 pt-3 flex justify-between items-baseline">
          <div>
            <span className="text-sm font-extrabold text-slate-900 dark:text-white block">Total Order Value</span>
            <span className="text-[10px] text-slate-400 dark:text-slate-500">Includes all taxes & delivery fees</span>
          </div>
          <span className="text-xl font-black text-slate-900 dark:text-emerald-400 font-mono">{formatPrice(totalAmount)}</span>
        </div>
      </div>

      {/* Customer Guarantees */}
      <div className="p-3 bg-slate-50 dark:bg-slate-950/80 border border-slate-200/80 dark:border-slate-800 rounded-2xl space-y-1.5 text-[11px] text-slate-500 dark:text-slate-400">
        <div className="flex items-center gap-1.5 font-semibold text-slate-700 dark:text-slate-300">
          <Award className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
          <span>VORTEX Price Match & Protection</span>
        </div>
        <p className="text-[10px] leading-relaxed">
          Your order pricing is permanently guaranteed and protected against sudden price fluctuations upon checkout confirmation.
        </p>
      </div>

      {/* Action Button */}
      {onPlaceOrder && (
        <button
          type="button"
          disabled={disabled || isProcessing || items.length === 0}
          onClick={onPlaceOrder}
          className="w-full py-3.5 px-4 rounded-xl text-xs font-bold text-white bg-slate-900 dark:bg-emerald-600 hover:bg-slate-800 dark:hover:bg-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed shadow-md transition-all flex items-center justify-center gap-2"
        >
          {isProcessing ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Authorizing & Processing Order...</span>
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
